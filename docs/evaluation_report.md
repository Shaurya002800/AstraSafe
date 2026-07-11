# AstraSafe AI Evaluation Report

## Evaluation Boundary

This report describes deterministic synthetic scenario replay in the hackathon prototype. It demonstrates whether the implemented logic behaves as designed under authored industrial scenarios. It does not claim real-plant accuracy, production reliability or regulatory certification.

## Compared Systems

1. **Single-sensor threshold baseline** - alerts only when an individual reading crosses its configured threshold.
2. **Two-factor static rule baseline** - alerts when a fixed pair of conditions is present, without full plant context.
3. **AstraSafe compound causal engine** - combines trend, permit, worker, equipment, shift, geospatial and incident-memory context.

## Summary Results

| Metric | Prototype result |
| --- | ---: |
| Synthetic scenarios | 4 |
| AstraSafe pathway detection | 4 / 4 (100%) |
| Single-sensor threshold detection | 3 / 4 (75%) |
| Two-factor static rule detection | 3 / 4 (75%) |
| Average lead time where a threshold eventually fires | 22 minutes |
| Average projected risk reduction | 57 points |
| Evidence links across scenarios | 24 |

## Scenario Results

| Scenario | AstraSafe | Static rule | Threshold | Lead time / outcome | Risk change |
| --- | ---: | ---: | ---: | --- | ---: |
| Gas + hot work + workers + fan maintenance | 10:45 | 10:51 | 11:06 | 21 min | 86 to 18 |
| Confined space + oxygen trend + supervisor absent | 11:02 | 11:10 | 11:24 | 22 min | 82 to 24 |
| Forklift route + blind corner + worker crowding | 14:11 | No alert | No alert | Compound risk detected | 74 to 29 |
| Incomplete isolation + startup permit | 16:18 | 16:27 | 16:40 | 22 min | 79 to 23 |

## Primary Demonstration

At `10:45`, AstraSafe identifies the Zone C pathway at `86/100` while Gas Sensor G7 remains below the traditional `100 ppm` alarm threshold. The evidence chain contains the rising gas trend, delayed ventilation, active hot-work permit, three exposed workers, shift handover and similar near-miss context.

The deterministic counterfactual replay projects:

- **No action:** risk reaches `100/100`.
- **Targeted intervention:** risk reaches `18/100`.
- **Projected reduction:** `82 points`.

The recommended intervention is to pause HW-204, evacuate Zone C and restore VF-2. High-impact actions remain subject to human approval.

## Calculation Rules

- Detection rate = detected scenarios / total scenarios.
- Lead time = traditional threshold alert time - AstraSafe alert time.
- Risk reduction = no-action projected risk - intervention projected risk.
- Average lead time excludes scenarios where the traditional baseline never alerts.

## Reproducibility

Run the automated checks:

```bash
npm test
```

Inspect the machine-readable benchmark:

```bash
curl http://127.0.0.1:4173/api/evaluation/benchmark
```

The scenario definitions and aggregate calculations are implemented in `src/domain/benchmark.js` and covered in `tests/risk-engine.test.js`.

## Limitations

- Scenario outcomes are synthetic and authored for deterministic replay.
- CCTV is represented as metadata, not live video inference.
- Integration adapters define contracts but are not connected to a real plant.
- Risk weights require site-specific calibration and safety-expert validation.
- Counterfactual outputs are scenario-model projections, not certified physical-process simulations.
