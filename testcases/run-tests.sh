#!/bin/bash

echo "=== Mood Tracker Test Suite Results ==="
echo "Timestamp: $(date)"
echo "========================================="

# Wait for the mood-tracker service to be ready
echo "Waiting for mood-tracker service to initialize..."
sleep 15

# Run tests and capture results
echo "Executing Comprehensive Test Suite..."

TEST_PASSED=0
TEST_FAILED=0

echo "--- Test 1: User Registration - Verify successful signup redirects to application with correct user details ---"
if node test1.js; then
    echo "✓ Test 1 PASSED - User Registration"
    ((TEST_PASSED++))
else
    echo "✗ Test 1 FAILED - User Registration"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 2: User Authentication - Verify successful login grants access to application ---"
if node test2.js; then
    echo "✓ Test 2 PASSED - User Authentication"
    ((TEST_PASSED++))
else
    echo "✗ Test 2 FAILED - User Authentication"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 3: Analytics Navigation - Verify clicking analytics button on main page opens analytics page ---"
if node test3.js; then
    echo "✓ Test 3 PASSED - Analytics Navigation"
    ((TEST_PASSED++))
else
    echo "✗ Test 3 FAILED - Analytics Navigation"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 4: Empty Analytics Verification - Verify analytics page displays empty state when no data available ---"
if node test4.js; then
    echo "✓ Test 4 PASSED - Empty Analytics Verification"
    ((TEST_PASSED++))
else
    echo "✗ Test 4 FAILED - Empty Analytics Verification"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 5: Mood Entry Verification - Verify saving a mood entry adds it to the mood journey list ---"
if node test5.js; then
    echo "✓ Test 5 PASSED - Mood Entry Verification"
    ((TEST_PASSED++))
else
    echo "✗ Test 5 FAILED - Mood Entry Verification"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 6: Analytics Data Visualization - Verify analytics page displays charts and graphs when data is available ---"
if node test6.js; then
    echo "✓ Test 6 PASSED - Analytics Data Visualization"
    ((TEST_PASSED++))
else
    echo "✗ Test 6 FAILED - Analytics Data Visualization"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 7: Mood Entry Deletion - Verify deleting a mood entry removes it from the mood journey list ---"
if node test7.js; then
    echo "✓ Test 7 PASSED - Mood Entry Deletion"
    ((TEST_PASSED++))
else
    echo "✗ Test 7 FAILED - Mood Entry Deletion"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 8: Profile Picture Update - Verify entering profile picture URL updates the user's profile image ---"
if node test8.js; then
    echo "✓ Test 8 PASSED - Profile Picture Update"
    ((TEST_PASSED++))
else
    echo "✗ Test 8 FAILED - Profile Picture Update"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 9: Profile Date of Birth Update - Verify changing profile date of birth updates user information correctly ---"
if node test9.js; then
    echo "✓ Test 9 PASSED - Profile Date of Birth Update"
    ((TEST_PASSED++))
else
    echo "✗ Test 9 FAILED - Profile Date of Birth Update"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 10: Profile Name Update - Verify changing profile name updates user information correctly ---"
if node test10.js; then
    echo "✓ Test 10 PASSED - Profile Name Update"
    ((TEST_PASSED++))
else
    echo "✗ Test 10 FAILED - Profile Name Update"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 11: Profile Dropdown Navigation - Verify clicking profile dropdown opens profile settings page ---"
if node test11.js; then
    echo "✓ Test 11 PASSED - Profile Dropdown Navigation"
    ((TEST_PASSED++))
else
    echo "✗ Test 11 FAILED - Profile Dropdown Navigation"
    ((TEST_FAILED++))
fi

echo ""
echo "--- Test 12: User Signout Verification - Verify signing out redirects user to login page ---"
if node test12.js; then
    echo "✓ Test 12 PASSED - User Signout Verification"
    ((TEST_PASSED++))
else
    echo "✗ Test 12 FAILED - User Signout Verification"
    ((TEST_FAILED++))
fi

echo ""
echo "========================================="
echo "Comprehensive Test Suite Summary:"
echo "Tests Passed: $TEST_PASSED"
echo "Tests Failed: $TEST_FAILED"
echo "Total Tests Executed: $((TEST_PASSED + TEST_FAILED))"

if [ $TEST_FAILED -gt 0 ]; then
    echo "Overall Test Result: FAILED"
    echo "Please review failed tests and address any issues before deployment."
    exit 1
else
    echo "Overall Test Result: PASSED"
    echo "All tests completed successfully. Application is ready for deployment."
    exit 0
fi
