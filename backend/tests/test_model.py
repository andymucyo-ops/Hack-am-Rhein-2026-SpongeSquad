import json
import copy
from pathlib import Path

import pytest

from backend.app.model import evaluate

CATALOGUE = json.loads((Path(__file__).parents[1] / "data/catalogue.json").read_text())


def test_unchanged_values_match_frontend_formula():
    assert evaluate("mild", {}, CATALOGUE)["ponding"] == 0
    assert evaluate("mild", {}, CATALOGUE)["temp"] == 31
    assert evaluate("rainstorm", {}, CATALOGUE)["ponding"] == 46
    assert evaluate("rainstorm", {}, CATALOGUE)["temp"] == 23
    assert evaluate("heatwave", {}, CATALOGUE)["ponding"] == 0
    assert evaluate("heatwave", {}, CATALOGUE)["temp"] == 57


def test_rainstorm_combines_selected_reductions():
    result = evaluate(
        "rainstorm",
        {"parking lot": "retention pools", "sidewalk": "street tree + permeatable pavement + bioswale (vegetated drainage strip)"},
        CATALOGUE,
    )
    assert result["ponding"] == 18


def test_heatwave_temperature_floor():
    catalogue = copy.deepcopy(CATALOGUE)
    catalogue["sections"][0]["options"][1]["coolC"] = 100
    result = evaluate("heatwave", {"apartments": "green roof"}, catalogue)
    assert result["temp"] == 22


def test_unknown_section_and_option_are_clear():
    with pytest.raises(ValueError, match="unknown section"):
        evaluate("mild", {"roof": "unchanged"}, CATALOGUE)
    with pytest.raises(ValueError, match="unknown option"):
        evaluate("mild", {"street": "not-real"}, CATALOGUE)
