# Wrapper and integration

Achim's workspace for bringing the SpongeSquad modules together.

This folder contains the complete latest state from the fork's `feature/street-lab-ui` branch:

- `docs/ARCHITECTURE.md` — product spine, module boundaries and integration contract;
- `prototypes/sponge-street/` — original standalone explainer;
- `street-workspace/` — latest React, TypeScript and Phaser Street Lab.

The source branch already includes the structured street-world work and the subsequent Street Lab UI improvements, so older overlapping branches are not copied separately.

## Integration boundary

Andy's hot-spot finder remains unchanged at `../basel-site-scoping-tool/`. The intended seam is:

```text
CandidateArea
→ example StreetScenarioSeed
→ Street Lab
→ explanation and comparison
```

The first integration should add navigation and an explicit adapter. It must not convert illustrative area scores into measured street geometry, soil or drainage facts.
