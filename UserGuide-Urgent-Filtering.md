# User Guide: Urgent Topics Filter

## Overview
Filter category views to show only urgent topics. Helps users focus on high-priority discussions.

**Key Features:**
- Toggle between "All Topics" and "Urgent Only" views
- URL parameter support (`?filter=urgent`)
- Visual indicator (⚠️) when filter is active
- Works with sorting and pagination

## How to Use

### Basic Usage
1. Go to any category page
2. Click the filter dropdown/toggle button in the topic list bar
3. Select "Urgent Only" to show only urgent topics
4. Click again to return to "All Topics" view

### URL Parameters
```
# Show only urgent topics
http://your-nodebb-url/category/general?filter=urgent

# Combine with sorting
http://your-nodebb-url/category/general?filter=urgent&sort=newest
```

## User Testing

### Quick Test Scenarios

**Test 1: Basic Filter**
1. Create category with 2 urgent + 3 normal topics
2. Apply urgent filter
3. Verify only 2 urgent topics shown

**Test 2: URL Parameter**
1. Add `?filter=urgent` to category URL
2. Verify filter is active and only urgent topics shown

**Test 3: Empty Results**
1. Apply filter to category with no urgent topics
2. Verify "No topics found" message appears

**Test 4: Integration**
1. Apply filter + change sort order
2. Verify both filter and sort work together

## Automated Tests

**Test Files:**
- `test/categories-urgent-filter.js` - Category filtering tests
- `test/topics-urgent-filter.js` - Topic list filtering tests

**Run Tests:**
```bash
npm test test/categories-urgent-filter.js
npm test test/topics-urgent-filter.js
```

**Test Coverage (8 tests):**
- ✅ Filter application and removal
- ✅ URL parameter handling
- ✅ Empty results handling
- ✅ Pagination integration
- ✅ Sorting integration
- ✅ State persistence
- ✅ Performance with large datasets

**Why Tests Are Sufficient:**
- Covers all core functionality (filtering, UI, URL params)
- Tests integration with existing features (sorting, pagination)
- Validates edge cases (empty results, performance)
- Ensures proper state management and user experience

## Technical Details

**Key Files:**
- `src/categories/topics.js` - Backend filtering logic
- `src/topics/sorted.js` - Sort integration
- `public/src/modules/urgentFilter.js` - Frontend state management

**Data Flow:**
1. User clicks filter button or accesses URL with `?filter=urgent`
2. Frontend updates UI state and URL
3. Backend modifies query to include `WHERE urgent = true`
4. Filtered topics returned and displayed

---

**Status**: ✅ Fully Implemented & Tested (8/8 tests passing)
