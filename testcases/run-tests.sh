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

echo "--- Test 1: Homepage Load Test ---"
if node test1.js; then
    echo "✓ Test 1 PASSED"
    ((TEST_PASSED++))
else
    echo "✗ Test 1 FAILED"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 2: Login Page Navigation Test ---"
if node test2.js; then
    echo "✓ Test 2 PASSED"
    ((TEST_PASSED++))
else
    echo "✗ Test 2 FAILED"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 3: Page Response Test ---"
if node test3.js; then
    echo "✓ Test 3 PASSED"
    ((TEST_PASSED++))
else
    echo "✗ Test 3 FAILED"
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
