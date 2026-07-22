# RadioTEDU web ↔ broadcast connection contract

The public website and the broadcast computer exchange status and audio through two deliberately separate paths. There is no remote playout-control path.

## 1. Broadcast computer → website status API

The broadcast supervisor pushes sanitized, station-scoped snapshots, play events and cover images to:

- `https://api.radiotedu.com/v1/radio/stations/radiotedu-en/...`
- `https://api.radiotedu.com/v1/radio/stations/radiotedu-fr/...`

Each request uses the `radiotedu-platform/v1` HMAC protocol implemented by `backend/public_sync.py` and verified by `backend/platform_api.py`. The website service must have distinct protected values for:

- `RADIOTEDU_EN_SNAPSHOT_SECRET`
- `RADIOTEDU_FR_SNAPSHOT_SECRET`

The broadcast computer must use matching station-specific values. Obtain them from the approved secret manager or ACL-protected configuration; never put them in Git, IIS rewrite rules, logs or chat. Required identity is `school-radio-pc`, required scope is `agent:playout`, maximum timestamp skew is 60 seconds, and request bodies are bounded to 256 KiB except covers, which are bounded to 5 MiB.

The website accepts public state only. It exposes no broadcast start/stop, playlist, Liquidsoap, TTS, request or admin command endpoint.

## 2. Website stream proxy → private Icecast

IIS/ARR for `stream.radiotedu.com` proxies only:

- `/en` → `http://10.98.98.75:11154/en`
- `/fr` → `http://10.98.98.75:11154/fr`

Preserve streaming bodies, `Content-Type`, ICY metadata headers, cache prevention and long-lived connections. Disable proxy response buffering for these routes. Do not proxy `/admin`, `/status-json.xsl`, `/server_version.xsl`, source endpoints, directory listings or any other upstream path. The private host and port must never appear in browser HTML or public API payloads.

The reverse proxy does not need and must not store an Icecast source password. The source credentials exist only on the broadcast computer.

## 3. Browser → public website

The browser loads one listener page at `https://radiotedu.com/ai`. Its in-page selector chooses between the exact public stream URLs `https://stream.radiotedu.com/en` and `https://stream.radiotedu.com/fr`. It polls only sanitized status endpoints on the website origin/API. `/ai/en` and `/ai/fr` do not exist.

Run `packaging/web/verify-broadcast-connection.ps1` on the website server after configuring the loopback public app and private Icecast route. A private mount HTTP 404 is acceptable before a source connects, but private TCP failure or an unhealthy loopback API is not.
