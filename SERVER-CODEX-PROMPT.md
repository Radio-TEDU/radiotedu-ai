# RadioTEDU web server — final Codex deployment prompt

You are Codex on the authorized RadioTEDU Windows/IIS web server. Deploy the
immutable RadioTEDU AI website release described below. Work autonomously,
back up every server configuration before changing it, preserve all unrelated
WordPress/IIS routes, and never print a credential or secret.

## Immutable source

- Repository: `https://github.com/Radio-TEDU/radiotedu-ai.git`
- Release tag: `v1.0.5`
- Release page: `https://github.com/Radio-TEDU/radiotedu-ai/releases/tag/v1.0.5`

Clone into a new versioned server directory, fetch tags, check out detached
`v1.0.5`, record the resolved commit, and verify every entry in
`MANIFEST.json`. Do not deploy a moving branch, the old `v1.0.4` release, or a
locally reconstructed copy.

## Required public result

- Listener page: `https://radiotedu.com/ai`
- Canonical API origin: `https://radiotedu.com`
- EN public audio: `https://stream.radiotedu.com/ai`
- FR public audio: `https://stream.radiotedu.com/event`
- EN station ID: `radiotedu-en`
- FR station ID: `radiotedu-fr`
- Protocol: `radiotedu-platform/v1`
- Broadcast identity: `school-radio-pc`
- Scope: `agent:playout`

`/ai` is one bilingual page with an in-page EN/FR selector. Do not create
`/ai/en`, `/ai/fr`, `/Radio`, `/radio`, or another application route. Do not
redirect `/ai` to `/ai-music/`. The browser plays the two stream URLs directly;
the web server must not proxy, ingest, administer, or re-encode audio.

## Product contract

Deploy the supplied website without redesigning it. It is an original
RadioTEDU editorial radio page informed by the broad information hierarchy of
Andon FM, not a copy. Preserve the RadioTEDU and RTAI marks and all six supplied
program covers. Keep the `RadioTEDU AI` masthead, but ensure the first viewport
also shows the live panel, now-playing title/artist, programme identity and
play/pause control at 1440×900 and 390×844.

The page must contain:

- EN/FR station selection without changing the `/ai` pathname;
- direct browser-local play/pause for `/ai` and `/event`;
- current and next programme, RTAI speech state and honest live/stale/unknown
  states;
- current programme cover and the six-program Europe/Istanbul schedule;
- music/talking airtime for the last 14 days;
- the latest 10 completed music plays;
- the five most-played songs over the last 14 days;
- up to six genres ranked by classified music airtime over the last 14 days.

There must be no listener count and no listener tracking. Do not create or
retain browser session start/heartbeat/end calls, session endpoints, a session
table, `active_website_listeners`, Icecast listener analytics, a hidden count or
a placeholder. There is also no commerce, buying, donation, request, message,
phone, voting, social, sharing, admin or remote playout surface.

Never fabricate history. Now Playing comes only from an accepted signed
snapshot. History comes only from accepted signed `play.completed` events.
Talking, silence and unknown airtime never appear as songs. Missing genre is
excluded from genre aggregation and produces an honest unavailable state.
Never expose event IDs, internal track IDs, local paths, queue state or private
metadata to the browser.

## Corrected broadcast contract

Release `v1.0.5` fixes the `v1.0.4` validator mismatch. The signed snapshot
contract is now the same as the real public audio:

- EN: URL `https://stream.radiotedu.com/ai`, mount `/ai`, codec `MP3`,
  bitrate `192`;
- FR: URL `https://stream.radiotedu.com/event`, mount `/event`, codec `MP3`,
  bitrate `192`.

Do not reintroduce the obsolete `/en`, `/fr` or `AAC-LC` snapshot literals.
The actual audio has been independently decoded as MP3, 48 kHz stereo,
192 kbps. Stream health remains `unknown` unless authoritatively known; a
snapshot must not claim `live` merely because playout is running.

Run only `backend.public_app`. Never run `backend.app`. The website machine
must not receive the music library, Qwen/TTS, Liquidsoap, source credentials,
playlists, schedules, operator logs, playout code or voting-system data.

The API accepts only:

- `POST /v1/radio/stations/{station_id}/handshake`
- `POST /v1/radio/stations/{station_id}/snapshot`
- `POST /v1/radio/stations/{station_id}/plays`
- `PUT /v1/radio/stations/{station_id}/covers/{cover_id}`
- `GET /v1/radio/stations/{station_id}/covers/{cover_id}`
- `GET /v1/radio/stations/{station_id}/status`

Keep the existing station-specific HMAC protocol exactly. Maximum clock skew
is 60 seconds. Snapshot/play bodies are capped at 256 KiB and covers at 5 MiB.
Nonce replay, path/station/agent binding, sequence monotonicity, idempotency and
constant-time proof comparison are mandatory.

Provision distinct matching values named
`RADIOTEDU_EN_SNAPSHOT_SECRET` and
`RADIOTEDU_FR_SNAPSHOT_SECRET` only from the server's ACL-protected secret
store or approved secret manager. Do not ask for or display them in chat. Do
not use an Icecast source password. If the server values are absent, finish
safe staging and report `awaiting_secret_provisioning`.

The broadcast PC uses the same safe direction as the voting integration: the
PC initiates outbound HTTPS; the website never opens a connection to the PC.
Unlike voting's WSS channel, this metadata channel uses independently signed
HTTPS operations plus a mutual server proof. The already-running broadcast
agent watches `openapi.json`; after this corrected contract is deployed it
will perform fresh EN and FR handshakes, verify both server proofs, and then
send only real snapshots and completed plays.

## Deployment

1. Record hostname, Windows/IIS version, current time source, current bindings,
   service identities, existing `/ai` behavior and the exact files/configuration
   that will change.
2. Back up IIS applicationHost configuration, current `/ai` mapping/content,
   current RadioTEDU web service configuration and public database. Record
   exact rollback commands.
3. Verify `MANIFEST.json`, the release commit and the presence of
   `backend/public_app.py`, `backend/platform_api.py`,
   `frontend/src/components/PublicDashboard.tsx`, both brand assets, all six
   program covers, the smoke test and the locked dependency files.
4. Create a version-specific Python virtual environment. Install only
   `packaging/web/requirements-web.lock.txt`. Run `npm ci` and `npm run build`.
5. Configure an ACL-protected durable SQLite database and backup path for
   snapshots, play events, covers, nonce records and idempotency records. The
   startup migration must remove the obsolete listener-session table. Back up
   the prior database before migration.
6. Run `python -m backend.public_app` as an automatically restarting,
   least-privileged Windows service bound only to loopback. Keep secrets out of
   process arguments and redacted logs.
7. Route only `/ai`, `/assets/*`, `/brand/*`, `/programs/*`,
   `/v1/radio/*`, and intentionally public `/openapi.json` through IIS to the
   loopback service. Keep TLS validation and normal security headers. Preserve
   unrelated WordPress/IIS applications.
8. Do not add an IIS/ARR route for `stream.radiotedu.com`; audio remains direct
   from the listener browser to the existing stream host.
9. Stage first, run every test below, then atomically switch only the approved
   application routes. Roll back those routes if a production gate fails.

## Verification gates

Run and retain redacted results:

```powershell
python -m pytest -q
npm test
npm run build
python scripts/smoke_public_server.py --base-url http://127.0.0.1:<staging-port> --strict --json
```

Require:

- all backend and frontend tests pass;
- `/ai` returns HTML while `/ai/en` and `/ai/fr` return 404;
- brand assets and all six covers return 200 with correct MIME types;
- EN/FR switching stays on `/ai`;
- built browser sources are exactly `/ai` and `/event`;
- no listener text, session call, session endpoint, session table or
  `active_website_listeners` field remains;
- OpenAPI exposes no admin, voting, control, request or playout endpoint;
- invalid/private/oversized payloads, stale timestamps, wrong station/secret,
  nonce replay, sequence rollback and conflicting idempotency are rejected;
- optional `genre` is normalized, bounded to 64 characters and rejects control
  characters or private Windows/UNC paths;
- recent plays are music-only, station-scoped, newest-first and capped at 10;
- top songs are completed music-only, station-scoped, 14-day bounded, stable
  and capped at five;
- top genres use only classified music duration, are station-scoped,
  14-day bounded and capped at six;
- direct public EN and FR audio each decode for at least 30 seconds without the
  web server acting as a proxy.

After production cutover, wait up to two minutes for the broadcast PC's
outbound agent. Confirm both station status endpoints receive fresh, real
schema-version-2 snapshots with `/ai` and `/event`, MP3/192, without private
fields. Confirm real completed plays begin populating history. A 200 handshake
alone is not enough; production completion requires accepted snapshots for
both stations. Do not create synthetic production tracks or play events.

## Report and final response

Write a redacted machine-readable report to:

`C:\ProgramData\RadioTEDU\reports\web-deployment.json`

Include revision/tag/commit, backups, rollback commands, files changed, service
identity/state, ACL checks, test/build/smoke results, IIS route matrix,
database migration, listener-removal proof, public asset/audio checks, EN/FR
handshake observation, accepted snapshot sequences, history state and
unresolved dependencies. Never include secrets, secret fingerprints,
credentials, listener identifiers, private payloads or local music paths.

Return exactly one line:

`RADIO TEDU WEB COMPLETE — report: C:\ProgramData\RadioTEDU\reports\web-deployment.json`

or:

`RADIO TEDU WEB SAFE STOP — report: C:\ProgramData\RadioTEDU\reports\web-deployment.json`
