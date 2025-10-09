'use strict';

const assert = require('assert');
const nconf = require('nconf');

const db = require('./mocks/databasemock');
const Categories = require('../src/categories');
const Topics = require('../src/topics');
const User = require('../src/user');
const groups = require('../src/groups');

describe('Topics Urgent Filter', () => {
	let categoryObj;
	let posterUid;
	let urgentTopicData;
	let normalTopicData;

	before(async () => {
		// Create test users
		posterUid = await User.create({ username: 'poster' });
		
		// Create test category
		categoryObj = await Categories.create({
			name: 'Test Category for Topics Urgent Filter',
			description: 'Test category for topics urgent filter testing',
			icon: 'fa-check',
			blockclass: 'category-blue',
			order: '5',
		});

		// Create urgent topics
		const urgentTopic1 = await Topics.post({
			uid: posterUid,
			cid: categoryObj.cid,
			title: 'URGENT: Server Down',
			content: 'The server is down and needs immediate attention',
			tags: ['urgent', 'server'],
		});
		
		const urgentTopic2 = await Topics.post({
			uid: posterUid,
			cid: categoryObj.cid,
			title: 'URGENT: Database Connection Lost',
			content: 'Database connection has been lost',
			tags: ['urgent', 'database'],
		});

		const urgentTopic3 = await Topics.post({
			uid: posterUid,
			cid: categoryObj.cid,
			title: 'URGENT: Security Breach',
			content: 'Potential security breach detected',
			tags: ['urgent', 'security'],
		});

		// Mark topics as urgent
		await Topics.setTopicFields(urgentTopic1.topicData.tid, { urgent: true });
		await Topics.setTopicFields(urgentTopic2.topicData.tid, { urgent: true });
		await Topics.setTopicFields(urgentTopic3.topicData.tid, { urgent: true });
		
		urgentTopicData = [urgentTopic1.topicData, urgentTopic2.topicData, urgentTopic3.topicData];

		// Create normal (non-urgent) topics
		const normalTopic1 = await Topics.post({
			uid: posterUid,
			cid: categoryObj.cid,
			title: 'Regular Feature Request',
			content: 'This is a regular feature request',
			tags: ['feature'],
		});
		
		const normalTopic2 = await Topics.post({
			uid: posterUid,
			cid: categoryObj.cid,
			title: 'General Discussion',
			content: 'Just a general discussion topic',
			tags: ['discussion'],
		});

		const normalTopic3 = await Topics.post({
			uid: posterUid,
			cid: categoryObj.cid,
			title: 'Bug Report',
			content: 'Reporting a minor bug',
			tags: ['bug'],
		});

		normalTopicData = [normalTopic1.topicData, normalTopic2.topicData, normalTopic3.topicData];
	});

	describe('Topics.filterUrgentTids', () => {
		it('should filter out non-urgent topics', async () => {
			const allTids = [
				urgentTopicData[0].tid,
				normalTopicData[0].tid,
				urgentTopicData[1].tid,
				normalTopicData[1].tid,
			];

			const urgentTids = await Topics.filterUrgentTids(allTids);
			
			// Should only return urgent topic IDs
			assert(Array.isArray(urgentTids));
			assert(urgentTids.length === 2, 'Should return exactly 2 urgent topics');
			
			// Verify all returned TIDs are urgent
			urgentTids.forEach(tid => {
				assert(urgentTopicData.some(urgent => urgent.tid === tid), 
					`Topic ${tid} should be in urgent topics list`);
			});
		});

		it('should return empty array when no urgent topics provided', async () => {
			const normalTids = normalTopicData.map(topic => topic.tid);
			
			const urgentTids = await Topics.filterUrgentTids(normalTids);
			
			assert(Array.isArray(urgentTids));
			assert(urgentTids.length === 0, 'Should return empty array when no urgent topics');
		});

		it('should return all topics when all are urgent', async () => {
			const urgentTids = urgentTopicData.map(topic => topic.tid);
			
			const filteredTids = await Topics.filterUrgentTids(urgentTids);
			
			assert(Array.isArray(filteredTids));
			assert(filteredTids.length === urgentTids.length, 'Should return all topics when all are urgent');
			
			// Verify order is preserved
			urgentTids.forEach((tid, index) => {
				assert(filteredTids[index] === tid, 'Order should be preserved');
			});
		});

		it('should handle empty input array', async () => {
			const urgentTids = await Topics.filterUrgentTids([]);
			
			assert(Array.isArray(urgentTids));
			assert(urgentTids.length === 0, 'Should return empty array for empty input');
		});

		it('should handle null/undefined input', async () => {
			const urgentTids = await Topics.filterUrgentTids(null);
			
			assert(Array.isArray(urgentTids));
			assert(urgentTids.length === 0, 'Should return empty array for null input');
		});

		it('should handle mixed valid and invalid topic IDs', async () => {
			const mixedTids = [
				urgentTopicData[0].tid,
				'99999', // Invalid topic ID
				urgentTopicData[1].tid,
				'99998', // Another invalid topic ID
			];

			const urgentTids = await Topics.filterUrgentTids(mixedTids);
			
			// Should only return valid urgent topics
			assert(Array.isArray(urgentTids));
			assert(urgentTids.length === 2, 'Should return only valid urgent topics');
			
			urgentTids.forEach(tid => {
				assert(urgentTopicData.some(urgent => urgent.tid === tid), 
					`Topic ${tid} should be a valid urgent topic`);
			});
		});
	});

	describe('Topics.getSortedTopics with urgent filter', () => {
		it('should return only urgent topics when filter=urgent', async () => {
			const params = {
				cids: [categoryObj.cid],
				uid: posterUid,
				filter: 'urgent',
				start: 0,
				stop: 20,
			};

			const result = await Topics.getSortedTopics(params);
			
			assert(result);
			assert(Array.isArray(result.topics));
			
			// Verify all returned topics are urgent
			result.topics.forEach(topic => {
				assert(topic.urgent === true, `Topic ${topic.tid} should be marked as urgent`);
			});
			
			// Should return at least some urgent topics
			assert(result.topics.length >= 3, 'Should return at least 3 urgent topics');
		});

		it('should return all topics when filter is not urgent', async () => {
			const params = {
				cids: [categoryObj.cid],
				uid: posterUid,
				start: 0,
				stop: 20,
			};

			const result = await Topics.getSortedTopics(params);
			
			assert(result);
			assert(Array.isArray(result.topics));
			
			// Should return both urgent and normal topics
			assert(result.topics.length >= 6, 'Should return at least 6 topics (3 urgent + 3 normal)');
		});

		it('should work with different sort orders and urgent filter', async () => {
			const sortOptions = ['recent', 'old', 'create', 'posts', 'votes', 'views'];
			
			const results = await Promise.all(sortOptions.map(async (sort) => {
				const params = {
					cids: [categoryObj.cid],
					uid: posterUid,
					filter: 'urgent',
					sort: sort,
					start: 0,
					stop: 20,
				};

				const result = await Topics.getSortedTopics(params);
				
				assert(result, `Should return result for sort: ${sort}`);
				assert(Array.isArray(result.topics), `Should return topics array for sort: ${sort}`);
				
				// All topics should be urgent
				result.topics.forEach(topic => {
					assert(topic.urgent === true, `Topic should be urgent for sort: ${sort}`);
				});
				
				return { sort, success: true };
			}));
			
			// Verify all sort options completed successfully
			assert(results.length === sortOptions.length, 'All sort options should complete successfully');
		});

		it('should handle pagination correctly with urgent filter', async () => {
			const params = {
				cids: [categoryObj.cid],
				uid: posterUid,
				filter: 'urgent',
				start: 0,
				stop: 1,
			};

			const result = await Topics.getSortedTopics(params);
			
			assert(result);
			assert(Array.isArray(result.topics));
			
			// Should return limited number of urgent topics
			assert(result.topics.length <= 2, 'Should respect pagination limits');
			
			// All returned topics should be urgent
			result.topics.forEach(topic => {
				assert(topic.urgent === true, 'All returned topics should be urgent');
			});
		});

		it('should work with term filtering and urgent filter', async () => {
			const params = {
				cids: [categoryObj.cid],
				uid: posterUid,
				filter: 'urgent',
				term: 'alltime',
				start: 0,
				stop: 20,
			};

			const result = await Topics.getSortedTopics(params);
			
			assert(result);
			assert(Array.isArray(result.topics));
			
			// All topics should be urgent
			result.topics.forEach(topic => {
				assert(topic.urgent === true, 'All topics should be urgent with term filtering');
			});
		});
	});

	describe('Integration with other filters', () => {
		it('should work with watched filter and urgent filter', async () => {
			// First, make user watch the category
			await Categories.watch([categoryObj.cid], posterUid);
			
			const params = {
				cids: [categoryObj.cid],
				uid: posterUid,
				filter: 'urgent',
				start: 0,
				stop: 20,
			};

			const result = await Topics.getSortedTopics(params);
			
			assert(result);
			assert(Array.isArray(result.topics));
			
			// Should still return urgent topics
			result.topics.forEach(topic => {
				assert(topic.urgent === true, 'All topics should be urgent');
			});
		});

		it('should work with tag filtering and urgent filter', async () => {
			const params = {
				cids: [categoryObj.cid],
				uid: posterUid,
				filter: 'urgent',
				tags: ['server'],
				start: 0,
				stop: 20,
			};

			const result = await Topics.getSortedTopics(params);
			
			assert(result);
			assert(Array.isArray(result.topics));
			
			// Should return urgent topics with specific tag
			result.topics.forEach(topic => {
				assert(topic.urgent === true, 'All topics should be urgent');
				assert(topic.tags.some(tag => tag.value === 'server'), 'All topics should have server tag');
			});
		});
	});

	describe('Performance and edge cases', () => {
		it('should handle large number of topics efficiently', async () => {
			// Create additional topics to test performance
			const promises = [];
			for (let i = 0; i < 20; i++) {
				promises.push(Topics.post({
					uid: posterUid,
					cid: categoryObj.cid,
					title: `Performance Test Topic ${i}`,
					content: `Content for performance test topic ${i}`,
				}));
			}
			await Promise.all(promises);

			const params = {
				cids: [categoryObj.cid],
				uid: posterUid,
				filter: 'urgent',
				start: 0,
				stop: 50,
			};

			const startTime = Date.now();
			const result = await Topics.getSortedTopics(params);
			const endTime = Date.now();
			
			// Should complete within reasonable time (less than 2 seconds)
			assert(endTime - startTime < 2000, 'Should complete within 2 seconds');
			assert(result);
			assert(Array.isArray(result.topics));
		});

		it('should handle invalid category IDs gracefully', async () => {
			const params = {
				cids: [99999],
				uid: posterUid,
				filter: 'urgent',
				start: 0,
				stop: 20,
			};

			const result = await Topics.getSortedTopics(params);
			
			assert(result);
			assert(Array.isArray(result.topics));
			assert(result.topics.length === 0, 'Should return empty array for invalid category');
		});

		it('should handle malformed parameters gracefully', async () => {
			const params = {
				cids: [categoryObj.cid],
				uid: posterUid,
				filter: 'urgent',
				start: null,
				stop: undefined,
			};

			const result = await Topics.getSortedTopics(params);
			
			assert(result);
			assert(Array.isArray(result.topics));
		});
	});

	describe('Data integrity', () => {
		it('should preserve topic data integrity when filtering', async () => {
			const allTids = [
				urgentTopicData[0].tid,
				normalTopicData[0].tid,
				urgentTopicData[1].tid,
			];

			const urgentTids = await Topics.filterUrgentTids(allTids);
			
			// Verify the filtered topics still have all their data
			const topicData = await Topics.getTopicsFields(urgentTids, [
				'tid', 'title', 'content', 'urgent', 'cid', 'uid', 'timestamp',
			]);
			
			topicData.forEach(topic => {
				assert(topic.tid, 'Topic should have TID');
				assert(topic.title, 'Topic should have title');
				assert(topic.content, 'Topic should have content');
				assert(topic.urgent === true, 'Topic should be marked as urgent');
				assert(topic.cid, 'Topic should have category ID');
				assert(topic.uid, 'Topic should have user ID');
				assert(topic.timestamp, 'Topic should have timestamp');
			});
		});

		it('should not modify original topic data', async () => {
			const originalTid = urgentTopicData[0].tid;
			
			// Get original topic data
			const originalData = await Topics.getTopicFields(originalTid, ['urgent', 'title', 'content']);
			
			// Filter topics
			await Topics.filterUrgentTids([originalTid]);
			
			// Verify original data is unchanged
			const afterFilterData = await Topics.getTopicFields(originalTid, ['urgent', 'title', 'content']);
			
			assert.deepStrictEqual(originalData, afterFilterData, 'Original topic data should not be modified');
		});
	});
});
