# Localization Policy

Multilingual support is mandatory from the first architecture decision.

## Active language order

1. Arabic with complete RTL.
2. English.
3. Turkish.

Agents may recommend additional languages from audience evidence.

## Requirements

- One shared translation system.
- Language-independent game and share links.
- Correct document `lang` and `dir`.
- Complete translation of discovery, gameplay, HUD, results, replay, sharing, friend challenge, comparison, errors, accessibility, safety, and legal text.
- Culturally appropriate wording rather than literal low-quality translation.
- Mixed-direction, number, punctuation, font, wrapping, and long-label tests.
- Safe allowlisted local preference and reliable fallback.
- No duplicated application or game implementation by language.

A release is blocked when required user-facing text is missing, misleading, clipped, directionally broken, or inaccessible in an active language.
