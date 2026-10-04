# Tellplatz Backend

Read-mostly FastAPI service for the `frontend/v1` sponge-city scenario. It has
no database. Generated catalogue and baseline data are static JSON files.

Install `backend/requirements.txt`, then run from the `backend/` directory:

```text
uvicorn app.main:app --reload
```

## Endpoints

`GET /api/health`

```json
{"status":"ok"}
```

```text
curl http://localhost:8000/api/health
```

`GET /api/catalogue`

Returns `{ "sections": [...] }` in the exact frontend order. Every option has
the frontend `id`, `label`, `file`, `stormMm`, `coolC` and `info`, plus a
`source` and structured `evidence` metadata when an opened source supports it.

```text
curl http://localhost:8000/api/catalogue
```

`GET /api/baseline?weather=mild`

```json
{"weather":"mild","ponding_mm":0,"surface_temp_c":31,"temp_floor_c":22,"ponding_scale_mm":50,"source":"frontend-default","notes":["Game baseline copied from frontend/v1/main.js.","Intervention effects are game estimates."]}
```

```text
curl 'http://localhost:8000/api/baseline?weather=mild'
```

`POST /api/evaluate`

```json
{"weather":"rainstorm","selected":{"parking lot":"retention pools"}}
```

```text
curl -X POST http://localhost:8000/api/evaluate -H 'content-type: application/json' -d '{"weather":"rainstorm","selected":{"parking lot":"retention pools"}}'
```

Returns `ponding`, `temp` and a complete per-section `breakdown`. Missing
sections mean `unchanged`; unknown section or option ids return HTTP 422.

`GET /api/site`

Returns Tellplatz `name`, WGS84 `bbox`, WGS84 `centroid`, projected EPSG:2056
`area` in square metres, and the source GeoJSON geometry.

```text
curl http://localhost:8000/api/site
```

## Data provenance

The intervention `stormMm` and `coolC` values are game estimates copied from
the finished frontend. Where evidence is present, it reports the source's
original metric; most runoff percentages and temperature measurements are not
directly comparable to the game's mm of reduced peak ponding or degrees C of
reduced peak hard-surface temperature. The seeded mild and rainstorm baselines
are frontend defaults, not engineering calculations. The optional observed
heatwave baseline is Landsat-derived daytime land-surface temperature at
Tellplatz, dates 2021-06-01 through 2025-08-31, not air temperature and not
the official Basel heat-island intensity. It uses the Tellplatz median and
keeps the replaced default in `baseline.json` history.

The opt-in command below promotes its Tellplatz median to the heatwave
baseline, recording the previous value in `baseline.json` history:

```text
python backend/scripts/build_baseline.py --use-observed-lst
```

Without the flag, `build_baseline.py` preserves the seeded defaults.

## Generation and tests

```text
python backend/scripts/build_catalogue.py
pytest -q backend/tests
```
