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

	//note that permission/mark unread tests are covered in user/notifications.js

});