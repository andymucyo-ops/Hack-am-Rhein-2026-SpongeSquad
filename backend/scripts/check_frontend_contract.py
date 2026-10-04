#!/usr/bin/env python3
"""Check that backend data still matches the frontend's embedded game model."""
from __future__ import annotations

import json
from pathlib import Path

from build_catalogue import parse_sections

ROOT = Path(__file__).resolve().parents[2]


def main() -> None:
    frontend = parse_sections((ROOT / "frontend/v1/main.js").read_text())
    catalogue = json.loads((ROOT / "backend/data/catalogue.json").read_text())
    baseline = json.loads((ROOT / "backend/data/baseline.json").read_text())
    assert [s["id"] for s in frontend["sections"]] == [s["id"] for s in catalogue["sections"]]
    for expected, actual in zip(frontend["sections"], catalogue["sections"]):
        actual_options = {option["id"]: option for option in actual["options"]}
        for option in expected["options"]:
            remote = actual_options[option["id"]]
            assert remote["stormMm"] == option["stormMm"]
            assert remote["coolC"] == option["coolC"]
    expected_baselines = {
        "mild": (0, 31, 22, 50),
        "rainstorm": (46, 23, 16, 50),
        "heatwave": (0, 57, 22, 50),
    }
    for weather, expected in expected_baselines.items():
        actual = baseline[weather]
        assert (actual["ponding_mm"], actual["surface_temp_c"], actual["temp_floor_c"], actual["ponding_scale_mm"]) == expected
    print("frontend/backend contract: PASS")


if __name__ == "__main__":
    main()
