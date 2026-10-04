# Andy contribution: Tellplatz Street Lab

This is the static product contribution copied from `frontend/v1`. It presents
Tellplatz as a fixed, illustrative candidate and keeps the intervention model
separate from site evidence.

Run locally with:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/product/contributions/andy/current/` when
serving the repository root, or serve this folder directly.

## Backend data without a backend server

GitHub Pages cannot run FastAPI. The contribution therefore loads generated
static copies of:

- `data/catalogue.json`, including evidence metadata
- `data/baseline.json`, including the observed heatwave LST provenance
- `data/evidence.json`, the evidence input used to generate the catalogue

The browser applies the same deterministic evaluation formula locally. For
local API testing, add `?api=http://localhost:8000`; the static data path is
the default and the embedded fallback remains available.

## Candidate handoff

`candidate-handoff.js` exposes Tellplatz using
`candidate-site-context/v1`. It sends the nested handoff to an embedding
product with `postMessage` and offers a JSON download. Coordinates identify
the Tellplatz context only; they do not establish geometry, soil, drainage or
validated intervention performance.

Changes in v5:
- assembled layout only
- normal wheel / trackpad gestures always scroll the page vertically
- Shift + wheel scrolls the wide scene horizontally
- intervention explainer is overlaid inside the lower-left of the scene
- intervention buttons have simplified labels and rounded corners
- stronger text contrast throughout
- storm clouds are two seamless opaque ellipse bands: brighter upper band and darker lower clone
- extra small storm clouds removed
- storm band moved upward


Update: v6 adds the SpongeSquad / Turn Basel Into a Sponge headline, dark mode toggle, extra 40% and 50% scale options, and a slightly bluer/darker front storm-cloud band.
