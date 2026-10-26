pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'akhand012/dungeon-generator'
        DOCKER_CREDS = 'dockerhub-credentials'
        APP_NAME     = 'dungeon-generator'
        PORT         = '30007'
    }

    options {
        timeout(time: 15, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    stages {
        stage('1. Checkout SCM') {
            steps {
                echo "=========================================================="
                echo "📥 STAGE 1: CHECKING OUT REPOSITORY FROM GITHUB"
                echo "=========================================================="
                checkout scm
                sh '''
                    echo "Current Git Commit: $(git rev-parse --short HEAD)"
                    echo "Current Git Branch: $(git branch --show-current || echo 'main')"
                    cat version.json
                '''
            }
        }

        stage('2. Build and Test') {
            steps {
                echo "=========================================================="
                echo "🧪 STAGE 2: INSTALLING DEPENDENCIES & RUNNING UNIT TESTS"
                echo "=========================================================="
                sh '''
                    npm install --prefer-offline
                    npm test
                '''
            }
        }

        stage('3. Docker Image Build') {
            steps {
                echo "=========================================================="
                echo "🐳 STAGE 3: BUILDING MULTI-STAGE DOCKER IMAGE"
                echo "=========================================================="
                sh '''
                    echo "Building Docker Image tagged with Build #${BUILD_NUMBER} and latest..."
                    docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} -t ${DOCKER_IMAGE}:latest .
                    docker images | grep ${DOCKER_IMAGE} || true
                '''
            }
        }

        stage('4. Docker Hub Push') {
            steps {
                echo "=========================================================="
                echo "🚀 STAGE 4: PUBLISHING IMAGE TO DOCKER HUB REGISTRY"
                echo "=========================================================="
                sh '''
                    echo "Importing built image directly into k3s containerd runtime..."
                    docker save ${DOCKER_IMAGE}:${BUILD_NUMBER} | sudo k3s ctr images import - || true
                    sync
                    sleep 3
                '''
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        if [ -n "$DOCKER_PASS" ] && [ "$DOCKER_PASS" != "dummy" ]; then
                            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                            echo "Pushing image tags to Docker Hub repository ${DOCKER_IMAGE}..."
                            docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}
                            docker push ${DOCKER_IMAGE}:latest
                            echo "Docker Hub push complete!"
                        else
                            echo "Docker Hub credentials not configured; local containerd image deployed directly into k3s."
                        fi
                    '''
                }
            }
        }

        stage('5. Kubernetes Deployment & Rollout') {
            steps {
                echo "=========================================================="
                echo "☸️ STAGE 5: APPLYING KUBERNETES MANIFESTS & ROLLING UPDATE"
                echo "=========================================================="
                sh '''
                    echo "Verifying Kubernetes API server connectivity..."
                    kubectl version --request-timeout=30s
                    kubectl get nodes --request-timeout=30s

                    echo "Applying Service configuration..."
                    kubectl apply -f k8s/service.yaml --request-timeout=30s

                    echo "Updating deployment image to ${DOCKER_IMAGE}:${BUILD_NUMBER}..."
                    sed -i "s|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:${BUILD_NUMBER}|g" k8s/deployment.yaml
                    kubectl apply -f k8s/deployment.yaml --request-timeout=30s

                    echo "Awaiting rollout status confirmation..."
                    kubectl rollout status deployment/dungeon-generator-deployment --timeout=180s

                    echo "Current Kubernetes Cluster Resources:"
                    kubectl get pods -l app=dungeon-generator -o wide
                    kubectl get svc dungeon-generator-service
                '''
            }
        }

        stage('6. Application Health Verification') {
            steps {
                echo "=========================================================="
                echo "🔍 STAGE 6: VERIFYING ENDPOINT HEALTH & APPLICATION VERSION"
                echo "=========================================================="
                sh '''
                    echo "Querying HTTP health probe on NodePort ${PORT}..."
                    sleep 5
                    
                    HEALTH_RESPONSE=$(curl -s -f --max-time 10 http://localhost:${PORT}/health || curl -s -f --max-time 10 http://127.0.0.1:${PORT}/health)
                    echo "Health Response: ${HEALTH_RESPONSE}"

                    echo "${HEALTH_RESPONSE}" | grep -q '"status":"UP"' || {
                        echo "❌ Health check failed! Application did not report UP status."
                        exit 1
                    }

                    APP_VERSION=$(echo "${HEALTH_RESPONSE}" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
                    EXPECTED_VERSION=$(grep -o '"version": *"[^"]*"' version.json | cut -d'"' -f4)
                    echo "Reported Version: ${APP_VERSION} | Expected Version: ${EXPECTED_VERSION}"

                    if [ "${APP_VERSION}" != "${EXPECTED_VERSION}" ]; then
                        echo "❌ Version mismatch! Expected ${EXPECTED_VERSION} but live application reported ${APP_VERSION}."
                        exit 1
                    fi

                    echo "✅ APPLICATION HEALTH & VERSION CONFIRMED: Status UP | Version: ${APP_VERSION}"
                    echo "🌐 Live URL accessible at: http://3.108.51.253:${PORT}/"
                '''
            }
        }
    }

    post {
        always {
            deleteDir()
        }
        success {
            echo "🎉 PIPELINE EXECUTION SUCCESSFUL! Dungeon Generator is live and updated."
        }
        failure {
            echo "💥 PIPELINE EXECUTION FAILED! Review stage logs above for root cause."
        }
    }
}
