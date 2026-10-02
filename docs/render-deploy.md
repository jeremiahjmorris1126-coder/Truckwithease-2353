# Render deploy — the public API origin

## Why this exists

Cloudflare Pages serves truckwithease.com and morrishive.com. It is **static**. There is no
`/api/*` on it.

That is fine for the A2P reviewer, who only needs to read `/terms` and `/privacy`. It is not
fine for the Sealed Line feature, which needs Twilio to be able to `POST` an inbound SMS to a
public HTTPS URL:

```
POST https://<render-host>/api/comms/inbound
```

That webhook is what resolves the driver, recomputes their duty clock as of the second the
message existed, writes the sealed row, and fires the auto-reply back over the fleet number.
Without a persistent server it cannot fire at all.

So: **Pages stays as the marketing/legal site, Render becomes the API origin.** Two hosts, one
repo, on purpose.

## What is in the repo

| file | role |
|---|---|
| `Dockerfile` | multi-stage `oven/bun:1.3.14` build → slim runtime, runs `bun packages/web/src/server.ts` |
| `.dockerignore` | keeps `node_modules`, `dist`, `.env`, `.git` out of the build context |
| `render.yaml` | Render Blueprint: one Docker web service, health check `/api/health`, every secret marked `sync: false` |

No secret is committed. `.env` is gitignored and stays that way — Render prompts for each value.

## Steps

1. Go to <https://dashboard.render.com> → **New** → **Blueprint**.
2. Connect the GitHub account and pick `truckwithease`. Render reads `render.yaml` from the
   repo root.
3. Render lists every `sync: false` variable and asks for a value. Paste them from the local
   `.env`. The ones that actually matter for the webhook path:
   - `DATABASE_URL`, `DATABASE_AUTH_TOKEN` — without these the API returns errors on every route
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_MESSAGING_SERVICE_SID`, `TWILIO_PHONE_NUMBER`
   - `BETTER_AUTH_SECRET`
   - `VITE_APPLICATION_ID`, `VITE_GOOGLE_MAPS_KEY`, `VITE_RUNABLE_AUTH_ISSUER` — these are
     inlined by `vite build`, so they must be set **before the first build**, not after
4. Click **Apply**. First build pulls the Bun image and runs `bun install` for the whole
   workspace — expect 5–10 minutes. Later deploys reuse the dependency layer.
5. Render assigns `https://truckwithease.onrender.com` (or similar). Copy it.

## Verify before pointing Twilio at it

```bash
HOST=https://truckwithease.onrender.com
curl -s -o /dev/null -w 'health   %{http_code}\n' $HOST/api/health
curl -s $HOST/api/comms/auto-reply | head -c 300; echo
curl -s $HOST/api/sealed-line/chain | head -c 300; echo
```

`/api/health` must be `200 {"status":"ok"}` or Render will keep restarting the container.
`/api/comms/auto-reply` should report `twilioConfigured: true` and `problems: []` — if it does
not, a Twilio env var did not get set.

## Then wire the webhook

Twilio Console → Phone Numbers → `+16363175798` → Messaging → "A message comes in":

```
Webhook   POST   https://<render-host>/api/comms/inbound
```

Send a real text to that number and confirm a sealed row appears:

```bash
curl -s $HOST/api/sealed-line/chain | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['verified'], len(d['rows']))"
```

## The plan tier is deliberate

`render.yaml` sets `plan: starter` (~$7/mo), not `free`. Render's free tier spins the container
down after 15 minutes of inactivity and takes ~50s to cold start. A sleeping container drops or
badly delays inbound Twilio webhooks, which is the one thing this service exists to catch. If
you want to trial it on free first, change `plan: starter` to `plan: free` in `render.yaml` —
just know inbound texts will be unreliable.

## Still blocked on Twilio, separately

Even with the webhook live, **outbound replies will keep coming back `undelivered` with error
`30034`** until the A2P campaign is approved. 30034 means the sending number is not attached to
an approved 10DLC campaign — a carrier-side block, nothing to do with this server. See
`docs/twilio-support-ticket.md`.

So the order is: Render live → webhook wired → inbound sealing proven end to end → campaign
approved → outbound flips from `undelivered` to `delivered`.
