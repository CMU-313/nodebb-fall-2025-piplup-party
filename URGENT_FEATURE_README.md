# NodeBB Urgent Topic Feature

This implementation adds a new boolean field `urgent` for topics (not posts) in NodeBB.

## Migration Summary

🔻 **Removed Post-Level Urgency**:
- Removed `urgent` field from `src/posts/data.js`
- Removed urgent handling from `src/posts/create.js`
- Deleted `setUrgency` from `src/posts/tools.js`
- Removed `postsAPI.setUrgency` from `src/api/posts.js`
- Removed urgency controller and routes for posts
- Removed post urgency UI and CSS

## Features Implemented

### Backend
✅ **Data Storage**: Added `urgent` to int/bool fields in `src/topics/data.js`
✅ **Topic Creation**: Set `urgent = data.urgent || false` in `src/topics/create.js`
✅ **Helper Function**: Added `setUrgency(tid, urgent, uid)` in `src/topics/tools.js`
✅ **API Endpoint**: Added `topicsAPI.setUrgency` in `src/api/topics.js`
✅ **Controller**: Added `setUrgency` controller in `controllers/write/topics.js`
✅ **Routes**: Added `PUT /api/v3/topics/:tid/urgency` route

### Frontend
✅ **Topic Tools**: Added urgency toggle to topic dropdown menu
✅ **Templates**: Added urgent badge to topic list and topic view
✅ **Styles**: Added CSS styles with animated urgent badge  
✅ **JavaScript**: Added client-side logic to toggle topic urgency

## API Usage

### Set Topic Urgency
```bash
curl -X PUT http://localhost:4567/api/v3/topics/{tid}/urgency \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"urgent": true}'
```

### Response
```json
{
  "tid": "123",
  "urgent": true
}
```

## UI Features

1. **Urgent Badge**: Topics marked as urgent display a red badge with exclamation triangle icon
2. **Topic List**: Urgent badge appears in topic lists (categories, recent, etc.)
3. **Topic View**: Urgent badge appears at top of topic thread
4. **Topic Menu**: Added toggle option in topic dropdown menu
5. **Visual Feedback**: Badge has subtle pulse animation to draw attention
6. **Permissions**: Only topic author, moderators, and admins can toggle urgency

## Database Storage

The `urgent` field is stored in the `topic:{tid}` hash as an integer (0 or 1) and automatically parsed as boolean when retrieved.

## Plugin Hook

The implementation fires the `action:topic.setUrgency` hook when urgency is changed:
```javascript
plugins.hooks.fire('action:topic.setUrgency', {
  tid: tid,
  uid: uid,
  urgent: urgent,
});
```

## Testing

1. Start NodeBB: `./nodebb start`
2. Create a topic
3. Use the topic dropdown menu (thread tools) to toggle urgency
4. Observe urgent badge in topic list and topic view
5. Or test the API directly with curl (requires authentication)

## Files Modified

### Backend
- `src/topics/data.js` - Added `urgent` to intFields
- `src/topics/create.js` - Set urgent field during topic creation
- `src/topics/tools.js` - Added setUrgency helper function
- `src/api/topics.js` - Added topicsAPI.setUrgency
- `src/controllers/write/topics.js` - Added urgency controller
- `src/routes/write/topics.js` - Added urgency route

### Frontend Templates
- `src/views/partials/topic/topic-menu-list.tpl` - Added urgency menu items
- `vendor/nodebb-theme-harmony-2.1.15/templates/partials/topics_list.tpl` - Added urgent badge to topic list
- `vendor/nodebb-theme-harmony-2.1.15/templates/topic.tpl` - Added urgent badge to topic view

### Frontend JavaScript & Styles
- `public/src/client/topic/threadTools.js` - Added urgency toggle functionality
- `vendor/nodebb-theme-harmony-2.1.15/scss/topic.scss` - Added topic urgency CSS

## Language Keys Added

The implementation expects these language keys to be defined:
- `[[topic:urgent]]` - "Urgent" label for badge
- `[[topic:thread-tools.mark-urgent]]` - "Mark Topic Urgent" menu item
- `[[topic:thread-tools.mark-not-urgent]]` - "Mark Topic Not Urgent" menu item
- `[[topic:topic-marked-urgent]]` - Success message when marked urgent
- `[[topic:topic-marked-not-urgent]]` - Success message when marked not urgent
