# Selenium Test Suite

This directory contains headless Selenium tests for the Mood Tracker application.

## Test Files

- `test1.js` - **User Registration**: Registers new user and verifies successful redirect to application with correct user details
- `test2.js` - **User Authentication**: Authenticates user and verifies successful access to application (includes session clearing)
- `test3.js` - **Analytics Navigation**: Clicks "View Analytics" button and verifies analytics page opens correctly
- `test4.js` - **Empty Analytics Verification**: Navigate to analytics and verify empty state display when no data available
- `test5.js` - **Mood Entry Creation**: Adds a mood entry and verifies it appears in the mood journey list
- `test6.js` - **Analytics Data Visualization**: Navigate to analytics and verify charts and graphs display with data
- `test7.js` - **Mood Entry Deletion**: Deletes a mood entry and verifies it's removed from the mood journey list
- `test8.js` - **Profile Picture Update**: Changes profile picture URL and verifies the image update
- `test9.js` - **Profile Date of Birth Update**: Changes date of birth in profile and verifies the information update
- `test10.js` - **Profile Name Update**: Changes first and last name in profile and verifies the information update
- `test11.js` - **Profile Dropdown Navigation**: Uses profile dropdown to access profile settings page
- `test12.js` - **User Signout Verification**: Signs out user and verifies redirect to login page

## Test Flow

The tests are designed to run in sequence to create a complete user journey:

1. **Test 1**: User Registration - Verify successful signup redirects to application with correct user details
2. **Test 2**: User Authentication - Verify successful login grants access to application
3. **Test 3**: Analytics Navigation - Verify clicking analytics button on main page opens analytics page
4. **Test 4**: Empty Analytics Verification - Verify analytics page displays empty state when no data available
5. **Test 5**: Mood Entry Verification - Verify saving a mood entry adds it to the mood journey list
6. **Test 6**: Analytics Data Visualization - Verify analytics page displays charts and graphs when data is available
7. **Test 7**: Mood Entry Deletion - Verify deleting a mood entry removes it from the mood journey list
8. **Test 8**: Profile Picture Update - Verify entering profile picture URL updates the user's profile image
9. **Test 9**: Profile Date of Birth Update - Verify changing profile date of birth updates user information correctly
10. **Test 10**: Profile Name Update - Verify changing profile name updates user information correctly
11. **Test 11**: Profile Dropdown Navigation - Verify clicking profile dropdown opens profile settings page
12. **Test 12**: User Signout Verification - Verify signing out redirects user to login page

## Running Tests

The tests are automatically run as part of the Jenkins pipeline in the "Test" stage.

### Manual Testing

To run tests manually:

```bash
cd testcases
docker-compose up --build --abort-on-container-exit
```

Or run individual tests:

```bash
node test1.js
node test2.js
node test3.js
node test4.js
node test5.js
node test6.js
node test7.js
node test8.js
node test9.js
node test10.js
node test11.js
node test12.js
```

## Test Structure

- Tests use headless Chrome in Docker containers for reliable execution
- Each test navigates to appropriate pages before performing test operations
- Tests verify proper UI feedback elements to confirm expected results
- Tests are self-contained but designed to run sequentially for complete user journey
- Tests exit with appropriate codes and provide detailed, professional logging
- Comprehensive output formatting for Jenkins CI/CD integration
- Session clearing implemented in Test 2 for reliable authentication testing

## Test Categories

### Authentication Tests
- Test 1: User registration and verification
- Test 2: User login authentication (with session clearing)
- Test 12: User signout and redirection

### Core Functionality Tests
- Test 3: Analytics page navigation verification
- Test 4: Analytics empty state verification (no data available)
- Test 5: Mood entry creation and list verification
- Test 6: Analytics data visualization verification
- Test 7: Mood entry deletion and removal verification

### Profile Management Tests
- Test 8: Profile picture URL update verification
- Test 9: Profile date of birth update verification
- Test 10: Profile name update verification

### Navigation Tests
- Test 11: Profile dropdown navigation verification
