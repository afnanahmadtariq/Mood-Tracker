# Selenium Test Suite

This directory contains headless Selenium tests for the Mood Tracker application.

## Test Files

- `test1.js` - Signup functionality: Registers new user and verifies redirect with correct details
- `test2.js` - Login functionality: Authenticates user and verifies app access
- `test3.js` - Analytics empty state: Checks analytics page shows no data initially
- `test4.js` - Mood creation: Adds a mood entry and verifies it appears in the list
- `test5.js` - Analytics with data: Verifies analytics page shows charts after mood data exists
- `test6.js` - Mood deletion: Removes a mood entry and verifies it's deleted from the list

## Test Flow

The tests are designed to run in sequence to create a complete user journey:

1. **Test 1**: User signs up → Redirects to app with same details as signed up
2. **Test 2**: User logs in → Successfully logins into app
3. **Test 3**: Navigate to analytics → Nothing showing (no data yet)
4. **Test 4**: Save a mood → Mood is added to list
5. **Test 5**: Navigate to analytics → Now showing charts and graphs
6. **Test 6**: Delete a mood → That mood is deleted from the list

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
# etc.
```

## Test Structure

- Tests use headless Chrome in Docker containers
- Each test navigates to proper pages before testing
- Tests look for proper UI feedback elements to verify results
- Tests are self-contained but designed to run sequentially
- Tests exit with appropriate codes and provide detailed logging
- Simple echo outputs for Jenkins logs
