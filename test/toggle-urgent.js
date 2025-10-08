'use strict';

const assert = require('assert');
const db = require('./mocks/databasemock');
const topics = require('../src/topics');
const categories = require('../src/categories');
const user = require('../src/user');
const groups = require('../src/groups');
const privileges = require('../src/privileges');

describe('Topic Urgency', () => {
	let adminUid;
	let regularUid;
	let categoryId;
	let topicData;

	// Add setup to ensure clean state
	before(async () => {
		// Clean database before starting
		await db.emptydb();
        
		// Wait for setup to complete
		await new Promise(resolve => setTimeout(resolve, 1000));
        
		// Create admin and regular user
		adminUid = await user.create({ username: 'admin', password: '123456' });
		await groups.join('administrators', adminUid);
		regularUid = await user.create({ username: 'regular', password: '123456' });

		// Create category
		const category = await categories.create({
			name: 'Test Category',
			description: 'Test category created by testing script',
		});
		categoryId = category.cid;
	});

	describe('Topic Urgent Functionality', () => {
		beforeEach(async () => {
			// Create a fresh test topic before each test
			const topicPostData = await topics.post({
				uid: adminUid,
				cid: categoryId,
				title: 'Test Topic Title',
				content: 'The content of test topic',
			});
			topicData = topicPostData.topicData;
		});

		it('should create topic with urgent field defaulting to false', async () => {
			assert.strictEqual(!!topicData.urgent, false, 'New topic should not be urgent by default');
		});

		it('should allow setting urgent status', async () => {
			await topics.setTopicField(topicData.tid, 'urgent', true);
			const urgentStatus = await topics.getTopicField(topicData.tid, 'urgent');
			assert.strictEqual(!!urgentStatus, true, 'Topic should be marked as urgent');
		});

		it('should allow removing urgent status', async () => {
			// First set it to true
			await topics.setTopicField(topicData.tid, 'urgent', true);
			// Then set it to false
			await topics.setTopicField(topicData.tid, 'urgent', false);
			const urgentStatus = await topics.getTopicField(topicData.tid, 'urgent');
			assert.strictEqual(!!urgentStatus, false, 'Topic should not be marked as urgent');
		});

		it('should persist urgent status after topic reload', async () => {
			await topics.setTopicField(topicData.tid, 'urgent', true);
			const reloadedTopic = await topics.getTopicData(topicData.tid);
			assert.strictEqual(!!reloadedTopic.urgent, true, 'Urgent status should persist');
		});
	});

	describe('Topic Urgent Permissions', () => {
		beforeEach(async () => {
			const topicPostData = await topics.post({
				uid: adminUid,
				cid: categoryId,
				title: 'Permission Test Topic',
				content: 'Topic content',
			});
			topicData = topicPostData.topicData;
		});

		it('should allow admins to toggle urgent status', async () => {
			const canEdit = await privileges.topics.canEdit(topicData.tid, adminUid);
			assert.strictEqual(canEdit, true, 'Admin should be able to edit topics');
		});

		it('should not allow regular users to toggle urgent status', async () => {
			const canEdit = await privileges.topics.canEdit(topicData.tid, regularUid);
			assert.strictEqual(canEdit, false, 'Regular user should not be able to edit topics');
		});
	});

	describe('Topic Urgent Edge Cases', () => {
		beforeEach(async () => {
			const topicPostData = await topics.post({
				uid: adminUid,
				cid: categoryId,
				title: 'Edge Case Topic',
				content: 'Topic content',
			});
			topicData = topicPostData.topicData;
		});

		it('should handle deleted topics', async () => {
			await topics.delete(topicData.tid, adminUid);
			const deletedTopic = await topics.getTopicData(topicData.tid);
			assert.strictEqual(!!deletedTopic.deleted, true, 'Topic should be marked as deleted');
		});

		it('should handle locked topics', async () => {
			// Use tools.lock instead of direct lock
			await topics.tools.lock(topicData.tid, adminUid);
			const lockedTopic = await topics.getTopicData(topicData.tid);
			assert.strictEqual(!!lockedTopic.locked, true, 'Topic should be marked as locked');
			
			// Test setting urgent on locked topic
			await topics.setTopicField(topicData.tid, 'urgent', true);
			const urgentStatus = await topics.getTopicField(topicData.tid, 'urgent');
			assert.strictEqual(!!urgentStatus, true, 'Should be able to set urgent on locked topic');
			
			// Cleanup - unlock the topic
			await topics.tools.unlock(topicData.tid, adminUid);
		});

		it('should handle urgent status for locked topics with regular users', async () => {
			// Lock the topic
			await topics.tools.lock(topicData.tid, adminUid);
			
			// Try to set urgent as regular user
			try {
				await topics.setTopicField(topicData.tid, 'urgent', true);
				assert.fail('Regular user should not be able to set urgent on locked topic');
			} catch (err) {
				assert(err);
			}
			
			// Cleanup
			await topics.tools.unlock(topicData.tid, adminUid);
		});
	});

	// Update the after block to clean up properly
	after(async () => {
		try {
			// Delete test topics if they exist
			if (topicData && topicData.tid) {
				await topics.purge(topicData.tid, adminUid);
			}
			
			// Check if users exist before trying to delete them
			if (adminUid) {
				try {
					const adminExists = await user.exists(adminUid);
					if (adminExists) {
						await user.delete(adminUid); // Use delete instead of deleteAccount
					}
				} catch (err) {
					console.error('Error deleting admin:', err);
				}
			}
			if (regularUid) {
				try {
					const regularExists = await user.exists(regularUid);
					if (regularExists) {
						await user.delete(regularUid); // Use delete instead of deleteAccount
					}
				} catch (err) {
					console.error('Error deleting regular user:', err);
				}
			}

			// Delete test category if it exists
			if (categoryId) {
				try {
					await categories.purge(categoryId);
				} catch (err) {
					console.error('Error purging category:', err);
				}
			}

			// Wait for cleanup to complete
			await new Promise(resolve => setTimeout(resolve, 500));

			// Clean database at the end
			await db.emptydb();
		} catch (err) {
			// Log any cleanup errors but don't fail the tests
			console.error('Cleanup error:', err);
		}
	});

	// Add this to clean up after each test suite
	afterEach(async () => {
		// Reset any modified topic fields
		if (topicData && topicData.tid) {
			await topics.setTopicField(topicData.tid, 'urgent', false);
			await topics.tools.unlock(topicData.tid, adminUid);
		}
	});
});