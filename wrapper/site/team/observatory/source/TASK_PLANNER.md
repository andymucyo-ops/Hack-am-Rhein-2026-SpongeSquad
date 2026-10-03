# Task Planner

The task planner is repository-native even though active task records are GitHub Issues.

Why Issues: durable URLs, comments, assignees, history, closure, and shared visibility for humans and agents.

## Task types

### `[TASK]`

A concrete shared outcome. State the observable outcome, why it matters now, acceptance/evidence, and likely repo area.

### `[EXPERIMENT]`

A cheap test designed to change our mind before more build investment. State hypothesis, cheapest useful test, result/evidence, and implication.

### `[DECISION]`

Use sparingly for consequential choices. If it becomes actual team coordination truth, also reflect it in `.observstory/coordination.json` after explicit agreement.

## Working rule

Question → proposition → discussion → smallest useful task or experiment.

Do not turn every idea into a ticket.

## Browser scratchpad

The Pages Task Planner has a local “My current focus” field. It is deliberately not shared state. Anything another person must rely on belongs in the repo or an Issue.
