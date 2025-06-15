# Selenium Test Suite

This directory contains headless Selenium tests for the Mood Tracker application.

## Test Files

- `test1.js` - Signup functionality: Registers new user and verifies redirect with correct details
- `test2.js` - Login functionality: Authenticates user and verifies app access (includes cookie clearing)
- `test3.js` - Analytics navigation: Clicks "View Analytics" button and verifies analytics page opens
- `test4.js` - Analytics empty state: Navigate to analytics and verify nothing showing (no data)
- `test5.js` - Mood creation: Adds a mood entry and verifies it appears in the list
- `test6.js` - Analytics with data: Navigate to analytics and verify charts/graphs are showing
- `test7.js` - Mood deletion: Deletes a mood entry and verifies it's removed from the list
- `test8.js` - Profile picture update: Changes profile picture URL and verifies the change
- `test9.js` - Profile DoB update: Changes date of birth in profile and verifies the change
- `test10.js` - Profile name update: Changes first and last name in profile and verifies the change
- `test11.js` - Profile dropdown navigation: Uses profile dropdown to access profile settings
- `test12.js` - Sign out functionality: Signs out user and verifies redirect to login page

## Test Flow

The tests are designed to run in sequence to create a complete user journey:

1. **Test 1**: User signs up → Redirects to app with same details as signed up
2. **Test 2**: User logs in → Successfully logins into app
3. **Test 3**: Click view analytics in main page → Analytics page opened
4. **Test 4**: Navigate to analytics → Nothing showing (no data yet)
5. **Test 5**: Save a mood → Mood is added to list
6. **Test 6**: Navigate to analytics → Now showing charts and graphs
7. **Test 7**: Delete a mood → That mood is deleted from the list
8. **Test 8**: Change profile picture URL → Profile picture changed
9. **Test 9**: Change profile DoB → Profile DoB changed
10. **Test 10**: Change profile Name → Profile Name changed
11. **Test 11**: Click on profile dropdown and opened profile settings → Profile page opened
12. **Test 12**: Signout → Redirects to login page

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

- Tests use headless Chrome in Docker containers
- Each test navigates to proper pages before testing
- Tests look for proper UI feedback elements to verify results
- Tests are self-contained but designed to run sequentially
- Tests exit with appropriate codes and provide detailed logging
- Simple echo outputs for Jenkins logs
- Cookie clearing implemented in Test 2 for reliable login testing

## Test Categories

### Authentication Tests
- Test 1: User registration
- Test 2: User login (with cookie clearing)
- Test 12: User sign out

### Core Functionality Tests
- Test 3: Analytics page navigation
- Test 4: Analytics empty state (no data)
- Test 5: Mood entry creation
- Test 6: Analytics with data
- Test 7: Mood entry deletion

### Profile Management Tests
- Test 8: Profile picture update
- Test 9: Date of birth update
- Test 10: Name update

### Navigation Tests
- Test 11: Profile dropdown navigation
