'use strict';

const assert = require('assert');
const nconf = require('nconf');
const request = require('../src/request');
const helpers = require('./helpers');
const user = require('../src/user');
const groups = require('../src/groups');
const categories = require('../src/categories');
const topics = require('../src/topics');

describe('Urgency Feature - Acceptance Criteria', () => {
	let adminUid;
	let adminJar;
	let csrfToken;
	let categoryObj;
	let topicObj;

	before(async () => {
		// Create admin user
		adminUid = await user.create({ username: 'admin', password: '123456' });
		await groups.join('administrators', adminUid);
		const adminLogin = await helpers.loginUser('admin', '123456');
		adminJar = adminLogin.jar;
		csrfToken = adminLogin.csrf_token;

		// Create test category
		categoryObj = await categories.create({
			name: 'Test Category',
			description: 'Test category for acceptance criteria tests',
		});

		// Create test topic
		topicObj = await topics.post({
			uid: adminUid,
			cid: categoryObj.cid,
			title: 'Acceptance Test Topic',
			content: 'This is a test topic for acceptance criteria testing',
		});
	});

	describe('AC1: "Mark as urgent/not urgent" option exists under topic tools dropdown menu', () => {
		describe('Per Topic View', () => {
			it('should show "Mark Topic Urgent" option when topic is not urgent', async () => {
				// Ensure topic is not urgent
				await topics.tools.setUrgency(topicObj.topicData.tid, false, adminUid);

				const { body, response } = await request.get(`${nconf.get('url')}/topic/${topicObj.topicData.slug}`, {
					jar: adminJar,
				});

				assert.strictEqual(response.statusCode, 200);

				// Check for mark urgent option
				assert(body.includes('component="topic/mark-urgent"'), 'Mark urgent component should be present');
				assert(body.includes('Mark Topic Urgent'), 'Mark Topic Urgent text should be present');
				assert(body.includes('fa-exclamation-triangle'), 'Exclamation triangle icon should be present');
				
				// Verify it's not hidden
				assert(!body.includes('component="topic/mark-urgent" hidden'), 'Mark urgent option should not be hidden');
			});

			it('should show "Mark Topic Not Urgent" option when topic is urgent', async () => {
				// Set topic as urgent
				await topics.tools.setUrgency(topicObj.topicData.tid, true, adminUid);

				const { body, response } = await request.get(`${nconf.get('url')}/topic/${topicObj.topicData.slug}`, {
					jar: adminJar,
				});

				assert.strictEqual(response.statusCode, 200);

				// Check for mark not urgent option
				assert(body.includes('component="topic/mark-not-urgent"'), 'Mark not urgent component should be present');
				assert(body.includes('Mark Topic Not Urgent'), 'Mark Topic Not Urgent text should be present');
				assert(body.includes('fa-exclamation'), 'Exclamation icon should be present');
				
				// Verify it's not hidden
				assert(!body.includes('component="topic/mark-not-urgent" hidden'), 'Mark not urgent option should not be hidden');
			});

			it('should hide "Mark Topic Urgent" when topic is urgent', async () => {
				// Set topic as urgent
				await topics.tools.setUrgency(topicObj.topicData.tid, true, adminUid);

				const { body, response } = await request.get(`${nconf.get('url')}/topic/${topicObj.topicData.slug}`, {
					jar: adminJar,
				});

				assert.strictEqual(response.statusCode, 200);

				// Check that mark urgent is hidden
				assert(body.includes('component="topic/mark-urgent" {{{ if urgent }}}hidden{{{ end }}}'), 'Mark urgent should be conditionally hidden');
			});

			it('should hide "Mark Topic Not Urgent" when topic is not urgent', async () => {
				// Ensure topic is not urgent
				await topics.tools.setUrgency(topicObj.topicData.tid, false, adminUid);

				const { body, response } = await request.get(`${nconf.get('url')}/topic/${topicObj.topicData.slug}`, {
					jar: adminJar,
				});

				assert.strictEqual(response.statusCode, 200);

				// Check that mark not urgent is hidden
				assert(body.includes('component="topic/mark-not-urgent" {{{ if !urgent }}}hidden{{{ end }}}'), 'Mark not urgent should be conditionally hidden');
			});
		});

		describe('Topic List View', () => {
			it('should show urgency options in category tools dropdown', async () => {
				const { body, response } = await request.get(`${nconf.get('url')}/category/${categoryObj.slug}`, {
					jar: adminJar,
				});

				assert.strictEqual(response.statusCode, 200);

				// Check for both urgency options in category tools
				assert(body.includes('component="topic/mark-urgent"'), 'Mark urgent component should be present in category tools');
				assert(body.includes('component="topic/mark-not-urgent"'), 'Mark not urgent component should be present in category tools');
				assert(body.includes('Mark Topic Urgent'), 'Mark Topic Urgent text should be present in category tools');
				assert(body.includes('Mark Topic Not Urgent'), 'Mark Topic Not Urgent text should be present in category tools');
			});

			it('should show urgency options in recent topics view', async () => {
				const { body, response } = await request.get(`${nconf.get('url')}/recent`, {
					jar: adminJar,
				});

				assert.strictEqual(response.statusCode, 200);

				// Check for urgency options in recent topics
				assert(body.includes('component="topic/mark-urgent"'), 'Mark urgent component should be present in recent topics');
				assert(body.includes('component="topic/mark-not-urgent"'), 'Mark not urgent component should be present in recent topics');
			});
		});
	});

	describe('AC2: Clicking that option adds/removes urgent tag from posts', () => {
		describe('API Functionality', () => {
			it('should add urgent tag when marking as urgent', async () => {
				// Ensure topic starts as not urgent
				await topics.tools.setUrgency(topicObj.topicData.tid, false, adminUid);

				// Mark as urgent via API
				const { body, response } = await request.put(`${nconf.get('url')}/api/v3/topics/${topicObj.topicData.tid}/urgency`, {
					jar: adminJar,
					body: { urgent: true },
					headers: { 'x-csrf-token': csrfToken },
				});

				assert.strictEqual(response.statusCode, 200);
				assert.strictEqual(body.response.urgent, true);

				// Verify in database
				const topicData = await topics.getTopicFields(topicObj.topicData.tid, ['urgent']);
				assert.strictEqual(topicData.urgent, true);
			});

			it('should remove urgent tag when marking as not urgent', async () => {
				// Ensure topic starts as urgent
				await topics.tools.setUrgency(topicObj.topicData.tid, true, adminUid);

				// Mark as not urgent via API
				const { body, response } = await request.put(`${nconf.get('url')}/api/v3/topics/${topicObj.topicData.tid}/urgency`, {
					jar: adminJar,
					body: { urgent: false },
					headers: { 'x-csrf-token': csrfToken },
				});

				assert.strictEqual(response.statusCode, 200);
				assert.strictEqual(body.response.urgent, false);

				// Verify in database
				const topicData = await topics.getTopicFields(topicObj.topicData.tid, ['urgent']);
				assert.strictEqual(topicData.urgent, false);
			});
		});

		describe('UI Updates', () => {
			it('should show urgent badge when topic is marked as urgent', async () => {
				// Mark topic as urgent
				await topics.tools.setUrgency(topicObj.topicData.tid, true, adminUid);

				const { body, response } = await request.get(`${nconf.get('url')}/topic/${topicObj.topicData.slug}`, {
					jar: adminJar,
				});

				assert.strictEqual(response.statusCode, 200);

				// Check for urgent badge
				assert(body.includes('component="topic/urgent"'), 'Urgent badge component should be present');
				assert(body.includes('badge bg-danger'), 'Urgent badge should have danger styling');
				assert(body.includes('fa-exclamation-triangle'), 'Urgent badge should have exclamation triangle icon');
			});

			it('should hide urgent badge when topic is marked as not urgent', async () => {
				// Mark topic as not urgent
				await topics.tools.setUrgency(topicObj.topicData.tid, false, adminUid);

				const { body, response } = await request.get(`${nconf.get('url')}/topic/${topicObj.topicData.slug}`, {
					jar: adminJar,
				});

				assert.strictEqual(response.statusCode, 200);

				// Check that urgent badge is hidden
				assert(body.includes('component="topic/urgent"'), 'Urgent badge component should be present but hidden');
				assert(body.includes('{{{ if !./urgent }}}hidden{{{ end }}}'), 'Urgent badge should be conditionally hidden');
			});

			it('should show urgent badge in topic list when urgent', async () => {
				// Mark topic as urgent
				await topics.tools.setUrgency(topicObj.topicData.tid, true, adminUid);

				const { body, response } = await request.get(`${nconf.get('url')}/category/${categoryObj.slug}`, {
					jar: adminJar,
				});

				assert.strictEqual(response.statusCode, 200);

				// Check for urgent badge in topic list
				assert(body.includes('component="topic/urgent"'), 'Urgent badge should be present in topic list');
				assert(body.includes('topic-urgent'), 'Urgent badge should have topic-urgent class');
				assert(body.includes('fa-exclamation-triangle'), 'Urgent badge should have exclamation triangle icon');
			});

			it('should add urgent class to topic list item when urgent', async () => {
				// Mark topic as urgent
				await topics.tools.setUrgency(topicObj.topicData.tid, true, adminUid);

				const { body, response } = await request.get(`${nconf.get('url')}/category/${categoryObj.slug}`, {
					jar: adminJar,
				});

				assert.strictEqual(response.statusCode, 200);

				// Check that topic list item has urgent class
				assert(body.includes('urgent'), 'Topic list item should have urgent class when topic is urgent');
			});
		});

		describe('Bulk Operations', () => {
			it('should handle bulk urgency operations in topic list', async () => {
				// Create additional test topic
				const topicObj2 = await topics.post({
					uid: adminUid,
					cid: categoryObj.cid,
					title: 'Bulk Test Topic',
					content: 'This is another test topic for bulk operations',
				});

				// Test bulk marking as urgent
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

				// Verify both topics are urgent
				const topic1Data = await topics.getTopicFields(topicObj.topicData.tid, ['urgent']);
				const topic2Data = await topics.getTopicFields(topicObj2.topicData.tid, ['urgent']);
				
				assert.strictEqual(topic1Data.urgent, true);
				assert.strictEqual(topic2Data.urgent, true);
			});
		});
	});

	describe('End-to-End Workflow', () => {
		it('should complete full urgency workflow', async () => {
			// 1. Create a new topic
			const newTopic = await topics.post({
				uid: adminUid,
				cid: categoryObj.cid,
				title: 'E2E Test Topic',
				content: 'This is an end-to-end test topic',
			});

			// 2. Verify topic starts as not urgent
			let topicData = await topics.getTopicFields(newTopic.topicData.tid, ['urgent']);
			assert.strictEqual(topicData.urgent, false);

			// 3. Mark as urgent via API
			const { body: urgentBody, response: urgentResponse } = await request.put(`${nconf.get('url')}/api/v3/topics/${newTopic.topicData.tid}/urgency`, {
				jar: adminJar,
				body: { urgent: true },
				headers: { 'x-csrf-token': csrfToken },
			});

			assert.strictEqual(urgentResponse.statusCode, 200);

			// 4. Verify topic is now urgent
			topicData = await topics.getTopicFields(newTopic.topicData.tid, ['urgent']);
			assert.strictEqual(topicData.urgent, true);

			// 5. Verify UI shows urgent state
			const { body: topicViewBody, response: topicViewResponse } = await request.get(`${nconf.get('url')}/topic/${newTopic.topicData.slug}`, {
				jar: adminJar,
			});

			assert.strictEqual(topicViewResponse.statusCode, 200);
			assert(topicViewBody.includes('component="topic/urgent"'), 'Urgent badge should be visible');
			assert(topicViewBody.includes('component="topic/mark-not-urgent"'), 'Mark not urgent option should be visible');

			// 6. Mark as not urgent via API
			const { body: notUrgentBody, response: notUrgentResponse } = await request.put(`${nconf.get('url')}/api/v3/topics/${newTopic.topicData.tid}/urgency`, {
				jar: adminJar,
				body: { urgent: false },
				headers: { 'x-csrf-token': csrfToken },
			});

			assert.strictEqual(notUrgentResponse.statusCode, 200);

			// 7. Verify topic is no longer urgent
			topicData = await topics.getTopicFields(newTopic.topicData.tid, ['urgent']);
			assert.strictEqual(topicData.urgent, false);

			// 8. Verify UI shows non-urgent state
			const { body: finalTopicViewBody, response: finalTopicViewResponse } = await request.get(`${nconf.get('url')}/topic/${newTopic.topicData.slug}`, {
				jar: adminJar,
			});

			assert.strictEqual(finalTopicViewResponse.statusCode, 200);
			assert(finalTopicViewBody.includes('component="topic/mark-urgent"'), 'Mark urgent option should be visible');
		});
	});
});
