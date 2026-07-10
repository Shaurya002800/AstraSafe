# AstraSafe AI Pitch Deck

## Slide 1 - Title

**AstraSafe AI: Causal Safety Twin for Zero-Harm Industrial Operations**

Accidents are chains, not moments. AstraSafe detects the chain before the alarm.

## Slide 2 - Problem

Industrial safety systems often react to threshold breaches after risk is already obvious.

In high-risk plants, dangerous events can form from weak signals:

- Rising but sub-threshold gas levels.
- Delayed ventilation maintenance.
- Hot-work permits becoming unsafe after issue.
- Workers entering a changing hazard zone.
- Shift handover reducing response availability.

Each signal looks manageable alone. Together, they form an accident pathway.

## Slide 3 - Solution

AstraSafe AI connects live plant context into a causal safety twin.

It combines:

- Sensor trend intelligence.
- Permit context.
- Worker exposure.
- Equipment state.
- Shift state.
- Incident memory.
- Counterfactual intervention simulation.

The output is not just an alert. It is an explainable prevention recommendation.

## Slide 4 - Demo Scenario

**The Accident That Never Happened**

In Zone C:

- Gas Sensor G7 rises but stays below the traditional alarm threshold.
- Ventilation Fan VF-2 is delayed.
- Hot Work Permit HW-204 is active.
- Three workers enter the zone.
- Shift handover begins.

AstraSafe detects the pathway at `10:45`.

The traditional gas alarm would trigger at `11:06`.

## Slide 5 - Key Result

**21 minutes of prevention lead time**

At the prevention moment:

- AstraSafe risk score: `86/100`.
- Traditional single-sensor baseline: `Silent`.
- No-action future: `100/100`.
- Recommended-action future: `18/100`.
- Projected risk reduction: `82 points`.

## Slide 6 - Why It Is Different

Traditional alarms ask:

> Has one signal crossed a threshold?

AstraSafe asks:

> Is an accident pathway forming across multiple systems?

The system explains the causal path:

Gas trend + delayed fan + active hot work + worker exposure + shift handover.

## Slide 7 - Product Experience

The command-center UI shows:

- Live plant state.
- Compound risk score.
- Causal pathway explanation.
- Knowledge graph context.
- Counterfactual replay.
- Permit intelligence.
- Similar near-miss memory.
- Safety officer action checklist.
- Evidence bundle export.

## Slide 8 - Technical Architecture

AstraSafe is modular:

- Synthetic plant simulator.
- Deterministic causal risk engine.
- Counterfactual future simulator.
- Knowledge graph context builder.
- Permit and incident-memory intelligence.
- Response orchestration workflow.
- Evidence bundle generator.
- API layer for every major output.

This makes the prototype explainable, inspectable and ready to replace synthetic data with real plant adapters.

## Slide 9 - Safety and Governance

AstraSafe is a decision-support layer.

It does not replace certified safety systems, SCADA interlocks or trained safety officers.

High-impact actions require human approval:

- Permit pause.
- Evacuation.
- Shutdown recommendations.

The current prototype is pilot-only and uses synthetic scenario data.

## Slide 10 - Business Impact

AstraSafe helps plants move from reactive safety to preventive operations.

Potential value:

- Fewer near misses and incidents.
- Less unplanned downtime.
- Faster safety officer decisions.
- Better audit evidence.
- Targeted interventions instead of broad shutdowns.

## Slide 11 - Hackathon Deliverables

Implemented:

- Working prototype.
- API endpoints.
- Evaluation summary.
- Benchmark suite.
- Evidence bundle.
- Integration adapter contracts.
- Governance model card.
- Demo script and recording plan.

## Slide 12 - Closing

**AstraSafe AI predicts the accident pathway before the accident exists.**

It gives safety teams the time, evidence and recommended action needed to prevent harm.
