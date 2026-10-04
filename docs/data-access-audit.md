# Tellplatz Data-Access Audit

**Execution:** 2026-10-04T05:03:37Z (UTC)

## Decision

**NO-GO for the numerical MVP.** The original NO-GO was provisional because heat/runoff were hardcoded to `FAIL`, `has_numeric_wms_value()` was unused, and only one or two points were queried. This final time-boxed investigation derives statuses from parsed responses. Runoff now passes through analytical WMS geometries; heat still fails because no numerical heat attribute or coverage was found.

## AOI

The actual `data/raw_data/tellPlatz-coordinates.kml` contains one valid non-empty Polygon. It was normalized to `data/processed/tellplatz_aoi.geojson` in EPSG:4326.

| Measure | Value |
|---|---:|
| Area | 125,322.12 m2 / 12.5322 ha |
| EPSG:4326 bbox | 7.58896256, 47.56521014, 7.59427502, 47.56880560 |
| EPSG:2056 bbox | 2611313.55, 1268289.07, 2611713.33, 1268688.84 |

## Corrected source results

| Source | Method | Status | Result | Evidence |
|---|---|---|---|---|
| Wärmeinseleffekt | GeoBS WMS `https://wms.geo.bs.ch/`, `KL_Waermeinseleffekt` | **FAIL** | Capabilities report queryable layer, EPSG:2056, WMS 1.1.1/1.3.0, and seven GetFeatureInfo formats. All 25 EPSG:2056 grid requests returned an empty `properties` object; 0/25 numerical values. | `heat_capabilities.json`, `heat_format_probes.json`, `heat_grid_results.json` |
| Amtliche Vermessung Bodenbedeckung | GeoBS OGC API Features bbox request | **PASS** | 657 bbox features, 526 clipped features. Existing class areas and percentages preserved. | `land_cover_clipped.geojson`, `land_cover_response.json` |
| Baumkataster | Basel Opendatasoft exact-polygon query | **PASS** | 172 inventoried trees; 13.7246 trees/ha. | `trees_clipped.geojson`, `trees_response.json` |
| Gefährdungskarte Oberflächenabfluss | Federal WMS JSON GetFeatureInfo, EPSG:2056, 25-point grid | **PASS** | 6 points returned analytical hazard polygon geometries; 19 returned valid empty FeatureCollections meaning no hazard at those points; 0 unqueryable responses. Union clipped to Tellplatz: 20,119.04 m2, exposed fraction 0.160539 (16.0539%). WMS properties contain no hazard class. | `runoff_capabilities.json`, `runoff_format_probes.json`, `runoff_grid_results.json`, `runoff_hazard_clipped.geojson` |
| Fokusgebiete Stadtklimakonzept | GeoBS OGC API Features bbox request | **PASS** | 6 bbox features, 5 clipped/intersecting polygons. Context only, not numerical heat. | `focus_areas_clipped.geojson`, `focus_response.json` |
| Amtliche Vermessung Einzelobjekte | Collection confirmed in OGC API capabilities; no interpretation request | **PARTIAL** | Collection is discoverable but optional classes were not audited further. | `config/data_sources.yaml` |

## Capabilities and formats

Both WMS capabilities documents returned HTTP 200 and advertised WMS 1.1.1 and 1.3.0. Both target layers were marked `queryable=1`.

Heat GetFeatureInfo formats: `text/plain`, `text/html`, `text/xml`, `application/vnd.ogc.gml`, `application/vnd.ogc.gml/3.1.1`, `application/json`, and `application/geo+json`. The layer advertises CRS:84, EPSG:4326, EPSG:4258, EPSG:3857, and EPSG:2056, plus a legend URL. All declared formats were probed at the grid center under both WMS versions. They returned no named numerical value.

Runoff GetFeatureInfo formats: `application/json`, `application/json; subtype=geojson`, `application/vnd.ogc.gml`, `text/plain`, `text/xml`, and GML XML variants. The layer advertises EPSG:2056 and other CRSs, a GeoCAT metadata URL, and a legend URL. JSON responses returned either actual polygon geometry or an empty FeatureCollection. The geometry is analytical, but its properties do not include a hazard class or depth.

## Alternate access

No heat download, WCS, OGC API Coverages, or matching GeoBS STAC collection was linked by the official GeoBS capabilities/service inventory. The only heat link discovered was the legend.

The official runoff GeoCAT metadata links to the federal STAC collection:
`https://data.geo.admin.ch/api/stac/v1/collections/ch.bafu.gefaehrdungskarte-oberflaechenabfluss/items`.
It exposes official downloads, including the Basel EPSG:2056 FileGDB ZIP:
`https://data.geo.admin.ch/ch.bafu.gefaehrdungskarte-oberflaechenabfluss/gefaehrdungskarte-oberflaechenabfluss_bs/gefaehrdungskarte-oberflaechenabfluss_bs_2056.gdb.zip`.
The file is 37.6 MB and was not downloaded because the bounded WMS geometry request already produced the required small Tellplatz evidence. No speculative endpoint was used.

## Existing baseline metrics

Land-cover classes remain separate; no sealed fraction was inferred. Tree and focus-area results are unchanged. The corrected heat/runoff metrics are in `data/processed/audit/baseline_metrics.json`:

- Heat: 25 points, 0 valid numerical values, no unit, status `FAIL`.
- Runoff: 25 points, 6 analytical geometries, 19 valid no-hazard responses, exposed fraction 0.160539, status `PASS`.

## Email request and uncertainty

Email ordering is still required for the heat source. Request a numerical current heat-island GeoTIFF, preferably EPSG:2056, with units, acquisition/model year, nodata value, resolution, metadata, and licence.

Runoff access is no longer blocked. If the MVP requires official hazard classes or depth rather than the returned unclassified hazard geometry, use the documented federal EPSG:2056 FileGDB/STAC download or request the equivalent clipped GeoPackage with class definitions and metadata.

The remaining heat uncertainty is whether a non-public or unpublished numerical raster exists outside the documented GeoBS WMS/service links. No numerical heat value was claimed from rendered output, IDs, coordinates, or HTTP status codes.

## Reproduction

```text
/tmp/hack-am-rhein-audit/bin/python scripts/audit_data_access.py
/tmp/hack-am-rhein-audit/bin/pytest -q
```

The script exits successfully while reporting ordinary source failures. It uses timeouts and records ordinary remote failures as source statuses.
