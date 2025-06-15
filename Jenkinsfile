pipeline {
  agent any
  environment {
    PROJECT_NAME = 'MoodTracker'
    JWT_SECRET_FALLBACK = credentials('JWT_SECRET')
  }

  stages {
    stage('Clone Repository') {
      steps {
        dir('Test-Cases') {
          git branch: 'main', url: 'https://github.com/afnanahmadtariq/Mood-Tracker.git'
        }
      }
    }    
    stage('Test') {
      steps {
        script {
            sh 'export JWT_SECRET_FALLBACK=${JWT_SECRET_FALLBACK}'
            sh 'cd testcases && docker-compose down -v --remove-orphans || true'
            sh 'cd testcases && docker-compose up --build --abort-on-container-exit | tee test-results.html'
            sh 'cd testcases && docker-compose down -v'
        }
      }
    }
    stage('Build and Deploy') {
      steps {
        script {
            sh 'export JWT_SECRET_FALLBACK=${JWT_SECRET_FALLBACK}'
            sh 'docker-compose -p $PROJECT_NAME -f docker-compose.yml down -v --remove-orphans || true'
            sh 'docker system prune -af || true'
            sh 'docker volume prune -f || true'
            sh 'docker-compose -p $PROJECT_NAME -f docker-compose.yml up -d --build'
        }
      }
    }
  }
  post {
    always {
      script {
        def testResults = readFile('testcases/test-results.html')
        def buildStatus = currentBuild.currentResult
        def committerEmail = sh(script: "cd Test-Cases && git log -1 --pretty=format:'%ae'", returnStdout: true).trim()
        
        // Determine status color and icon
        def statusColor = buildStatus == 'SUCCESS' ? '#28a745' : '#dc3545'
        def statusIcon = buildStatus == 'SUCCESS' ? '✅' : '❌'
        def statusBgColor = buildStatus == 'SUCCESS' ? '#d4edda' : '#f8d7da'
        
        emailext (
          subject: "${statusIcon} Mood Tracker Test Results - ${buildStatus}",
          mimeType: 'text/html',
          body: """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .header {
                        background-color: ${statusBgColor};
                        border: 1px solid ${statusColor};
                        border-radius: 5px;
                        padding: 20px;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .status-title {
                        color: ${statusColor};
                        font-size: 24px;
                        font-weight: bold;
                        margin: 0;
                    }
                    .info-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    .info-table th, .info-table td {
                        border: 1px solid #ddd;
                        padding: 12px;
                        text-align: left;
                    }
                    .info-table th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                    }
                    .test-results {
                        background-color: #f8f9fa;
                        border: 1px solid #e9ecef;
                        border-radius: 5px;
                        padding: 15px;
                        margin-bottom: 20px;
                    }
                    .test-results h3 {
                        color: #495057;
                        margin-top: 0;
                    }
                    .test-output {
                        background-color: #2d3748;
                        color: #e2e8f0;
                        padding: 15px;
                        border-radius: 5px;
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        white-space: pre-wrap;
                        overflow-x: auto;
                        max-height: 400px;
                        overflow-y: auto;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        color: #666;
                    }
                    .jenkins-link {
                        display: inline-block;
                        background-color: #007bff;
                        color: white;
                        padding: 10px 20px;
                        text-decoration: none;
                        border-radius: 5px;
                        margin-top: 10px;
                    }
                    .jenkins-link:hover {
                        background-color: #0056b3;
                        color: white;
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1 class="status-title">${statusIcon} Mood Tracker Test Results</h1>
                    <h2 style="color: ${statusColor}; margin: 10px 0;">${buildStatus}</h2>
                </div>
                
                <table class="info-table">
                    <tr>
                        <th>Build Number</th>
                        <td>${BUILD_NUMBER}</td>
                    </tr>
                    <tr>
                        <th>Branch</th>
                        <td>${GIT_BRANCH}</td>
                    </tr>
                    <tr>
                        <th>Committer</th>
                        <td>${committerEmail}</td>
                    </tr>
                    <tr>
                        <th>Build Status</th>
                        <td style="color: ${statusColor}; font-weight: bold;">${buildStatus}</td>
                    </tr>
                    <tr>
                        <th>Timestamp</th>
                        <td>${new Date()}</td>
                    </tr>
                </table>
                
                <div class="test-results">
                    <h3>📋 Test Output:</h3>
                    <div class="test-output">${testResults}</div>
                </div>
                
                <div class="footer">
                    <p>View full build details on Jenkins:</p>
                    <a href="${BUILD_URL}" class="jenkins-link">🔗 Open Jenkins Build</a>
                    <p style="margin-top: 20px; font-size: 12px;">
                        This is an automated email from the Mood Tracker CI/CD pipeline.
                    </p>
                </div>
            </body>
            </html>
          """,
          to: "${committerEmail}",
          replyTo: "shipatarGang@yourdomain.com",
          from: "shipatarGang@yourdomain.com"
        )
      }
    }
  }
}
