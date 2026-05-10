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

        stage('Install Display Dependencies') {
            steps {
                sh '''
                    if command -v apt-get >/dev/null 2>&1; then
                        if command -v sudo >/dev/null 2>&1; then
                            sudo apt-get update
                            sudo apt-get install -y xdotool wmctrl libcanberra-gtk-module || true
                        else
                            apt-get update
                            apt-get install -y xdotool wmctrl libcanberra-gtk-module || true
                        fi
                    fi
                '''
            }
        }

        stage('Run Playwright Login Test') {
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

                              echo "=============================="
                              echo "INSIDE XVFB"
                              echo "=============================="

                              echo "DISPLAY=$DISPLAY"

                              echo "=============================="
                              echo "ENV DISPLAY VARIABLES"
                              echo "=============================="

                              env | grep DISPLAY || true

                              echo "=============================="
                              echo "JAVA VERSION"
                              echo "=============================="

                              java -version

                              echo "=============================="
                              echo "RUNNING PLAYWRIGHT LOGIN TEST ONLY"
                              echo "=============================="

                              CI=true npx playwright test tests/login.spec.js --project=chromium
                          '
                    '''
                }
            }
        }
    }

    post {

        always {

            archiveArtifacts artifacts: 'playwright/playwright-report/**',
                             allowEmptyArchive: true

            archiveArtifacts artifacts: 'playwright/test-results/**',
                             allowEmptyArchive: true
        }

        failure {
            echo 'Pipeline Failed'
        }

        success {
            echo 'Pipeline Passed'
        }
    }
}