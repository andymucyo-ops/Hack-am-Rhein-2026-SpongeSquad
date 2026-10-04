# Shared website (integration)

The shared SpongeSquad website. It joins Andy's site-scoping tool, the Street Lab and every other workstream into one static site without changing their source folders.

The product direction and current finish line are documented in:

- [`wrapper/docs/PRODUCT_VISION.md`](../wrapper/docs/PRODUCT_VISION.md)
- [`wrapper/docs/MVP.md`](../wrapper/docs/MVP.md)
- [`wrapper/docs/adr/`](../wrapper/docs/adr/README.md)

## Run

From the repository root:

```sh
npm start
```

Open `http://localhost:4173/`. The landing page leads into the journey; FIND embeds Andy's tool, and UNDERSTAND carries a chosen candidate into the Street Lab through `assets/street-lab-adapter.js`.

## What lives here

| Path | Role |
| --- | --- |
| `routes.json` | Single configuration: stages, sections, workstreams and module builds |
| `index.html`, `find/`, `understand/`, `lab/`, `decide/`, `research/`, `team/`, `view/` | Shell pages |
| `assets/site.css`, `assets/site.js` | Shared styling, header, journey stepper and candidate state |
| `assets/street-lab-adapter.js` | The explicit candidate → Street Lab adapter |
| `contracts/` | Versioned handoff schema |

Pages may contain build-time includes such as `<!--@docs:team-->` or `<!--@catalog:sponge-->`; `scripts/build-integration.mjs` expands them.

The earlier multi-port development setup (`scripts/dev-integration.mjs`, `scripts/serve-shell.mjs`) was replaced by one static build. Andy's tool is now built from `basel-site-scoping-tool/` unchanged, so the snapshot copy in `data/site-scoping-tool/` is no longer part of the site.

## Borrowed from Basel Spatial Graph

- **Normalize once, consume through a narrow contract.** The cross-app payload is versioned in `contracts/candidate-site-context.v1.schema.json`.
- **Keep structures optimized for their job.** The scoping model, street graph and simulation remain separate; the handoff references a candidate rather than merging models.
- **Carry provenance.** The handoff is explicitly `illustrative`, with evidence leads, missing data and a note about what was not transferred.
- **Separate prepared facts from dynamic calculations.** Candidate context is static input; the storm result is computed in Street Lab for the selected controls.
- **Degrade explicitly.** Street Lab still works without a payload and rejects malformed or unknown handoff versions.

We did not borrow the graph database, query language or backend. They solve a larger problem than this vertical slice requires.

## Renderer decision

Street Lab uses React + SVG/HTML as a replaceable view of the typed street and simulation state. Phaser was valuable visual exploration, but the explanatory product needs accessible DOM controls, evidence panels and a renderer that does not own intervention or calculation logic. See [ADR 0003](../wrapper/docs/adr/0003-use-react-svg-for-the-mvp-renderer.md).
