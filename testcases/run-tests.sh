#!/bin/bash

echo "Starting Selenium Tests..."

# Wait for the mood-tracker service to be ready
echo "Waiting for mood-tracker service..."
sleep 10

# Run tests
echo "Running Test Suite..."
npm test

echo "Tests completed."
