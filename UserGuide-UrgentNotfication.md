# User Guide: Urgent Topic Notifications

## Overview
Automatic notifications sent to followers when urgent topics are created. Only users with category access and following relationships receive notifications.

**Key Features:**
- Automatic delivery when urgent topics are created
- Permission-aware (only notifies users with category access)
- Follower-based targeting (must follow the author)
- Integration with NodeBB notification system
- Only triggers during topic creation, not when marking existing topics urgent

## How to Use

### Receiving Notifications
**Setup:**
1. Follow users whose urgent topics you want notifications for
2. Ensure you have access to categories where urgent topics are created
3. Check that notifications are enabled in your preferences

**Receiving:**
- Notifications appear automatically in notification center/dropdown
- Click notification to navigate directly to urgent topic
- Only urgent topics trigger notifications (not regular topics)

### Creating Notifications
**For Authors:**
1. Create new topic in any category
2. Check "Mark Urgent" checkbox before posting
3. Post topic - all followers with category access receive notifications

**Important Notes:**
- Notifications only sent during creation, not when marking existing topics urgent
- Only followers with category access receive notifications
- Non-urgent topics don't send notifications

### Admin Management
**Permissions:**
- Admin Panel → Categories → Set category access permissions
- Admin Panel → Users → Settings → Configure notification preferences

**Testing:**
1. Create test user, have them follow admin
2. Create urgent topic as admin
3. Verify test user receives notification

## User Testing

### Quick Test Scenarios

**Test 1: Basic Notification**
1. Create Author + Follower accounts
2. Have Follower follow Author
3. Author creates urgent topic
4. Verify Follower receives notification

**Test 2: Permission Check**
1. Create restricted category (Author only)
2. Author creates urgent topic in restricted category
3. Verify Follower receives notification (has access)

**Test 3: Non-Follower Exclusion**
1. Create Author + Non-Follower accounts
2. Ensure Non-Follower does NOT follow Author
3. Author creates urgent topic
4. Verify Non-Follower gets no notification

**Test 4: Non-Urgent Exclusion**
1. Author + Follower setup
2. Author creates topic WITHOUT "Mark Urgent"
3. Verify Follower gets no notification

**Test 5: Multiple Followers**
1. Create Author + 3 Followers
2. All Followers follow Author
3. Author creates urgent topic
4. Verify all 3 Followers receive notifications

## Automated Tests

**Test File:** `test/urgentnotifications.js`

**Run Tests:**
```bash
npm test test/urgentnotifications.js
```

**Test Coverage (8 tests):**
- ✅ Notification creation for urgent topics
- ✅ Delivery to followers
- ✅ Permission-based filtering (category access)
- ✅ Non-follower exclusion
- ✅ Multiple followers support
- ✅ Non-urgent topic exclusion
- ✅ Notification content accuracy
- ✅ Existing topic urgency change exclusion

**Why Tests Are Sufficient:**
- Covers core notification creation and delivery
- Tests permission boundaries and targeting accuracy
- Validates content accuracy and edge cases
- Ensures notifications only sent for urgent topics during creation
- Leverages NodeBB's proven notification infrastructure

## Technical Details

**Key Files:**
- `src/user/notifications.js` - `sendUrgentTopicNotification()` function
- `src/topics/create.js` - Integration with topic creation process

**Integration:**
- Uses existing NodeBB notification system
- Leverages follower relationship system
- Integrates with permission checking system

**Data Flow:**
1. User creates topic with "Mark Urgent" checked
2. System detects urgent flag during creation
3. Queries all followers of topic author
4. Filters followers based on category access
5. Creates notification for each authorized follower
6. NodeBB delivers notifications via existing system

**API Integration:**
```javascript
// Notification creation
await user.notifications.create({
    type: 'urgent-topic',
    bodyShort: `Urgent topic: ${topicTitle}`,
    nid: `urgent_topic_${topicId}_${followerId}`,
    path: `/topic/${topicId}`
});
```

---

**Status**: ✅ Fully Implemented & Tested (8/8 tests passing)

