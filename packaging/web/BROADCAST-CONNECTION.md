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

## 2. Browser → existing public streams

The listener browser plays the two existing public stream services directly:

- English: `https://stream.radiotedu.com/en`
- French: `https://stream.radiotedu.com/fr`

The website server does not host, proxy, configure or administer these streams. Do not add an IIS binding, ARR rule or private Icecast upstream on the website server. Stream availability is owned by the existing stream service and does not block deployment of an otherwise healthy `/ai` website.

No private Icecast host, port or source credential may appear in browser HTML, the public API, website configuration or deployment reports.

## 3. Browser → public website

The browser loads one listener page at `https://radiotedu.com/ai`. Its in-page selector chooses between the exact public stream URLs `https://stream.radiotedu.com/en` and `https://stream.radiotedu.com/fr`. It polls only sanitized status endpoints on the website origin/API. `/ai/en` and `/ai/fr` do not exist.

Run `packaging/web/verify-website-runtime.ps1` on the website server after configuring the loopback public app. It verifies `/ai`, both public status endpoints, the two exact browser stream URLs, and the absence of private Icecast or operator-control references.
