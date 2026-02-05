# Kit Sync Engine (Mock Adapter)

This is a ready-to-run Docker Compose service that:
- Reads kit specs from `/data/kits.json`
- Creates/updates assemblies in `/data/assemblies.json`
- Tracks spec hashes and sync state in `/data/state.sqlite`
- Exposes:
  - GET  /health
  - POST /sync/run
  - POST /sync/kits/:kitId

## Prereqs
- Docker Desktop (Windows/Mac) or Docker Engine + Docker Compose (Linux)

## Run
From this folder:

```bash
docker compose up -d
```

## Test
Health:
```bash
curl http://localhost:8080/health
```

Run sync:
```bash
curl -X POST http://localhost:8080/sync/run
```

## Try a change
Edit `data/kits.json` (add/remove/change component qty), then run sync again.
Assemblies will be updated in `data/assemblies.json`.
