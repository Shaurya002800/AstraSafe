# AstraSafe Deployment Guide

This project is intentionally dependency-light. It runs on the built-in Node.js HTTP server and can be hosted as a simple web service.

## Local Run

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:4173
```

## Production Run

```bash
npm install
npm start
```

The server uses:

- `PORT` from the hosting platform.
- `HOST=0.0.0.0` automatically when `NODE_ENV=production`.

## Render Deployment

Production service:

```text
https://astrasafe-ai.onrender.com
```

The repository includes `render.yaml`, so Render can create the service from the repo.

Recommended Render settings:

- Service type: Web Service
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Environment variable: `NODE_ENV=production`

After deployment, verify:

```bash
curl https://astrasafe-ai.onrender.com/api/health
curl "https://astrasafe-ai.onrender.com/api/risk/current?step=6"
curl "https://astrasafe-ai.onrender.com/api/submission/readiness"
```

Expected proof points:

- Health endpoint returns `ok: true`.
- Risk endpoint shows `score: 86` and `leadTimeMinutes: 21`.
- Submission endpoint shows `submission_ready_mvp`.

## Final Smoke Test

Before submitting the deployed link:

1. Open the home page.
2. Click `Jump to Prevention`.
3. Confirm the risk score is `86`.
4. Confirm baseline status says `Silent`.
5. Confirm the recommended intervention is pause, evacuate and restore ventilation.
6. Confirm evidence bundle download works.
