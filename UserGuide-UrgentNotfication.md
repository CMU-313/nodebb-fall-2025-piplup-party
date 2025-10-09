Context:
On a high level, this feature sends out notifications to followers when an urgent post is created. 

How to Use This Feature:
On the UI, click the "Mark Urgent" box when creating a post. In the codebase, the primary function is located in src/user/notifications.js and can be called through user.notifications.sendUrgentTopicNotification.

How to test this feature:
On the UI, follow the admin account from general user account. Log into admin account and create an urgent post. Log back into general user account and see notification come through. In this codebase, my feature test suite is located in the file test/urgentnotifications.js. To test, run the following in terminal (after installing npm):
- npx mocha test/urgentnotifications.js
- npm run test (general test suite)

Why these tests are sufficient:
The tests ensure that an urgent notification is created when marked urgent, and that a notification is sent to followers. Also verifies that notification is not sent to followers if they don't have permissions to category. Since I am utilizing NodeBB notification feature, logic for marking unread/read are already covered in the general test suite (see test/notifications.js).

