"""Pure evaluation logic for the frontend scenario model."""
from __future__ import annotations

WEATHER = {"mild", "rainstorm", "heatwave"}


def evaluate(weather: str, selected: dict[str, str], catalogue: dict) -> dict:
    if weather not in WEATHER:
        raise ValueError(f"unknown weather: {weather!r}; expected mild, rainstorm, or heatwave")
    sections = {section["id"]: section for section in catalogue["sections"]}
    unknown_sections = sorted(set(selected) - set(sections))
    if unknown_sections:
        raise ValueError(f"unknown section id(s): {', '.join(unknown_sections)}")

    breakdown = []
    storm_reduction = 0
    cooling = 0
    for section in catalogue["sections"]:
        section_id = section["id"]
        option_id = selected.get(section_id, "unchanged")
        options = {option["id"]: option for option in section["options"]}
        if option_id not in options:
            raise ValueError(f"unknown option id {option_id!r} for section {section_id!r}")
        option = options[option_id]
        storm_reduction += option["stormMm"]
        cooling += option["coolC"]
        breakdown.append({"section": section_id, "optionId": option_id, "stormMm": option["stormMm"], "coolC": option["coolC"]})

    base_ponding = 46 if weather == "rainstorm" else 0
    base_surface_temp = 57 if weather == "heatwave" else 23 if weather == "rainstorm" else 31
    return {
        "ponding": max(0, round(base_ponding - storm_reduction)),
        "temp": max(16 if weather == "rainstorm" else 22, round((base_surface_temp - cooling) * 10) / 10),
        "breakdown": breakdown,
    }
