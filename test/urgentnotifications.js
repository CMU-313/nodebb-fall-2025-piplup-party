'use strict';


const assert = require('assert');
const nconf = require('nconf');
const util = require('util');

const db = require('./mocks/databasemock');
const meta = require('../src/meta');
const user = require('../src/user');
const topics = require('../src/topics');
const categories = require('../src/categories');
const notifications = require('../src/notifications');

describe('Urgent Notifications', function () {
	let uid;
	let notification;

	before((done) => {
		user.create({ username: 'poster' }, (err, _uid) => {
			if (err) {
				return done(err);
			}

			uid = _uid;
			done();
		});
	});

	it('should create an urgent notification if marked urgent', (done) => {
		notifications.create({
			bodyShort: 'bodyShort',
			nid: 'notification_id',
			path: '/notification/path',
			pid: 1,
			urgent: true, //makes urgent notificaiton 
		}, (err, _notification) => {
			notification = _notification;
			assert.ifError(err);
			assert(notification);
			assert.strictEqual(notification.urgent, true, 'Notification should be marked as urgent'); //checks notification is urgent
			db.exists(`notifications:${notification.nid}`, (err, exists) => {
				assert.ifError(err);
				assert(exists);
				db.isSortedSetMember('notifications', notification.nid, (err, isMember) => {
					assert.ifError(err);
					assert(isMember);
					done();
				});
			});
		});
	});

	it('should not create an urgent notification if not urgent', (done) => {
		notifications.create({
			bodyShort: 'bodyShort',
			nid: 'notification_id',
			path: '/notification/path',
			pid: 1,
			urgent: false, //NOT urgent notificaiton 
		}, (err, _notification) => {
			notification = _notification;
			assert.ifError(err);
			assert(notification);
			assert.notStrictEqual(notification.urgent, true, 'Notification should not be marked as urgent'); //checks notification is urgent
			db.exists(`notifications:${notification.nid}`, (err, exists) => {
				assert.ifError(err);
				assert(exists);
				db.isSortedSetMember('notifications', notification.nid, (err, isMember) => {
					assert.ifError(err);
					assert(isMember);
					done();
				});
			});
		});
	});

	it('should send urgent-topic notifications to followers', async () => {
		const followerUid = await user.create({ username: 'follower' });
		await user.follow(followerUid, uid);
        
		//dealing with privilages --> used AI to debug this here
		const db = require('../src/database');
		const privileges = require('../src/privileges');
		const notifications = require('../src/notifications');
        
		// Grant read permissions to category 1 for registered users
		await privileges.categories.give(['groups:read'], 1, 'registered-users');
        
		const topicData = { tid: 123, cid: 1, title: 'Urgent Topic' };
		const postData = { 
			pid: 456, 
			tid: 123,
			content: 'urgent content', 
			user: { displayname: 'poster' }, 
		};
        
		const nid = `urgent-topic:${postData.tid}:uid:${uid}`;
        
		await user.notifications.sendUrgentTopicNotification(uid, topicData, postData);
        
		// CRITICAL: Wait for the setTimeout (500ms) + batch processing to complete --> used AI to debug this here
		await new Promise(resolve => setTimeout(resolve, 1600));
        
		const notifData = await user.notifications.getAll(followerUid);
        
		const urgentNotif = notifData.find(notif => {
			const nidCheck = typeof notif === 'string' ? notif : notif.nid;
			return nidCheck && nidCheck.startsWith('urgent-topic:');
		});
        
		assert(urgentNotif, 'Urgent notification should be sent to followers');
	});

	it('should not send urgent-topic notifications to followers without category permissions', async () => {
		const followerUid = await user.create({ username: 'follower' });
		await user.follow(followerUid, uid);
        
		const db = require('../src/database');
		const privileges = require('../src/privileges');
		const notifications = require('../src/notifications');
        
		//fix category permissions to ensure follower cannot read category 1
		await privileges.categories.rescind(['groups:read'], 1, 'registered-users');
        
		const topicData = { tid: 123, cid: 1, title: 'Urgent Topic' };
		const postData = { 
			pid: 456, 
			tid: 123,
			content: 'urgent content', 
			user: { displayname: 'poster' }, 
		};
        
		const nid = `urgent-topic:${postData.tid}:uid:${uid}`;
        
		await user.notifications.sendUrgentTopicNotification(uid, topicData, postData);
        
		await new Promise(resolve => setTimeout(resolve, 1600));
        
		const notifData = await user.notifications.getAll(followerUid);
        
		const urgentNotif = notifData.find(notif => {
			const nidCheck = typeof notif === 'string' ? notif : notif.nid;
			return nidCheck && nidCheck.startsWith('urgent-topic:');
		});
        
		assert(!urgentNotif, 'Should NOT send notification when follower lacks category permissions');
	});
      
	//note that permission/mark read tests are covered in user/notifications.js

});