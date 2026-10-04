#!/usr/bin/env python3
"""Extract the frontend SECTIONS contract into backend/data/catalogue.json."""
from __future__ import annotations

import ast
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "frontend/v1/main.js"
OUTPUT = ROOT / "backend/data/catalogue.json"
ORDER = ["apartments", "sidewalk", "street", "parking lot"]


def js_string(value: str) -> str:
    return ast.literal_eval(value)


def parse_sections(source: str) -> dict:
    sections = {}
    section_pattern = re.compile(
        r"(?P<key>'parking lot'|apartments|sidewalk|street)\s*:\s*\{"
        r"title:'(?P<title>(?:\\.|[^'])*)',"
        r"subtitle:'(?P<subtitle>(?:\\.|[^'])*)',"
        r"options:\[(?P<options>.*?)\]\s*\}",
        re.DOTALL,
    )
    option_pattern = re.compile(
        r"\{id:'(?P<id>(?:\\.|[^'])*)',label:'(?P<label>(?:\\.|[^'])*)',"
        r"file:'(?P<file>(?:\\.|[^'])*)',stormMm:(?P<storm>-?(?:\d+(?:\.\d+)?|\.\d+)),"
        r"coolC:(?P<cool>-?(?:\d+(?:\.\d+)?|\.\d+)),info:'(?P<info>(?:\\.|[^'])*)'\}"
    )
    for match in section_pattern.finditer(source):
        raw_key = match.group("key")
        key = js_string(raw_key) if raw_key.startswith("'") else raw_key
        options = []
        for option in option_pattern.finditer(match.group("options")):
            storm = float(option.group("storm"))
            cool = float(option.group("cool"))
            options.append({
                "id": js_string("'" + option.group("id") + "'"),
                "label": js_string("'" + option.group("label") + "'"),
                "file": js_string("'" + option.group("file") + "'"),
                "stormMm": int(storm) if storm.is_integer() else storm,
                "coolC": int(cool) if cool.is_integer() else cool,
                "info": js_string("'" + option.group("info") + "'"),
                "source": "game-estimate",
                "evidence": [],
            })
        if not options:
            raise ValueError(f"no options parsed for {key}")
        sections[key] = {"id": key, "title": js_string("'" + match.group("title") + "'"), "subtitle": js_string("'" + match.group("subtitle") + "'"), "options": options}
    if list(sections) != ORDER:
        raise ValueError(f"frontend section order changed: {list(sections)}")
    return {"sections": [sections[key] for key in ORDER]}


def main() -> None:
    catalogue = parse_sections(SOURCE.read_text())
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(catalogue, indent=2, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
