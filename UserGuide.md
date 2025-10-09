# User Guide: Urgent Topic Counter Feature

## Table of Contents
1. [Feature Overview](#feature-overview)
2. [How to Use the Feature](#how-to-use-the-feature)
3. [User Testing Guide](#user-testing-guide)
4. [Automated Tests](#automated-tests)
5. [Technical Details](#technical-details)

---

## Feature Overview

### What is the Urgent Topic Counter?

The Urgent Topic Counter is a visual indicator that displays the number of urgent topics within each category on the NodeBB categories page. This feature helps users and administrators quickly identify which categories contain topics that require immediate attention.

### Key Benefits

- **Quick Visual Identification**: Urgent topics are highlighted with a red badge/card
- **Improved Workflow**: Administrators can prioritize categories needing attention
- **Multi-Platform Support**: Works seamlessly on both mobile and desktop devices
- **Real-Time Accuracy**: Counts update when topics are marked/unmarked as urgent

### Visual Indicators

- **🔴 Red Background**: Indicates the category contains urgent topics (count > 0)
- **⚪ Grey Background**: Indicates no urgent topics in the category (count = 0)
- **🔺 Exclamation Icon**: Visual emphasis for urgent status

---

## How to Use the Feature

### For End Users

#### Viewing Urgent Topic Counts

1. **Navigate to Categories Page**
   - From the homepage, click on "Categories" in the navigation menu
   - Or visit: `http://your-nodebb-url/categories`

2. **Locate the Urgent Counter**
   - **On Desktop**: Look for the urgent count card (first of three stat cards) on the right side of each category
   - **On Mobile**: Look for the red/grey badge with an exclamation icon below the category description

3. **Interpret the Counter**
   - The number shows how many urgent topics exist in that category
   - Red background means there are urgent topics requiring attention
   - Grey background means no urgent topics

#### Example Visual Layout

**Desktop View:**
```
Category Name
Description text here
                                [Urgent: 3] [Topics: 45] [Posts: 234]
                                   (RED)      (GREY)      (GREY)
```


### For Topic Authors & Moderators

#### Marking a Topic as Urgent

To create topics that will be counted:

1. **Create a topic** in any category
2. **Mark it as urgent** using the topic dropdown menu:
   - Open the topic you created
   - Click the thread tools dropdown (⋮ icon in topic header)
   - Select "Mark Topic Urgent"
   - The topic will now contribute to the category's urgent count

3. **Verify the count**:
   - Return to the categories page
   - Check that the category's urgent count has increased

#### Unmarking a Topic

1. Open the urgent topic
2. Click the thread tools dropdown
3. Select "Mark Topic Not Urgent"
4. The category's urgent count will decrease

---

## User Testing Guide

### Test Case 1: Verify Urgent Counter Displays

**Objective**: Confirm urgent counter is visible on categories page

**Steps**:
1. Start NodeBB: `./nodebb start`
2. Navigate to `http://localhost:4567/categories`
3. Observe each category listing

**Expected Result**:
- Each category shows a stat card/badge with urgent count
- Urgent count is displayed as a number
- Icon (exclamation triangle) is visible

**Pass Criteria**: ✅ All categories display the urgent counter

---

### Test Case 2: Verify Urgent Count Accuracy

**Objective**: Confirm the counter accurately reflects urgent topics

**Setup**:
1. Create a new category called "Test Category"
2. Note the initial urgent count (should be 0)

**Steps**:
1. Create 3 new topics in "Test Category"
2. Mark 2 of them as urgent using thread tools
3. Refresh the categories page
4. Check the urgent count for "Test Category"

**Expected Result**:
- Initial count: 0 (grey background)
- After marking 2 topics urgent: 2 (red background)

**Pass Criteria**: ✅ Counter shows exactly 2 urgent topics

---

### Test Case 3: Verify Dynamic Updates

**Objective**: Confirm counter updates when urgency status changes

**Steps**:
1. Navigate to a category with urgent topics
2. Note the current urgent count (e.g., 5)
3. Open one of the urgent topics
4. Unmark it as urgent (Mark Topic Not Urgent)
5. Return to categories page
6. Check the urgent count

**Expected Result**:
- Count decreases by 1 (e.g., from 5 to 4)
- If count reaches 0, background changes from red to grey

**Pass Criteria**: ✅ Counter updates correctly

---

### Test Case 4: Verify Responsive Design

**Objective**: Confirm feature works on different screen sizes

**Steps**:
1. Open categories page on desktop (width > 992px)
   - Verify urgent count appears in card format on right side
2. Resize browser to mobile width (< 768px)
   - Verify urgent count appears in badge format below description
3. Test on actual mobile device if available

**Expected Result**:
- Desktop: Card layout with full "Urgent" label
- Mobile: Compact badge with icon only

**Pass Criteria**: ✅ Both layouts display correctly

---

### Test Case 5: Verify Multiple Categories

**Objective**: Confirm counter works independently for each category

**Steps**:
1. Create 3 different categories
2. Add different numbers of urgent topics to each:
   - Category A: 1 urgent topic
   - Category B: 3 urgent topics
   - Category C: 0 urgent topics
3. View categories page

**Expected Result**:
- Category A shows count: 1 (red)
- Category B shows count: 3 (red)
- Category C shows count: 0 (grey)
- Each count is independent and correct

**Pass Criteria**: ✅ All counters show correct values

---

### Test Case 6: Verify API Response

**Objective**: Confirm urgent count is available via API

**Steps**:
1. Open a terminal
2. Make API request:
   ```bash
   curl http://localhost:4567/api/v3/categories
   ```
3. Examine the JSON response

**Expected Result**:
- Response includes `urgentCount` field for each category
- Value is a number (0 or greater)

**Pass Criteria**: ✅ `urgentCount` property exists in API response

---

### Test Case 7: Verify Empty Categories

**Objective**: Confirm counter handles categories with no topics

**Steps**:
1. Create a brand new category with no topics
2. View categories page
3. Check the urgent count for the new category

**Expected Result**:
- Urgent count displays as 0
- Grey background (no urgent topics)
- No errors or missing values

**Pass Criteria**: ✅ Empty category shows count of 0

---

### Test Case 8: Verify Nested Subcategories

**Objective**: Confirm counter works with parent/child categories

**Steps**:
1. Create a parent category
2. Create a child category under the parent
3. Add urgent topics to both parent and child
4. View categories page
5. Check both parent and child urgent counts

**Expected Result**:
- Parent category shows its own urgent count
- Child category shows its own urgent count
- Counts are independent

**Pass Criteria**: ✅ Both parent and child show correct counts

---

## Automated Tests

### Test Location

All automated tests for the Urgent Topic Counter feature are located in:

**File**: `/test/categories.js`  
**Test Suite**: `"Urgent Topic Counter"` (lines 868-1070)

### How to Run Tests

```bash
# Run all tests
npm test

# Run only category tests
npm test test/categories.js

# Run tests with coverage
npm run test
```

### Test Suite Overview

The test suite includes 8 comprehensive tests:

#### 1. **API Property Inclusion Test**
```javascript
it('should include urgentCount property in category data from API')
```
- **What it tests**: Verifies that the API response includes `urgentCount` property
- **Why it's sufficient**: Ensures the backend correctly adds the field to API responses
- **Acceptance Criteria**: Category objects from API contain `urgentCount`

#### 2. **Count Accuracy Test**
```javascript
it('should correctly count urgent topics in a category')
```
- **What it tests**: Creates 2 urgent topics and verifies count equals 2
- **Why it's sufficient**: Validates core counting logic works correctly
- **Acceptance Criteria**: Counter accurately reflects number of urgent topics

#### 3. **Zero Count Test**
```javascript
it('should return 0 urgent count for category with no urgent topics')
```
- **What it tests**: Categories with only normal topics show count of 0
- **Why it's sufficient**: Ensures counter doesn't falsely count non-urgent topics
- **Acceptance Criteria**: Counter shows 0 when no urgent topics exist

#### 4. **Dynamic Update Test**
```javascript
it('should update urgent count when topic urgency changes')
```
- **What it tests**: Marks/unmarks topics and verifies count changes accordingly
- **Why it's sufficient**: Ensures real-time accuracy when topics change status
- **Acceptance Criteria**: Counter updates when topics are marked/unmarked urgent

#### 5. **HTTP Endpoint Test**
```javascript
it('should load categories page with urgent counts via HTTP request')
```
- **What it tests**: Full HTTP request to `/api/categories` includes urgent counts
- **Why it's sufficient**: Validates end-to-end integration with web interface
- **Acceptance Criteria**: Categories page loads with urgent count data

#### 6. **API v3 Endpoint Test**
```javascript
it('should include urgentCount in category API endpoint')
```
- **What it tests**: REST API v3 endpoint includes `urgentCount` field
- **Why it's sufficient**: Ensures external API consumers can access the data
- **Acceptance Criteria**: `/api/v3/categories` returns urgentCount

#### 7. **Empty Category Test**
```javascript
it('should handle categories with no topics gracefully')
```
- **What it tests**: Brand new categories without any topics
- **Why it's sufficient**: Validates error handling and edge cases
- **Acceptance Criteria**: Empty categories don't cause errors, show count of 0

#### 8. **Nested Subcategory Test**
```javascript
it('should count urgent topics in nested subcategories')
```
- **What it tests**: Parent/child category relationships
- **Why it's sufficient**: Ensures feature works with complex category structures
- **Acceptance Criteria**: Each category counts only its own urgent topics

### Test Coverage Analysis

#### Why These Tests Are Sufficient

1. **Complete Feature Coverage**
   - ✅ API integration (Tests 1, 5, 6)
   - ✅ Core counting logic (Tests 2, 3)
   - ✅ Dynamic updates (Test 4)
   - ✅ Edge cases (Tests 7, 8)
   - ✅ Data structure support (Test 8)

2. **Acceptance Criteria Met**
   - **Display urgent count**: Validated by HTTP endpoint tests
   - **Accurate counting**: Validated by count accuracy test
   - **Real-time updates**: Validated by dynamic update test
   - **Handle edge cases**: Validated by empty category test
   - **API accessibility**: Validated by API endpoint tests

3. **Integration Points Covered**
   - **Backend API**: Tests 1, 6
   - **Controllers**: Test 5
   - **Database queries**: Tests 2, 3, 4
   - **Category tree structure**: Test 8

4. **User Scenarios Tested**
   - New user viewing categories (Test 5)
   - Admin checking category stats (Tests 1, 6)
   - Topic author marking topics urgent (Test 4)
   - Empty/new categories (Test 7)
   - Complex category hierarchies (Test 8)

### Test Results

Running the test suite:

```bash
$ npm test

Urgent Topic Counter
  ✓ should include urgentCount property in category data from API
  ✓ should correctly count urgent topics in a category
  ✓ should return 0 urgent count for category with no urgent topics
  ✓ should update urgent count when topic urgency changes
  ✓ should load categories page with urgent counts via HTTP request
  ✓ should include urgentCount in category API endpoint
  ✓ should handle categories with no topics gracefully
  ✓ should count urgent topics in nested subcategories

8 passing
```

All tests pass successfully, validating the feature implementation.

---

## Technical Details

### Data Flow

1. **Categories Page Load**
   → Controller (`src/controllers/categories.js`)
   → Calls `getUrgentTopicsCount(tree)`
   → Queries topics for each category
   → Counts topics with `urgent: true`
   → Attaches `urgentCount` to each category

2. **API Request**
   → API endpoint (`src/api/categories.js`)
   → Calls `categoriesAPI.list()`
   → Builds category tree
   → Calls `getUrgentTopicsCount(tree)`
   → Returns categories with `urgentCount`

3. **Template Rendering**
   → Template receives category data with `urgentCount`
   → Conditional styling based on count > 0
   → Displays count with appropriate color/icon

### Files Modified

**Backend:**
- `src/controllers/categories.js` - Added `getUrgentTopicsCount()`
- `src/api/categories.js` - Integrated urgent count into API

**Frontend:**
- `vendor/nodebb-theme-harmony-2.1.15/templates/partials/categories/item.tpl` - Display logic

**Documentation:**
- `public/openapi/components/schemas/CategoryObject.yaml` - Added `urgentCount` schema
- `public/language/en-US/global.json` - Added "urgent" translation

**Testing:**
- `test/categories.js` - Added comprehensive test suite (8 tests)

### Performance Considerations

- Queries run in parallel using `Promise.all()`
- Graceful error handling (failures don't break page)
- Counts calculated on-demand (no caching currently)

---

## Support & Troubleshooting

### Common Issues

**Issue**: Counter shows 0 but I marked topics as urgent
- **Solution**: Refresh the categories page; ensure topics are in the correct category

**Issue**: Counter not visible on mobile
- **Solution**: Ensure screen width < 768px; check browser console for errors

**Issue**: API doesn't return urgentCount
- **Solution**: Ensure NodeBB version supports the feature; check API endpoint is `/api/v3/categories`

### Getting Help

- Review test cases in `/test/categories.js` for usage examples
- Check implementation in `src/controllers/categories.js`
- Refer to OpenAPI schema in `public/openapi/components/schemas/CategoryObject.yaml`

---

## Changelog

### Version 1.0 (Current)
- ✅ Initial implementation of urgent topic counter
- ✅ Desktop and mobile responsive design
- ✅ API integration
- ✅ Comprehensive test coverage
- ✅ OpenAPI schema documentation

### Future Enhancements
- [ ] Add caching mechanism for improved performance
- [ ] Real-time WebSocket updates
- [ ] Filter categories by urgent count
- [ ] Admin dashboard widget
- [ ] Notification thresholds

---

**Last Updated**: October 8, 2025  
**Feature Status**: ✅ Fully Implemented & Tested  
**Test Coverage**: 8/8 tests passing

