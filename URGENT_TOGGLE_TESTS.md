# Urgency Feature Test Suite

This document describes the comprehensive test suite for the NodeBB urgency feature implementation.

## Test Files

### 1. `test/urgency.js` - Core API and Backend Tests
Tests the core functionality of the urgency feature including:

- **API Endpoints**: Tests the `/api/v3/topics/:tid/urgency` endpoint
- **Database Integration**: Verifies urgency data is stored correctly
- **Permissions**: Tests user permissions for urgency operations
- **Edge Cases**: Handles invalid inputs and error conditions
- **Topic Creation**: Tests urgency handling during topic creation

**Key Test Cases:**
- ✅ Set topic urgency to true/false
- ✅ Reject invalid urgency values
- ✅ Reject requests from non-logged-in users
- ✅ Reject requests from users without permissions
- ✅ Store urgency as integer in database
- ✅ Handle urgency in topic creation
- ✅ Default urgency to false in topic creation

### 2. `test/frontend-urgency.js` - Frontend Integration Tests
Tests the frontend integration including:

- **Template Rendering**: Verifies urgency options appear in templates
- **JavaScript Integration**: Tests client-side urgency handlers
- **UI Elements**: Checks for correct icons, classes, and styling
- **API Integration**: Tests frontend API calls

**Key Test Cases:**
- ✅ Include urgency options in topic menu template
- ✅ Show correct urgency option based on topic state
- ✅ Include urgent badge in topic view when urgent
- ✅ Include urgency options in category tools dropdown
- ✅ Include urgent badge in topic list when urgent
- ✅ Include urgent class in topic list items
- ✅ Include urgency handlers in threadTools.js
- ✅ Include urgency handlers in category tools
- ✅ Include urgency in generateTopicClass helper

### 3. `test/urgency-acceptance.js` - Acceptance Criteria Tests
Tests specifically against the stated acceptance criteria:

**AC1: "Mark as urgent/not urgent" option exists under topic tools dropdown menu, for both topic list view and per topic view**

- ✅ Show "Mark Topic Urgent" option when topic is not urgent
- ✅ Show "Mark Topic Not Urgent" option when topic is urgent
- ✅ Hide "Mark Topic Urgent" when topic is urgent
- ✅ Hide "Mark Topic Not Urgent" when topic is not urgent
- ✅ Show urgency options in category tools dropdown
- ✅ Show urgency options in recent topics view

**AC2: Clicking that option adds/removes urgent tag from posts**

- ✅ Add urgent tag when marking as urgent
- ✅ Remove urgent tag when marking as not urgent
- ✅ Show urgent badge when topic is marked as urgent
- ✅ Hide urgent badge when topic is marked as not urgent
- ✅ Show urgent badge in topic list when urgent
- ✅ Add urgent class to topic list item when urgent
- ✅ Handle bulk urgency operations in topic list

## Running the Tests

### Run All Urgency Tests
```bash
./test/test-urgency.js
```

### Run Individual Test Files
```bash
# Core API tests
npx mocha test/urgency.js --timeout 30000

# Frontend integration tests
npx mocha test/frontend-urgency.js --timeout 30000

# Acceptance criteria tests
npx mocha test/urgency-acceptance.js --timeout 30000
```

### Run All Tests
```bash
npm test
```

## Test Coverage

The test suite covers:

### Backend Coverage
- ✅ API endpoint functionality
- ✅ Database storage and retrieval
- ✅ User permissions and authentication
- ✅ Error handling and validation
- ✅ Socket event emission
- ✅ Topic creation with urgency

### Frontend Coverage
- ✅ Template rendering
- ✅ JavaScript event handlers
- ✅ UI state management
- ✅ CSS class application
- ✅ Icon and styling verification
- ✅ Bulk operations

### Integration Coverage
- ✅ End-to-end workflows
- ✅ Cross-component communication
- ✅ Real-time updates
- ✅ Permission-based UI changes

## Test Data

The tests use the following test data:
- **Admin User**: `admin` (has all permissions)
- **Regular User**: `regular` (limited permissions)
- **Test Category**: "Test Category" for topic creation
- **Test Topics**: Various topics for testing urgency operations

## Dependencies

The tests require:
- NodeBB test environment
- Mocha test framework
- Request library for HTTP testing
- Database mock for isolated testing

## Expected Results

All tests should pass, confirming that:
1. The urgency feature is fully functional
2. UI elements appear correctly in both topic and category views
3. API endpoints work as expected
4. Database operations are correct
5. User permissions are enforced
6. The implementation meets all acceptance criteria

## Troubleshooting

If tests fail:
1. Ensure NodeBB is properly set up for testing
2. Check that all dependencies are installed
3. Verify database connections are working
4. Check that test users have proper permissions
5. Review test output for specific error messages
