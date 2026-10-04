# Andy contribution dock

This is the landing zone for Andy's current local site-scoping and map work.
The product already works with the repository snapshot; Andy can replace that
handoff without changing the rest of the journey.

## What to add

Create a self-contained contribution under:

```text
product/contributions/andy/current/
```

Preferred entry point:

```text
product/contributions/andy/current/index.html
```

Static assets may live beside it. If the contribution needs a build step, add
its own `package.json` and document the command here before changing the shared
website builder.

## Minimal handoff

The product needs one selected candidate expressed as:

```json
{
  "contract": "candidate-site-context/v1",
  "candidateId": "stable-id",
  "name": "Human-readable place",
  "coordinates": [7.0, 47.0],
  "coordinateUse": "identity-context-only",
  "sourceRefs": [],
  "constraints": [],
  "evidenceQuestions": []
}
```

Rules:

- Candidate scores are screening signals, not measured street facts.
- Coordinates identify the candidate; they do not establish geometry.
- Unknown values stay unknown and never become zero, safe or suitable.
- Include provenance for every data-backed claim.
- Keep local-only or restricted data out of the repository.

## Integration checklist

1. Add the local app under `current/`.
2. Add or export one contract fixture.
3. Record source and licence information.
4. Verify relative links from a subpath deployment.
5. Run `cd wrapper && npm test`.
6. Update `product/data/product-manifest.json` only when the new entry point is
   ready to replace the snapshot.
