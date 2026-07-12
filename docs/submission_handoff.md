# AstraSafe Final Submission Handoff

## Final Links

- Live prototype: https://astrasafe-ai.onrender.com
- Source repository: https://github.com/Shaurya002800/AstraSafe/tree/shaurya/demo-cli-flow
- Pitch deck: `outputs/AstraSafe_AI_Hackathon_Pitch.pptx`
- Narrated demo video: `outputs/AstraSafe_Demo_Video.mp4`
- Narration master: `outputs/AstraSafe_Demo_Narration.aiff`
- Architecture: `docs/assets/architecture.svg`
- Evaluation report: `docs/evaluation_report.md`

## Submission Title

```text
AstraSafe AI - Causal Safety Twin for Zero-Harm Industrial Operations
```

## Short Description

```text
AstraSafe AI is a causal safety twin that connects weak signals across sensors, permits, workers, equipment, shift state and incident memory to detect accident pathways before traditional threshold alarms trigger. In the deterministic demo scenario, it identifies a critical pre-incident state 21 minutes before the single-sensor gas alarm, explains the causal chain and recommends the smallest verified intervention with human approval for high-impact actions.
```

## Innovation Statement

```text
Unlike conventional safety dashboards that monitor isolated thresholds, AstraSafe models how individually weak signals combine into an accident pathway. It joins compound risk scoring, relationship-graph context, counterfactual future replay and evidence-linked intervention ranking in one auditable decision-support workflow.
```

## Honest Validation Boundary

```text
The current prototype uses deterministic synthetic industrial scenarios so judges can replay and inspect its behavior. It demonstrates implemented causal reasoning, explainability and intervention logic; it does not claim real-plant accuracy, regulatory certification or replacement of certified safety systems.
```

## Verified Proof Points

- Critical prevention state: `86/100`.
- Traditional threshold baseline: `Silent`.
- Prevention lead time: `21 minutes`.
- No-action future: `100/100`.
- Recommended-action future: `18/100`.
- Projected risk reduction: `82 points`.
- Benchmark: `4` deterministic scenarios, `100%` AstraSafe detection and `75%` threshold detection.
- Automated verification: `22/22` tests passing.
- Narrated video: `3 minutes 30 seconds`, H.264/AAC MP4.

## Final Demo Order

1. Open the live prototype and state the disconnected-signal problem.
2. Show the normal baseline with the traditional alarm silent.
3. Select `Jump to Prevention`.
4. Explain the `86/100` causal pathway and seven evidence links.
5. Compare the `100/100` no-action future with the `18/100` intervention future.
6. Show permit intelligence, incident memory and human approval controls.
7. Close on the benchmark, safety boundary and 21-minute prevention lead time.
