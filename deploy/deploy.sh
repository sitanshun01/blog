#!/usr/bin/env bash
# Run from the repo root on the server: bash deploy/deploy.sh
set -e
cd "$(dirname "$0")/.."

git pull
docker compose up -d

cd backend
npm install --omit=dev
pm2 describe blog-api > /dev/null 2>&1 && pm2 restart blog-api || pm2 start index.js --name blog-api
pm2 save

cd ../frontend
npm install
npm run build
sudo mkdir -p /var/www/blog
sudo rm -rf /var/www/blog/*
sudo cp -r dist/* /var/www/blog/

echo "Deployed."
