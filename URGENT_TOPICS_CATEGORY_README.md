# Urgent Topics Category Feature

This feature automatically creates a dedicated "Urgent Topics" category that collects all topics marked as urgent from other categories.

## Overview

When a user marks a topic as urgent in any category, the system automatically:
1. Creates an "Urgent Topics" category (if it doesn't exist)
2. Moves the urgent topic to this special category
3. Tracks the original category for potential restoration

## Features

### Automatic Category Management
- **Auto-creation**: The "Urgent Topics" category is created automatically on first use
- **Visual Design**: Red theme with exclamation triangle icon to indicate urgency
- **Top Placement**: Category appears at the top of the category list for visibility

### Topic Management
- **Automatic Movement**: Topics marked urgent are moved to the urgent category
- **Original Tracking**: System remembers the original category for each urgent topic
- **Manual Restoration**: Users can move topics back to their original categories

### User Interface
- **Urgent Badge**: Topics show an urgent badge in the urgent category
- **Move Back Button**: Easy one-click restoration to original category
- **Category Information**: Shows which category the topic originally came from

## Implementation Details

### Backend Components

#### Plugin Structure
```
plugins/urgent-topics-category/
├── plugin.json                    # Plugin configuration
├── library.js                     # Main plugin logic
├── languages/en.json              # Language strings
├── templates/urgent-topics-category.tpl  # Template for urgent topics display
└── public/urgent-topics-category.js      # Client-side JavaScript
```

#### Key Methods
- `onTopicUrgencyChange()` - Handles urgency changes via plugin hook
- `createUrgentCategory()` - Creates the urgent topics category
- `moveToUrgentCategory()` - Moves topics to urgent category
- `moveBackToOriginalCategory()` - Restores topics to original category
- `ensureUrgentCategoryExists()` - Ensures category exists on startup

#### Database Changes
- Added `originalCid` field to topics data structure to track original categories

### Frontend Components

#### Templates
- Custom template for displaying urgent topics with management controls
- Integrated with existing category view system

#### JavaScript
- Socket.io handlers for real-time topic management
- AJAX-based move back functionality
- Loading states and user feedback

## API Endpoints

### Socket Events
- `admin.topics.moveBackToOriginal` - Move topic back to original category
- `admin.topics.getUrgentTopics` - Get all urgent topics

### Usage Example
```javascript
// Move topic back to original category
socket.emit('admin.topics.moveBackToOriginal', { tid: 123 }, function(err, result) {
    if (result.success) {
        console.log('Topic moved back successfully');
    }
});

// Get all urgent topics
socket.emit('admin.topics.getUrgentTopics', {}, function(err, result) {
    console.log('Urgent topics:', result.topics);
});
```

## Configuration

### Category Settings
The urgent category is created with these default settings:
- **Name**: "Urgent Topics"
- **Description**: "Topics marked as urgent from other categories"
- **Icon**: `fa-exclamation-triangle`
- **Background Color**: `#dc3545` (Bootstrap danger red)
- **Text Color**: `#ffffff` (White)
- **Order**: 1 (appears at top)

### Permissions
The urgent category inherits standard category permissions:
- **Registered Users**: Can read, create, reply, edit, delete topics
- **Moderators**: Full management capabilities
- **Guests**: Read-only access

## Usage Instructions

### For Users

#### Marking Topics Urgent
1. Navigate to any topic
2. Click the topic menu (three dots)
3. Select "Mark Topic Urgent"
4. Topic automatically moves to "Urgent Topics" category

#### Managing Urgent Topics
1. Go to the "Urgent Topics" category
2. View all urgent topics from various categories
3. Click "Move Back" button to restore topic to original category
4. Topic returns to its original category and urgency is preserved

### For Administrators

#### Category Management
- The urgent category is automatically created and managed
- Standard category settings apply (permissions, appearance, etc.)
- Category can be manually modified through admin panel if needed

#### Monitoring
- Check the urgent category regularly for topics that need attention
- Use the move back functionality to organize topics as needed
- Monitor urgent topic patterns to identify recurring issues

## Technical Integration

### Plugin Hooks Used
- `action:topic.setUrgency` - Triggers when topic urgency changes
- `action:app.load` - Ensures urgent category exists on startup
- `static:sockets.init` - Initializes socket handlers
- `filter:category.topics.build` - Enhances category view with urgent topics data

### Database Schema Changes
```javascript
// Added to src/topics/data.js
const intFields = [
    // ... existing fields ...
    'originalCid',  // New field to track original category
];
```

## Testing

Run the test script to verify installation:
```bash
node test-urgent-category.js
```

### Manual Testing Steps
1. Start NodeBB: `./nodebb start`
2. Create a topic in any category
3. Mark the topic as urgent using the topic menu
4. Verify the topic appears in the "Urgent Topics" category
5. Use the "Move Back" button to return the topic to its original category
6. Verify the topic returns to its original location

## Troubleshooting

### Common Issues

#### Urgent Category Not Created
- Check NodeBB logs for plugin errors
- Ensure plugin is properly installed and enabled
- Verify database permissions

#### Topics Not Moving
- Check if the urgent hook is firing correctly
- Verify topic urgency is being set properly
- Check database for topic data integrity

#### Frontend Issues
- Ensure JavaScript files are loading
- Check browser console for errors
- Verify socket.io connections are working

### Debug Information
Enable debug logging to troubleshoot issues:
```javascript
// In NodeBB config
debug: true
```

## Future Enhancements

### Potential Improvements
- **Bulk Operations**: Move multiple urgent topics at once
- **Time-based Auto-restoration**: Automatically move topics back after time period
- **Urgency Levels**: Multiple urgency levels with different categories
- **Notifications**: Alert administrators when topics become urgent
- **Analytics**: Track urgent topic patterns and statistics
- **Integration**: Connect with external ticketing systems

### Customization Options
- Custom category name and appearance
- Configurable auto-move behavior
- Integration with existing workflow systems
- Custom permission rules for urgent topics

## Support

For issues or questions about the Urgent Topics Category feature:
1. Check the troubleshooting section above
2. Review NodeBB logs for error messages
3. Test with the provided test script
4. Verify all plugin files are present and valid

## Version History

- **v1.0.0**: Initial implementation
  - Automatic urgent category creation
  - Topic movement on urgency change
  - Manual restoration functionality
  - Basic UI for topic management
