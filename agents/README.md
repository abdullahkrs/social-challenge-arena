# Agent Team

## Roles

| Role | File | Label |
|---|---|---|
| Coordinator | `agents/coordinator.md` | `agent-coordinator` |
| Product Strategist | `agents/product-strategist.md` | `agent-product` |
| Social Trends Scout | `agents/social-trends.md` | `agent-trends` |
| Creative Director | `agents/creative-director.md` | `agent-creative` |
| Visual Direction | `agents/visual-direction.md` | `agent-visual` |
| Motion Design | `agents/motion-design.md` | `agent-motion` |
| 2D Game Development | `agents/game-2d.md` | `agent-2d` |
| 3D Game Development | `agents/game-3d.md` | `agent-3d` |
| Platform and Integration | `agents/platform-integration.md` | `agent-platform` |
| Localization | `agents/localization.md` | `agent-i18n` |
| QA Review | `agents/qa-review.md` | `ready-for-qa` |
| Product Health | `agents/product-health.md` | `agent-health` |

Islamic-content compliance is shared across all roles through `ISLAMIC_CONTENT_POLICY.md` and independent QA. There is no standalone Islamic review role and no owner-referral path. When permissibility or policy application is unclear, use the most conservative clearly compliant option, remove or replace the disputed element, or reject the concept and continue with a safe alternative.

## Work gate

An agent may change the repository only when one open issue:

- names exactly one owner role;
- is marked `ready-for-agent`;
- has merged dependencies;
- defines allowed and forbidden files;
- has measurable acceptance criteria and non-goals;
- includes Islamic-content, language, accessibility, visual/motion, and 2D/3D considerations;
- does not overlap another active issue.

If no valid issue exists, stop without changes.

## Delivery flow

```text
Health or Trends
→ Product Strategy
→ Creative
→ Visual + Motion
→ focused architecture decision when needed
→ 2D / 3D / Platform vertical slice
→ Localization
→ QA
→ Coordinator merge
→ Health review
```

Adjacent planning stages may be combined by the Coordinator when this reduces delay without weakening evidence or QA.

## Shared rules

- One active implementation priority.
- One issue, branch, and PR per task.
- Branch from current `main`; target `main` directly.
- No stacked PRs.
- No implementation merge without independent `QA: PASS`.
- No more than two foundation-only merges before a visible vertical slice.
- All roles must respect `PRODUCT_BRIEF.md`, `AGENT.md`, and `ISLAMIC_CONTENT_POLICY.md`.