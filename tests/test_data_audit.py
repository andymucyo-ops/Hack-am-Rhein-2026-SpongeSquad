from pathlib import Path
import sys

import pytest
from pyproj import Transformer
from shapely.geometry import Point

sys.path.insert(0, str(Path(__file__).parents[1] / "scripts"))
import audit_data_access as audit


def test_actual_kml_is_valid_polygon():
    geom = audit.load_aoi()
    assert geom.geom_type in {"Polygon", "MultiPolygon"}
    assert geom.is_valid and not geom.is_empty


def test_aoi_crs_transformation_has_metric_area():
    geom = audit.load_aoi()
    transformer = Transformer.from_crs(4326, 2056, always_xy=True)
    projected = audit.transform(transformer.transform, geom)
    assert projected.area > 100_000
    assert projected.bounds[0] > 2_600_000


def test_saved_wms_evidence_does_not_claim_numeric_success():
    evidence = Path(__file__).parents[1] / "data/processed/audit/heat_grid_results.json"
    records = __import__("json").loads(evidence.read_text())
    assert records and all(record["value"] is None for record in records)


def test_numeric_heat_response_is_parsed_from_named_attribute():
    response = '{"type":"FeatureCollection","features":[{"properties":{"heat_value":2.75}}]}'
    assert audit.parse_numeric_wms_value(response, "application/json") == 2.75
    assert audit.has_numeric_wms_value(response, "application/json")


def test_layer_name_and_coordinates_are_not_heat_values():
    response = '{"features":[{"id":"KL_Waermeinseleffekt","properties":{},"type":"Feature"}]}'
    assert audit.parse_numeric_wms_value(response, "application/json") is None
    assert not audit.has_numeric_wms_value(response, "application/json")


def test_valid_no_hazard_response_is_distinguished_from_unqueryable():
    class Response:
        status_code = 200
        headers = {"content-type": "application/json"}
        def json(self):
            return {"type": "FeatureCollection", "features": []}

    assert audit.classify_runoff_response(Response())[0] == "no_hazard"


def test_empty_non_json_response_is_unqueryable():
    class Response:
        status_code = 200
        headers = {"content-type": "text/plain"}
        text = "Search returned no results"
        def json(self):
            raise ValueError("not JSON")

    assert audit.classify_runoff_response(Response())[0] == "unqueryable"


def test_derived_status_logic():
    assert audit.derive_heat_status(0) == "FAIL"
    assert audit.derive_heat_status(3) == "PARTIAL"
    assert audit.derive_heat_status(3, raster_available=True) == "PASS"
    assert audit.derive_runoff_status(["no_hazard", "no_hazard"], False) == "PASS"
    assert audit.derive_runoff_status(["unqueryable"], False) == "FAIL"


def test_image_response_is_not_analytical():
    assert not audit.has_numeric_wms_value("PNG image bytes 123456")


def test_unavailable_endpoint_is_graceful():
    with pytest.raises(Exception):
        audit.request_json("http://127.0.0.1:1/unavailable", {})


def test_aoi_contains_known_interior_point():
    geom = audit.load_aoi()
    assert geom.covers(Point(7.5916, 47.567))
