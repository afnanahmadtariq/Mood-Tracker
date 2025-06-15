# Test Results Formatter

This directory contains a custom HTML formatter for test results that creates beautiful, interactive reports with colors and icons.

## Files

- `format-test-results.js` - Main formatter script that converts raw test output to styled HTML
- `test-formatter.bat` / `test-formatter.sh` - Test scripts to verify the formatter works
- `test-results.html` - Generated HTML report (created after running tests)
- `test-results-raw.txt` - Raw test output (captured during Jenkins run)

## Features

- 🎨 **Beautiful Design**: Modern, responsive design with gradients and shadows
- 📊 **Summary Statistics**: Total tests, passed, failed, duration, and success rate
- 🔍 **Interactive Sections**: Click to expand/collapse individual test details
- 🎯 **Color-coded Results**: Green for passed, red for failed, blue for running
- 📱 **Icon Support**: Emoji icons for different types of test activities
- ⚡ **Auto-expand Failed Tests**: Failed tests are automatically expanded for quick debugging

## Usage

### In Jenkins Pipeline
The formatter is automatically used in the Jenkins pipeline:

```groovy
sh 'cd testcases && docker-compose up --build --abort-on-container-exit 2>&1 | tee test-results-raw.txt'
sh 'cd testcases && node format-test-results.js test-results-raw.txt test-results.html'
```

### Manual Usage
```bash
# Format existing test output
node format-test-results.js input.txt output.html

# Test the formatter with sample data
node test-formatter.bat  # Windows
./test-formatter.sh     # Linux/Mac
```

### Reading from stdin
```bash
# Pipe test output directly to formatter
your-test-command | node format-test-results.js - test-results.html
```

## Test Log Patterns

The formatter recognizes these patterns in test output:

| Pattern | Icon | Color | Description |
|---------|------|-------|-------------|
| `Starting Test N:` | 🚀 | Blue | Test initialization |
| `✅`, `passed`, `SUCCESS` | ✅ | Green | Test success |
| `❌`, `failed`, `FAILED`, `ERROR` | ❌ | Red | Test failure |
| `📍`, `Navigating to` | 📍 | Blue | Page navigation |
| `🔍`, `Looking for` | 🔍 | Gray | Element searching |
| `📝`, `Filling out` | 📝 | Purple | Form input |
| `🚀`, `Submitting` | 🎯 | Orange | Action execution |
| `⏳`, `Waiting for` | ⏳ | Yellow | Wait operations |
| `✓`, `Checking` | ✓ | Teal | Verification |
| `Warning:` | ⚠️ | Yellow | Warnings |
| `Info:`, `ℹ️` | ℹ️ | Cyan | Information |

## HTML Output Features

- **Responsive Design**: Works on desktop and mobile
- **Auto-expand Failed Tests**: Failed tests are automatically expanded
- **Collapsible Sections**: Click test headers to expand/collapse details
- **Timestamp Display**: Each log line includes execution time
- **Statistics Summary**: Overview cards with key metrics
- **Modern Styling**: Gradient backgrounds, shadows, and smooth transitions

## Email Integration

The formatted HTML is automatically sent via email in the Jenkins pipeline, providing recipients with a professional, easy-to-read test report directly in their inbox.
