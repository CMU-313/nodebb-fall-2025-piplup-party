# Urgent Topics Dashboard Widget

This feature adds a simple but useful urgent topics widget to the NodeBB admin dashboard.

## Features

### ✅ **Widget Display**
- Shows count of urgent topics in the header
- Lists up to 5 most recent urgent topics
- Displays topic title, author, category, and stats
- Links directly to topics and user profiles
- Responsive design for mobile and desktop

### ✅ **Visual Design**
- Red urgent badge with pulsing animation
- Clean card-based layout
- Hover effects for better UX
- Empty state when no urgent topics exist
- Consistent with NodeBB admin theme

### ✅ **Data Integration**
- Fetches urgent topics from database
- Sorts by most recent first
- Shows post count and view count
- Includes author and category information
- Error handling for failed requests

## Implementation Details

### Files Added/Modified

#### **Backend Changes**
- `src/controllers/admin/dashboard.js` - Added `getUrgentTopics()` function and data fetching
- `src/views/admin/dashboard.tpl` - Included urgent topics widget template

#### **Frontend Changes**
- `src/views/admin/partials/dashboard/urgent-topics.tpl` - Widget template with styling
- `public/language/en-US/admin/dashboard.json` - Added language keys

### **Language Keys Added**
- `[[admin/dashboard:urgent-topics]]` - "Urgent Topics" widget title
- `[[admin/dashboard:no-urgent-topics]]` - "No urgent topics at the moment"
- `[[admin/dashboard:posts]]` - "posts" label
- `[[admin/dashboard:views]]` - "views" label
- `[[admin/dashboard:view-all-urgent-topics]]` - "View all urgent topics" button

## Usage

1. **Access**: Navigate to Admin → Dashboard
2. **Location**: Widget appears in the right sidebar, above the version information
3. **Functionality**: 
   - Click topic titles to view topics
   - Click author names to view user profiles
   - Click category names to view categories
   - "View all urgent topics" button appears when 5+ urgent topics exist

## Technical Notes

### **Performance**
- Fetches up to 1000 recent topics and filters for urgent ones
- Limits display to 5 most recent urgent topics
- Includes error handling to prevent dashboard crashes

### **Styling**
- Uses inline CSS for simplicity
- Responsive design with mobile optimizations
- Consistent with NodeBB admin theme colors
- Animated urgent badge for attention

### **Data Structure**
```javascript
{
  topics: [
    {
      tid: "123",
      title: "Topic Title",
      slug: "topic-slug",
      urgent: true,
      timestamp: 1234567890,
      timestampISO: "2023-01-01T00:00:00.000Z",
      postcount: 5,
      viewcount: 25,
      user: { username: "user", displayname: "User", userslug: "user" },
      category: { name: "Category", slug: "category" }
    }
  ],
  count: 3
}
```

## Future Enhancements

Potential improvements for the widget:

1. **Real-time Updates** - WebSocket integration for live updates
2. **Filtering Options** - Filter by category or time range
3. **Bulk Actions** - Mark multiple topics as urgent/not urgent
4. **Notifications** - Alert when new urgent topics are created
5. **Analytics** - Track urgency usage patterns
6. **Auto-expiry** - Set urgency to expire after time period

## Testing

To test the widget:

1. Create some topics and mark them as urgent using the topic tools
2. Navigate to Admin → Dashboard
3. Verify the widget appears in the right sidebar
4. Check that urgent topics are displayed correctly
5. Test links to topics, users, and categories
6. Verify empty state when no urgent topics exist

## Troubleshooting

### **Widget Not Showing**
- Check that urgent topics exist in the database
- Verify template is included in dashboard.tpl
- Check browser console for JavaScript errors

### **Styling Issues**
- Ensure CSS is properly included in template
- Check for conflicts with other admin styles
- Verify responsive design on different screen sizes

### **Data Issues**
- Check database for urgent topics: `SELECT * FROM topic WHERE urgent = 1`
- Verify topic data includes required fields
- Check error logs for database connection issues
