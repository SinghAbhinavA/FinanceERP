pipeline {

    agent any

    environment {
        SIKULI_DIR = "${WORKSPACE}/JNLP.sikuli"

        // Java 17
        JAVA_HOME = "/opt/java/jdk-17.0.18+8"

        PATH = "${JAVA_HOME}/bin:${env.PATH}"
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
                    echo "=============================="
                    echo "JAVA_HOME=$JAVA_HOME"
                    echo "PATH=$PATH"
                    echo "=============================="

                    java -version
                    mvn -v
                '''
            }
        }

        stage('Verify Sikuli Folder') {
            steps {
                sh '''
                    echo "=============================="
                    echo "Workspace: $WORKSPACE"
                    echo "SIKULI_DIR: $SIKULI_DIR"
                    echo "=============================="

                    ls -la $WORKSPACE

                    echo "=============================="
                    echo "Checking Sikuli Folder"
                    echo "=============================="

                    ls -la $WORKSPACE/JNLP.sikuli || echo "JNLP.sikuli NOT FOUND"
                '''
            }
        }

        stage('Install Playwright Dependencies') {
            steps {
                dir('playwright') {
                    sh '''
                        npm install
                    '''
                }
            }
        }

        stage('Install Browsers') {
            steps {
                dir('playwright') {
                    sh '''
                        npx playwright install --with-deps
                    '''
                }
            }
        }

        stage('Build Java JNLP Launcher') {
            steps {
                dir('java-jnlp') {
                    sh '''
                        mvn clean package
                    '''
                }
            }
        }

        stage('Run Playwright Tests') {
            steps {
                dir('playwright') {
                    sh '''
                        echo "=============================="
                        echo "JAVA_HOME=$JAVA_HOME"
                        echo "DISPLAY BEFORE XVFB=$DISPLAY"
                        echo "SIKULI_DIR=$SIKULI_DIR"
                        echo "=============================="

                        xvfb-run \
                          --auto-servernum \
                          --server-args="-screen 0 1920x1080x24" \
                          bash -c '
                              echo "DISPLAY INSIDE XVFB=$DISPLAY"
                              java -version
                              npx playwright test --headed
                          '
                    '''
                }
            }
        }
    }

    post {

        always {
            archiveArtifacts artifacts: 'playwright/playwright-report/**', allowEmptyArchive: true

            archiveArtifacts artifacts: 'playwright/test-results/**', allowEmptyArchive: true
        }

        failure {
            echo 'Pipeline Failed'
        }

        success {
            echo 'Pipeline Passed'
        }
    }
}