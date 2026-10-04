# Basel Spatial Graph assessment

Evaluated from `blackmath88/basel-spatial-graph` `main` on 2026-10-03.

## What is strong

The repository has a mature boundary between data preparation and product use:

- external sources are normalized behind provider contracts;
- network and entity structures remain separate because they serve different queries;
- prepared snapshots make runtime deterministic and offline-capable;
- every answer can distinguish observed, official, persisted-derived and request-time dynamic values;
- the graph backend sits behind a small store interface;
- FastAPI, CLI and MCP reuse one service layer instead of calling each other;
- fixtures and explicit fallback modes make missing data visible rather than silently inventing facts.

This is senior architecture because it optimizes for trustworthy boundaries and replaceability, not for putting every concern into one graph.

## What SpongeSquad should borrow now

| Spatial Graph pattern | SpongeSquad application |
| --- | --- |
| Normalized source contract | One versioned `CandidateSiteHandoffV1` envelope |
| Prepared vs dynamic split | Candidate evidence stays input; storm results are computed per interaction |
| Structure-specific models | Candidate area, street world and water graph stay separate |
| Provenance classifications | Handoff and UI explicitly label the candidate and simulation illustrative |
| Explicit fallback | Street Lab opens without context and rejects malformed/unknown versions |
| Stable IDs and bounded payloads | Candidate ID plus validated, size-limited context travels in the URL |

## What not to borrow for the hackathon

Do not add NetworkX, a graph database, a generic query language, FastAPI, MCP or a live ingestion pipeline to this vertical slice. The current product question needs one candidate-to-scenario transition. Those components become justified only when multiple clients must query verified cross-domain city relationships or when prepared real datasets replace the fixtures.

## Recommended next upgrade

Keep this handoff contract stable while replacing Andy's placeholder candidates with a prepared Basel snapshot generated from verified source adapters. That snapshot should attach retrieval date, licence, spatial unit, null/missingness and transformation metadata to every derived indicator. Street-scale geometry should enter through a new versioned scenario-seed contract rather than expanding the candidate payload or inferring geometry from ranking scores.
