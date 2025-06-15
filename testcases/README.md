# Selenium Test Suite

This directory contains headless Selenium tests for the Mood Tracker application.

## Test Files

- `test1.js` - Homepage load test
- `test2.js` - Login page navigation test  
- `test3.js` - Page response time test

## Running Tests

The tests are automatically run as part of the Jenkins pipeline in the "Test" stage.

### Manual Testing

To run tests manually:

```bash
cd testcases
docker-compose up --build --abort-on-container-exit
```

## Test Structure

- Tests use headless Chrome in Docker containers
- Each test is self-contained and exits with appropriate codes
- Tests run sequentially and stop on first failure
- Simple echo outputs for Jenkins logs
