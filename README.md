# WAYPOINT — V2 Investor App

**Live Vercel project:** https://waypoint-investor-demo-v1.vercel.app  
**Source:** https://github.com/darthhayda9/WAYPOINT  
**Current stage:** interactive browser demo, not a production booking/payment system.

## Run locally

No install required for the static site. Serve this directory with a local web server so /api paths and assets resolve from the root:

```sh
npx http-server . -p 3000
```

Then open http://localhost:3000/ . The server-side AI route runs on Vercel, not under http-server; local chat automatically uses its clearly labelled demo fallback.

## Functioning V2 flows

- New responsive dashboard with **Home, Trips, Map, AI, More**.
- 3 **user-created** trips on Free. Sample trips don't count; removing a created trip does not restore a free credit.
- Trip creation, editing, deletion, detail view, personal notes, checklists and TXT export, persisted in localStorage.
- Sample QF128 flight itinerary; downloadable sample calendar event.
- Animated **simulated** flight map and fictional status changes, explicitly labelled.
- Expenses, sample seat-refund tracking and additional user-created refund watchlist.
- Destination pack, demo FX converter, transport tips, eSIM example cards and Saily external link.
- Open-ended AI-style chat input, history persistence and local travel-answer fallback.
- Travel ID **fake data** autofill demo (not a real secure identity vault).
- Show/hide feature presets, saved preferences, notifications and JSON data export.
- Annual A$24.99 or monthly A$4.99 Pro preview. **No real subscription is charged or verified**.

## Optional AI backend

`api/chat.js` is a Vercel Node Function and remains disabled until these server-side environment variables are configured:

```
OPENAI_API_KEY=...                       # secret — Vercel environment variable only
WAYPOINT_AI_DEMO_ENABLED=true           # enable only for supervised demos
WAYPOINT_AI_MODEL=gpt-4o-mini           # optional
```

Never commit a secret or include it in client-side HTML/JS. The browser sends only limited itinerary examples and text conversation — **not passport details**.

**Important:** This endpoint is for controlled demonstrations; it does not have production accounts or durable abuse protection. Do not publicly enable it without authentication, per-user rate limits, spend caps and monitoring.

## Real services still required before launch

- Proper authentication, database and per-user isolation.
- Stripe Checkout + Stripe webhook verification + server-enforced subscription entitlements.
- Gmail OAuth with secure refresh-token storage, narrow scopes and deletion/export.
- Licensed live aviation data provider, source timestamps and accuracy handling.
- Live FX feed and proper data provenance.
- Airline integrations, loyalty balances and refund reconciliation.
- Saily affiliate **exact referral URL** (currently links to saily.com without the user's referral).
- Real travel identity vault, biometric/device approval and full security review.

Do not present browser-local settings, simulated paid plans or fake passport data as secure production systems.

## Basic smoke checklist

1. From the landing page choose **View demo**, then navigate Home → Trips → Map → AI → More.
2. Create three user trips. The fourth should show a Pro paywall; deleting a trip should not give a free credit back.
3. Open and edit a user trip, tick a checklist item, save notes, export itinerary and reload to verify persistence.
4. Add a refund in Money, mark received and reload.
5. Ask the assistant several different questions and follow-ups; verify Demo Mode is labelled until live AI is configured.
6. Preview Pro Annual — confirm no card is charged; new trip creation should then be allowed.
7. Use mobile viewport to confirm five-item bottom navigation and usable forms.
8. Reset demo data; the three free credits should return.

## Deployment

The GitHub repository's `main` branch is connected to the existing Vercel project `waypoint-investor-demo-v1`. Each commit triggers a new deployment automatically.
