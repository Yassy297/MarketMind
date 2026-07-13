---
name: Local MongoDB for this project
description: This project's MONGO_URI secret is a localhost connection string, not Atlas/cloud — a local mongod process must be running.
---

The MONGO_URI secret for this project (MarketMind) is a plain `mongodb://localhost:27017/...` connection string, not a managed cloud cluster. There is no MongoDB Replit integration/connector available.

**Why:** the backend failed with `ECONNREFUSED 127.0.0.1:27017` on a fresh environment because nothing was listening on that port — the secret was valid, but no Mongo server existed yet.

**How to apply:** install the `mongodb` Nix system package (`installSystemDependencies({ packages: ["mongodb"] })`) and run `mongod --dbpath .data/mongo --bind_ip 127.0.0.1 --port 27017` as its own workflow (separate from the app workflow). Add `.data/` to `.gitignore`. Don't assume a missing/placeholder secret — check whether a local server process is actually running first.
