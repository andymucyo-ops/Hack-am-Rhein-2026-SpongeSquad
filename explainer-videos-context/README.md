# Explainer videos and context

Home for Bala Chandar Muppala's explainers, contextual information and video assets.

Prefer reusable pieces that the wrapper and presentation can embed or link. Record the claim, source and intended audience beside each asset.

## Playground

Open `playground.html` through a local web server to review the current video
sequence:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/explainer-videos-context/playground.html`.
The file is standalone and uses relative asset paths. Add new videos beside it,
duplicate an explainer card, complete the claim/source/audience fields, and add
the filename to the `bala-explainers` module in
`wrapper/site/integration/routes.json` so the shared build publishes it.
