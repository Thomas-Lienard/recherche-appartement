---
name: run-app
description: Use when the user asks to run, start, or launch the application, or when you need to verify the app runs after changes
---

# Run App

Run the app locally using Docker Compose.

## Commands

**Start:**
```bash
docker compose up --build -d
```

**View logs:**
```bash
docker compose logs -f app
```

**Stop:**
```bash
docker compose down
```

**Rebuild from scratch:**
```bash
docker compose down && docker compose up --build -d
```

## Prerequisites

- Docker Desktop running
- `.env` file at project root (copy from `.env.example`)

## Access

App runs at http://localhost:3000

## Troubleshooting

- **Container won't start:** Check `docker compose logs app` for errors
- **DB issues:** Volume `app-data` persists data. Reset with `docker compose down -v`
- **Build cache stale:** Use `docker compose build --no-cache`
