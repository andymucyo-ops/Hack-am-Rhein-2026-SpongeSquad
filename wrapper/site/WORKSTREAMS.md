# SpongeSquad owner buckets

The shared website is a neutral entrance to five independent workspaces. Each
owner can change the page in their own folder. Integration is a later, explicit
decision rather than the default.

| Published page | Source file | Owner | Scope |
| --- | --- | --- | --- |
| `andy/` | `wrapper/site/basel-site-scoping-tool/bucket/index.html` | Andy | Data, site scoping, maps and provenance |
| `simon/` | `frontend/bucket/index.html` | Simon | Frontend, interaction and visual artefacts |
| `bala/` | `explainer-videos-context/bucket/index.html` | Bala Chandar Muppala | Explanations, videos, claims and context |
| `mary/` | `presentation-story/bucket/index.html` | Mary | Pitch, slides, script and demo order |
| `achim/` | `wrapper/achim/index.html` | Achim | End-to-end journey, evidence gaps, participation, state and integration |

## Working rule

- Change only your bucket and its assets.
- Treat another bucket as an external input.
- Connect buckets through a documented input/output contract.
- Do not turn a visual concept, candidate score or missing value into an
  unsupported result.
- The earlier connected group narrative remains at `archive/group-story-v1/`.

## Build

Run `npm start` in `wrapper/`. The wrapper stages the owner pages, builds the
working modules and publishes one static `wrapper/dist/` directory.
