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
        }        body {
            font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            min-height: 100vh;
            padding: 24px;
            line-height: 1.6;
            color: #2c3e50;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 24px 64px rgba(0, 0, 0, 0.12), 0 8px 24px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%);
            color: #ffffff;
            padding: 48px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }

        .header h1 {
            font-size: 3.2em;
            margin-bottom: 16px;
            font-weight: 700;
            letter-spacing: -0.02em;
            position: relative;
            z-index: 1;
        }

        .header .subtitle {
            font-size: 1.3em;
            opacity: 0.85;
            font-weight: 400;
            letter-spacing: 0.01em;
            position: relative;
            z-index: 1;
        }        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 24px;
            padding: 40px;
            background: linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%);
            border-bottom: 1px solid #dee2e6;
        }

        .stat-card {
            background: #ffffff;
            padding: 32px 24px;
            border-radius: 12px;
            text-align: center;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.04);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(0, 0, 0, 0.04);
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #3498db, #2980b9);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08);
        }

        .stat-card:hover::before {
            transform: scaleX(1);
        }

        .stat-icon {
            font-size: 2.4em;
            margin-bottom: 16px;
            display: block;
        }

        .stat-value {
            font-size: 2.8em;
            font-weight: 700;
            margin-bottom: 8px;
            line-height: 1;
        }

        .stat-label {
            color: #6c757d;
            font-size: 1em;
            font-weight: 500;
            letter-spacing: 0.02em;
            text-transform: uppercase;
        }

        .passed { color: #27ae60; }
        .failed { color: #e74c3c; }
        .duration { color: #3498db; }
        .rate { color: #f39c12; }        .test-results {
            padding: 40px;
            background: #ffffff;
        }

        .test-section {
            margin-bottom: 24px;
            border: 1px solid #e1e5e9;
            border-radius: 12px;
            overflow: hidden;
            background: #ffffff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
            transition: all 0.3s ease;
        }

        .test-section:hover {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .test-header {
            padding: 20px 24px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 1.05em;
            user-select: none;
        }

        .test-header:hover {
            background-color: rgba(52, 73, 94, 0.02);
        }

        .test-header.passed {
            background: linear-gradient(135deg, #d5f4e6 0%, #c8e6c9 100%);
            color: #1b5e20;
            border-left: 5px solid #27ae60;
        }

        .test-header.failed {
            background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
            color: #b71c1c;
            border-left: 5px solid #e74c3c;
        }

        .test-header.running {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            color: #0d47a1;
            border-left: 5px solid #3498db;
        }

        .test-body {
            padding: 24px;
            background: linear-gradient(145deg, #fafbfc 0%, #f5f6fa 100%);
            display: none;
            border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .test-body.expanded {
            display: block;
        }        .log-line {
            padding: 12px 16px;
            margin: 6px 0;
            border-radius: 8px;
            font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
            font-size: 13.5px;
            line-height: 1.5;
            display: flex;
            align-items: center;
            transition: all 0.2s ease;
            position: relative;
        }

        .log-line:hover {
            transform: translateX(4px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .log-icon {
            margin-right: 12px;
            font-size: 15px;
            min-width: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .log-line.success {
            background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
            border-left: 4px solid #27ae60;
            color: #1b5e20;
        }

        .log-line.error {
            background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
            border-left: 4px solid #e74c3c;
            color: #b71c1c;
        }

        .log-line.warning {
            background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
            border-left: 4px solid #f39c12;
            color: #e65100;
        }

        .log-line.navigation {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            border-left: 4px solid #3498db;
            color: #0d47a1;
        }

        .log-line.search {
            background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
            border-left: 4px solid #9b59b6;
            color: #4a148c;
        }

        .log-line.input {
            background: linear-gradient(135deg, #f1f8e9 0%, #dcedc8 100%);
            border-left: 4px solid #8bc34a;
            color: #33691e;
        }

        .log-line.action {
            background: linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%);
            border-left: 4px solid #ff9800;
            color: #e65100;
        }

        .log-line.wait {
            background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%);
            border-left: 4px solid #e91e63;
            color: #880e4f;
        }

        .log-line.check {
            background: linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%);
            border-left: 4px solid #00bcd4;
            color: #006064;
        }

        .log-line.info {
            background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
            border-left: 4px solid #673ab7;
            color: #4a148c;
        }

        .log-line.test-start {
            background: linear-gradient(135deg, #eceff1 0%, #cfd8dc 100%);
            border-left: 4px solid #607d8b;
            color: #263238;
            font-weight: 600;
        }        .timestamp {
            color: #8e9aaf;
            font-size: 11.5px;
            margin-left: auto;
            font-weight: 500;
            background: rgba(255, 255, 255, 0.7);
            padding: 2px 8px;
            border-radius: 4px;
            backdrop-filter: blur(4px);
        }

        .footer {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: #ecf0f1;
            padding: 32px;
            text-align: center;
            font-size: 0.95em;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer p {
            margin: 0;
            font-weight: 500;
            letter-spacing: 0.01em;
        }

        .toggle-icon {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 1.2em;
            color: rgba(0, 0, 0, 0.6);
        }

        .toggle-icon.expanded {
            transform: rotate(180deg);
            color: rgba(0, 0, 0, 0.8);
        }

        /* Professional typography improvements */
        h2 {
            font-weight: 700;
            font-size: 1.8em;
            margin-bottom: 24px;
            color: #2c3e50;
            letter-spacing: -0.01em;
            position: relative;
            padding-left: 16px;
        }

        h2::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 24px;
            background: linear-gradient(135deg, #3498db, #2980b9);
            border-radius: 2px;
        }

        /* Accessibility improvements */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }

        /* Print styles */
        @media print {
            body {
                background: white;
                padding: 0;
            }
            .container {
                box-shadow: none;
                border: 1px solid #ddd;
            }
            .header {
                background: #2c3e50 !important;
                -webkit-print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="container">        <div class="header">
            <h1>📊 Mood Tracker Test Execution Report</h1>
            <div class="subtitle">Comprehensive Automated Testing Results & Analytics</div>
        </div>

        <div class="summary">
            <div class="stat-card">
                <div class="stat-icon">🧪</div>
                <div class="stat-value">${this.totalTests}</div>
                <div class="stat-label">Total Test Cases</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon passed">✅</div>
                <div class="stat-value passed">${this.passedTests}</div>
                <div class="stat-label">Tests Passed</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon failed">❌</div>
                <div class="stat-value failed">${this.failedTests}</div>
                <div class="stat-label">Tests Failed</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon duration">⏱️</div>
                <div class="stat-value duration">${duration}s</div>
                <div class="stat-label">Execution Time</div>
            </div>
        </div>

        <div class="test-results">
            <h2>📋 Detailed Test Execution Log</h2>
            ${this.generateTestSections()}
        </div>

        <div class="footer">
            <p>Report Generated: ${new Date().toLocaleString()} | Success Rate: ${successRate}% | Mood Tracker Quality Assurance</p>
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
      const statusIcon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '🔄';      return `
        <div class="test-section">
            <div class="test-header ${statusClass}" onclick="toggleTest('${testId}')">
                <span>
                    <span class="stat-icon">${statusIcon}</span>
                    Test Case ${test.number}: ${test.name.replace(/Starting Test \d+: ?/i, '')}
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
      'navigation': '🧭',
      'search': '🔍',
      'input': '📝',
      'action': '⚡',
      'wait': '⏳',
      'check': '✔️',
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
    console.log(`✅ Professional test results report generated: ${outputFile}`);
    console.log(`📊 Test Execution Summary:`);
    console.log(`   • Total Test Cases: ${formatter.totalTests}`);
    console.log(`   • Passed: ${formatter.passedTests}`);
    console.log(`   • Failed: ${formatter.failedTests}`);
    console.log(`   • Success Rate: ${formatter.totalTests > 0 ? ((formatter.passedTests / formatter.totalTests) * 100).toFixed(1) : 0}%`);
    console.log(`📈 Report available at: ${path.resolve(outputFile)}`);
  }
}

module.exports = TestResultsFormatter;
