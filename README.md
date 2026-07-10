# Social Challenge Arena

Mobile-first social challenge product for fast friend-to-friend competition.

## Product Direction

Social Challenge Arena is a lightweight web product where a user can open a challenge on mobile, understand it in seconds, play or create it with minimal steps, receive a result, share a link or score card, and invite a friend to beat them.

The product is intentionally not a large gaming platform at this stage. The first MVP focuses on proving one repeatable viral loop:

Discover → Play/Create Challenge → Get Score/Result → Share → Friend Competes → Compare → Share Again

## Problem

Most social games require too much setup, login, app installation, or explanation before a friend can participate. Social media users are willing to share quick, funny, competitive, identity-based, or creator-led prompts, but the action after clicking must be immediate.

## First Target User

The first target user is a casual mobile social user who wants to send a quick challenge to friends on WhatsApp, Instagram Stories, TikTok bio/link, or X without asking them to register.

Secondary future users include creators, teachers, families, and small communities.

## Chosen MVP Direction

The first direction is: one-link friend challenge templates.

A user can choose or create a simple challenge from a template, share one link, and friends can compete on the same page. The initial challenge type should be simple enough to explain in 5–10 seconds and flexible enough to support future templates.

## Product Hypothesis

If users can create or play a lightweight challenge without login, get a clear score/result, and share a one-link invitation that makes a friend feel personally challenged, then a meaningful percentage of recipients will click, play, compare, and share again.

## MVP Scope

The MVP must include:

- Mobile-first landing page.
- One simple challenge template.
- No-login play flow.
- Result/score screen.
- Shareable challenge link.
- Friend attempt flow from the shared link.
- Basic comparison between creator score and friend score.
- Copy/share prompt that works across WhatsApp, Instagram, TikTok bio/link, and X.

## Current Implementation

The repository now includes a static mobile-first landing page and the first playable challenge.

The CTA opens a no-login 10-second tap challenge. The browser counts valid taps locally, stops scoring at the deadline, shows the final score, and lets the player try again. Sharing and friend comparison are not implemented yet.

## Out of Scope for MVP

- User accounts.
- Payments or subscriptions.
- Native mobile apps.
- Many challenge types.
- Creator analytics dashboards.
- Advanced moderation.
- Social feed.
- Complex real-time multiplayer.
- AI challenge generation.

## Running Locally

Open `index.html` directly in a browser.

## Testing

Install/use Node.js 20+ and run:

```bash
npm test
```

The tests verify the landing-page promise and no-login constraint plus the tap challenge's scoring, deadline, and replay reset behavior.

## Build

Run:

```bash
npm run build
```

The build copies the static preview files into `dist/` and fails if required files such as `index.html` or `app.js` are missing.

## CI and Preview Artifact

GitHub Actions runs on every push and pull request to `main`:

1. `npm test`
2. `npm run build`
3. Uploads the `dist/` output as a workflow artifact named `social-challenge-arena-preview`.

## GitHub Pages Preview

The live GitHub Pages URL will not work until GitHub Pages is enabled in the repository settings.

The repository now includes a `docs/` folder prepared for GitHub Pages branch deployment.

To activate the preview link:

1. Open the repository on GitHub.
2. Go to `Settings` → `Pages`.
3. Under `Build and deployment`, choose `Deploy from a branch`.
4. Select branch: `main`.
5. Select folder: `/docs`.
6. Save.

After GitHub finishes deployment, the preview URL should be:

```text
https://abdullahkrs.github.io/social-challenge-arena/
```

Do not treat this URL as live until GitHub Pages shows a successful deployment in the repository settings.
