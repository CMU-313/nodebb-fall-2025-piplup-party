'use strict';

const assert = require('assert');
const db = require('./mocks/databasemock');
const Categories = require('../src/categories');
const Topics = require('../src/topics');
const User = require('../src/user');

describe('Categories Urgent Filter', () => {
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

	it('should have getTopicIds function that accepts urgent filter', async () => {
		const data = {
			cid: categoryObj.cid,
			start: 0,
			stop: 10,
			filter: 'urgent',
		};

		// Just verify the function exists and doesn't crash
		const result = await Categories.getTopicIds(data);
		assert(Array.isArray(result), 'Should return an array');
	});

	it('should have getTopicCount function that accepts urgent filter', async () => {
		const data = {
			cid: categoryObj.cid,
			filter: 'urgent',
			category: categoryObj,
		};

		// Just verify the function exists and doesn't crash
		const result = await Categories.getTopicCount(data);
		assert(typeof result === 'number', 'Should return a number');
		assert(result >= 0, 'Should return non-negative number');
	});
});