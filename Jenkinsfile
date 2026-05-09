pipeline {

    agent any

    environment {
        DISPLAY = ':0'
        SIKULI_DIR = "${WORKSPACE}/JNLP.sikuli"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                url: 'https://github.com/SinghAbhinavA/FinanceERP.git'
            }
        }

        stage('Verify Sikuli Folder') {
            steps {
                sh '''
                    echo "Workspace: $WORKSPACE"
                    ls -la $WORKSPACE
                    ls -la $WORKSPACE/JNLP.sikuli || echo "JNLP.sikuli NOT FOUND"
                '''
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
                    sh 'npx playwright install --with-deps'
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
                    sh '''
                        echo "SIKULI_DIR = $SIKULI_DIR"
                        npx playwright test --headed
                    '''
                }
            }
        }
    }

    post {

        always {
            archiveArtifacts artifacts: 'playwright/playwright-report/**', allowEmptyArchive: true
        }

        failure {
            echo 'Pipeline Failed'
        }
    }
}