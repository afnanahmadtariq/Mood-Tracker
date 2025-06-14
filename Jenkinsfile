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
}
