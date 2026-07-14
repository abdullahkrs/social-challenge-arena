# Social Challenge Arena

A mobile-first multilingual social arcade platform with two complete original skill challenges.

## Playable catalog

- **Orbit Lock** — a 2D precision-timing challenge: lock a moving pulse inside twelve deterministic gates.
- **Echo Grid** — a 2D visual-memory challenge: watch a deterministic tile pattern and repeat it in order across eight rounds.

Both use the complete journey:

`discover → choose → play → result → localized share → direct friend attempt → head-to-head comparison → rematch share`

Valid invitation links open the selected challenge and target score directly, while normal catalog discovery remains available.

## Languages and access

- Arabic with full RTL, English, and Turkish
- Touch and pointer throughout; Space/Enter for Orbit Lock and native keyboard buttons for Echo Grid
- Reduced-effects mode, visible focus, non-color-only feedback, and live announcements
- No account, external analytics, third-party assets, or network API

## Run locally

```bash
npm ci
npm test
npm run build
python3 -m http.server 8000
```

Open `http://localhost:8000`. The deployable static output is generated in `dist/` and published from `main` through GitHub Pages.

## Delivery model

`one issue → one branch → one playable PR → one QA result → merge, reduce, or cancel`

See `PRODUCT_BRIEF.md`, `AGENT.md`, `SWARM.md`, `ISLAMIC_CONTENT_POLICY.md`, and `DELIVERY_EVIDENCE.md`.
