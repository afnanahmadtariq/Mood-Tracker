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
            sh 'cd testcases && docker-compose up --build --abort-on-container-exit | tee test-results.log'
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
        def testResults = readFile('testcases/test-results.log')
        def buildStatus = currentBuild.currentResult
        def committerEmail = sh(script: "cd Test-Cases && git log -1 --pretty=format:'%ae'", returnStdout: true).trim()
        
        emailext (
          subject: "Mood Tracker Test Results - ${buildStatus}",
          body: """
            Test Results for Mood Tracker Application
            
            Build Status: ${buildStatus}
            Build Number: ${BUILD_NUMBER}
            Branch: ${GIT_BRANCH}
            Committer: ${committerEmail}
            
            Test Output:
            ${testResults}
            
            Jenkins Build: ${BUILD_URL}
          """,
          to: "${committerEmail}",
          replyTo: "shipatarGang@yourdomain.com",
          from: "shipatarGang@yourdomain.com"
        )
      }
    }
  }
}
