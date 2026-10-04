# Sponge City Street Lab — v5

Run with:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Connecting to the backend

Run the API in one terminal and the frontend in another:

```bash
cd backend && uvicorn app.main:app --reload
cd frontend/v1 && python3 -m http.server 8080
```

The frontend requests the catalogue, weather baselines, and evaluations from `http://localhost:8000`. If the API is unreachable or returns an incompatible catalogue, it automatically uses the embedded demo values and remains fully usable. An alternate API URL can be supplied with `?api=http://localhost:8000`.

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
