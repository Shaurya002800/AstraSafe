# Demo Script - The Accident That Never Happened

## 4-Minute Flow

### 0:00-0:25 Problem

Industrial sites already have sensors, permits, cameras and logs, but accidents still form when weak signals remain disconnected.

### 0:25-0:55 Baseline

Open AstraSafe at the normal state. Gas Sensor G7 is below the 100 ppm threshold, so a traditional single-sensor alarm is silent.

### 0:55-1:40 Accident Chain Forms

Play the scenario. Point out the weak signals as they appear:

- Gas trend rising below threshold.
- Ventilation Fan VF-2 maintenance delay.
- Hot Work Permit HW-204 active in Zone C.
- Three workers detected inside Zone C.
- Shift handover begins.

### 1:40-2:30 AstraSafe Explains Why

Jump to prevention. Show risk score 86 and the causal pathway panel. The key line is:

> AstraSafe is not reacting to one dangerous reading. It is detecting the chain.

### 2:30-3:20 Counterfactual Replay

Show no-action future reaching 100/100 risk and the recommended intervention dropping risk to 18/100.

### 3:20-3:50 Evidence Report

Show the prevention report with event IDs and the baseline comparison. Emphasize that the LLM-style narrative is grounded in deterministic evidence.

### 3:50-4:00 Close

Before the alarm. Before the accident. AstraSafe turns industrial safety from emergency response into emergency prevention.

## Judge Questions To Be Ready For

- Is this using real plant data?  
  This prototype uses deterministic synthetic data, built so the judges can replay and evaluate the accident pathway.

- Is the AI deciding to shut down the plant?  
  No. AstraSafe is a decision-support layer. High-impact actions require a safety officer approval gate.

- What is technically differentiated?  
  The combination of compound risk scoring, plant relationship graph, counterfactual future replay and evidence-linked intervention ranking.

- How do you measure success?  
  Lead time gained, false-negative reduction against single-sensor baselines, risk reduction after intervention and evidence completeness.
