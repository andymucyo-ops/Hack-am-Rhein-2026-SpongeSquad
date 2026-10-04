import json
import re
from pathlib import Path

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.scripts.build_catalogue import ORDER, parse_sections

client = TestClient(app)
ROOT = Path(__file__).parents[2]


def test_catalogue_round_trips_frontend_sections_and_options():
    source = (ROOT / "frontend/v1/main.js").read_text()
    expected = parse_sections(source)
    actual = client.get("/api/catalogue").json()
    assert [section["id"] for section in actual["sections"]] == ORDER
    for expected_section, actual_section in zip(expected["sections"], actual["sections"]):
        assert expected_section["title"] == actual_section["title"]
        assert expected_section["subtitle"] == actual_section["subtitle"]
        assert [option["id"] for option in expected_section["options"]] == [option["id"] for option in actual_section["options"]]
        for expected_option, actual_option in zip(expected_section["options"], actual_section["options"]):
            assert actual_option["stormMm"] == expected_option["stormMm"]
            assert actual_option["coolC"] == expected_option["coolC"]
            if actual_option["evidence"]:
                assert actual_option["source"] == "literature-supported"
                for evidence in actual_option["evidence"]:
                    assert evidence["url"]
                    assert evidence["citation"]
            else:
                assert actual_option["source"] == "game-estimate"


def test_health_and_site():
    assert client.get("/api/health").json() == {"status": "ok"}
    site = client.get("/api/site")
    assert site.status_code == 200
    assert site.json()["name"] == "Tellplatz"
    assert site.json()["area"] > 100_000
    assert site.json()["geometry"]["type"] == "Polygon"


def test_baseline_weather():
    response = client.get("/api/baseline", params={"weather": "rainstorm"})
    assert response.status_code == 200
    assert response.json()["ponding_mm"] == 46
    assert response.json()["source"] == "frontend-default"


def test_observed_heatwave_baseline_and_seeded_mild_baseline():
    mild = client.get("/api/baseline", params={"weather": "mild"}).json()
    heatwave = client.get("/api/baseline", params={"weather": "heatwave"}).json()
    assert mild["surface_temp_c"] == 31
    assert mild["source"] == "frontend-default"
    assert heatwave["surface_temp_c"] == 40.23967190000002
    assert heatwave["source"] == "Landsat-derived daytime land-surface temperature at Tellplatz"
    assert "not air temperature and not the official Basel heat-island intensity" in heatwave["notes"][-1]


def test_evaluate_matches_local_formula_for_sample_inputs():
    response = client.post("/api/evaluate", json={"weather": "heatwave", "selected": {"apartments": "green roof", "street": "permeable paving blocks"}})
    assert response.status_code == 200
    assert response.json()["ponding"] == 0
    assert response.json()["temp"] == 37.5


def test_evaluate_preflight_allows_localhost():
    response = client.options(
        "/api/evaluate",
        headers={
            "Origin": "http://localhost:8080",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:8080"


def test_evaluate_preflight_allows_loopback_address():
    response = client.options(
        "/api/evaluate",
        headers={
            "Origin": "http://127.0.0.1:8080",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:8080"


def test_evaluate_preflight_rejects_external_origin():
    response = client.options(
        "/api/evaluate",
        headers={
            "Origin": "https://evil.example",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert response.status_code == 400
    assert "access-control-allow-origin" not in response.headers


def test_evaluate_and_unknown_ids_are_422():
    response = client.post("/api/evaluate", json={"weather": "rainstorm", "selected": {"parking lot": "retention pools", "sidewalk": "street tree + permeatable pavement + bioswale (vegetated drainage strip)"}})
    assert response.status_code == 200
    assert response.json()["ponding"] == 18
    response = client.post("/api/evaluate", json={"weather": "mild", "selected": {"street": "unknown"}})
    assert response.status_code == 422
    assert "unknown option" in response.json()["detail"]
