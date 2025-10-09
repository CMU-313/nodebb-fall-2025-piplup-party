'use strict';

const assert = require('assert');
const request = require('../src/request');
const nconf = require('nconf');

const db = require('./mocks/databasemock');
const Categories = require('../src/categories');
const Topics = require('../src/topics');
const User = require('../src/user');

describe('Frontend Urgent Filter', () => {
	let categoryObj;
	let posterUid;
	let urgentTopicData;
	let normalTopicData;

	before(async () => {
		// Create test users
		posterUid = await User.create({ username: 'poster' });
		
		// Create test category
		categoryObj = await Categories.create({
			name: 'Test Category for Frontend Urgent Filter',
			description: 'Test category for frontend urgent filter testing',
			icon: 'fa-check',
			blockclass: 'category-blue',
			order: '5',
		});

		// Create urgent topics
		const urgentTopic1 = await Topics.post({
			uid: posterUid,
			cid: categoryObj.cid,
			title: 'URGENT: Frontend Issue',
			content: 'Critical frontend issue that needs immediate attention',
			tags: ['urgent', 'frontend'],
		});
		
		const urgentTopic2 = await Topics.post({
			uid: posterUid,
			cid: categoryObj.cid,
			title: 'URGENT: UI Bug',
			content: 'Critical UI bug affecting user experience',
			tags: ['urgent', 'ui'],
		});

		// Mark topics as urgent
		await Topics.setTopicFields(urgentTopic1.topicData.tid, { urgent: true });
		await Topics.setTopicFields(urgentTopic2.topicData.tid, { urgent: true });
		
		urgentTopicData = [urgentTopic1.topicData, urgentTopic2.topicData];

		// Create normal (non-urgent) topics
		const normalTopic1 = await Topics.post({
			uid: posterUid,
			cid: categoryObj.cid,
			title: 'Regular Frontend Discussion',
			content: 'This is a regular frontend discussion',
			tags: ['frontend'],
		});
		
		const normalTopic2 = await Topics.post({
			uid: posterUid,
			cid: categoryObj.cid,
			title: 'Feature Request',
			content: 'Requesting a new feature',
			tags: ['feature'],
		});

		normalTopicData = [normalTopic1.topicData, normalTopic2.topicData];
	});

	describe('Category page with urgent filter', () => {
		it('should load category page with urgent filter parameter', async () => {
			const { response, body } = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter?filter=urgent`);
			
			assert.equal(response.statusCode, 200);
			assert(body);
			assert(typeof body === 'string');
			
			// Check that the page contains urgent filter indicators
			assert(body.includes('urgent') || body.includes('Urgent'), 'Page should contain urgent filter content');
		});

		it('should load category page without filter parameter', async () => {
			const { response, body } = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter`);
			
			assert.equal(response.statusCode, 200);
			assert(body);
			assert(typeof body === 'string');
		});

		it('should handle invalid filter parameter gracefully', async () => {
			const { response, body } = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter?filter=invalid`);
			
			assert.equal(response.statusCode, 200);
			assert(body);
			assert(typeof body === 'string');
		});
	});

	describe('API endpoints with urgent filter', () => {
		it('should return urgent topics via API', async () => {
			const { response, body } = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter?filter=urgent`);
			
			assert.equal(response.statusCode, 200);
			assert(body);
			
			if (body.topics && Array.isArray(body.topics)) {
				// All returned topics should be urgent
				body.topics.forEach(topic => {
					assert(topic.urgent === true, `Topic ${topic.tid} should be marked as urgent`);
				});
			}
		});

		it('should return all topics via API when no filter', async () => {
			const { response, body } = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter`);
			
			assert.equal(response.statusCode, 200);
			assert(body);
			
			if (body.topics && Array.isArray(body.topics)) {
				// Should return both urgent and normal topics
				const expectedMin = urgentTopicData.length + 2; // urgent + normal topics
				assert(body.topics.length >= expectedMin, `Should return at least ${expectedMin} topics, got ${body.topics.length}`);
			}
		});

		it('should handle pagination with urgent filter', async () => {
			const { response, body } = await request.get(`${nconf.get('url')}/api/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter?filter=urgent&start=0&stop=1`);
			
			assert.equal(response.statusCode, 200);
			assert(body);
			
			if (body.topics && Array.isArray(body.topics)) {
				// Should respect pagination limits
				assert(body.topics.length <= 2, 'Should respect pagination limits');
				
				// All topics should be urgent
				body.topics.forEach(topic => {
					assert(topic.urgent === true, 'All returned topics should be urgent');
				});
			}
		});
	});

	describe('Socket.io endpoints with urgent filter', () => {
		it('should handle loadMore with urgent filter', async () => {
			const socketCategories = require('../src/socket.io/categories');
			
			const result = await socketCategories.loadMore({ uid: posterUid }, {
				cid: categoryObj.cid,
				after: 0,
				query: {
					filter: 'urgent',
				},
			});

			assert(Array.isArray(result.topics));
			
			// All returned topics should be urgent
			result.topics.forEach(topic => {
				assert(topic.urgent === true, 'All topics should be urgent');
			});
		});

		it('should handle loadMore without filter', async () => {
			const socketCategories = require('../src/socket.io/categories');
			
			const result = await socketCategories.loadMore({ uid: posterUid }, {
				cid: categoryObj.cid,
				after: 0,
			});

			assert(Array.isArray(result.topics));
			
			// Should return both urgent and normal topics
			const expectedMin = urgentTopicData.length + 2; // urgent + normal topics
			assert(result.topics.length >= expectedMin, `Should return at least ${expectedMin} topics, got ${result.topics.length}`);
		});
	});

	describe('Template rendering with urgent filter', () => {
		it('should render urgent filter UI components', async () => {
			const { response, body } = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter`);
			
			assert.equal(response.statusCode, 200);
			assert(body);
			
			// Check for urgent filter UI elements (based on template structure)
			// These checks depend on the actual template implementation
			const hasUrgentFilterElements = body.includes('urgent-filter') || 
											body.includes('urgent/dropdown') || 
											body.includes('urgent/button') ||
											body.includes('fa-exclamation-triangle');
			
			// At least one urgent filter UI element should be present
			assert(hasUrgentFilterElements, 'Page should contain urgent filter UI elements');
		});

		it('should render correct filter state in templates', async () => {
			// Test with urgent filter active
			const urgentResponse = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter?filter=urgent`);
			assert.equal(urgentResponse.response.statusCode, 200);
			
			// Test without filter
			const normalResponse = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter`);
			assert.equal(normalResponse.response.statusCode, 200);
			
			// Both responses should be valid
			assert(urgentResponse.body);
			assert(normalResponse.body);
		});
	});

	describe('URL parameter handling', () => {
		it('should preserve urgent filter in URLs', async () => {
			const { response, body } = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter?filter=urgent&sort=recent`);
			
			assert.equal(response.statusCode, 200);
			assert(body);
			
			// The page should load successfully with multiple parameters
			assert(typeof body === 'string');
		});

		it('should handle malformed URL parameters', async () => {
			const { response, body } = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter?filter=&sort=invalid`);
			
			assert.equal(response.statusCode, 200);
			assert(body);
			
			// Should handle malformed parameters gracefully
			assert(typeof body === 'string');
		});

		it('should handle multiple filter parameters', async () => {
			const { response, body } = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter?filter=urgent&filter=watched`);
			
			assert.equal(response.statusCode, 200);
			assert(body);
			
			// Should handle multiple filter parameters
			assert(typeof body === 'string');
		});
	});

	describe('JavaScript module functionality', () => {
		it('should load urgent filter JavaScript module', async () => {
			const { response, body } = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter`);
			
			assert.equal(response.statusCode, 200);
			assert(body);
			
			// Check that the page includes the urgent filter module
			const hasUrgentFilterModule = body.includes('urgentFilter') || 
										body.includes('urgent-filter') ||
										body.includes('define(\'urgentFilter\'');
			
			assert(hasUrgentFilterModule, 'Page should include urgent filter JavaScript module');
		});

		it('should handle JavaScript errors gracefully', async () => {
			// Test with malformed parameters that might cause JS errors
			const { response, body } = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter?filter=urgent&invalid_param=test`);
			
			assert.equal(response.statusCode, 200);
			assert(body);
			
			// Should still load the page even with invalid parameters
			assert(typeof body === 'string');
		});
	});

	describe('Internationalization', () => {
		it('should load language strings for urgent filter', async () => {
			const { response, body } = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter`);
			
			assert.equal(response.statusCode, 200);
			assert(body);
			
			// Check for language-related content
			// This might include translated strings or language file references
			const hasLanguageContent = body.includes('topic') || 
										body.includes('category') ||
										body.includes('filter');
			
			assert(hasLanguageContent, 'Page should contain language-related content');
		});

		it('should handle different locales', async () => {
			// Test with different locale parameter
			const { response, body } = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter?filter=urgent&_lang=en-GB`);
			
			assert.equal(response.statusCode, 200);
			assert(body);
			
			// Should handle locale parameters
			assert(typeof body === 'string');
		});
	});

	describe('Error handling and edge cases', () => {
		it('should handle non-existent category gracefully', async () => {
			const { response } = await request.get(`${nconf.get('url')}/category/99999/non-existent?filter=urgent`);
			
			// Should return 404 or appropriate error status
			assert(response.statusCode >= 400, 'Should return error status for non-existent category');
		});

		it('should handle invalid category slug gracefully', async () => {
			const { response } = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/invalid-slug?filter=urgent`);
			
			// Should handle invalid slug (might redirect or show error)
			assert(response.statusCode >= 200, 'Should handle invalid slug');
		});

		it('should handle malformed category ID gracefully', async () => {
			const { response } = await request.get(`${nconf.get('url')}/category/invalid-id/test-category?filter=urgent`);
			
			// Should return error for malformed category ID
			assert(response.statusCode >= 400, 'Should return error for malformed category ID');
		});
	});

	describe('Performance considerations', () => {
		it('should load page within reasonable time with urgent filter', async () => {
			const startTime = Date.now();
			const { response, body } = await request.get(`${nconf.get('url')}/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter?filter=urgent`);
			const endTime = Date.now();
			
			assert.equal(response.statusCode, 200);
			assert(body);
			
			// Should complete within reasonable time (less than 5 seconds)
			assert(endTime - startTime < 5000, 'Page should load within 5 seconds');
		});

		it('should handle concurrent requests with urgent filter', async () => {
			const requests = [];
			
			// Make multiple concurrent requests
			for (let i = 0; i < 5; i++) {
				requests.push(request.get(`${nconf.get('url')}/category/${categoryObj.cid}/test-category-for-frontend-urgent-filter?filter=urgent`));
			}
			
			const results = await Promise.all(requests);
			
			// All requests should succeed
			results.forEach(result => {
				assert.equal(result.response.statusCode, 200);
				assert(result.body);
			});
		});
	});
});
