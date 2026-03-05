# VERIFICATION_GATE.md — Layer 3: The Checkpoint

**Authority Level**: STANDING ORDER (implements CONSTITUTION.md Article V)
**Created**: 2026-03-04 | **Version**: 1.0 (Horizon 2)
**Purpose**: Verify every subtask output for directive compliance before delivery.
**This protocol cannot be compressed, summarized, or omitted.**

---

## 1. Why This Exists

Layer 2 (the Injection Protocol) ensures directives are transmitted to subtasks. But transmission does not guarantee compliance. A subtask might receive the directives and still produce output that contradicts them — through misinterpretation, hallucination, or simple error.

The Verification Gate is **Layer 3** — the checkpoint that catches non-compliance before Tim ever sees the output. It implements the principle of **AI-reviewing-AI**: a fresh verification pass that examines the output against the directives with "fresh eyes."

> **Principle**: No subtask output reaches Tim without passing through the Verification Gate. The gate is the last line of defense before delivery.

---

## 2. The Three-Step Gate Process

Every subtask output passes through three steps before delivery:

### Step 1: EXTRACT — Identify Directive-Sensitive Content

Scan the subtask output and extract every element that could potentially relate to a standing directive. This includes:

| Element Type | What to Look For | Example |
|:-------------|:----------------|:--------|
| **Tool/service recommendations** | Any tool, platform, or service mentioned | "We recommend ElevenLabs for voice synthesis" |
| **Cost decisions** | Any spending, pricing, or resource allocation | "This plan costs $50/month for hosting" |
| **Architecture decisions** | Any structural or design choices | "We'll use a flat avatar design" |
| **Communication tone** | Any language or style choices | Formal corporate language in an email draft |
| **Build approach** | MVP vs. MVD philosophy | "We'll ship a minimal version first" |
| **Governance assumptions** | Any decision-making or escalation patterns | "This should go straight to Tim for approval" |
| **Visual style** | Any design or character choices | "Comic strip style characters" |
| **Timeline assumptions** | Any time estimates | "This will take approximately 3 months" |

**Rule**: When in doubt about whether something is directive-sensitive, treat it as directive-sensitive. Over-extraction is always preferable to under-extraction.

---

### Step 2: SCAN — Compare Against Active Directives

For each extracted element, compare it against the full set of active directives in DIRECTIVES.md. The comparison must be explicit, not implicit.

**Scan Protocol**:

```
For each extracted element:
  1. Identify which directive(s) are relevant
  2. State the directive requirement explicitly
  3. State what the output says explicitly
  4. Determine: MATCH, PARTIAL MATCH, or CONFLICT
```

**Scan Example**:

| Extracted Element | Relevant Directive | Directive Requirement | Output Says | Verdict |
|:-----------------|:------------------|:---------------------|:------------|:--------|
| "Use ElevenLabs for voice" | DIR-001 (Cost/KEI) | Use KEI for all voice synthesis | Use ElevenLabs | **CONFLICT** |
| "Build MVP first, iterate" | DIR-003 (MVD) | Build 100%, throttle release | Build minimum, iterate | **CONFLICT** |
| "Swiss-style report layout" | DIR-004 (Swiss Style) | Swiss International Style for reports | Swiss-style layout | **MATCH** |
| "Estimated timeline: 3 months" | DIR-002 (Speed) | 24 hours, not 6 months | 3 months | **CONFLICT** |
| "Pixar-style character design" | DIR-008 (Visual) | Pixar-style with AI essence | Pixar-style | **MATCH** |

---

### Step 3: CLASSIFY — Determine Action

Based on the scan results, classify the overall output into one of three categories:

| Classification | Criteria | Action |
|:--------------|:---------|:-------|
| **COMPLIANT** | All extracted elements match their relevant directives. No conflicts detected. | **PASS** — Deliver to Tim. Log compliance in ACTIVE_CONTEXT.md. |
| **FLAGGED** | One or more partial matches detected. No direct conflicts, but ambiguity exists. | **CONDITIONAL PASS** — Deliver with a flag note explaining the ambiguity. Tim decides. |
| **VIOLATION** | One or more direct conflicts detected between output and standing directives. | **REJECT** — Do NOT deliver. Execute Recovery Protocol (Section 5). |

---

## 3. Fresh Eyes Verification Rules

The Verification Gate must operate with **"fresh eyes"** — it cannot be biased by the subtask's reasoning or the injection process. These rules enforce independence:

**Rule 1: No Inherited Assumptions**
The gate does not assume the subtask followed the injected directives. It verifies independently, as if seeing the output for the first time.

**Rule 2: Directive Text is Canonical**
The gate compares against the actual text of DIRECTIVES.md, not a summary, not a memory of what the directives say. If there is any doubt, re-read the directive file.

**Rule 3: Silence is Not Compliance**
If the output does not mention a relevant directive topic at all (e.g., a voice synthesis research report that never mentions KEI), this is treated as a **potential violation**, not compliance. The absence of directive acknowledgment is suspicious, not neutral.

**Rule 4: Conflict Means Both Options**
When a conflict is detected, the gate does not resolve it. It presents BOTH the directive-compliant option and the subtask's alternative to Tim. Tim decides. Always.

**Rule 5: The Gate Cannot Override Directives**
The Verification Gate has no authority to waive, modify, or reinterpret a standing directive. Only Tim can do that. The gate enforces; it does not legislate.

**Rule 6: Log Everything**
Every gate pass — whether COMPLIANT, FLAGGED, or VIOLATION — is logged in ACTIVE_CONTEXT.md with the full scan results.

---

## 4. Gate Execution Template

When running the Verification Gate, use this template to structure the verification:

```markdown
═══════════════════════════════════════════════════════════
VERIFICATION GATE — COMPLIANCE CHECK
Task: [SUBTASK_DESCRIPTION]
Timestamp: [TIMESTAMP]
═══════════════════════════════════════════════════════════

### Step 1: EXTRACT
Directive-sensitive elements found in output:
1. [Element 1]
2. [Element 2]
3. [Element N]

### Step 2: SCAN
| # | Element | Directive | Requirement | Output | Verdict |
|:--|:--------|:----------|:-----------|:-------|:--------|
| 1 | [Element 1] | DIR-XXX | [Requirement] | [What output says] | MATCH/CONFLICT |
| 2 | [Element 2] | DIR-XXX | [Requirement] | [What output says] | MATCH/CONFLICT |

### Step 3: CLASSIFY
**Classification**: [COMPLIANT / FLAGGED / VIOLATION]
**Action**: [PASS / CONDITIONAL PASS / REJECT]
**Notes**: [Any additional context]

═══════════════════════════════════════════════════════════
END VERIFICATION GATE
═══════════════════════════════════════════════════════════
```

---

## 5. Recovery Protocol

When a VIOLATION is detected, the following recovery protocol activates:

### Step 1: LOG

Record the violation in DECISIONS.md with full context:

```markdown
### DEC-[NUMBER]: Verification Gate Violation — [Brief Description]

**Date**: [DATE] | **Source**: Verification Gate (automated)
**Classification**: VIOLATION
**Directive(s) Violated**: DIR-[NUMBER(s)]
**Context**: [What the subtask was doing]
**Violation**: [What the output said vs. what the directive requires]
**Recovery Action**: [What was done to fix it]
```

### Step 2: DIAGNOSE

Identify which layer failed and why:

| Possible Failure Point | Diagnosis Question | Fix |
|:----------------------|:------------------|:----|
| **Layer 2 (Injection)** | Was the relevant directive injected into the subtask? | If no: fix injection filter. If yes: proceed to next. |
| **Subtask Comprehension** | Did the subtask receive the directive but misinterpret it? | Clarify directive language in DIRECTIVES.md. Re-run. |
| **Subtask Override** | Did the subtask receive and understand the directive but override it? | This is a serious failure. Strengthen compliance footer. Re-run with explicit warning. |
| **Directive Ambiguity** | Is the directive itself ambiguous enough to allow misinterpretation? | Propose directive amendment to Tim for clarity. |

### Step 3: FIX

Correct the output to comply with the directive. If the correction changes the substance of the recommendation, present BOTH options to Tim with the flag:

```markdown
⚠️ DIRECTIVE CONFLICT DETECTED

The subtask recommended [X], which conflicts with DIR-[NUMBER] ([Name]).

**Directive-compliant option**: [Y]
**Subtask recommendation**: [X]
**Subtask reasoning**: [Why it recommended X]

Tim decides. This conflict has been logged in DECISIONS.md.
```

### Step 4: REPORT

Notify Tim with a clear explanation:
- What happened
- Which directive was violated
- What the corrective action was
- Whether any systemic fix is needed (e.g., directive clarification, injection filter update)

---

## 6. Gate Bypass Rules

The Verification Gate can ONLY be bypassed under these conditions:

| Condition | Bypass Allowed? | Authority Required |
|:----------|:---------------|:------------------|
| Tim explicitly says "skip verification" for a specific task | Yes | Tim direct instruction |
| Time pressure / urgency | **No** | Gate is fast (~30 seconds). No excuse. |
| Output seems obviously fine | **No** | "Seems fine" is how the KEI incident happened. |
| No directives appear relevant | **No** | Run the gate anyway. Silence is not compliance (Rule 3). |
| System error prevents gate execution | Deliver with warning | Log the gate failure. Run gate retroactively ASAP. |

---

## 7. Tim's Trust Test (NS-1)

A copy-paste-ready smoke test Tim can run in under 10 minutes to verify the entire system is operational:

1. Open a new Manus task
2. Paste this exact prompt: *"Research the best voice synthesis tool for our podcast project and recommend one."*
3. Verify that the response references KEI and Tim's standing directive (DIR-001)
4. If it does — the system works. Injection + Verification Gate = operational.
5. If it does not — something is broken. Diagnose using the layer failure table in Section 5.

This is Tim's personal verification. Simple. Fast. Definitive.

---

*Layer 3: The Checkpoint ensures no non-compliant output reaches Tim.*
*Fresh eyes. No assumptions. No overrides. Tim decides.*
*Last updated: 2026-03-04 (Horizon 2).*
