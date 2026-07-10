# Final Submission Checklist

Use this checklist before uploading the project to the hackathon portal.

## Required Links

- GitHub repository link.
- Public deployed app link.
- Demo video link.
- Pitch deck file or deck link.

## Repository Check

```bash
npm test
git status --short
```

Expected:

- Tests pass.
- Working tree is clean.

## Demo App Check

Run locally:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:4173
```

Verify:

- `Jump to Prevention` shows risk `86`.
- Prediction lead time is `21 min`.
- Single-sensor baseline is `Silent`.
- Counterfactual replay shows no action reaching `100/100`.
- Recommended action reaches `18/100`.
- Permit HW-204 is marked unsafe after context changes.
- Evidence bundle can be copied or downloaded.

## API Check

```bash
curl http://127.0.0.1:4173/api/health
curl "http://127.0.0.1:4173/api/risk/current?step=6"
curl "http://127.0.0.1:4173/api/evaluation/benchmark"
curl "http://127.0.0.1:4173/api/submission/readiness"
```

## Demo Video Flow

Use `docs/demo_script.md` or the in-app recording panel.

Recommended structure:

1. Start with the problem: threshold alarms are too late.
2. Show normal monitoring.
3. Click `Jump to Prevention`.
4. Explain the causal chain.
5. Show baseline silent vs AstraSafe alert.
6. Show counterfactual risk reduction.
7. Show permit intelligence and near-miss memory.
8. Show evidence bundle and governance.
9. Close with the 21-minute prevention lead-time result.

## Pitch Deck

Use `docs/pitch_deck.md` as the slide content source.

Keep the final deck clean:

- One idea per slide.
- Large screenshots from the actual app.
- No overclaiming about production deployment.
- Clear result slide with `21 min lead time` and `82 point risk reduction`.

## Submission Wording

Suggested short description:

```text
AstraSafe AI is a causal safety twin for industrial plants. It connects weak signals across sensors, permits, workers, equipment, shift state and incident memory to detect accident pathways before traditional threshold alarms trigger. In the demo scenario, AstraSafe identifies a critical pre-incident state 21 minutes before the single-sensor gas alarm, explains the causal chain and recommends the smallest verified intervention.
```

Suggested safety note:

```text
This prototype is a decision-support layer for safety officers. It does not replace certified interlocks, SCADA controls or human approval for high-impact actions.
```
