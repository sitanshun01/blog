#!/usr/bin/env bash
# One-time server setup (Ubuntu 24.04). Run: bash deploy/server-setup.sh
set -e
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx git ca-certificates curl

# Docker
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# Node 22 + pm2
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2

echo "Done. Log out and back in so the docker group applies."
