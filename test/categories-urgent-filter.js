'use strict';

const assert = require('assert');
const nconf = require('nconf');

const db = require('./mocks/databasemock');
const Categories = require('../src/categories');
const Topics = require('../src/topics');
const User = require('../src/user');
const groups = require('../src/groups');
const privileges = require('../src/privileges');

describe('Categories Urgent Filter', () => {
	let categoryObj;
	let posterUid;
	let urgentTopicData;
	let normalTopicData;

	before(async () => {
		// Create test users
		posterUid = await User.create({ username: 'poster' });
		
		// Create test category
		categoryObj = await Categories.create({
			name: 'Test Category for Urgent Filter',
			description: 'Test category for urgent filter testing',
			icon: 'fa-check',
			blockclass: 'category-blue',
			order: '5',
		});

		// Create urgent topics
		const urgentTopic1 = await Topics.post({
			uid: posterUid,
			cid: categoryObj.cid,
			title: 'URGENT: Critical System Issue',
			content: 'This is an urgent topic that requires immediate attention',
			tags: ['urgent', 'critical'],
		});
		
		const urgentTopic2 = await Topics.post({
			uid: posterUid,
			cid: categoryObj.cid,
			title: 'URGENT: Security Vulnerability',
			content: 'Security vulnerability that needs urgent patching',
			tags: ['urgent', 'security'],
		});

		// Mark topics as urgent
		await Topics.setTopicFields(urgentTopic1.topicData.tid, { urgent: true });
		await Topics.setTopicFields(urgentTopic2.topicData.tid, { urgent: true });
		
		urgentTopicData = [urgentTopic1.topicData, urgentTopic2.topicData];

		// Create normal (non-urgent) topics
		const normalTopic1 = await Topics.post({
			uid: posterUid,
			cid: categoryObj.cid,
			title: 'Regular Discussion Topic',
			content: 'This is a normal discussion topic',
			tags: ['discussion'],
		});
		
		const normalTopic2 = await Topics.post({
			uid: posterUid,
			cid: categoryObj.cid,
			title: 'General Question',
			content: 'Just a general question about the system',
			tags: ['question'],
		});

		normalTopicData = [normalTopic1.topicData, normalTopic2.topicData];
	});

	describe('Categories.getTopicIds with urgent filter', () => {
		it('should return only urgent topics when filter=urgent', async () => {
			const data = {
				cid: categoryObj.cid,
				start: 0,
				stop: 10,
				uid: 0,
				filter: 'urgent',
			};

			const tids = await Categories.getTopicIds(data);
			
			// Should only return urgent topics
			assert(Array.isArray(tids));
			assert(tids.length > 0, 'Should return some urgent topics');
			
			// Verify all returned topics are urgent
			const topicData = await Topics.getTopicsFields(tids, ['urgent']);
			topicData.forEach(topic => {
				assert(topic.urgent === true, `Topic ${topic.tid} should be marked as urgent`);
			});
		});

		it('should return all topics when filter is not urgent', async () => {
			const data = {
				cid: categoryObj.cid,
				start: 0,
				stop: 10,
				uid: 0,
			};

			const tids = await Categories.getTopicIds(data);
			
			// Should return all topics (urgent + normal)
			assert(Array.isArray(tids));
			assert(tids.length >= 4, 'Should return at least 4 topics (2 urgent + 2 normal)');
		});

		it('should apply pagination correctly with urgent filter', async () => {
			const data = {
				cid: categoryObj.cid,
				start: 0,
				stop: 1,
				uid: 0,
				filter: 'urgent',
			};

			const tids = await Categories.getTopicIds(data);
			
			// Should return only 1 urgent topic due to pagination
			assert(Array.isArray(tids));
			assert(tids.length <= 2, 'Should return at most 2 urgent topics');
		});

		it('should work with different sort orders and urgent filter', async () => {
			const sortOptions = ['recently_replied', 'recently_created', 'most_posts', 'most_votes', 'most_views'];
			
			const results = await Promise.all(sortOptions.map(async (sort) => {
				const data = {
					cid: categoryObj.cid,
					start: 0,
					stop: 10,
					uid: 0,
					filter: 'urgent',
					sort: sort,
				};

				const tids = await Categories.getTopicIds(data);
				
				// Should return only urgent topics regardless of sort order
				assert(Array.isArray(tids), `Should return array for sort: ${sort}`);
				
				if (tids.length > 0) {
					const topicData = await Topics.getTopicsFields(tids, ['urgent']);
					topicData.forEach(topic => {
						assert(topic.urgent === true, `Topic should be urgent for sort: ${sort}`);
					});
				}
				
				return { sort, tids };
			}));
			
			// Verify all sorts completed successfully
			assert(results.length === sortOptions.length, 'All sort options should complete');
		});
	});

	describe('Categories.getTopicCount with urgent filter', () => {
		it('should return correct count of urgent topics', async () => {
			// First, verify our urgent topics are actually marked as urgent
			const urgentTids = await Topics.filterUrgentTids(urgentTopicData.map(t => t.tid));
			assert(urgentTids.length >= 2, `Should have at least 2 urgent topics, got ${urgentTids.length}`);
			
			const data = {
				cid: categoryObj.cid,
				filter: 'urgent',
				category: categoryObj,
			};

			const count = await Categories.getTopicCount(data);
			
			// Should return count of urgent topics only
			assert(typeof count === 'number', 'Should return a number');
			assert(count >= 2, `Should count at least 2 urgent topics, got ${count}`);
		});

		it('should return total topic count when filter is not urgent', async () => {
			const data = {
				cid: categoryObj.cid,
				category: categoryObj,
			};

			const count = await Categories.getTopicCount(data);
			
			// Should return total topic count
			assert(typeof count === 'number');
			assert(count >= 4, 'Should count all topics (urgent + normal)');
		});
	});

	describe('Categories.getCategoryTopics with urgent filter', () => {
		it('should return only urgent topics when filter=urgent', async () => {
			const data = {
				cid: categoryObj.cid,
				start: 0,
				stop: 10,
				uid: 0,
				filter: 'urgent',
			};

			const result = await Categories.getCategoryTopics(data);
			
			assert(result);
			assert(Array.isArray(result.topics));
			
			// Verify all returned topics are urgent
			result.topics.forEach(topic => {
				assert(topic.urgent === true, `Topic ${topic.tid} should be marked as urgent`);
			});
		});

		it('should return all topics when filter is not specified', async () => {
			const data = {
				cid: categoryObj.cid,
				start: 0,
				stop: 10,
				uid: 0,
			};

			const result = await Categories.getCategoryTopics(data);
			
			assert(result);
			assert(Array.isArray(result.topics));
			assert(result.topics.length >= 4, 'Should return all topics');
		});
	});

	describe('Integration with existing category functionality', () => {
		it('should work with category privileges', async () => {
			const data = {
				cid: categoryObj.cid,
				start: 0,
				stop: 10,
				uid: posterUid,
				filter: 'urgent',
			};

			const tids = await Categories.getTopicIds(data);
			
			// Should still work with user privileges
			assert(Array.isArray(tids));
		});

		it('should work with pinned topics', async () => {
			// Pin one of the urgent topics
			await Topics.tools.pin(urgentTopicData[0].tid, posterUid);
			
			const data = {
				cid: categoryObj.cid,
				start: 0,
				stop: 10,
				uid: 0,
				filter: 'urgent',
			};

			const tids = await Categories.getTopicIds(data);
			
			// Should include pinned urgent topics
			assert(Array.isArray(tids));
			assert(tids.includes(urgentTopicData[0].tid), 'Should include pinned urgent topic');
			
			// Cleanup
			await Topics.tools.unpin(urgentTopicData[0].tid, posterUid);
		});

		it('should work with tag filtering', async () => {
			const data = {
				cid: categoryObj.cid,
				start: 0,
				stop: 10,
				uid: 0,
				filter: 'urgent',
				tag: 'critical',
			};

			const tids = await Categories.getTopicIds(data);
			
			// Should return urgent topics with specific tag
			assert(Array.isArray(tids));
			
			if (tids.length > 0) {
				const topicData = await Topics.getTopicsFields(tids, ['urgent', 'tags']);
				topicData.forEach(topic => {
					assert(topic.urgent === true, 'Topic should be urgent');
					assert(topic.tags.some(tag => tag.value === 'critical'), 'Topic should have critical tag');
				});
			}
		});
	});

	describe('Edge cases and error handling', () => {
		it('should handle empty topic list gracefully', async () => {
			// Create a new category with no topics
			const emptyCategory = await Categories.create({
				name: 'Empty Category',
				description: 'Category with no topics',
			});

			const data = {
				cid: emptyCategory.cid,
				start: 0,
				stop: 10,
				uid: 0,
				filter: 'urgent',
			};

			const tids = await Categories.getTopicIds(data);
			
			// Should return empty array
			assert(Array.isArray(tids));
			assert(tids.length === 0, 'Should return empty array for category with no topics');
		});

		it('should handle invalid category ID gracefully', async () => {
			const data = {
				cid: 99999,
				start: 0,
				stop: 10,
				uid: 0,
				filter: 'urgent',
			};

			const tids = await Categories.getTopicIds(data);
			
			// Should return empty array for invalid category
			assert(Array.isArray(tids));
			assert(tids.length === 0, 'Should return empty array for invalid category');
		});

		it('should handle malformed filter parameter', async () => {
			const data = {
				cid: categoryObj.cid,
				start: 0,
				stop: 10,
				uid: 0,
				filter: null,
			};

			const tids = await Categories.getTopicIds(data);
			
			// Should work normally when filter is null
			assert(Array.isArray(tids));
		});
	});

	describe('Performance considerations', () => {
		it('should handle large number of topics efficiently', async () => {
			// Create additional topics to test performance
			const promises = [];
			for (let i = 0; i < 10; i++) {
				promises.push(Topics.post({
					uid: posterUid,
					cid: categoryObj.cid,
					title: `Test Topic ${i}`,
					content: `Content for test topic ${i}`,
				}));
			}
			await Promise.all(promises);

			const data = {
				cid: categoryObj.cid,
				start: 0,
				stop: 20,
				uid: 0,
				filter: 'urgent',
			};

			const startTime = Date.now();
			const tids = await Categories.getTopicIds(data);
			const endTime = Date.now();
			
			// Should complete within reasonable time (less than 1 second)
			assert(endTime - startTime < 1000, 'Should complete within 1 second');
			assert(Array.isArray(tids));
		});
	});
});
