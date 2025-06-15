#!/bin/bash

echo "=== Mood Tracker Test Suite Results ==="
echo "Timestamp: $(date)"
echo "========================================="

# Wait for the mood-tracker service to be ready
echo "Waiting for mood-tracker service..."
sleep 15

# Run tests and capture results
echo "Running Test Suite..."

TEST_PASSED=0
TEST_FAILED=0

echo "--- Test 1: Signup -> Redirects into app with same details ---"
if node test1.js; then
    echo "✓ Test 1 PASSED"
    ((TEST_PASSED++))
else
    echo "✗ Test 1 FAILED"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 2: Login -> Logins into app ---"
if node test2.js; then
    echo "✓ Test 2 PASSED"
    ((TEST_PASSED++))
else
    echo "✗ Test 2 FAILED"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 3: Navigate to analytics -> Nothing showing ---"
if node test3.js; then
    echo "✓ Test 3 PASSED"
    ((TEST_PASSED++))
else
    echo "✗ Test 3 FAILED"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 4: Save a mood -> Mood is added to list ---"
if node test4.js; then
    echo "✓ Test 4 PASSED"
    ((TEST_PASSED++))
else
    echo "✗ Test 4 FAILED"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 5: Navigate to analytics -> Now showing charts and graphs ---"
if node test5.js; then
    echo "✓ Test 5 PASSED"
    ((TEST_PASSED++))
else
    echo "✗ Test 5 FAILED"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 6: Delete a mood -> That mood is deleted from the list ---"
if node test6.js; then
    echo "✓ Test 6 PASSED"
    ((TEST_PASSED++))
else
    echo "✗ Test 6 FAILED"
    ((TEST_FAILED++))
fi

echo ""
echo "========================================="
echo "Test Summary:"
echo "Tests Passed: $TEST_PASSED"
echo "Tests Failed: $TEST_FAILED"
echo "Total Tests: $((TEST_PASSED + TEST_FAILED))"

if [ $TEST_FAILED -gt 0 ]; then
    echo "Overall Result: FAILED"
    exit 1
else
    echo "Overall Result: PASSED"
    exit 0
fi
