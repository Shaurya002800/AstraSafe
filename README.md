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

For hosted environments:

```bash
npm start
```

## Test

```bash
npm test
```

## What Is Implemented

- Deterministic synthetic plant simulator.
- Explainable compound risk engine using the weighted model from the project plan.
- Single-sensor baseline comparator.
- API-style snapshot endpoints for world state, risk, futures and reports.
- Permit intelligence that detects when a previously valid hot-work permit becomes unsafe after live context changes.
- Incident memory retrieval with near-miss and SOP matches.
- Live knowledge graph context that links workers, zones, permits, sensors, equipment and incident memory.
- Safety officer action checklist.
- Benchmark suite covering multiple compound-risk scenarios and baseline comparison.
- Submission readiness API mapping the prototype to hackathon judging criteria and deliverables.
- Pitch pack API and copyable demo brief for deck/video preparation.
- Timed demo recording plan for a 4-minute submission video.
- Evidence bundle API and export controls for audit-ready prevention evidence.
- Integration adapter contracts for SCADA, permits, CCTV metadata, maintenance, shifts and incident memory.
- Response orchestration workflow for safety officer approval, dispatch messages and evidence preservation.
- Safety governance model card covering intended use, limits, privacy, validation and production gates.
- Causal factor evidence with event IDs.
- Counterfactual future simulator for no-action and intervention futures.
- Intervention ranking based on projected risk reduction, response speed, confidence, reversibility and disruption.
- Prevention report generator with confirmed facts, predictions, recommended actions and uncertainty.
- Judge-facing command-center UI.

## API Endpoints

Use `step=6` to inspect the prevention moment.

```bash
curl http://127.0.0.1:4173/api/health
curl "http://127.0.0.1:4173/api/world/current?step=6"
curl "http://127.0.0.1:4173/api/risk/current?step=6"
curl "http://127.0.0.1:4173/api/futures/simulate?step=6"
curl "http://127.0.0.1:4173/api/intelligence/permit?step=6"
curl "http://127.0.0.1:4173/api/intelligence/memory?step=6"
curl "http://127.0.0.1:4173/api/graph/context?step=6"
curl "http://127.0.0.1:4173/api/reports/latest?step=6"
curl "http://127.0.0.1:4173/api/evidence/bundle?step=6"
curl "http://127.0.0.1:4173/api/integrations/adapters?step=6"
curl "http://127.0.0.1:4173/api/orchestration/response?step=6"
curl "http://127.0.0.1:4173/api/governance/model-card?step=6"
curl http://127.0.0.1:4173/api/evaluation/summary
curl http://127.0.0.1:4173/api/evaluation/benchmark
curl http://127.0.0.1:4173/api/submission/readiness
curl http://127.0.0.1:4173/api/submission/pitch-pack
curl http://127.0.0.1:4173/api/submission/recording-plan
```

## Safety Positioning

AstraSafe is a decision-support and prevention intelligence layer. It does not replace SCADA interlocks, certified safety systems or trained safety officers. In production, high-impact actions such as permit pause, evacuation and shutdown require human approval.

## Submission Assets

- `docs/demo_script.md` - narration and flow for the demo video.
- `docs/pitch_deck.md` - slide-by-slide content for the final deck.
- `docs/final_submission_checklist.md` - upload checklist for repository, demo, deck and deployed app.
- `docs/deployment_guide.md` - Render/local deployment steps and smoke checks.
- `render.yaml` - Render web-service blueprint.
