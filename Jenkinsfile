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
                    docker save ${DOCKER_IMAGE}:latest | sudo k3s ctr images import - || true
                '''
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        if [ -n "$DOCKER_PASS" ] && [ "$DOCKER_PASS" != "dummy" ]; then
                            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                            echo "Pushing image tags to Docker Hub repository ${DOCKER_IMAGE}..."
                            docker push ${DOCKER_IMAGE}:${BUILD_NUMBER} || true
                            docker push ${DOCKER_IMAGE}:latest || true
                            echo "Docker Hub push complete!"
                        else
                            echo "Docker Hub credentials not provided; local k3s containerd image will be deployed."
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
                    echo "Applying Service configuration..."
                    kubectl apply -f k8s/service.yaml

                    echo "Updating deployment image to ${DOCKER_IMAGE}:${BUILD_NUMBER}..."
                    sed -i "s|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:${BUILD_NUMBER}|g" k8s/deployment.yaml
                    kubectl apply -f k8s/deployment.yaml

                    echo "Awaiting rollout status confirmation..."
                    kubectl rollout status deployment/dungeon-generator-deployment --timeout=120s

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
                    sleep 3
                    
                    HEALTH_RESPONSE=$(curl -s -f http://localhost:${PORT}/health || curl -s -f http://127.0.0.1:${PORT}/health)
                    echo "Health Response: ${HEALTH_RESPONSE}"

                    echo "${HEALTH_RESPONSE}" | grep -q '"status":"UP"' || {
                        echo "❌ Health check failed! Application did not report UP status."
                        exit 1
                    }

                    APP_VERSION=$(echo "${HEALTH_RESPONSE}" | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
                    echo "✅ APPLICATION HEALTH CONFIRMED: Status UP | Version: ${APP_VERSION}"
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
