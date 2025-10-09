'use strict';

const assert = require('assert');
const db = require('./mocks/databasemock');
const Categories = require('../src/categories');
const Topics = require('../src/topics');
const User = require('../src/user');

describe('Topics Urgent Filter - Simple', () => {
	let categoryObj;
	let posterUid;
	let urgentTopic;

	before(async () => {
		// Create test user
		posterUid = await User.create({ username: 'poster' });
		
		// Create test category
		categoryObj = await Categories.create({
			name: 'Test Category',
			description: 'Simple test category',
		});

		// Create ONE urgent topic
		const urgentTopicResult = await Topics.post({
			uid: posterUid,
			cid: categoryObj.cid,
			title: 'URGENT: Test Topic',
			content: 'This is an urgent test topic',
		});

		// Mark it as urgent
		await Topics.setTopicFields(urgentTopicResult.topicData.tid, { urgent: true });
		urgentTopic = urgentTopicResult.topicData;
	});

	it('should filter urgent topics correctly', async () => {
		// Get all topic IDs in category
		const allTids = await Topics.getTopicIds({
			cid: categoryObj.cid,
			start: 0,
			stop: -1,
		});

		// Filter to urgent only
		const urgentTids = await Topics.filterUrgentTids(allTids);
		
		// Should return at least 1 urgent topic
		assert(Array.isArray(urgentTids), 'Should return an array');
		assert(urgentTids.length >= 1, `Should return at least 1 urgent topic, got ${urgentTids.length}`);
		
		// Should include our urgent topic
		assert(urgentTids.includes(urgentTopic.tid), 'Should include our urgent topic');
	});

	it('should work with getSortedTopics', async () => {
		const params = {
			cids: [categoryObj.cid],
			uid: posterUid,
			filter: 'urgent',
			start: 0,
			stop: 10,
		};

		const result = await Topics.getSortedTopics(params);
		
		assert(result, 'Should return a result');
		assert(Array.isArray(result.topics), 'Should return topics array');
		assert(result.topics.length >= 1, `Should return at least 1 urgent topic, got ${result.topics.length}`);
		
		// All returned topics should be urgent
		result.topics.forEach(topic => {
			assert(topic.urgent === true, 'All topics should be urgent');
		});
	});
});
