#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class TestResultsFormatter {
  constructor() {
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.startTime = new Date();
  }

  parseLogLine(line) {
    // Remove ANSI color codes and clean the line
    const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '').trim();
    
    // Test patterns
    const patterns = {
      testStart: /Starting Test \d+:/i,
      testPass: /✅|Test \d+ passed|SUCCESS|PASSED/i,
      testFail: /❌|Test \d+ failed|FAILED|ERROR/i,
      navigation: /📍|Navigating to/i,
      searching: /🔍|Looking for|Finding/i,
      filling: /📝|Filling out|Entering/i,
      submitting: /🚀|Submitting|Clicking/i,
      waiting: /⏳|Waiting for/i,
      checking: /✓|Checking|Verifying/i,
      error: /Error:|Exception:|failed to/i,
      warning: /Warning:|Warn:/i,
      info: /Info:|ℹ️/i
    };

    return {
      original: line,
      clean: cleanLine,
      type: this.determineLineType(cleanLine, patterns),
      timestamp: new Date().toISOString().substr(11, 8)
    };
  }

  determineLineType(line, patterns) {
    if (patterns.testStart.test(line)) return 'test-start';
    if (patterns.testPass.test(line)) return 'success';
    if (patterns.testFail.test(line)) return 'error';
    if (patterns.error.test(line)) return 'error';
    if (patterns.warning.test(line)) return 'warning';
    if (patterns.navigation.test(line)) return 'navigation';
    if (patterns.searching.test(line)) return 'search';
    if (patterns.filling.test(line)) return 'input';
    if (patterns.submitting.test(line)) return 'action';
    if (patterns.waiting.test(line)) return 'wait';
    if (patterns.checking.test(line)) return 'check';
    if (patterns.info.test(line)) return 'info';
    return 'default';
  }

  processRawLog(rawLog) {
    const lines = rawLog.split('\n');
    const processedLines = [];
    let currentTest = null;

    for (const line of lines) {
      if (!line.trim()) continue;

      const processed = this.parseLogLine(line);
      
      // Track test starts
      if (processed.type === 'test-start') {
        this.totalTests++;
        const testMatch = processed.clean.match(/Test (\d+):/);
        currentTest = {
          number: testMatch ? testMatch[1] : this.totalTests,
          name: processed.clean,
          lines: [],
          status: 'running',
          startTime: new Date()
        };
        this.testResults.push(currentTest);
      }

      // Track test results
      if (processed.type === 'success' && currentTest) {
        currentTest.status = 'passed';
        this.passedTests++;
      } else if (processed.type === 'error' && currentTest) {
        currentTest.status = 'failed';
        this.failedTests++;
      }

      if (currentTest) {
        currentTest.lines.push(processed);
      }

      processedLines.push(processed);
    }

    return processedLines;
  }

  generateHTML(processedLines) {
    const endTime = new Date();
    const duration = ((endTime - this.startTime) / 1000).toFixed(2);
    const successRate = this.totalTests > 0 ? ((this.passedTests / this.totalTests) * 100).toFixed(1) : 0;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mood Tracker Test Results</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }

        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
        }

        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }

        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transition: transform 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-5px);
        }

        .stat-icon {
            font-size: 2em;
            margin-bottom: 10px;
        }

        .stat-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .stat-label {
            color: #6c757d;
            font-size: 0.9em;
        }

        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .duration { color: #17a2b8; }
        .rate { color: #ffc107; }

        .test-results {
            padding: 30px;
        }

        .test-section {
            margin-bottom: 30px;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            overflow: hidden;
        }

        .test-header {
            padding: 15px 20px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: background-color 0.3s ease;
        }

        .test-header:hover {
            background-color: #f8f9fa;
        }

        .test-header.passed {
            background-color: #d4edda;
            color: #155724;
            border-left: 4px solid #28a745;
        }

        .test-header.failed {
            background-color: #f8d7da;
            color: #721c24;
            border-left: 4px solid #dc3545;
        }

        .test-header.running {
            background-color: #d1ecf1;
            color: #0c5460;
            border-left: 4px solid #17a2b8;
        }

        .test-body {
            padding: 20px;
            background: #f8f9fa;
            display: none;
        }

        .test-body.expanded {
            display: block;
        }

        .log-line {
            padding: 8px 12px;
            margin: 3px 0;
            border-radius: 5px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 13px;
            line-height: 1.4;
            display: flex;
            align-items: center;
        }

        .log-icon {
            margin-right: 10px;
            font-size: 14px;
            min-width: 20px;
        }

        .log-line.success {
            background: #d4edda;
            border-left: 3px solid #28a745;
            color: #155724;
        }

        .log-line.error {
            background: #f8d7da;
            border-left: 3px solid #dc3545;
            color: #721c24;
        }

        .log-line.warning {
            background: #fff3cd;
            border-left: 3px solid #ffc107;
            color: #856404;
        }

        .log-line.navigation {
            background: #cce5ff;
            border-left: 3px solid #007bff;
            color: #004085;
        }

        .log-line.search {
            background: #e2e3e5;
            border-left: 3px solid #6c757d;
            color: #383d41;
        }

        .log-line.input {
            background: #f0e5ff;
            border-left: 3px solid #6f42c1;
            color: #3d1a6b;
        }

        .log-line.action {
            background: #ffe5cc;
            border-left: 3px solid #fd7e14;
            color: #8a3700;
        }

        .log-line.wait {
            background: #fff5e6;
            border-left: 3px solid #e67e22;
            color: #b85600;
        }

        .log-line.check {
            background: #e8f5e8;
            border-left: 3px solid #20c997;
            color: #0f5132;
        }

        .log-line.info {
            background: #e7f3ff;
            border-left: 3px solid #0dcaf0;
            color: #055160;
        }

        .log-line.test-start {
            background: #f8f9fa;
            border-left: 3px solid #495057;
            color: #212529;
            font-weight: bold;
        }

        .timestamp {
            color: #6c757d;
            font-size: 11px;
            margin-left: auto;
        }

        .footer {
            background: #343a40;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 0.9em;
        }

        .toggle-icon {
            transition: transform 0.3s ease;
        }

        .toggle-icon.expanded {
            transform: rotate(180deg);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Mood Tracker Test Results</h1>
            <div class="subtitle">Automated Test Execution Report</div>
        </div>

        <div class="summary">
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-value">${this.totalTests}</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon passed">✅</div>
                <div class="stat-value passed">${this.passedTests}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon failed">❌</div>
                <div class="stat-value failed">${this.failedTests}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon duration">⏱️</div>
                <div class="stat-value duration">${duration}s</div>
                <div class="stat-label">Duration</div>
            </div>
        </div>

        <div class="test-results">
            <h2 style="margin-bottom: 20px; color: #495057;">📋 Test Execution Details</h2>
            ${this.generateTestSections()}
        </div>

        <div class="footer">
            <p>Generated on ${new Date().toLocaleString()} | Success Rate: ${successRate}%</p>
        </div>
    </div>

    <script>
        function toggleTest(testId) {
            const body = document.getElementById('test-body-' + testId);
            const icon = document.getElementById('toggle-icon-' + testId);
            
            body.classList.toggle('expanded');
            icon.classList.toggle('expanded');
        }

        // Auto-expand failed tests
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.test-header.failed').forEach(header => {
                const testId = header.onclick.toString().match(/toggleTest\\('([^']+)'\\)/)[1];
                toggleTest(testId);
            });
        });
    </script>
</body>
</html>`;
  }

  generateTestSections() {
    if (this.testResults.length === 0) {
      return '<div class="test-section"><div class="test-header">No tests found in the output</div></div>';
    }

    return this.testResults.map((test, index) => {
      const testId = `test-${index}`;
      const statusClass = test.status === 'passed' ? 'passed' : test.status === 'failed' ? 'failed' : 'running';
      const statusIcon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '🔄';

      return `
        <div class="test-section">
            <div class="test-header ${statusClass}" onclick="toggleTest('${testId}')">
                <span>
                    <span class="stat-icon">${statusIcon}</span>
                    Test ${test.number}: ${test.name.replace(/Starting Test \d+: ?/i, '')}
                </span>
                <span class="toggle-icon" id="toggle-icon-${testId}">▼</span>
            </div>
            <div class="test-body" id="test-body-${testId}">
                ${this.generateLogLines(test.lines)}
            </div>
        </div>`;
    }).join('');
  }

  generateLogLines(lines) {
    return lines.map(line => {
      const icon = this.getIconForType(line.type);
      return `
        <div class="log-line ${line.type}">
            <span class="log-icon">${icon}</span>
            <span class="log-content">${this.escapeHtml(line.clean)}</span>
            <span class="timestamp">${line.timestamp}</span>
        </div>`;
    }).join('');
  }

  getIconForType(type) {
    const icons = {
      'test-start': '🚀',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'navigation': '📍',
      'search': '🔍',
      'input': '📝',
      'action': '🎯',
      'wait': '⏳',
      'check': '✓',
      'info': 'ℹ️',
      'default': '📄'
    };
    return icons[type] || icons.default;
  }

  escapeHtml(text) {
    const div = { innerHTML: text };
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  formatResults(rawLog) {
    this.startTime = new Date();
    const processedLines = this.processRawLog(rawLog);
    return this.generateHTML(processedLines);
  }
}

// Main execution
if (require.main === module) {
  const inputFile = process.argv[2] || 'test-results.txt';
  const outputFile = process.argv[3] || 'test-results.html';

  try {
    let rawLog = '';
    
    if (fs.existsSync(inputFile)) {
      rawLog = fs.readFileSync(inputFile, 'utf8');
    } else {
      // Read from stdin if no input file
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (chunk) => {
        rawLog += chunk;
      });
      process.stdin.on('end', () => {
        processAndSave(rawLog);
      });
      return;
    }
    
    processAndSave(rawLog);
    
  } catch (error) {
    console.error('Error processing test results:', error.message);
    process.exit(1);
  }

  function processAndSave(rawLog) {
    const formatter = new TestResultsFormatter();
    const htmlOutput = formatter.formatResults(rawLog);
    
    fs.writeFileSync(outputFile, htmlOutput);
    console.log(`✅ Formatted test results saved to ${outputFile}`);
    console.log(`📊 Total Tests: ${formatter.totalTests}`);
    console.log(`✅ Passed: ${formatter.passedTests}`);
    console.log(`❌ Failed: ${formatter.failedTests}`);
  }
}

module.exports = TestResultsFormatter;
