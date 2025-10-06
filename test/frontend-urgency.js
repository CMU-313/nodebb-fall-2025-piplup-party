'use strict';

const assert = require('assert');
const nconf = require('nconf');
const request = require('../src/request');
const helpers = require('./helpers');
const user = require('../src/user');
const groups = require('../src/groups');
const categories = require('../src/categories');
const topics = require('../src/topics');

describe('Frontend Urgency Integration', () => {
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
			description: 'Test category for frontend urgency tests',
		});

		// Create test topic
		topicObj = await topics.post({
			uid: adminUid,
			cid: categoryObj.cid,
			title: 'Frontend Test Topic',
			content: 'This is a test topic for frontend urgency testing',
		});
	});

	describe('Topic View Templates', () => {
		it('should include urgency options in topic menu template', async () => {
			const { body, response } = await request.get(`${nconf.get('url')}/topic/${topicObj.topicData.slug}`, {
				jar: adminJar,
			});

			assert.strictEqual(response.statusCode, 200);

			// Check for urgency menu items in the HTML
			assert(body.includes('component="topic/mark-urgent"'), 'Mark urgent option should be present');
			assert(body.includes('component="topic/mark-not-urgent"'), 'Mark not urgent option should be present');
			assert(body.includes('Mark Topic Urgent'), 'Mark Topic Urgent text should be present');
			assert(body.includes('Mark Topic Not Urgent'), 'Mark Topic Not Urgent text should be present');
		});

		it('should show correct urgency option based on topic state', async () => {
			// Test with non-urgent topic
			await topics.tools.setUrgency(topicObj.topicData.tid, false, adminUid);

			const { body: body1, response: response1 } = await request.get(`${nconf.get('url')}/topic/${topicObj.topicData.slug}`, {
				jar: adminJar,
			});

			assert.strictEqual(response1.statusCode, 200);

			// When not urgent, mark-urgent should be visible, mark-not-urgent should be hidden
			assert(body1.includes('component="topic/mark-urgent"'), 'Mark urgent option should be present for non-urgent topic');
			assert(body1.includes('Mark Topic Urgent'), 'Mark Topic Urgent text should be present');

			// Test with urgent topic
			await topics.tools.setUrgency(topicObj.topicData.tid, true, adminUid);

			const { body: body2, response: response2 } = await request.get(`${nconf.get('url')}/topic/${topicObj.topicData.slug}`, {
				jar: adminJar,
			});

			assert.strictEqual(response2.statusCode, 200);

			// When urgent, mark-not-urgent should be visible, mark-urgent should be hidden
			assert(body2.includes('component="topic/mark-not-urgent"'), 'Mark not urgent option should be present for urgent topic');
			assert(body2.includes('Mark Topic Not Urgent'), 'Mark Topic Not Urgent text should be present');
		});

		it('should include urgent badge in topic view when urgent', async () => {
			// Set topic as urgent
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
	});

	describe('Category View Templates', () => {
		it('should include urgency options in category tools dropdown', async () => {
			const { body, response } = await request.get(`${nconf.get('url')}/category/${categoryObj.slug}`, {
				jar: adminJar,
			});

			assert.strictEqual(response.statusCode, 200);

			// Check for urgency options in category tools
			assert(body.includes('component="topic/mark-urgent"'), 'Mark urgent option should be present in category tools');
			assert(body.includes('component="topic/mark-not-urgent"'), 'Mark not urgent option should be present in category tools');
			assert(body.includes('Mark Topic Urgent'), 'Mark Topic Urgent text should be present in category tools');
			assert(body.includes('Mark Topic Not Urgent'), 'Mark Topic Not Urgent text should be present in category tools');
		});

		it('should include urgent badge in topic list when urgent', async () => {
			// Set topic as urgent
			await topics.tools.setUrgency(topicObj.topicData.tid, true, adminUid);

			const { body, response } = await request.get(`${nconf.get('url')}/category/${categoryObj.slug}`, {
				jar: adminJar,
			});

			assert.strictEqual(response.statusCode, 200);

			// Check for urgent badge in topic list
			assert(body.includes('component="topic/urgent"'), 'Urgent badge component should be present in topic list');
			assert(body.includes('topic-urgent'), 'Urgent badge should have topic-urgent class');
			assert(body.includes('fa-exclamation-triangle'), 'Urgent badge should have exclamation triangle icon');
		});

		it('should include urgent class in topic list items', async () => {
			// Set topic as urgent
			await topics.tools.setUrgency(topicObj.topicData.tid, true, adminUid);

			const { body, response } = await request.get(`${nconf.get('url')}/category/${categoryObj.slug}`, {
				jar: adminJar,
			});

			assert.strictEqual(response.statusCode, 200);

			// Check that topic list item has urgent class
			assert(body.includes('urgent'), 'Topic list item should have urgent class when topic is urgent');
		});
	});

	describe('JavaScript Integration', () => {
		it('should include urgency handlers in threadTools.js', async () => {
			const { body, response } = await request.get(`${nconf.get('url')}/public/src/client/topic/threadTools.js`);

			assert.strictEqual(response.statusCode, 200);

			// Check for urgency event handlers
			assert(body.includes('component="topic/mark-urgent"'), 'Mark urgent handler should be present');
			assert(body.includes('component="topic/mark-not-urgent"'), 'Mark not urgent handler should be present');
			assert(body.includes('setUrgencyState'), 'setUrgencyState function should be present');
			assert(body.includes('mark-urgent'), 'mark-urgent command should be handled');
			assert(body.includes('mark-not-urgent'), 'mark-not-urgent command should be handled');
		});

		it('should include urgency handlers in category tools', async () => {
			const { body, response } = await request.get(`${nconf.get('url')}/public/src/client/category/tools.js`);

			assert.strictEqual(response.statusCode, 200);

			// Check for urgency handlers in category tools
			assert(body.includes('component="topic/mark-urgent"'), 'Mark urgent handler should be present in category tools');
			assert(body.includes('component="topic/mark-not-urgent"'), 'Mark not urgent handler should be present in category tools');
			assert(body.includes('isTopicUrgent'), 'isTopicUrgent function should be present');
			assert(body.includes('setUrgencyState'), 'setUrgencyState function should be present in category tools');
		});

		it('should include urgency in generateTopicClass helper', async () => {
			const { body, response } = await request.get(`${nconf.get('url')}/public/src/modules/helpers.common.js`);

			assert.strictEqual(response.statusCode, 200);

			// Check that urgency is included in generateTopicClass
			assert(body.includes("'urgent'"), 'Urgent should be included in generateTopicClass fields array');
		});
	});

	describe('API Integration', () => {
		it('should handle urgency API calls from frontend', async () => {
			// Test marking as urgent
			const { body: urgentBody, response: urgentResponse } = await request.put(`${nconf.get('url')}/api/v3/topics/${topicObj.topicData.tid}/urgency`, {
				jar: adminJar,
				body: { urgent: true },
				headers: { 'x-csrf-token': csrfToken },
			});

			assert.strictEqual(urgentResponse.statusCode, 200);
			assert.strictEqual(urgentBody.response.urgent, true);

			// Test marking as not urgent
			const { body: notUrgentBody, response: notUrgentResponse } = await request.put(`${nconf.get('url')}/api/v3/topics/${topicObj.topicData.tid}/urgency`, {
				jar: adminJar,
				body: { urgent: false },
				headers: { 'x-csrf-token': csrfToken },
			});

			assert.strictEqual(notUrgentResponse.statusCode, 200);
			assert.strictEqual(notUrgentBody.response.urgent, false);
		});

		it('should return proper error for invalid requests', async () => {
			// Test with invalid urgency value
			const { response } = await request.put(`${nconf.get('url')}/api/v3/topics/${topicObj.topicData.tid}/urgency`, {
				jar: adminJar,
				body: { urgent: 'invalid' },
				headers: { 'x-csrf-token': csrfToken },
			});

			assert.strictEqual(response.statusCode, 400);
		});
	});

	describe('Template Rendering', () => {
		it('should render urgency options with correct icons', async () => {
			const { body, response } = await request.get(`${nconf.get('url')}/topic/${topicObj.topicData.slug}`, {
				jar: adminJar,
			});

			assert.strictEqual(response.statusCode, 200);

			// Check for correct FontAwesome icons
			assert(body.includes('fa-exclamation-triangle'), 'Mark urgent should have exclamation triangle icon');
			assert(body.includes('fa-exclamation'), 'Mark not urgent should have exclamation icon');
		});

		it('should render urgency options with correct CSS classes', async () => {
			const { body, response } = await request.get(`${nconf.get('url')}/topic/${topicObj.topicData.slug}`, {
				jar: adminJar,
			});

			assert.strictEqual(response.statusCode, 200);

			// Check for correct CSS classes
			assert(body.includes('dropdown-item'), 'Urgency options should have dropdown-item class');
			assert(body.includes('rounded-1'), 'Urgency options should have rounded-1 class');
			assert(body.includes('d-flex'), 'Urgency options should have d-flex class');
			assert(body.includes('align-items-center'), 'Urgency options should have align-items-center class');
		});
	});
});
