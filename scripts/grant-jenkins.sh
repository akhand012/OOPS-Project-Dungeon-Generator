#!/usr/bin/env bash
set -e
echo "jenkins ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/jenkins
chmod 440 /etc/sudoers.d/jenkins
sudo -u jenkins sudo k3s ctr version
