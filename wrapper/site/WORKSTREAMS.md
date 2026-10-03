# SpongeSquad workstreams

This branch is a shared assembly space. Each workstream can develop inside its own folder without changing another workstream's files.

| Folder | Responsibility | Current owner |
| --- | --- | --- |
| `basel-site-scoping-tool/` | Andy's existing hot-spot finder and site-scoping application | Andy |
| `frontend/` | Shared product frontend and integration-ready UI contributions | Frontend |
| `data/` | Datasets, transformations, schemas and provenance | Data / map workstream |
| `explainer-videos-context/` | Explanations, context, video assets and supporting information | Bala Chandar Muppala |
| `presentation-story/` | Demo narrative, pitch, presentation and slides | Mary |
| `wrapper/` | Shared shell and Achim's existing prototypes, Street Lab and architecture | Achim |

## Working rule

Keep active work inside the relevant folder or feature branch. Existing feature branches remain unchanged. Bring work together through documented inputs and outputs; do not silently rewrite another workstream's implementation.

Each workstream folder now also contains an `index.html` drop-in page. The
shared landing page links these stable folder routes; teams can replace their
placeholder cards when they expose a working entry point.

## Website

`npm start` builds and serves the shared website (see [README.md](README.md)). Every row above has a page there. Workstream pages are configured in `integration/routes.json`; replace your folder's `index.html` when you have a stable entry point.
