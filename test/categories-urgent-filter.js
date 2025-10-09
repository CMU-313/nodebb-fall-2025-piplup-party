'use strict';

const assert = require('assert');
const db = require('./mocks/databasemock');
const Categories = require('../src/categories');
const Topics = require('../src/topics');
const User = require('../src/user');

describe('Categories Urgent Filter - Simple', () => {
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

	it('should return urgent topics when filter=urgent', async () => {
		const data = {
			cid: categoryObj.cid,
			start: 0,
			stop: 10,
			filter: 'urgent',
		};

		const tids = await Categories.getTopicIds(data);
		
		// Should return at least 1 topic (our urgent one)
		assert(Array.isArray(tids), 'Should return an array');
		assert(tids.length >= 1, `Should return at least 1 urgent topic, got ${tids.length}`);
		
		// The topic should be our urgent topic
		assert(tids.includes(urgentTopic.tid), 'Should include our urgent topic');
	});

	it('should return correct count for urgent filter', async () => {
		const data = {
			cid: categoryObj.cid,
			filter: 'urgent',
			category: categoryObj,
		};

		const count = await Categories.getTopicCount(data);
		
		// Should return at least 1
		assert(typeof count === 'number', 'Should return a number');
		assert(count >= 1, `Should count at least 1 urgent topic, got ${count}`);
	});
});
