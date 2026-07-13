# Art Direction

The platform supports original 2D, 2.5D, and 3D visual identities while maintaining one coherent product shell.

## Principles

- Immediate readability on mobile.
- Distinctive original worlds and characters.
- Strong silhouette, hierarchy, contrast, and state clarity.
- Share-worthy result moments.
- Culturally respectful and Islamically compliant presentation.
- Scalable assets for Arabic RTL, English, Turkish, and future languages.
- Performance-aware detail levels and low-end fallbacks.

## Required visual brief per game

- Dimension: 2D / 2.5D / 3D.
- Style and rationale.
- Player, world, obstacle, HUD, result, and share treatment.
- Color and contrast logic.
- Asset inventory, source, ownership, license, compression, and loading.
- Low-end and reduced-detail behavior.
- Direct `ISLAMIC_CONTENT_POLICY.md` record and conservative replacement rule.
- Forbidden references and originality comparison.
- Actionable Motion Design and architecture handoff.

## Asset rules

- No copied characters, logos, levels, layouts, or distinctive trade dress.
- Use repository-owned, properly licensed, generated, or procedurally created assets only.
- Record asset provenance.
- Keep assets bounded, compressed, lazy-loaded where appropriate, and removable without breaking platform contracts.
- Unclear symbols, motifs, effects, or rights must be removed or replaced with a clearly neutral repository-owned alternative; they must not create a standalone review gate or owner referral.

## Active game visual systems

### Trace Relay — Ribbon Relay

- Brief: `concepts/trace-relay/VISUAL_BRIEF.md`.
- Dimension: 2D with removable depth cues only.
- Identity: broad folded signal through an asymmetric field of nine possible irregular folded-marker anchors.
- Core differentiation: non-grid geometry, varied silhouettes, tap/keyboard-first equivalence, route crossings or revisits, and a fixed spoiler-safe three-band relay mark.
- Palette: neutral dark board with high-contrast teal reveal, amber player trace, coral restrained error, violet assisted state, and monochrome outline/pattern fallbacks.
- Text and layout: no text embedded in game artwork; the board never mirrors in RTL; Arabic, English, and Turkish shell layouts use logical properties and wrap outside the board.
- Performance: critical game visual assets target 35 KB gzip with a 50 KB ceiling; no critical raster, video, model, texture atlas, or game-specific font; active board target 180 nodes and hard ceiling 240.
- Low-end behavior: removes texture, depth highlight, decorative fragments, blur, and idle motion while preserving geometry, route readability, hit targets, focus, states, score access, and share actions.
- Policy status: Visual Direction records PASS for the neutral abstract treatment under `ISLAMIC_CONTENT_POLICY.md`; independent QA must verify the exact brief and later implementation. Any questionable addition is removed or replaced rather than referred to a separate reviewer.
- Next handoff: Motion Design, then focused implementation architecture after QA.