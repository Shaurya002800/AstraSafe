export function buildRecordingPlan(snapshot) {
  return {
    targetDurationSeconds: 240,
    title: "4-minute demo recording plan",
    openingLine:
      "Industrial accidents are chains, not moments. AstraSafe detects the chain before the alarm.",
    closingLine:
      "The accident never happened because the system connected weak signals early enough to prevent it.",
    scenes: [
      {
        id: "opening_problem",
        timeRange: "0:00-0:25",
        screen: "Command Center normal state",
        action: "Start from the default view before clicking Play Scenario.",
        narration:
          "Plants already have sensors, permits, cameras and logs, but weak signals are often disconnected."
      },
      {
        id: "weak_signals",
        timeRange: "0:25-1:20",
        screen: "Plant map and event stream",
        action: "Click Play Scenario and let the weak signals appear one by one.",
        narration:
          "Gas is rising below threshold, ventilation is delayed, hot work becomes active and workers enter Zone C."
      },
      {
        id: "prevention_moment",
        timeRange: "1:20-1:55",
        screen: "Risk score and operational metrics",
        action: "Click Jump to Prevention.",
        narration: `AstraSafe reaches risk ${snapshot.risk.score} while the single-sensor baseline is still silent, gaining ${snapshot.metrics.leadTimeMinutes} minutes.`
      },
      {
        id: "causal_reasoning",
        timeRange: "1:55-2:35",
        screen: "Causal Pathway and Knowledge Graph",
        action: "Scroll to the causal pathway and knowledge graph panels.",
        narration:
          "The system connects worker exposure, hot work, rising gas, degraded ventilation and incident memory into one pathway."
      },
      {
        id: "counterfactual",
        timeRange: "2:35-3:10",
        screen: "Counterfactual Replay",
        action: "Show no-action risk versus recommended intervention risk.",
        narration: `No action reaches ${snapshot.metrics.noActionFinalRisk}. The recommended intervention drops risk to ${snapshot.metrics.actionFinalRisk}.`
      },
      {
        id: "evidence_and_evaluation",
        timeRange: "3:10-3:45",
        screen: "Prevention Report, Benchmark Suite and Submission Readiness",
        action: "Show evidence report, benchmark metrics and readiness mapping.",
        narration:
          "Every claim is linked to evidence, and the benchmark shows the system generalizes beyond one scripted alert."
      },
      {
        id: "close",
        timeRange: "3:45-4:00",
        screen: "Pitch Pack",
        action: "End on the Pitch Pack or Command Center.",
        narration:
          "This is not emergency response. This is emergency prevention: before the alarm, before the accident."
      }
    ],
    recordingChecklist: [
      "Use Jump to Prevention if the live playback takes too long.",
      "Show risk score 86, lead time 21 min and baseline silent.",
      "Show the graph path and permit status Unsafe after issue.",
      "Show no-action 100/100 versus intervention 18/100.",
      "Show the prevention report before closing.",
      "Do not claim autonomous shutdown; say decision-support for safety officers."
    ]
  };
}
