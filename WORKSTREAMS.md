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

Keep contributions inside the relevant folder. Andy's existing `basel-site-scoping-tool/` stays in place and unchanged. Integration happens in `wrapper/` through explicit seams rather than by moving or rewriting another workstream's source.
