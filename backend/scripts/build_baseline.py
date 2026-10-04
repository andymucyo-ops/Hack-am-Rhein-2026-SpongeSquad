#!/usr/bin/env python3
"""Optionally promote observed Landsat LST into the scenario baseline."""
from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASELINE = ROOT / "backend/data/baseline.json"
LANDSAT = ROOT / "data/processed/audit/heat/landsat_heat_baseline.json"


def observed_temperature() -> tuple[float, str, str]:
    output = json.loads(LANDSAT.read_text())
    value = output.get("tellplatz", {}).get("median_c")
    if value is None:
        raise ValueError("Landsat output has no Tellplatz surface-temperature value")
    source = output["source"]
    observed_date = output.get("period", {}).get("end", date.today().isoformat())
    return float(value), source, observed_date


def build(use_observed_lst: bool = False) -> dict:
    data = json.loads(BASELINE.read_text())
    if not use_observed_lst:
        return data
    value, source, observed_date = observed_temperature()
    history = data.setdefault("history", [])
    for weather in ("heatwave",):
        old = {key: data[weather].get(key) for key in ("surface_temp_c", "source", "date")}
        history.append({"weather": weather, "field": "surface_temp_c", "old": old, "replaced_on": date.today().isoformat()})
        data[weather]["surface_temp_c"] = value
        data[weather]["source"] = "Landsat-derived daytime land-surface temperature at Tellplatz"
        data[weather]["date"] = observed_date
        data[weather]["notes"].append(
            f"Landsat-derived daytime land-surface temperature at Tellplatz, dates {observed_period()}, "
            "not air temperature and not the official Basel heat-island intensity."
        )
    return data


def observed_period() -> str:
    period = json.loads(LANDSAT.read_text())["period"]
    return f"{period['start'][:10]} through {period['end'][:10]}"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--use-observed-lst", action="store_true", help="replace mild/heatwave surface temperature and record prior values")
    args = parser.parse_args()
    data = build(args.use_observed_lst)
    BASELINE.write_text(json.dumps(data, indent=2) + "\n")


if __name__ == "__main__":
    main()
