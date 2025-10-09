# NodeBB Topic Urgency Toggle Feature

Context:
This feature allows users with appropriate permissions to mark topics as urgent or non-urgent through the topic tools dropdown menu. Topics marked as urgent display a visual indicator and can be toggled between urgent and non-urgent states at any time.

How to Use This Feature:
There are two ways to interact with urgent topics:
1. When viewing a topic list:
   - Select a post
   - Click the topic tools dropdown menu
   - Select "Mark Topic Urgent" or "Mark Topic Not Urgent" depending on current state

2. When viewing an individual topic:
   - Click the topic tools dropdown menu in the topic header
   - Select "Mark Topic Urgent" or "Mark Topic Not Urgent" depending on current state

The urgent status is indicated by a visual badge next to the topic title.

How to test this feature:
1. UI Testing:
   - Log in as an administrator
   - Create a new topic
   - Use the topic tools dropdown to toggle urgent status
   - Verify the urgent badge appears/disappears
   - Log in as a regular user and verify they cannot toggle urgent status

2. Automated Testing:
In this codebase, the feature test suite is located in test/toggle-urgent.js. To test:
```bash
# Run just the urgent toggle tests
npm test test/toggle-urgent.js

# Run full test suite
npm run test
```

Why these tests are sufficient:
The test suite covers:
- Default state of new topics (non-urgent)
- Setting and removing urgent status
- Permission checks (admin vs regular users)
- Edge cases like deleted and locked topics
- State persistence after topic reload
- Proper cleanup to avoid test interference

The tests ensure that:
1. Only users with proper permissions can toggle urgent status
2. Urgent state persists correctly in the database
3. Edge cases are handled appropriately
4. The feature integrates properly with existing topic functionality