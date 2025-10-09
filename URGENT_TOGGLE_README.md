# NodeBB Topic Urgency Toggle Feature

This feature allows users to mark topics as urgent or non-urgent through the topic tools dropdown menu in both the topic list view and the per topic view. Toggling the urgency state of a topic will remove/display the urgent badge on the post.

## Files Modified

1. src/views/partials/topic/topic-menu-list.tpl
   - Added urgent toggle menu items
   - Added urgent/not urgent options with icons

2. src/views/partials/category/tools-dropdown-content.tpl  
   - Added urgent toggle menu items
   - Added urgent/not urgent options with icons

3. public/src/client/topic/threadTools.js
   - Added setUrgencyState handler
   - Added urgent toggle command handlers
   - Added UI update logic for urgent badges

4. public/src/client/category/tools.js
   - Added urgent toggle functionality
   - Added urgent state tracking
   - Added urgent toggle command handlers

5. public/src/modules/helpers.common.js
   - Updated generateTopicClass to include urgent state
   - Added urgent class to topic rendering

6. test/toggle-urgent.js
   - Added test suite for urgent functionality
   - Tests topic creation, urgent status, permissions
   - Tests edge cases and state persistence

