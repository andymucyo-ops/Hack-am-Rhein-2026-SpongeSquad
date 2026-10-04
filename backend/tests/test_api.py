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


def test_evaluate_and_unknown_ids_are_422():
    response = client.post("/api/evaluate", json={"weather": "rainstorm", "selected": {"parking lot": "retention pools", "sidewalk": "street tree + permeatable pavement + bioswale (vegetated drainage strip)"}})
    assert response.status_code == 200
    assert response.json()["ponding"] == 18
    response = client.post("/api/evaluate", json={"weather": "mild", "selected": {"street": "unknown"}})
    assert response.status_code == 422
    assert "unknown option" in response.json()["detail"]
