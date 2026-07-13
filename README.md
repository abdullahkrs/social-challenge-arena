# Social Challenge Arena

A mobile-first multilingual social arcade platform.

## First playable experience

**Orbit Lock** is an original 2D timing challenge: tap when the moving pulse enters each gate, build a precision score, and share a strict same-route link so a friend can compete and compare results.

The complete journey is available from the real entry point:

`discover → understand → play → result → replay → share → friend attempt → compare → share again`

## Languages and access

- Arabic with full RTL
- English
- Turkish
- Touch, pointer, Space, and Enter controls
- Reduced-effects mode and live accessibility announcements
- No account, external analytics, third-party assets, or network API

## Run locally

```bash
npm ci
npm test
npm run build
python3 -m http.server 8000
```

Open `http://localhost:8000`. The deployable static output is generated in `dist/` and is published from `main` through GitHub Pages.

## Delivery model

Each visible delivery uses:

`one issue → one branch → one playable PR → one QA result → merge, reduce, or cancel`

See `PRODUCT_BRIEF.md`, `AGENT.md`, `SWARM.md`, `ISLAMIC_CONTENT_POLICY.md`, and `DELIVERY_EVIDENCE.md`.
