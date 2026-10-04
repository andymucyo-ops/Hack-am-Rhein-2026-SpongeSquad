# Tellplatz Data-Access Audit

**Local heat re-audit:** 2026-10-04T05:55:14Z (UTC)

## Decision

**Overall MVP decision: `GO`.** Tellplatz is a relevant heat-adaptation
prototype area because the official `fokusgebiet_hitzeentwicklung` planning
layer classifies 87.4252% of its 12.5322 ha analysis area as `Fokus`. The
project has the local data required for a scenario-based MVP: land cover,
public-tree inventory, surface-runoff exposure and spatial planning context.

The numerical official heat layer is not available programmatically. This is
non-blocking: the planning classification establishes official site relevance,
but does not quantify heat intensity.

## What the GeoPackage represents

The `fokusgebiet_hitzeentwicklung` GeoPackage is an official spatial planning
classification from Basel-Stadt's climate concept. It identifies areas
according to heat-development planning priorities. Its `Art` field contains
categories such as `Fokus`, `Verbessern`, `Erhalten` and `übriges Gebiet`.

It is not:

- a measured temperature dataset;
- a numerical urban-heat-island raster;
- evidence of a specific temperature difference; or
- a ranking of Basel's hottest neighbourhoods.

The official planning classification establishes relevance but does not
contain measured temperature values, heat intensity, uncertainty or time
series measurements. The numerical official `Wärmeinseleffekt` source remains
`UNAVAILABLE` / not retrieved as numerical values. It must not be changed to
`PASS`.

## Tellplatz result

The AOI is valid and covers 125,322.12 m2 / 12.5322 ha. Five source polygons
intersect Tellplatz and cover the AOI completely. The clipped source
categories are:

| Source category | Area | AOI fraction |
|---|---:|---:|
| `Fokus` | 109,563.16 m2 | 87.4252% |
| `übriges Gebiet` | 15,758.96 m2 | 12.5748% |

Tellplatz was selected as a relevant heat-adaptation prototype area because
87.4252% of its 12.5322 ha analysis area lies within the official `Fokus`
category of Basel-Stadt's heat-development planning layer. This planning
classification establishes official relevance but does not quantify heat
intensity.

## How the Tellplatz AOI was selected

The initial qualitative, evidence-based shortlist contained three candidate
areas:

1. Tellplatz and surrounding blocks in Gundeldingen.
2. Wiesenplatz-Klybeckstrasse in Klybeck.
3. Feldbergstrasse-Matthäusstrasse in Matthäus.

This was not a numerical ranking of Basel heat pixels. Candidates were
compared using:

| Criterion | Meaning |
|---|---|
| Official heat-planning relevance | Whether the location belongs to an area identified by Basel-Stadt as requiring heat-adaptation attention. |
| Small-area suitability | Whether a compact neighbourhood-sized AOI could be defined for an MVP. |
| Local data availability | Whether land cover, trees, buildings, runoff and planning layers could be spatially joined. |
| Intervention relevance | Whether common sponge-city interventions could plausibly be represented in the area. |
| Technical simplicity | Whether data could be clipped and aggregated without building a city-wide pipeline. |
| Demo clarity | Whether the location could support a clear before/after prototype narrative. |

### Tellplatz / Gundeldingen

- Strong official heat-planning relevance.
- Compact and recognisable neighbourhood area.
- Straightforward AOI definition.
- Good overlap with usable land-cover, tree and runoff data.
- Strong fit for a simple scenario-based MVP.
- Selected as the final AOI.

### Wiesenplatz / Klybeck

- Strong planning relevance.
- Good urban-transformation narrative.
- Suitable available environmental data.
- More complex because a custom neighbourhood boundary and larger development context would be needed.

### Feldbergstrasse / Matthäus

- Strong heat-adaptation relevance in a dense urban setting.
- Good potential for street-tree and depaving scenarios.
- Less straightforward AOI definition and prototype narrative than Tellplatz.

Tellplatz was selected because it offered the best combination of official
relevance, accessible data, manageable scope and demo clarity, not because it
was proven to have the highest temperature.

## What must not be claimed

The project must not claim that:

- Tellplatz is Basel's hottest neighbourhood;
- Tellplatz is one of the three objectively hottest locations;
- the `Fokus` category corresponds to a known temperature threshold;
- the GeoPackage measures air or surface temperature; or
- Tellplatz has a specific heat anomaly based on this GeoPackage.

## Source and gate statuses

| Component | Status |
|---|---|
| AOI geometry | `PASS` |
| Official heat-planning relevance | `PASS` |
| Official numerical heat intensity | `UNAVAILABLE`, non-blocking |
| Bodenbedeckung | `PASS` |
| Baumkataster | `PASS` |
| Surface runoff | `PASS` |
| Einzelobjekte | `PARTIAL`, optional |
| Site-selection gate | `PASS` |
| Data-foundation gate | `PASS` |
| Overall MVP decision | `GO` |

The MVP can justify Tellplatz, describe existing land cover and public trees,
quantify surface-runoff exposure, construct intervention scenarios from local
spatial data, and later apply transparent literature-derived intervention
coefficients.

## Evidence

- `data/processed/audit/heat/heat_gpkg_inventory.json`
- `data/processed/audit/heat/heat_summary.json`
- `data/processed/audit/heat/tellplatz_heat_clipped.geojson`
- `data/processed/audit/baseline_metrics.json`

The immutable source GeoPackage was not modified, renamed, reprojected or
duplicated. The local audit uses it without live network requests.

## Reproduction

```text
/tmp/hack-am-rhein-audit/bin/python scripts/audit_data_access.py
/tmp/hack-am-rhein-audit/bin/pytest -q
/tmp/hack-am-rhein-audit/bin/python -m py_compile scripts/audit_data_access.py tests/test_data_audit.py
```
