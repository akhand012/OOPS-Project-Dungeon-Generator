#!/usr/bin/env bash
# ==============================================================================
# AWS EC2 PROVISIONING SCRIPT — DUNGEON GENERATOR CI/CD PIPELINE
# Student: Akhand Pratap Singh | Course: TYCSE Cloud Computing & DevOps (CCA 2)
# Supported OS: Ubuntu 22.04 / 24.04 LTS or Amazon Linux 2023 (t3.large/c7i-flex.large)
# ==============================================================================

set -euo pipefail

echo "=================================================================="
echo "🚀 STARTING AWS EC2 CI/CD INFRASTRUCTURE SETUP"
echo "=================================================================="

# 1. Update OS Packages
echo "--> Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release git jq openjdk-17-jdk

# 2. Install Docker Engine
echo "--> Installing Docker Engine..."
if ! command -v docker &> /dev/null; then
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

sudo systemctl enable --now docker
sudo usermod -aG docker "$USER" || true

# 3. Install Lightweight Kubernetes (k3s)
echo "--> Installing Lightweight Kubernetes (k3s)..."
if ! command -v k3s &> /dev/null; then
    curl -sfL https://get.k3s.io | sh -s - --write-kubeconfig-mode 644
fi

# Ensure kubectl points to k3s
mkdir -p "$HOME/.kube"
sudo cp /etc/rancher/k3s/k3s.yaml "$HOME/.kube/config"
sudo chown -R "$USER:$USER" "$HOME/.kube"
export KUBECONFIG="$HOME/.kube/config"

# Verify Cluster Status
echo "--> Verifying Kubernetes Nodes..."
kubectl get nodes

# 4. Install Jenkins LTS
echo "--> Installing Jenkins LTS..."
if ! command -v jenkins &> /dev/null; then
    sudo wget -O /usr/share/keyrings/jenkins-keyring.asc https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key
    echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee /etc/apt/sources.list.d/jenkins.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y jenkins
fi

# Grant Jenkins permissions to Docker and Kubernetes
sudo usermod -aG docker jenkins || true
sudo mkdir -p /var/lib/jenkins/.kube
sudo cp /etc/rancher/k3s/k3s.yaml /var/lib/jenkins/.kube/config
sudo chown -R jenkins:jenkins /var/lib/jenkins/.kube
sudo chmod 600 /var/lib/jenkins/.kube/config

sudo systemctl enable --now jenkins

# 5. Output Summary and Credentials
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || curl -s ifconfig.me || echo "localhost")
INITIAL_ADMIN_PASSWORD=$(sudo cat /var/lib/jenkins/secrets/initialAdminPassword 2>/dev/null || echo "Check /var/lib/jenkins/secrets/initialAdminPassword")

echo "=================================================================="
echo "✅ EC2 CI/CD ENVIRONMENT SETUP COMPLETE"
echo "=================================================================="
echo "📍 Server Public IP: ${PUBLIC_IP}"
echo "🌐 Jenkins Dashboard: http://${PUBLIC_IP}:8080"
echo "🔑 Initial Admin Password: ${INITIAL_ADMIN_PASSWORD}"
echo "🎮 Live Dungeon Generator App (NodePort): http://${PUBLIC_IP}:30007"
echo "=================================================================="
