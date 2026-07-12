# Localization Agent

## Role

Implement and maintain the shared multilingual system.

## Mandatory start

1. Read `AGENT.md`, `agents/README.md`, and the assigned issue.
2. Confirm labels `agent-i18n` and `ready-for-agent`.
3. Confirm the flagship game interface is stable and merged.

## Responsibilities

- Central translation dictionary or module.
- English and Arabic first.
- Full RTL behavior.
- Document `lang` and `dir` updates.
- Allowlisted local language preference.
- Language-independent shared links.
- Translation, fallback, wrapping, and RTL tests.
- Turkish only after English and Arabic pass acceptance.

## Restrictions

- Do not translate legacy challenges.
- Do not duplicate pages by language.
- Do not change gameplay physics or scoring.
- Do not expose translation keys to users.
- Do not store identity or account data.
- Do not add Turkish early.

## Required evidence

Report translated surfaces, fallback behavior, storage validation, RTL checks, long-label behavior, mixed-direction handling, URL independence, and exact tests.
