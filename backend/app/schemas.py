from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Weather = Literal["mild", "rainstorm", "heatwave"]


class Evidence(BaseModel):
    claim: str
    value_or_range: str
    unit: str
    metric: str
    citation: str
    url: str
    note: str
    consistency: Literal["within range", "below range", "above range", "not comparable"] | None = None
    consistency_reason: str | None = None


class Option(BaseModel):
    id: str
    label: str
    file: str
    stormMm: float
    coolC: float
    info: str
    source: str
    evidence: list[Evidence] = Field(default_factory=list)


class Section(BaseModel):
    id: str
    title: str
    subtitle: str
    options: list[Option]


class CatalogueResponse(BaseModel):
    sections: list[Section]


class BaselineResponse(BaseModel):
    weather: Weather
    ponding_mm: float
    surface_temp_c: float
    temp_floor_c: float
    ponding_scale_mm: float
    source: str
    notes: list[str]


class EvaluateRequest(BaseModel):
    weather: Weather
    selected: dict[str, str] = Field(default_factory=dict)


class Breakdown(BaseModel):
    section: str
    optionId: str
    stormMm: float
    coolC: float


class EvaluateResponse(BaseModel):
    ponding: float
    temp: float
    breakdown: list[Breakdown]


class SiteResponse(BaseModel):
    name: str
    bbox: list[float]
    centroid: list[float]
    area: float
    geometry: dict
