# AstraSafe Product Walkthrough

## What AstraSafe Does

AstraSafe watches several weak safety signals together. A gas reading may still be below its alarm limit, but it becomes dangerous when hot work is active, ventilation is delayed, workers are exposed and a shift handover reduces response capacity.

The prototype connects those facts, calculates compound risk, explains the accident pathway and compares what happens with and without intervention.

## Main Demo Flow

1. The scenario begins at `10:30` with normal monitoring.
2. Select `Play scenario` to reveal each weak signal in time order.
3. Select `Jump to prevention` to move directly to the critical state at `10:45`.
4. AstraSafe shows `86/100` risk while the traditional gas threshold remains silent.
5. The causal pathway explains which signals created the risk.
6. Counterfactual replay compares `100/100` no-action risk with `18/100` after intervention.
7. The response workspace shows permit changes, officer actions and approval gates.
8. The evidence workspace exposes events, graph relationships, incident memory and the audit report.

## Interface Sections

### Live Causal Twin

The Three.js scene is the plant situation in visual form. It contains the coke oven, Gas Sensor G7, Ventilation Fan VF-2, Hot Work Permit HW-204 and workers in Zone C.

- The gas cloud appears when the gas trend rises.
- Workers appear when camera metadata detects exposure.
- Hot-work sparks appear when the permit is active.
- The fan status changes when maintenance delays ventilation.
- Zone C changes from green to amber or red as compound risk increases.

### Compound Risk

The right side explains the total risk score. It separates the score into sensor anomaly, permit conflict, worker exposure, equipment degradation, incident-memory similarity, shift vulnerability and evacuation constraint.

The score is deterministic. Free-form AI text does not decide the number.

### Prevention Proof

The proof strip shows the five numbers judges need immediately:

- Prevention lead time.
- Traditional threshold status.
- Projected risk reduction.
- Number of evidence links.
- Current prevention risk and prototype readiness.

### Causal Pathway

This is the ordered explanation of how the accident forms. Every step is linked to an event ID, so the explanation can be audited.

### Counterfactual Replay

This compares two futures:

- `No action` shows the accident pathway continuing to `100/100` risk.
- `Recommended action` pauses hot work, clears workers and restores ventilation, reducing risk to `18/100`.

### Response Workspace

- **Permit intelligence** re-checks whether HW-204 remains safe as conditions change.
- **Action checklist** gives the safety officer a clear response sequence.
- **Response orchestration** identifies who must approve or confirm high-impact actions.

### Evidence Workspace

- **Event stream** shows the source signals in time order.
- **Knowledge graph** shows relationships between workers, equipment, permits and hazards.
- **Incident memory** retrieves similar near misses and operating procedures.
- **Prevention report** creates a readable evidence-backed explanation.
- **Audit bundle** packages the decision as JSON for review or integration.

### Validation Workspace

- **Baseline comparison** proves AstraSafe alerts before the single-sensor threshold.
- **Benchmark suite** replays four deterministic synthetic scenarios against two simpler baselines.
- **Model card** explains intended use, limitations and human oversight.

### System Workspace

- **Plant adapters** define future SCADA, permit, CCTV, maintenance, roster and incident-data contracts.
- **Prototype readiness** maps implemented evidence to judging criteria.
- **Demo brief and storyboard** preserve the final presentation flow.

## Important Safety Boundary

This is a hackathon decision-support prototype using deterministic synthetic scenarios. It does not replace certified interlocks, SCADA controls or trained safety officers. Real deployment requires plant integrations, site calibration, domain-expert validation, cybersecurity review and regulatory approval.
