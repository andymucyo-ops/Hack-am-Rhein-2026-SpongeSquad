# SpongeSquad website and wrapper

From the group repository:

```bash
cd wrapper
npm start
```

Open http://localhost:4173/ . The command installs missing dependencies, builds
all modules and serves the complete website. Requires Node 24 (Node 22.6+ is
supported by the imported test runner). `npm test` builds and runs module,
adapter and internal-link checks. `npm run serve` serves the last build.
Deployable static output is `wrapper/dist/`; no deployment is performed here.

## What lives where

- `site/integration/`: landing, FIND, UNDERSTAND, DESIGN/TEST/SEE, DECIDE,
  Sources & Research and Team pages. `routes.json` controls the journey.
- `site/research/`, `site/team/`: imported source material and migration record.
- `site/frontend/`, `site/data/`, `site/explainer-videos-context/`,
  `site/presentation-story/`: integration templates, not changes to teammates' folders.
- `site/basel-site-scoping-tool/`: unchanged snapshot from fork commit `74826d7`.
  Current group main has no runnable Andy app. This snapshot supplies FIND and
  candidate fixtures; its provenance is in `site/research/MIGRATION.md`.
- `street-workspace/`, `street-xray/`, `data-charter-map/`, `sponge-catalogue/`,
  `prototypes/`, `docs/`: canonical existing modules, including Rain Walk and references.
- `scripts/website.mjs`: copies inputs into ignored `.site-workspace/` for the
  existing site builder, then copies the output to `dist/`. All writes stay here.

Candidates carry identity and evidence questions, never scores as geometry.
Examples and simulation remain illustrative. Rain Walk saves locally; there is
no shared review service. Some workstream pages and Basel procedures remain
explicit placeholders. Team planning records are historical.

Street Lab's site build disables Rollup tree-shaking to avoid the pinned version's
slow transform; its standalone configuration remains unchanged. Existing module
commands remain available. Build output is disposable; edit sources, not staging.
