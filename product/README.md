# SpongeSquad product workspace

`product/` is the team's integration space. Contributor folders remain the
authoritative working areas; this folder assembles selected outputs into a
single demo without rewriting those sources.

## Run the MVP

The product is published by the existing wrapper build:

```bash
cd wrapper
npm test
```

The generated entry point is `wrapper/dist/product/index.html`.

## Structure

| Path | Purpose |
| --- | --- |
| `index.html`, `product.css`, `app.js` | Product-level MVP and interaction |
| `data/product-manifest.json` | Human- and machine-readable module handoffs |
| `contributions/andy/` | Andy's import boundary for the current local scoping work |
| `snapshots/2026-10-04-main-c41d423/` | Frozen copy of every contributor folder at integration start |

## Source and snapshot rule

- Continue active work in the existing contributor folders.
- Treat `snapshots/` as immutable evidence of the starting point.
- Port reviewed outputs into the product through a documented contribution
  contract; do not edit a frozen copy into a new source of truth.
- The product may explain or combine modules. It must not upgrade illustrative,
  assumed, restricted or missing evidence into fact.

## Current product story

Basel is already working on the Sponge City. The product therefore starts from
a more specific question: what does the evidence permit us to do at one place?

The MVP connects six bounded steps:

1. **Find** a candidate signal.
2. **Classify** the evidence.
3. **Gate** the decision where evidence is missing or restricted.
4. **Observe** what people can responsibly verify.
5. **Explore** a possible intervention and its mechanism.
6. **Decide** the next investigation, not construction.

The first live integration case is Klybeck. It remains
`requires-investigation`.
