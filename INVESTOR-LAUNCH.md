# WAYPOINT — Friday Investor Readiness

Target demonstration: **Friday 16 October 2026**.  
Live app: https://waypoint-investor-demo-v1.vercel.app  
GitHub: https://github.com/darthhayda9/WAYPOINT

## What works right now

- Premium, minimal homepage and responsive five-tab app.
- Three self-created trips on Free (count remains spent even if a trip is deleted), Pro preview for unlimited trips; all locally saved.
- Trip details, checklists, notes, editing, removal and itinerary exports.
- Interactive **QF128 HKG→SYD flight map replay**: pan/zoom OSM map, route arc, scrubbable timeline, position, altitude/speed *model values*, play/pause/replay, fit route and follow aircraft. It is not actual ADS-B data, and QF128 on 9 Oct 2026 is past.
- Local booking confirmation parsing: paste email, import .eml/.txt/.ics, inspect route/flight/date, save to Trips. Emails stay in the browser.
- Manually maintained frequent-flyer wallet with balance, status, expiry and last-updated timestamp. Does not store airline credentials.
- Extra expense and refund watchlists, demo Qantas paid-seat refund, notifications.
- Destination pack, Saily handoff, live Hong Kong clock, reference HKD→AUD conversion when API is available and Open-Meteo current forecast in the demo. Both provide labelled fallback/attribution.
- Travel ID fake passport autofill and feature customization.
- AI text conversation with persisted history and a knowledge-driven demo fallback. A production model requires `OPENAI_API_KEY`.
- Three vector brand marks switchable in **More → Brand studio**.

All sample flight positions, associated flight status changes, sample travel charges, legacy bookings and demo subscription state are *simulated*. No real passenger data or card billing is connected.

## What the owner needs to do for live integrations

### 1. Real AI concierge (recommended first)

1. Create an OpenAI API account and turn on usage billing, with a small **monthly hard spend limit**.
2. In Vercel → `waypoint-investor-demo-v1` → **Settings → Environment Variables**, add `OPENAI_API_KEY` as an **encrypted** secret (Production only). Never paste the key into a public GitHub issue or chat.
3. Add `WAYPOINT_AI_DEMO_ENABLED=true`. Optionally `WAYPOINT_AI_MODEL=gpt-4o-mini`.
4. Redeploy and test `/api/chat` using the UI.
5. Keep the demo behind access protection before switching this on. The existing endpoint has only a light IP rate limit. **Before public consumer release**, add authentication, a database, per-user quotas, rate limits, provider error monitoring and safety/abuse controls.

**Status:** server endpoint exists; API key/activation not provided. The browser's local demo fallback still works.

### 2. Google / Gmail booking sync

For a real consumer Gmail connection:

1. Create **Google Cloud** project under the Waypoint organization.
2. Enable **Gmail API**.
3. Set up Google Auth Platform consent screen with public product domain, support email, privacy policy, terms, data deletion instructions and correct branding.
4. Configure an **External**, test-user OAuth application initially. Add intended restricted scope `https://www.googleapis.com/auth/gmail.readonly`, with a clear limited-use justification.
5. Create a **Web application OAuth client** with production redirect URI, e.g. `https://YOUR-DOMAIN/api/auth/google/callback`, once the matching backend exists.
6. Store `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` only in Vercel encrypted environment variables.
7. Build user authentication (a Waypoint account and per-user session), encrypted refresh-token storage in managed database, background sync, booking email parser, evidence references, disconnect/revoke, export and deletion. Do *not* put tokens in localStorage.
8. Submit Google verification. **Gmail readonly is restricted** and storing/transmitting restricted user data on a server may require a third-party security assessment. This can take weeks; do not promise unrestricted public sync by Friday.

**Friday workaround:** working local `.eml`/text/`.ics` importer under **More → Connections**. For demo, this is much safer and provides a real flow.

Google documentation:
- https://developers.google.com/workspace/gmail/api/auth/web-server
- https://developers.google.com/workspace/gmail/api/auth/scopes
- https://developers.google.com/identity/protocols/oauth2/production-readiness/restricted-scope-verification

### 3. Frequent-flyer automatic balances

- No universal consumer frequent-flyer API or OAuth endpoint reliably covers Qantas/Emirates/KrisFlyer/Velocity/Marriott and credit-card balances.
- Pursue **official partner agreements**, API access or integrations with verified third-party loyalty aggregators where contractually allowed.
- As an intermediate mode, parse customer-authorized points statements and award emails, clearly stating last-reported balances and avoiding a guarantee that the balance is current.
- Never ask users for airline site passwords or scrape private accounts.
- **Friday:** working manual points wallet in **More → Points**; add programme, points, status, optional expiry, remove.

### 4. Actual aircraft positions & historical QF128

1. Obtain **FlightAware AeroAPI**, a licensed alternative or an approved ADS-B source (coverage and terms differ).
2. Add **server-side API key** and back-end caching, per-user quotas and timestamps.
3. For actual **9 October 2026 QF128**, request the historical flight identifier / track on that date; positions and altitude must originate from the provider.
4. For a flight that is currently in the air, query real-time positions/status and update the map with API timestamps and provider confidence.
5. Handle not-yet-departed, on-ground, diversion and unavailable-coverage cases.

The built-in demonstration already has accurate HKG and SYD airport coordinates but the intermediate track is a great-circle *approximation*, not where the actual aircraft flew. Labelled accordingly.

FlightAware: https://www.flightaware.com/commercial/aeroapi/

### 5. Stripe subscriptions

- Create a Stripe account that can legally operate and collect payments.
- Create A$24.99 annual and A$4.99 monthly Prices (verify your final offer).
- Implement Stripe Checkout server endpoint, billing portal, verified webhooks and *server-side* entitlements in database.
- Give Free **three trips total** per authenticated user; protect the limit on the server and synchronize across devices.
- Existing Pro buttons intentionally activate local **demo state** only. No real money is charged.

### 6. Destination and eSIM services

- Replace `SAILY_REFERRAL_URL` in `index.html` with the owner's exact approved Saily referral link, and comply with affiliate disclosure requirements.
- Obtain commercial weather licence before selling a consumer service using Open-Meteo; current free evaluation calls are prototyping-only, with attribution shown.
- Use a production-compliant FX vendor for recurring high-volume conversion; current open reference rate is not a card-specific executable price.
- Choose a map-tile provider suitable for commercial traffic and respect OSM attribution/usage policy.

### 7. Launch infrastructure

- Use production user accounts and session auth, a hosted database with per-user access controls, encrypted provider tokens, export/delete workflows, monitoring/error tracking and backups.
- Register and validate product domain / brand trademarks before publicly marketing under WAYPOINT.
- A public privacy policy, terms, affiliate disclosure and support contact are required before collecting personal travel data.
- Keep sample/fictional claims clearly separated from verified travel information.

## Friday demo script (8–10 minutes)

1. Show the new premium homepage, free-to-Pro value proposition and brand.
2. Open the app → create a new trip and demonstrate persistence/notes/checklist/export.
3. Open Flight map → zoom route, scrub timeline, select Follow and play, clearly say the QF128 replay is modelled.
4. More → Connections → Try sample email → Review → Save imported trip.
5. More → Points → Add Qantas example points balance and status; explain manual now, permitted email/official integration later.
6. Money → add an expense and track a refund.
7. Concierge → ask about the sample paid-seat refund and airport preparation.
8. More → Brand studio → switch logo; show mobile-responsive navigation.
9. Explain 3 full trips free, A$24.99/year, and the post-booking/refund intelligence differentiation.

## Investor-safe claims

Say **“interactive working demo with real local workflows and simulated flight playback”**. Never say that the flight is live, Gmail/airlines are connected, users are charged, points are synced automatically or the vault stores actual passports unless the corresponding backend integration is demonstrably live.

## Known limitations

- User/trip/rewards/paywall state is browser-local, not per-user cloud data. Clearing browser storage resets it.
- Current assistant is local/rule-based unless Vercel AI environment variables are configured; the optional server endpoint is not production hardened.
- No commercial provider API key is configured in the Vercel project as of 12 October 2026.
- A completed page-load test does not establish readiness for unrestricted public launch. Browser QA and external integrations require continued checks.
