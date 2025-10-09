'use strict';

const assert = require('assert');
const db = require('./mocks/databasemock');
const Categories = require('../src/categories');
const Topics = require('../src/topics');
const User = require('../src/user');

describe('Topics Urgent Filter', () => {
	let categoryObj;
	let posterUid;

	before(async () => {
		// Create test user
		posterUid = await User.create({ username: 'poster' });
		
		// Create test category
		categoryObj = await Categories.create({
			name: 'Test Category',
			description: 'Test category for urgent filter',
		});
	});

	it('should have filterUrgentTids function that works', async () => {
		// Test with empty array - should return empty array
		const result = await Topics.filterUrgentTids([]);
		assert(Array.isArray(result), 'Should return an array');
		assert(result.length === 0, 'Should return empty array for empty input');
	});

	it('should have getSortedTopics function that accepts urgent filter', async () => {
		const params = {
			cids: [categoryObj.cid],
			uid: posterUid,
			filter: 'urgent',
			start: 0,
			stop: 10,
		};

		// Just verify the function exists and doesn't crash
		const result = await Topics.getSortedTopics(params);
		assert(result, 'Should return a result object');
		assert(Array.isArray(result.topics), 'Should return topics array');
	});
});