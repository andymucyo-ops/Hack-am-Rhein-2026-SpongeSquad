# Connected Case — Information Design

Status: parallel design specification  
Owner: Achim  
Scope: `wrapper/achim/**` only  
Example: illustrative Klybeck street edge

## Product sentence

The candidate map identifies **where to look**. Achim's system shows **what must become known before a real intervention decision is defensible**.

This is not a dashboard of seven tools. It is one evidence-preserving journey in which independent modules answer different questions.

## Audience outcome

After ninety seconds, a viewer should understand:

1. Klybeck is a promising investigation area, not a validated construction site.
2. Open data can support screening but cannot answer every street-scale question.
3. Missing evidence has different kinds, owners and next actions.
4. A field observation can add evidence without pretending to reveal the subsurface.
5. A rain-garden scenario can explain a mechanism without becoming an engineering recommendation.
6. The product output is a bounded next decision: investigate, request, test, pause or exclude.

## Primary journey

```text
SIGNAL       Candidate area worth investigating
  ↓
EVIDENCE     Known, derived, assumed, restricted and missing claims
  ↓
GATE         Blockers that prevent design or recommendation
  ↓
OBSERVE      What a responsible street visit could establish
  ↓
EXPLORE      One intervention mechanism, explicitly illustrative
  ↓
DECIDE       A named next action with owner and evidence requirement
```

The journey is linear for presentation, but the underlying modules remain independent and linkable.

## Screen hierarchy

### Layer 1 — The proposition

Show only:

- Klybeck candidate identity;
- why it merits investigation;
- current decision state: `requires-investigation`;
- the sentence: **A signal is not yet a site.**

Do not lead with the module catalogue. Lead with the problem and the current state.

### Layer 2 — The connected case

The main visual is a six-stage decision path. One stage is active at a time. Each stage contains:

- one question;
- one answer in plain language;
- one evidence-state label;
- one output handed to the next stage;
- one link to inspect the responsible module.

The stage navigation is the presentation spine. It must work with keyboard, pointer and narrow screens.

### Layer 3 — Evidence drawer

Every stage can reveal its evidence drawer. The drawer answers:

| Field | User-facing question |
|---|---|
| claim | What are we saying? |
| evidence class | How do we know? |
| source | Where did it come from? |
| validation | Has it been checked? |
| permitted use | What may this support? |
| limitation | What must we not conclude? |
| gatekeeper | Who can unlock the missing evidence? |
| next action | What happens next? |

This is progressive disclosure: provenance is always available but never allowed to bury the narrative.

### Layer 4 — Module landscape

The seven module cards move below the connected case. They are the architecture appendix, not the opening experience.

Each card shows:

- the question the module owns;
- its input and output contract;
- its maturity: working, experiment, knowledge model or missing;
- whether it contributes evidence, constraints, observations, candidates, scenarios or explanation.

## Stage design

### 1. Signal — Candidate finder

**Question:** Why look here?  
**Visible answer:** High sealing and low canopy make this edge worth investigating.  
**Boundary:** Candidate scores are screening signals, not street facts.  
**Handoff:** Identity, coordinates, source references, constraints and open questions.

### 2. Evidence — Data Charter

**Question:** What kind of knowledge is available?  
**Visible answer:** Some claims are sourced, some derived, some restricted and some not measured.  
**Boundary:** Relevance does not prove analytical or engineering fitness.  
**Handoff:** Evidence class, permitted use, limitation and access route.

### 3. Gate — Street X-Ray

**Question:** What blocks a real decision?  
**Visible answer:** Visible space is not the same as buildable space.  
**Boundary:** Utilities, drainage, infiltration and ownership remain unresolved.  
**Handoff:** Named blockers with gatekeepers and investigation actions.

### 4. Observe — Rain Walk

**Question:** What can a person responsibly add?  
**Visible answer:** Curbs, drains, surfaces, planting and obstructions can be observed and reviewed.  
**Boundary:** A walk cannot establish utilities, contamination, groundwater or infiltration.  
**Handoff:** An observation plan first; completed evidence only after an actual visit.

### 5. Explore — Catalogue + Street Lab

**Question:** What change is worth exploring, and how would it work?  
**Visible answer:** A kerbside rain garden could redirect, slow and temporarily store runoff.  
**Boundary:** The 384 m² footprint and the scenario are illustrative. The 7.68 m³ value is rainfall on the assumed footprint, not retained capacity.  
**Handoff:** Candidate intervention, dependencies, illustrative scenario and model limits.

### 6. Decide — Decision packet

**Question:** What is the next defensible move?  
**Visible answer:** Continue investigation; do not recommend construction.  
**Actions:**

- request utility clearance;
- confirm drainage routing;
- commission infiltration testing;
- plan a bounded field observation;
- pause or exclude the intervention if evidence conflicts.

## Evidence language

Use a small, consistent vocabulary throughout the page:

| State | Meaning | Visual treatment |
|---|---|---|
| known | Directly supported by an identified source | green, solid |
| derived | Deterministically calculated from cited inputs | blue-green, solid |
| observed | Recorded in the field with review history | blue, solid |
| assumed | Chosen to construct the illustrative case | amber, dashed |
| modelled | Produced by an explicit model or scenario | violet, dashed |
| restricted | Exists but requires a gatekeeper or lawful access path | rust, locked |
| missing | Not yet available or not yet measured | grey, open |
| conflicting | Evidence disagrees and blocks progression | red, split |

Never use colour alone. Always pair it with the state word and, where useful, an icon or line style.

## Visual grammar

The page should feel like a decision instrument, not a marketing landing page.

- Keep the existing restrained green/paper palette.
- Use one strong visual axis for the six-stage journey.
- Show evidence as small labelled records, not decorative metric cards.
- Reserve maps and rich visuals for spatial claims.
- Reserve diagrams for dependencies and water pathways.
- Use whitespace to separate evidence, assumptions and actions.
- Avoid aggregate readiness scores, traffic-light verdicts and false precision.

## Placement of Simon and Bala

### Simon's visual artefact

Treat it as a **visual entry point**, not the application shell or evidence source.

For V1 it can appear in a framed iframe inside the Explore stage, with:

- a clear title;
- an `Illustrative visualisation` label;
- a short statement of what data it receives;
- a fallback link to open it independently;
- a boundary note explaining what it does not validate.

### Bala's playground

Treat it as a **replaceable explanation surface** that can consume the same connected-case object.

It may visualise:

- why a site is being investigated;
- known versus missing evidence;
- the water pathway;
- the next decision.

It must not become a second source of facts or silently create new claims.

## Data-to-interface projection

The eventual page should consume the connected-case contract through a thin projection function:

```text
connected case JSON
  → validate schema/version
  → project six presentation stages
  → render summary + evidence drawer + actions
  → link to independent modules and visual artefacts
```

The page should not know how source modules calculate their results. It only needs their stable claim IDs, evidence states, labels, limitations and links.

Expected view model:

```js
{
  caseTitle,
  locationLabel,
  decisionState,
  summary,
  stages: [{
    id,
    verb,
    question,
    answer,
    evidenceState,
    claims,
    output,
    moduleLink,
    visualLink
  }],
  nextActions: [{ action, owner, blockedBy, evidenceNeeded }]
}
```

This is a view model, not a second canonical data format. It should be derived at runtime from Claude's versioned connected-case object.

## Responsive behaviour

- Desktop: stage rail plus active-stage detail and evidence drawer.
- Tablet: three-by-two stage grid or horizontally scrollable rail.
- Mobile: vertical stepper; one expanded stage; evidence drawer below it.
- iframe visual: fixed aspect-ratio container with an external-open fallback.
- The decision state and next action remain visible without horizontal scrolling.

## Presentation mode

For the five-minute demonstration, support a simple guided sequence:

1. the signal;
2. why the signal is insufficient;
3. the three blockers;
4. what citizens can observe;
5. what the visual scenario teaches;
6. the bounded next move.

The presenter should be able to advance stages with arrow keys. The page should never auto-advance.

## Integration acceptance

The final implementation is ready when:

- it reads the generated connected-case object rather than duplicating its facts;
- changing a claim state in the case changes the visible label;
- every blocker has a gatekeeper or explicitly says that none is known;
- assumptions cannot visually appear as sourced facts;
- Rain Walk shows an observation plan unless real observations exist;
- 7.68 m³ is never labelled as retained volume;
- the final state remains `requires-investigation`;
- Simon's and Bala's surfaces are clearly framed as visual/explanation modules;
- no file outside `wrapper/achim/**` is required for the initial implementation branch.

## Implementation sequence after Claude's PR

1. Review the connected-case schema and generated Klybeck object.
2. Map contract fields to the view model without copying source facts.
3. Refactor `wrapper/achim/index.html` around the connected case as the primary experience.
4. Add evidence drawers and next-action ownership.
5. Add the visual iframe as an optional Explore-stage panel.
6. Test keyboard navigation, mobile layout, missing values and unsupported schema versions.
7. Open a separate Achim-only PR for review; do not merge automatically.
