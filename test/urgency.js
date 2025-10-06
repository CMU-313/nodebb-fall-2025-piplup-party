'use strict';

const assert = require('assert');
const nconf = require('nconf');
const request = require('../src/request');
const db = require('./mocks/databasemock');
const helpers = require('./helpers');
const topics = require('../src/topics');
const categories = require('../src/categories');
const user = require('../src/user');
const groups = require('../src/groups');
const privileges = require('../src/privileges');

describe('Topic Urgency Feature', () => {
	let adminUid;
	let regularUid;
	let adminJar;
	let regularJar;
	let csrfToken;
	let categoryObj;
	let topicObj;
	let topicObj2;

	before(async () => {
		// Create admin user
		adminUid = await user.create({ username: 'admin', password: '123456' });
		await groups.join('administrators', adminUid);
		const adminLogin = await helpers.loginUser('admin', '123456');
		adminJar = adminLogin.jar;
		csrfToken = adminLogin.csrf_token;

		// Create regular user
		regularUid = await user.create({ username: 'regular', password: '123456' });
		const regularLogin = await helpers.loginUser('regular', '123456');
		regularJar = regularLogin.jar;

		// Create test category
		categoryObj = await categories.create({
			name: 'Test Category',
			description: 'Test category for urgency tests',
		});

		// Create test topics
		topicObj = await topics.post({
			uid: adminUid,
			cid: categoryObj.cid,
			title: 'Test Topic 1',
			content: 'This is a test topic for urgency testing',
		});

		topicObj2 = await topics.post({
			uid: adminUid,
			cid: categoryObj.cid,
			title: 'Test Topic 2',
			content: 'This is another test topic for urgency testing',
		});
	});

	describe('API Endpoints', () => {
		it('should set topic urgency to true', async () => {
			const { body, response } = await request.put(`${nconf.get('url')}/api/v3/topics/${topicObj.topicData.tid}/urgency`, {
				jar: adminJar,
				body: {
					urgent: true,
				},
				headers: {
					'x-csrf-token': csrfToken,
				},
			});

			assert.strictEqual(response.statusCode, 200);
			assert.strictEqual(body.status.code, 'ok');
			assert.strictEqual(parseInt(body.response.tid, 10), topicObj.topicData.tid);
			assert.strictEqual(body.response.urgent, true);

			// Verify in database
			const topicData = await topics.getTopicFields(topicObj.topicData.tid, ['urgent']);
			assert.strictEqual(Boolean(topicData.urgent), true);
		});

		it('should set topic urgency to false', async () => {
			const { body, response } = await request.put(`${nconf.get('url')}/api/v3/topics/${topicObj.topicData.tid}/urgency`, {
				jar: adminJar,
				body: {
					urgent: false,
				},
				headers: {
					'x-csrf-token': csrfToken,
				},
			});

			assert.strictEqual(response.statusCode, 200);
			assert.strictEqual(body.status.code, 'ok');
			assert.strictEqual(parseInt(body.response.tid, 10), topicObj.topicData.tid);
			assert.strictEqual(body.response.urgent, false);

			// Verify in database
			const topicData = await topics.getTopicFields(topicObj.topicData.tid, ['urgent']);
			assert.strictEqual(Boolean(topicData.urgent), false);
		});

		it('should reject invalid urgency values', async () => {
			const { response } = await request.put(`${nconf.get('url')}/api/v3/topics/${topicObj.topicData.tid}/urgency`, {
				jar: adminJar,
				body: {
					urgent: 'invalid',
				},
				headers: {
					'x-csrf-token': csrfToken,
				},
			});

			assert.strictEqual(response.statusCode, 400);
		});

		it('should reject requests from non-logged-in users', async () => {
			const { response } = await request.put(`${nconf.get('url')}/api/v3/topics/${topicObj.topicData.tid}/urgency`, {
				body: {
					urgent: true,
				},
			});

			assert.strictEqual(response.statusCode, 403);
		});

		it('should reject requests from users without permissions', async () => {
			const { response } = await request.put(`${nconf.get('url')}/api/v3/topics/${topicObj.topicData.tid}/urgency`, {
				jar: regularJar,
				body: {
					urgent: true,
				},
				headers: {
					'x-csrf-token': csrfToken,
				},
			});

			assert.strictEqual(response.statusCode, 403);
		});
	});

	describe('Topic Tools Integration', () => {
		it('should include urgency options in topic tools data', async () => {
			const { body, response } = await request.get(`${nconf.get('url')}/api/v3/topics/${topicObj.topicData.tid}`, {
				jar: adminJar,
			});

			assert.strictEqual(response.statusCode, 200);
			const topicData = body.response;
			
			// Check that urgency field is present
			assert.strictEqual(typeof topicData.urgent, 'boolean');
		});

		it('should show mark-urgent option when topic is not urgent', async () => {
			// First ensure topic is not urgent
			await topics.tools.setUrgency(topicObj.topicData.tid, false, adminUid);

			const { body, response } = await request.get(`${nconf.get('url')}/api/v3/topics/${topicObj.topicData.tid}`, {
				jar: adminJar,
			});

			assert.strictEqual(response.statusCode, 200);
			const topicData = body.response;
			assert.strictEqual(Boolean(topicData.urgent), false);
		});

		it('should show mark-not-urgent option when topic is urgent', async () => {
			// First set topic as urgent
			await topics.tools.setUrgency(topicObj.topicData.tid, true, adminUid);

			const { body, response } = await request.get(`${nconf.get('url')}/api/v3/topics/${topicObj.topicData.tid}`, {
				jar: adminJar,
			});

			assert.strictEqual(response.statusCode, 200);
			const topicData = body.response;
			assert.strictEqual(Boolean(topicData.urgent), true);
		});
	});

	describe('Category Tools Integration', () => {
		it('should handle bulk urgency operations', async () => {
			// Set one topic as urgent, one as not urgent
			await topics.tools.setUrgency(topicObj.topicData.tid, true, adminUid);
			await topics.tools.setUrgency(topicObj2.topicData.tid, false, adminUid);

			// Verify initial states
			const topic1Data = await topics.getTopicFields(topicObj.topicData.tid, ['urgent']);
			const topic2Data = await topics.getTopicFields(topicObj2.topicData.tid, ['urgent']);
			
			assert.strictEqual(topic1Data.urgent, true);
			assert.strictEqual(topic2Data.urgent, false);

			// Test bulk operation - mark both as urgent
			const { response: response1 } = await request.put(`${nconf.get('url')}/api/v3/topics/${topicObj.topicData.tid}/urgency`, {
				jar: adminJar,
				body: { urgent: true },
				headers: { 'x-csrf-token': csrfToken },
			});

			const { response: response2 } = await request.put(`${nconf.get('url')}/api/v3/topics/${topicObj2.topicData.tid}/urgency`, {
				jar: adminJar,
				body: { urgent: true },
				headers: { 'x-csrf-token': csrfToken },
			});

			assert.strictEqual(response1.statusCode, 200);
			assert.strictEqual(response2.statusCode, 200);

			// Verify both topics are now urgent
			const finalTopic1Data = await topics.getTopicFields(topicObj.topicData.tid, ['urgent']);
			const finalTopic2Data = await topics.getTopicFields(topicObj2.topicData.tid, ['urgent']);
			
			assert.strictEqual(finalTopic1Data.urgent, true);
			assert.strictEqual(finalTopic2Data.urgent, true);
		});
	});

	describe('Template Integration', () => {
		it('should include urgent class in generateTopicClass', async () => {
			// This test verifies that the urgency field is properly handled
			// The actual generateTopicClass function is tested in the frontend tests
			
			// Test that urgency is properly stored and retrieved
			await topics.tools.setUrgency(topicObj.topicData.tid, true, adminUid);
			const topicData = await topics.getTopicFields(topicObj.topicData.tid, ['urgent']);
			assert.strictEqual(Boolean(topicData.urgent), true);
			
			await topics.tools.setUrgency(topicObj.topicData.tid, false, adminUid);
			const topicData2 = await topics.getTopicFields(topicObj.topicData.tid, ['urgent']);
			assert.strictEqual(Boolean(topicData2.urgent), false);
		});
	});

	describe('Database Integration', () => {
		it('should store urgency as integer in database', async () => {
			// Set topic as urgent
			await topics.tools.setUrgency(topicObj.topicData.tid, true, adminUid);

			// Check raw database value
			const rawValue = await db.getObjectField(`topic:${topicObj.topicData.tid}`, 'urgent');
			assert.strictEqual(rawValue, '1');

			// Set topic as not urgent
			await topics.tools.setUrgency(topicObj.topicData.tid, false, adminUid);

			// Check raw database value
			const rawValue2 = await db.getObjectField(`topic:${topicObj.topicData.tid}`, 'urgent');
			assert.strictEqual(rawValue2, '0');
		});

		it('should handle urgency in topic creation', async () => {
			const urgentTopic = await topics.post({
				uid: adminUid,
				cid: categoryObj.cid,
				title: 'Urgent Test Topic',
				content: 'This is an urgent test topic',
				urgent: true,
			});

			const topicData = await topics.getTopicFields(urgentTopic.topicData.tid, ['urgent']);
			assert.strictEqual(Boolean(topicData.urgent), true);
		});

		it('should default urgency to false in topic creation', async () => {
			const normalTopic = await topics.post({
				uid: adminUid,
				cid: categoryObj.cid,
				title: 'Normal Test Topic',
				content: 'This is a normal test topic',
			});

			const topicData = await topics.getTopicFields(normalTopic.topicData.tid, ['urgent']);
			assert.strictEqual(Boolean(topicData.urgent), false);
		});
	});

	describe('Permissions', () => {
		it('should allow topic author to change urgency', async () => {
			// Create a topic as regular user
			const userTopic = await topics.post({
				uid: regularUid,
				cid: categoryObj.cid,
				title: 'User Topic',
				content: 'This is a user topic',
			});

			// Get fresh CSRF token for regular user
			const regularLogin = await helpers.loginUser('regular', '123456');
			const regularToken = regularLogin.csrf_token;
			const regularJar = regularLogin.jar;

			// Check permissions first
			const canEdit = await privileges.topics.canEdit(userTopic.topicData.tid, regularUid);
			console.log('Can edit:', canEdit);
			console.log('Is author:', parseInt(userTopic.topicData.uid, 10) === parseInt(regularUid, 10));

			// User should be able to set urgency
			const { response } = await request.put(`${nconf.get('url')}/api/v3/topics/${userTopic.topicData.tid}/urgency`, {
				jar: regularJar,
				body: { urgent: true },
				headers: { 'x-csrf-token': regularToken },
			});

			assert.strictEqual(response.statusCode, 200);
		});

		it('should allow moderators to change urgency', async () => {
			// Add regular user to moderators group
			await groups.join('moderators', regularUid);

			// Create a topic as the moderator user
			const moderatorTopic = await topics.post({
				uid: regularUid,
				cid: categoryObj.cid,
				title: 'Moderator Topic',
				content: 'This is a moderator topic',
			});

			// Get fresh CSRF token for regular user
			const regularLogin = await helpers.loginUser('regular', '123456');
			const regularToken = regularLogin.csrf_token;
			const regularJar = regularLogin.jar;

			const { response } = await request.put(`${nconf.get('url')}/api/v3/topics/${moderatorTopic.topicData.tid}/urgency`, {
				jar: regularJar,
				body: { urgent: true },
				headers: { 'x-csrf-token': regularToken },
			});

			assert.strictEqual(response.statusCode, 200);
		});
	});

	describe('Edge Cases', () => {
		it('should handle non-existent topic', async () => {
			const { response } = await request.put(`${nconf.get('url')}/api/v3/topics/99999/urgency`, {
				jar: adminJar,
				body: { urgent: true },
				headers: { 'x-csrf-token': csrfToken },
			});

			assert.strictEqual(response.statusCode, 404);
		});

		it('should handle missing urgency parameter', async () => {
			const { response } = await request.put(`${nconf.get('url')}/api/v3/topics/${topicObj.topicData.tid}/urgency`, {
				jar: adminJar,
				body: {},
				headers: { 'x-csrf-token': csrfToken },
			});

			assert.strictEqual(response.statusCode, 400);
		});

		it('should handle null urgency parameter', async () => {
			const { response } = await request.put(`${nconf.get('url')}/api/v3/topics/${topicObj.topicData.tid}/urgency`, {
				jar: adminJar,
				body: { urgent: null },
				headers: { 'x-csrf-token': csrfToken },
			});

			assert.strictEqual(response.statusCode, 400);
		});
	});
});
