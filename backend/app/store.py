"""Read-only access to generated JSON and AOI data."""
from __future__ import annotations

import json
from pathlib import Path

from pyproj import Transformer
from shapely.geometry import shape, mapping
from shapely.ops import transform

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "backend/data"
AOI = ROOT / "data/processed/tellplatz_aoi.geojson"


def read_json(path: Path) -> dict:
    return json.loads(path.read_text())


def catalogue() -> dict:
    return read_json(DATA / "catalogue.json")


def baseline() -> dict:
    return read_json(DATA / "baseline.json")


def site() -> dict:
    document = read_json(AOI)
    geometry = shape(document["features"][0]["geometry"])
    projected = transform(Transformer.from_crs(4326, 2056, always_xy=True).transform, geometry)
    return {
        "name": "Tellplatz",
        "bbox": list(geometry.bounds),
        "centroid": [geometry.centroid.x, geometry.centroid.y],
        "area": projected.area,
        "geometry": mapping(geometry),
    }
