# Evaluation Plan

## Demo Baselines

| Scenario | Single-sensor alert | AstraSafe alert | Lead time gained |
| --- | --- | --- | --- |
| Gas + hot work + workers + fan maintenance | 11:06 | 10:45 | 21 minutes |

## Metrics Shown In Prototype

- Prediction lead time: AstraSafe alerts before the 100 ppm traditional gas threshold.
- False-negative reduction: the single-sensor baseline is silent at the prevention moment.
- Compound evidence quality: every causal factor links to an event ID or source ID.
- Intervention effectiveness: no-action future reaches 100 risk while the targeted intervention drops risk to 18.
- User response clarity: the prevention report separates confirmed evidence, prediction, recommended action and uncertainty.

## Judge-Safe Claims

- AstraSafe is a decision-support layer for safety officers.
- The demo uses synthetic but realistic industrial events.
- Real deployment requires site-specific validation, certified safety governance and human approval gates for high-impact actions.
