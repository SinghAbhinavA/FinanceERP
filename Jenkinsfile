pipeline {

    agent any

    environment {
        DISPLAY = ':0'
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                url: 'https://github.com/SinghAbhinavA/FinanceERP.git'
            }
        }

        stage('Install Playwright Dependencies') {
            steps {
                dir('playwright') {
                    sh 'npm install'
                }
            }
        }

        stage('Install Browsers') {
            steps {
                dir('playwright') {
                    sh 'npx playwright install'
                }
            }
        }

        stage('Build Java JNLP Launcher') {
            steps {
                dir('java-jnlp') {
                    sh 'mvn clean package'
                }
            }
        }

        stage('Run Playwright Tests') {
            steps {
                dir('playwright') {
                    sh 'npx playwright test --headed'
                }
            }
        }
    }

    post {

        always {
            archiveArtifacts artifacts: 'playwright/playwright-report/**'
        }

        failure {
            echo 'Pipeline Failed'
        }
    }
}
