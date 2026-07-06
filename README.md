# AstraSafe AI - Causal Safety Twin

AstraSafe AI is a hackathon prototype for ET AI Hackathon 2.0 Problem Statement 1: AI-powered industrial safety intelligence for zero-harm operations.

The core thesis is simple: accidents are chains, not moments. AstraSafe connects weak signals across sensors, permits, workers, equipment, shift state and incident memory, then predicts the accident pathway before a traditional threshold alarm fires.

## Demo Scenario

The included scenario is **The Accident That Never Happened**:

- Gas Sensor G7 in Zone C begins rising but remains below the traditional alarm threshold.
- Ventilation Fan VF-2 is delayed in maintenance.
- Hot Work Permit HW-204 becomes active in the same zone.
- Three workers enter Zone C.
- A shift handover starts, reducing response availability.
- AstraSafe detects the compound pathway and recommends pausing the permit, evacuating Zone C and restoring VF-2.

## Run

```bash
npm run dev
```

Open `http://localhost:4173`.

## Test

```bash
npm test
```

## What Is Implemented

- Deterministic synthetic plant simulator.
- Explainable compound risk engine using the weighted model from the project plan.
- Single-sensor baseline comparator.
- Causal factor evidence with event IDs.
- Counterfactual future simulator for no-action and intervention futures.
- Intervention ranking based on projected risk reduction, response speed, confidence, reversibility and disruption.
- Prevention report generator with confirmed facts, predictions, recommended actions and uncertainty.
- Judge-facing command-center UI.

## Safety Positioning

AstraSafe is a decision-support and prevention intelligence layer. It does not replace SCADA interlocks, certified safety systems or trained safety officers. In production, high-impact actions such as permit pause, evacuation and shutdown require human approval.
