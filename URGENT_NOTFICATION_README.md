# NodeBB Urgent Notification Feature

This feature sends out notifications to followers when an urgent post is created. Utilizes NodeBB existing notification function.

# Files changed

1. public/language/en-GB/notifications.json
2. src/topics/create.js
3. src/topics/tools.js
4. src/user/notifications.js

# Backend

Primary function located in src/user/notifications.js: sendUrgentTopicNotification
- Checks permissions so that only followers recieve notification
- Creates urgent notification utilizing language key 

Calls sendUrgentTopicNotification when a topic is marked as urgent (src/topic/tools.js and src/topics/create.js)

# Front-end

Not large changes since notification feature already exists. Added unique language key for unique notification:

- "urgent-topic-created": "<strong>%1</strong> has created an urgent topic: <strong>%2</strong>",
