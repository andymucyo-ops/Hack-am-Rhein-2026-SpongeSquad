from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from . import store
from .model import evaluate
from .schemas import BaselineResponse, CatalogueResponse, EvaluateRequest, EvaluateResponse, SiteResponse, Weather

app = FastAPI(title="Make Basel a Sponge backend", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost(:\d+)?$",
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/catalogue", response_model=CatalogueResponse)
def get_catalogue() -> dict:
    return store.catalogue()


@app.get("/api/baseline", response_model=BaselineResponse)
def get_baseline(weather: Weather = Query(...)) -> dict:
    data = store.baseline()[weather]
    return {"weather": weather, **data}


@app.post("/api/evaluate", response_model=EvaluateResponse)
def post_evaluate(request: EvaluateRequest) -> dict:
    try:
        return evaluate(request.weather, request.selected, store.catalogue())
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get("/api/site", response_model=SiteResponse)
def get_site() -> dict:
    return store.site()
