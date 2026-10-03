# Wrapper and integration

Home for Achim's work bringing the SpongeSquad modules together.

This folder contains the complete latest state consolidated from the fork's `feature/street-lab-ui` branch:

- `docs/ARCHITECTURE.md` — product spine, module boundaries and integration contract;
- `docs/TODO-DATA-GAP-TO-DECISION.md` — broader evidence-profile and gap-investigator direction, deliberately kept outside tonight's MVP;
- `data-charter-map/` — city-wide evidence charter, gap-filling research and real/inferred/missing Basel map;
- `street-xray/` — one-street evidence gate, verification rehearsal and printable Evidence Passport;
- `prototypes/sponge-street/` — original standalone explainer;
- `street-workspace/` — typed React, TypeScript and SVG Street Lab.

That source already includes the structured street-world work and subsequent UI improvements, so older overlapping branch versions are not duplicated.

## Integration boundary

Andy's hot-spot finder remains unchanged on `feature/hot-spot-map`. The intended seam is:

```text
Data Charter / inference claims
→ CandidateArea
→ Street X-Ray / Evidence Passport
→ example StreetScenarioSeed
→ Street Lab
→ explanation and comparison
```

Integration must not turn illustrative area scores into measured street geometry, soil or drainage facts.

## Self-contained wrapper

Build scripts, styles and routes live inside `wrapper/`. No root shell is required.
From the repository root:

```bash
cd wrapper
npm run setup
npm test
npm run dev
```

Open http://127.0.0.1:4173/wrapper/ . `npm run build` generates `wrapper/dist/`;
`npm start` serves an existing build. Serve that directory as the web root to
preserve `/wrapper/` routes. These commands do not deploy anything.

Rain Walk and references are linked from this landing page. The source catalogue
is in `sponge-catalogue/`. Andy's app and team folders remain independent; these
scripts do not build or change them.
