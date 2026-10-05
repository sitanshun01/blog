# Blog (Express + Postgres/Docker + React)

## Run locally
1. cp .env.example .env   (edit the values)
2. docker compose up -d
3. cd backend && npm install && node index.js
4. cd frontend && npm install && npm run dev
Open the Vite URL, click Admin, enter ADMIN_TOKEN, publish.

## Deploy
See deploy/ (server-setup.sh, nginx.conf, deploy.sh).
