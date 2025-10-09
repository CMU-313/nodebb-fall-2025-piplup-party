# Urgent Topics Filter - Team Documentation

## Quick Overview
Filter to show only urgent topics in category views. Adds dropdown/toggle UI and backend filtering logic.

## How It Works
- **UI**: Dropdown in topic list bar to switch between "All Topics" and "Urgent Only"
- **Backend**: `filter=urgent` URL parameter filters topics by `urgent` field
- **Integration**: Works with existing sorting, pagination, and permissions

## Key Files Modified
- `src/categories/topics.js` - Added urgent filter logic to `getTopicIds()`, `getTopicCount()`
- `src/topics/unread.js` - Added `filterUrgentTids()` function
- `src/topics/sorted.js` - Added urgent filter to `getSortedTopics()`
- `public/src/modules/urgentFilter.js` - Frontend UI state management
- Templates: `urgent-filter.tpl`, `category/sort.tpl`, `category/watch.tpl`, `topic-list-bar.tpl`

## Test Coverage
4 comprehensive test suites covering backend, frontend, integration, and edge cases:

```bash
# Run all urgent filter tests
npm test -- --grep "Urgent Filter"

# Run specific suites
npm test test/categories-urgent-filter.js
npm test test/topics-urgent-filter.js  
npm test test/frontend-urgent-filter.js
npm test test/integration-urgent-filter.js
```

**Test Sufficiency**: ✅ Functional requirements, performance, user experience, security, error handling

## Usage
- **URL**: Add `?filter=urgent` to category URLs
- **UI**: Click dropdown/toggle button in topic list bar
- **Visual**: Button shows warning triangle (⚠️) when urgent filter active

## Technical Notes
- Uses existing `urgent` boolean field in topics table
- Applies filter before pagination (gets all urgent topics, then paginates)
- Respects user permissions and category access controls
- Compatible with all existing sorting and filtering options
