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
            sh 'cd testcases && docker-compose up --build --abort-on-container-exit 2>&1 | tee test-results-raw.txt'
            sh 'cd testcases && docker-compose down -v'
            sh 'cd testcases && node format-test-results.js test-results-raw.txt test-results.html'
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
        def testResultsHtml = ''
        try {
          testResultsHtml = readFile('testcases/test-results.html')
        } catch (Exception e) {
          testResultsHtml = '<p style="color: red;">❌ Could not load test results: ' + e.getMessage() + '</p>'
        }
        
        def buildStatus = currentBuild.currentResult
        def committerEmail = sh(script: "cd Test-Cases && git log -1 --pretty=format:'%ae'", returnStdout: true).trim()
        
        // Determine status color and icon
        def statusColor = buildStatus == 'SUCCESS' ? '#28a745' : '#dc3545'
        def statusIcon = buildStatus == 'SUCCESS' ? '✅' : '❌'
        
        emailext (
          subject: "${statusIcon} Mood Tracker Test Results - ${buildStatus}",
          mimeType: 'text/html',
          body: testResultsHtml,
          to: "${committerEmail}",
          replyTo: "shipatarGang@yourdomain.com",
          from: "shipatarGang@yourdomain.com"
        )
      }
    }
  }
}
