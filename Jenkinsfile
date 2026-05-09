pipeline {

    agent any

    environment {
        DISPLAY = ':0'
        SIKULI_DIR = "${WORKSPACE}/JNLP.sikuli"
        JAVA_HOME = '/usr/lib/jvm/java-21-openjdk-amd64'
        PATH = "${JAVA_HOME}/bin:${PATH}"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                url: 'https://github.com/SinghAbhinavA/FinanceERP.git'
            }
        }

        stage('Verify Java & Maven') {
            steps {
                sh '''
                    echo "JAVA_HOME=$JAVA_HOME"
                    java -version
                    mvn -v
                '''
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

        stage('Install Java Web Start') {
            steps {
                sh '''
                    apt-get update && apt-get install -y icedtea-netx
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
                xvfb-run --auto-servernum npx playwright test --headed
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