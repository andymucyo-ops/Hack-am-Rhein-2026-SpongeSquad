# Observatory

The **Observatory** is a repository-native documentation and coordination module for The Sponge Squad.

It is not a link out to a dashboard. The repository owns the plan, coordination rules, task conventions and observability configuration. GitHub Pages is only a rendered projection of this module.

## What lives here

| Surface | Repository truth | Rendered view |
|---|---|---|
| Project observability | `observstory.config.json` + `.observstory/coordination.json` | Observatory tab |
| Day plan | `observatory/data/weekend.json` | Day Plan tab |
| Task planning | GitHub Issues + issue forms | Task Planner tab |
| Team decisions | `.observstory/coordination.json` | Observatory / project map |
| Research evidence | `docs/` + `resources/` | repository evidence |

## Operating model

Repository work → Observstory observes → Observatory documents/projects → team decides → tasks, experiments and implementation.

The Observatory never replaces the repository. It makes repository state legible.

## Weekend operating surfaces

### Observatory

The default view: in-flight work, overlap, stale work, dependencies, and declared coordination.

### Day Plan

Canonical schedule: [`data/weekend.json`](data/weekend.json)

Human-readable schedule: [DAY_PLAN.md](DAY_PLAN.md)

### Task Planner

Shared tasks use **GitHub Issues**, not hidden browser state. See [TASK_PLANNER.md](TASK_PLANNER.md).

- `[TASK]` — concrete shared outcome
- `[EXPERIMENT]` — cheap test of an assumption
- `[DECISION]` — consequential choice needing durable visibility

## Durable vs generated state

Durable repository state includes this directory, `.observstory/coordination.json`, `observstory.config.json`, GitHub Issues, and research/evidence in `docs/` and `resources/`.

Generated state includes the Observstory snapshot, Project Map, Radar and Pages bundle. These can be rebuilt at any time.

## Source files

- [DAY_PLAN.md](DAY_PLAN.md)
- [TASK_PLANNER.md](TASK_PLANNER.md)
- [data/weekend.json](data/weekend.json)
- [site/index.html](site/index.html)
- [../.observstory/coordination.json](../.observstory/coordination.json)
- [../observstory.config.json](../observstory.config.json)
