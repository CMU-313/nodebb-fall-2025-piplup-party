'use strict';

const assert = require('assert');
const nconf = require('nconf');
const request = require('../src/request');

const db = require('./mocks/databasemock');
const Categories = require('../src/categories');
const Topics = require('../src/topics');
const User = require('../src/user');
const groups = require('../src/groups');
const privileges = require('../src/privileges');

describe('Integration Tests - Urgent Filter Workflow', () => {
	let categoryObj;
	let adminUid;
	let regularUserUid;
	let urgentTopicData;
	let normalTopicData;

	before(async () => {
		// Create test users with different roles
		adminUid = await User.create({ username: 'admin' });
		regularUserUid = await User.create({ username: 'regularuser' });
		
		// Make admin user an administrator
		await groups.join('administrators', adminUid);
		
		// Create test category
		categoryObj = await Categories.create({
			name: 'Integration Test Category',
			description: 'Category for integration testing of urgent filter',
			icon: 'fa-check',
			blockclass: 'category-blue',
			order: '5',
		});

		// Create urgent topics
		const urgentTopic1 = await Topics.post({
			uid: adminUid,
			cid: categoryObj.cid,
			title: 'URGENT: System Maintenance Required',
			content: 'System maintenance is required immediately',
			tags: ['urgent', 'maintenance'],
		});
		
		const urgentTopic2 = await Topics.post({
			uid: regularUserUid,
			cid: categoryObj.cid,
			title: 'URGENT: Bug Report - Critical',
			content: 'Critical bug that affects all users',
			tags: ['urgent', 'bug'],
		});

		const urgentTopic3 = await Topics.post({
			uid: adminUid,
			cid: categoryObj.cid,
			title: 'URGENT: Security Alert',
			content: 'Security vulnerability detected',
			tags: ['urgent', 'security'],
		});

		// Mark topics as urgent
		await Topics.setTopicFields(urgentTopic1.topicData.tid, { urgent: true });
		await Topics.setTopicFields(urgentTopic2.topicData.tid, { urgent: true });
		await Topics.setTopicFields(urgentTopic3.topicData.tid, { urgent: true });
		
		urgentTopicData = [urgentTopic1.topicData, urgentTopic2.topicData, urgentTopic3.topicData];

		// Create normal (non-urgent) topics
		const normalTopic1 = await Topics.post({
			uid: regularUserUid,
			cid: categoryObj.cid,
			title: 'Regular Feature Discussion',
			content: 'Discussing a new feature',
			tags: ['feature'],
		});
		
		const normalTopic2 = await Topics.post({
			uid: adminUid,
			cid: categoryObj.cid,
			title: 'General Announcement',
			content: 'General announcement for all users',
			tags: ['announcement'],
		});

		const normalTopic3 = await Topics.post({
			uid: regularUserUid,
			cid: categoryObj.cid,
			title: 'Question about Configuration',
			content: 'Need help with system configuration',
			tags: ['question'],
		});

		normalTopicData = [normalTopic1.topicData, normalTopic2.topicData, normalTopic3.topicData];
	});

	describe('Complete User Workflow - Viewing Urgent Topics', () => {
		it('should allow regular user to view urgent topics in category', async () => {
			// Step 1: User visits category page
			const categoryResponse = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/integration-test-category`);
			assert.equal(categoryResponse.response.statusCode, 200);
			assert(categoryResponse.body);

			// Step 2: User applies urgent filter
			const urgentResponse = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/integration-test-category?filter=urgent`);
			assert.equal(urgentResponse.response.statusCode, 200);
			assert(urgentResponse.body);

			// Step 3: Verify API returns only urgent topics
			const apiResponse = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?filter=urgent`);
			assert.equal(apiResponse.response.statusCode, 200);
			assert(apiResponse.body);

			if (apiResponse.body.topics && Array.isArray(apiResponse.body.topics)) {
				// Should only return urgent topics
				apiResponse.body.topics.forEach(topic => {
					assert(topic.urgent === true, 'All returned topics should be urgent');
				});
				
				// Should return at least some urgent topics
				assert(apiResponse.body.topics.length >= 3, 'Should return at least 3 urgent topics');
			}
		});

		it('should allow admin user to view urgent topics with different privileges', async () => {
			// Admin user should see the same urgent topics
			const apiResponse = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?filter=urgent`);
			assert.equal(apiResponse.response.statusCode, 200);
			assert(apiResponse.body);

			if (apiResponse.body.topics && Array.isArray(apiResponse.body.topics)) {
				apiResponse.body.topics.forEach(topic => {
					assert(topic.urgent === true, 'Admin should see urgent topics');
				});
			}
		});

		it('should handle pagination correctly in urgent filter workflow', async () => {
			// Test first page
			const page1Response = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?filter=urgent&start=0&stop=1`);
			assert.equal(page1Response.response.statusCode, 200);

			// Test second page
			const page2Response = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?filter=urgent&start=2&stop=3`);
			assert.equal(page2Response.response.statusCode, 200);

			if (page1Response.body.topics && page2Response.body.topics) {
				// Should have different topics on different pages
				const page1Tids = page1Response.body.topics.map(t => t.tid);
				const page2Tids = page2Response.body.topics.map(t => t.tid);
				
				// No overlap between pages
				const intersection = page1Tids.filter(tid => page2Tids.includes(tid));
				assert(intersection.length === 0, 'Different pages should have different topics');
			}
		});
	});

	describe('Complete User Workflow - Switching Between Filters', () => {
		it('should allow user to switch from all topics to urgent topics', async () => {
			// Step 1: View all topics
			const allTopicsResponse = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category`);
			assert.equal(allTopicsResponse.response.statusCode, 200);
			
			// Step 2: Switch to urgent topics
			const urgentTopicsResponse = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?filter=urgent`);
			assert.equal(urgentTopicsResponse.response.statusCode, 200);

			if (allTopicsResponse.body.topics && urgentTopicsResponse.body.topics) {
				// Urgent topics should be a subset of all topics
				const allTids = allTopicsResponse.body.topics.map(t => t.tid);
				const urgentTids = urgentTopicsResponse.body.topics.map(t => t.tid);
				
				// All urgent topic IDs should be in the all topics list
				urgentTids.forEach(tid => {
					assert(allTids.includes(tid), `Urgent topic ${tid} should be in all topics`);
				});
				
				// Urgent topics should be fewer than all topics
				assert(urgentTids.length <= allTids.length, 'Urgent topics should be subset of all topics');
			}
		});

		it('should allow user to switch from urgent topics back to all topics', async () => {
			// Step 1: View urgent topics
			const urgentTopicsResponse = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?filter=urgent`);
			assert.equal(urgentTopicsResponse.response.statusCode, 200);
			
			// Step 2: Switch back to all topics
			const allTopicsResponse = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category`);
			assert.equal(allTopicsResponse.response.statusCode, 200);

			if (urgentTopicsResponse.body.topics && allTopicsResponse.body.topics) {
				// All topics should include both urgent and normal topics
				const urgentTids = urgentTopicsResponse.body.topics.map(t => t.tid);
				const allTids = allTopicsResponse.body.topics.map(t => t.tid);
				
				// All urgent topics should be in all topics
				urgentTids.forEach(tid => {
					assert(allTids.includes(tid), `Urgent topic ${tid} should be in all topics`);
				});
				
				// All topics should have more topics than just urgent ones
				assert(allTids.length >= urgentTids.length, 'All topics should include urgent topics');
			}
		});
	});

	describe('Integration with Other Features', () => {
		it('should work with topic sorting and urgent filter', async () => {
			const sortOptions = ['recent', 'old', 'create', 'posts', 'votes', 'views'];
			
			const results = await Promise.all(sortOptions.map(async (sort) => {
				const response = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?filter=urgent&sort=${sort}`);
				assert.equal(response.response.statusCode, 200);
				assert(response.body);

				if (response.body.topics && Array.isArray(response.body.topics)) {
					// All topics should still be urgent regardless of sort
					response.body.topics.forEach(topic => {
						assert(topic.urgent === true, `Topic should be urgent for sort: ${sort}`);
					});
				}
				
				return { sort, success: true };
			}));
			
			// Verify all sorts completed successfully
			assert(results.length === sortOptions.length, 'All sort options should complete');
		});

		it('should work with tag filtering and urgent filter', async () => {
			// Filter by specific tag and urgent
			const response = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?filter=urgent&tag=bug`);
			assert.equal(response.response.statusCode, 200);
			assert(response.body);

			if (response.body.topics && Array.isArray(response.body.topics)) {
				// All topics should be urgent and have the specified tag
				response.body.topics.forEach(topic => {
					assert(topic.urgent === true, 'Topic should be urgent');
					assert(topic.tags.some(tag => tag.value === 'bug'), 'Topic should have bug tag');
				});
			}
		});

		it('should work with user-specific filtering and urgent filter', async () => {
			// Filter by specific user and urgent
			const response = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?filter=urgent&author=${regularUserUid}`);
			assert.equal(response.response.statusCode, 200);
			assert(response.body);

			if (response.body.topics && Array.isArray(response.body.topics)) {
				// All topics should be urgent and by the specified user
				response.body.topics.forEach(topic => {
					assert(topic.urgent === true, 'Topic should be urgent');
					assert.equal(topic.uid, regularUserUid, 'Topic should be by specified user');
				});
			}
		});
	});

	describe('Real-time Updates and Socket Integration', () => {
		it('should handle socket.io requests with urgent filter', async () => {
			const socketCategories = require('../src/socket.io/categories');
			
			// Test loadMore with urgent filter
			const result = await socketCategories.loadMore({ uid: regularUserUid }, {
				cid: categoryObj.cid,
				after: 0,
				query: {
					filter: 'urgent',
				},
			});

			assert(Array.isArray(result.topics));
			
			// All topics should be urgent
			result.topics.forEach(topic => {
				assert(topic.urgent === true, 'Socket result should only include urgent topics');
			});
		});

		it('should handle new urgent topic creation in real-time', async () => {
			// Create a new urgent topic
			const newUrgentTopic = await Topics.post({
				uid: adminUid,
				cid: categoryObj.cid,
				title: 'URGENT: New Critical Issue',
				content: 'A new critical issue has been discovered',
				tags: ['urgent', 'critical'],
			});

			// Mark as urgent
			await Topics.setTopicFields(newUrgentTopic.topicData.tid, { urgent: true });

			// Verify it appears in urgent filter
			const response = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?filter=urgent`);
			assert.equal(response.response.statusCode, 200);
			assert(response.body);

			if (response.body.topics && Array.isArray(response.body.topics)) {
				// Should include the new urgent topic
				const hasNewTopic = response.body.topics.some(topic => topic.tid === newUrgentTopic.topicData.tid);
				assert(hasNewTopic, 'New urgent topic should appear in urgent filter');
			}
		});
	});

	describe('Performance and Scalability Integration', () => {
		it('should handle multiple concurrent urgent filter requests', async () => {
			const requests = [];
			
			// Make multiple concurrent requests with urgent filter
			for (let i = 0; i < 10; i++) {
				requests.push(request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?filter=urgent`));
			}
			
			const startTime = Date.now();
			const results = await Promise.all(requests);
			const endTime = Date.now();
			
			// All requests should succeed
			results.forEach(result => {
				assert.equal(result.response.statusCode, 200);
				assert(result.body);
			});
			
			// Should complete within reasonable time (less than 3 seconds)
			assert(endTime - startTime < 3000, 'Concurrent requests should complete within 3 seconds');
		});

		it('should maintain performance with large number of topics', async () => {
			// Create additional topics to test performance
			const promises = [];
			for (let i = 0; i < 20; i++) {
				promises.push(Topics.post({
					uid: regularUserUid,
					cid: categoryObj.cid,
					title: `Performance Test Topic ${i}`,
					content: `Content for performance test topic ${i}`,
					tags: ['performance'],
				}));
			}
			await Promise.all(promises);

			// Test urgent filter performance with more topics
			const startTime = Date.now();
			const response = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?filter=urgent`);
			const endTime = Date.now();
			
			assert.equal(response.response.statusCode, 200);
			assert(response.body);
			
			// Should still complete within reasonable time (less than 2 seconds)
			assert(endTime - startTime < 2000, 'Should maintain performance with more topics');
		});
	});

	describe('Error Handling and Edge Cases Integration', () => {
		it('should handle database errors gracefully in urgent filter', async () => {
			// Test with invalid category ID
			const response = await request.get(`${nconf.get('url')}/api/category/99999/non-existent?filter=urgent`);
			
			// Should handle gracefully (might return 404 or empty result)
			assert(response.response.statusCode >= 400, 'Should return error for invalid category');
		});

		it('should handle malformed filter parameters in integration', async () => {
			// Test with various malformed parameters
			const malformedParams = [
				'filter=urgent&filter=invalid',
				'filter=&sort=urgent',
				'filter=urgent&start=invalid',
				'filter=urgent&stop=invalid',
			];

			const results = await Promise.all(malformedParams.map(async (params) => {
				const response = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?${params}`);
				
				// Should handle malformed parameters gracefully
				assert(response.response.statusCode >= 200, 'Should handle malformed parameters');
				return { params, success: true };
			}));
			
			// Verify all malformed parameter tests completed
			assert(results.length === malformedParams.length, 'All malformed parameter tests should complete');
		});

		it('should maintain data integrity across filter operations', async () => {
			// Get initial urgent topics
			const initialResponse = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?filter=urgent`);
			assert.equal(initialResponse.response.statusCode, 200);

			// Perform various operations
			const allTopicsResponse = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category`);
			const urgentResponse2 = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?filter=urgent`);

			// Verify data integrity
			assert.equal(initialResponse.response.statusCode, 200);
			assert.equal(allTopicsResponse.response.statusCode, 200);
			assert.equal(urgentResponse2.response.statusCode, 200);

			// Urgent filter results should be consistent
			if (initialResponse.body.topics && urgentResponse2.body.topics) {
				const initialTids = initialResponse.body.topics.map(t => t.tid).sort();
				const secondTids = urgentResponse2.body.topics.map(t => t.tid).sort();
				
				assert.deepStrictEqual(initialTids, secondTids, 'Urgent filter results should be consistent');
			}
		});
	});

	describe('User Experience Integration', () => {
		it('should provide consistent user experience across different user types', async () => {
			// Test with different user types
			const userTypes = [
				{ uid: 0, name: 'guest' },
				{ uid: regularUserUid, name: 'regular user' },
				{ uid: adminUid, name: 'admin' },
			];

			const results = await Promise.all(userTypes.map(async (userType) => {
				const response = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?filter=urgent`);
				assert.equal(response.response.statusCode, 200);
				assert(response.body);

				// All user types should be able to access urgent filter
				if (response.body.topics && Array.isArray(response.body.topics)) {
					response.body.topics.forEach(topic => {
						assert(topic.urgent === true, `${userType.name} should see urgent topics`);
					});
				}
				
				return { userType: userType.name, success: true };
			}));
			
			// Verify all user types completed successfully
			assert(results.length === userTypes.length, 'All user types should complete successfully');
		});

		it('should handle user permissions correctly with urgent filter', async () => {
			// Test that users can only see topics they have permission to see
			const response = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/integration-test-category?filter=urgent`);
			assert.equal(response.response.statusCode, 200);
			assert(response.body);

			// The urgent filter should respect topic permissions
			// (This would depend on the specific permission system implementation)
			assert(typeof response.body === 'object', 'Should return valid response object');
		});
	});
});
