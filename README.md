# RadioTEDU AI web

Website-only RadioTEDU AI listener and public status service.

Public contract:

- Listener page: `https://radiotedu.com/ai`
- English Icecast audio: `https://stream.radiotedu.com/en`
- French Icecast audio: `https://stream.radiotedu.com/fr`
- Versioned status/write API: `https://api.radiotedu.com/v1/radio/...`

There is one listener page. EN/FR selection happens inside `/ai`; `/ai/en` and `/ai/fr` do not exist. The application has no commerce, social or playout-control surface.

The broadcast connection is documented in [`packaging/web/BROADCAST-CONNECTION.md`](packaging/web/BROADCAST-CONNECTION.md). The website accepts signed, sanitized state from the broadcast computer. Listener browsers play the existing public `/en` and `/fr` stream URLs directly; this web server never proxies or administers Icecast and never remotely controls playout.

For authorized Windows/IIS deployment, use [`SERVER-CODEX-PROMPT.md`](SERVER-CODEX-PROMPT.md) as a one-way execution prompt on the website server.

## Local verification

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r packaging\web\requirements-web.lock.txt
npm.cmd ci
npm.cmd test
npm.cmd run build
$env:PUBLIC_COMPATIBILITY_ENABLED = "false"
.\.venv\Scripts\python.exe -m backend.public_app
```

Then open `http://127.0.0.1:8000/ai` and run:

```powershell
.\.venv\Scripts\python.exe scripts\smoke_public_server.py --base-url http://127.0.0.1:8000 --strict --json
```

Never commit `.env`, HMAC secrets, Icecast source credentials, databases or listener state.
