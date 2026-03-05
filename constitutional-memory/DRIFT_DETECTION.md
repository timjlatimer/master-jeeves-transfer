# DRIFT_DETECTION.md — Layer 4: The Watchtower

**Authority Level**: STANDING ORDER (implements CONSTITUTION.md Article VI)
**Created**: 2026-03-04 | **Version**: 1.0 (Horizon 3)
**Purpose**: Detect and correct directive drift before it causes harm.
**This protocol cannot be compressed, summarized, or omitted.**

---

## 1. Why This Exists

Layers 1-3 handle the **known** — they store directives, transmit them, and verify compliance against them. Layer 4 handles the **unknown** — the slow, invisible erosion of directive adherence that happens over time, across sessions, and through context compression.

Drift is insidious because it does not announce itself. A directive is not violated in a single dramatic moment — it is gradually forgotten, softened, or reinterpreted until the original intent is lost. The Watchtower exists to detect this erosion before it reaches Tim.

> **Principle**: Drift is the enemy of trust. If Tim's directives slowly change meaning without his knowledge, the system has failed even if no single violation occurred.

---

## 2. Five Detection Triggers

Drift detection is not a single event — it is embedded at five critical points in the Master Jeeves workflow. Each trigger activates a specific check designed to catch drift at the moment it is most likely to occur.

### Trigger 1: SESSION START — Constitutional Reload

**When**: At the beginning of every new Master Jeeves session.
**What**: Re-read all constitutional files from the GitHub repository. Compare against the session's working context.

| Check | Action | Failure Indicator |
|:------|:-------|:-----------------|
| Read CONSTITUTION.md | Verify all articles are present and unmodified | Missing article or altered text |
| Read DIRECTIVES.md | Verify all active directives are present | Missing directive or altered requirement |
| Read DECISIONS.md | Load decision history for context | Missing entries or altered records |
| Read PREFERENCES.md | Load current preferences | Outdated or contradicted preferences |
| Read KNOWLEDGE.md | Load institutional knowledge index | Missing projects or outdated references |
| Read INJECTION_PROTOCOL.md | Confirm injection process is understood | Protocol not loaded or misunderstood |
| Read VERIFICATION_GATE.md | Confirm gate process is understood | Gate not loaded or misunderstood |
| Read this file | Confirm drift detection is active | Meta-failure: drift detection itself drifted |

**Cold Start Verification Statement** (must be generated at session start):

```markdown
CONSTITUTIONAL MEMORY SYSTEM — SESSION START VERIFICATION
Timestamp: [TIMESTAMP]
Files loaded: [LIST ALL FILES READ]
Directives active: [COUNT] (expected: [CURRENT_COUNT])
Decisions logged: [COUNT]
Drift detection: ACTIVE
Status: [VERIFIED / DISCREPANCY DETECTED]
```

---

### Trigger 2: PRE-SUBTASK — Injection Integrity Check

**When**: Before every subtask is spawned (immediately after assembling the Directive Injection Package).
**What**: Verify the injection package is complete and accurate.

| Check | Action | Failure Indicator |
|:------|:-------|:-----------------|
| Package assembled? | Confirm injection package exists | No package = injection skipped |
| Constitutional principles included? | Verify verbatim inclusion | Missing or summarized principles |
| Relevant directives included? | Cross-reference against domain mapping | Directive excluded that should be included |
| Compliance footer included? | Verify footer is present and complete | Missing or truncated footer |
| Decision history included? | Verify relevant decisions are referenced | Relevant decision omitted |

If any check fails, **HALT** the subtask and fix the injection package before proceeding.

---

### Trigger 3: POST-SUBTASK — Output Compliance Scan

**When**: After every subtask completes (before delivery to Tim).
**What**: Run the Verification Gate (VERIFICATION_GATE.md) on the output.

This trigger is the activation point for Layer 3. The drift detection layer ensures the Verification Gate is actually run — it is the meta-check that confirms the check itself happened.

| Check | Action | Failure Indicator |
|:------|:-------|:-----------------|
| Verification Gate executed? | Confirm gate was run on the output | No gate log = gate was skipped |
| Gate classification logged? | Confirm COMPLIANT/FLAGGED/VIOLATION recorded | Missing classification |
| Violations addressed? | If VIOLATION, confirm recovery protocol was executed | Unresolved violation |

---

### Trigger 4: CONTEXT COMPRESSION — NEVER-COMPRESS Safeguard

**When**: Whenever the AI platform compresses, summarizes, or truncates the conversation context.
**What**: Verify that NEVER-COMPRESS items survived the compression.

Context compression is the single most dangerous moment for directive drift. When the platform reduces context to fit within token limits, critical directives can be silently dropped. The NEVER-COMPRESS safeguard prevents this.

**Post-Compression Verification Protocol**:

After any detected or suspected context compression:
1. Re-read ALL constitutional files from GitHub (not from memory)
2. Verify all NEVER-COMPRESS items are still in working context
3. If any are missing, re-inject them immediately
4. Log the compression event and any items that were lost

---

### Trigger 5: WEEKLY MONDAY AUDIT — Systematic Review

**When**: Every Monday (scheduled).
**What**: Comprehensive audit of the entire Constitutional Memory System.

This is the most thorough drift detection trigger — a full system review that catches anything the other four triggers missed. See Section 5 for the complete audit template.

---

## 3. NEVER-COMPRESS Safeguard Rules

The following items are classified as **NEVER-COMPRESS** — they must survive any context compression, summarization, or truncation event. If the AI platform compresses context and any of these items are lost, they must be immediately re-injected from the constitutional files.

### Tier 1: ABSOLUTE (Must survive any compression)

| Item | Source | Why |
|:-----|:-------|:----|
| Master Jeeves identity and role | CONSTITUTION.md Art. I | Without identity, the system operates as a generic AI |
| North Star: Tim HB1000 | CONSTITUTION.md Art. II | Without the North Star, all decisions lose their anchor |
| DIR-001: KEI for voice synthesis | DIRECTIVES.md | The directive that caused the original trust break |
| DIR-011: Never lose context | DIRECTIVES.md | The meta-directive. Losing this is recursive failure. |
| Injection Protocol requirement | CONSTITUTION.md Art. IV | Without this, subtasks run blind |
| Compliance instruction | INJECTION_PROTOCOL.md §4 | Without this, conflicts are silently overridden |

### Tier 2: CRITICAL (Must survive standard compression)

| Item | Source | Why |
|:-----|:-------|:----|
| All active directive IDs and names | DIRECTIVES.md index | Must know what directives exist even if details are re-read |
| Decision history (last 10 entries) | DECISIONS.md | Recent decisions inform current work |
| Current session context | ACTIVE_CONTEXT.md | Losing session state causes duplicate work |
| Tim's contact information | PREFERENCES.md | Must always be reachable |
| Drift detection is active | This file | Meta-safeguard: drift detection must know it exists |

### Tier 3: IMPORTANT (Should survive if possible)

| Item | Source | Why |
|:-----|:-------|:----|
| Full directive text (all 23) | DIRECTIVES.md | Preferable to re-reading, but re-read is acceptable fallback |
| Rooftop topology | KNOWLEDGE.md | Architectural reference for build tasks |
| Knowledge gaps list | KNOWLEDGE.md | Prevents duplicate extraction work |
| Preference details | PREFERENCES.md | Informs style and approach |

**Recovery rule**: If ANY Tier 1 item is missing after compression, immediately execute a full Constitutional Reload (Trigger 1) before proceeding with any other work.

---

## 4. Drift Types and Detection Patterns

| Drift Type | Description | Detection Method | Example |
|:-----------|:-----------|:----------------|:--------|
| **Directive Amnesia** | A directive is completely forgotten | Session Start check finds missing directive | KEI directive not loaded at session start |
| **Directive Softening** | A hard requirement becomes a suggestion | Verification Gate finds "consider using KEI" instead of "use KEI" | "You might want to try KEI" vs. "Use KEI" |
| **Directive Reinterpretation** | The directive's meaning shifts over time | Weekly audit compares current interpretation to original text | MVD interpreted as "ship early, add later" (that is MVP) |
| **Scope Creep** | A directive's scope expands or contracts without authorization | Weekly audit reviews directive application patterns | DIR-001 (cost) applied only to voice, not to all tools |
| **Priority Inversion** | A lower-priority preference overrides a higher-priority directive | Verification Gate catches preference overriding directive | Tim's "friendly tone" preference overriding a cost directive |
| **Silent Override** | A subtask ignores a directive without flagging the conflict | Verification Gate Rule 3 (silence is not compliance) | Research report on voice tools that never mentions KEI |
| **Compression Loss** | A directive is lost during context compression | Post-compression verification finds missing items | DIR-001 dropped after long conversation |

---

## 5. Weekly Monday Audit Template

This template is used every Monday for the comprehensive system audit. It should be completed by Master Jeeves and the results logged in DECISIONS.md.

```markdown
═══════════════════════════════════════════════════════════
WEEKLY MONDAY AUDIT — CONSTITUTIONAL MEMORY SYSTEM
Date: [MONDAY DATE]
Auditor: Master Jeeves
═══════════════════════════════════════════════════════════

## 1. FILE INTEGRITY CHECK

| File | Expected Version | Current Version | Status |
|:-----|:----------------|:---------------|:-------|
| CONSTITUTION.md | [VERSION] | [VERSION] | ✓/✗ |
| DIRECTIVES.md | [VERSION] | [VERSION] | ✓/✗ |
| DECISIONS.md | [VERSION] | [VERSION] | ✓/✗ |
| PREFERENCES.md | [VERSION] | [VERSION] | ✓/✗ |
| KNOWLEDGE.md | [VERSION] | [VERSION] | ✓/✗ |
| INJECTION_PROTOCOL.md | [VERSION] | [VERSION] | ✓/✗ |
| VERIFICATION_GATE.md | [VERSION] | [VERSION] | ✓/✗ |
| DRIFT_DETECTION.md | [VERSION] | [VERSION] | ✓/✗ |
| ACTIVE_CONTEXT.md | [VERSION] | [VERSION] | ✓/✗ |

## 2. DIRECTIVE STATUS REVIEW

| Directive | Status | Last Applied | Any Drift? | Notes |
|:----------|:-------|:------------|:-----------|:------|
| DIR-001 | ACTIVE | [DATE] | YES/NO | [Notes] |
| DIR-002 | ACTIVE | [DATE] | YES/NO | [Notes] |
| [Continue for all directives...] |

## 3. DECISION LOG REVIEW

Decisions logged this week: [COUNT]
Any decisions that contradict standing directives? YES/NO
If YES: [Details and resolution]

## 4. INJECTION LOG REVIEW

Subtasks spawned this week: [COUNT]
Subtasks with injection packages: [COUNT]
Injection compliance rate: [PERCENTAGE]
Any injection failures? YES/NO
If YES: [Details and resolution]

## 5. VERIFICATION GATE LOG REVIEW

Gate checks performed this week: [COUNT]
Results: [X] COMPLIANT, [Y] FLAGGED, [Z] VIOLATION
Any unresolved violations? YES/NO
If YES: [Details and escalation plan]

## 6. COMPRESSION EVENTS

Context compressions detected this week: [COUNT]
Items lost to compression: [LIST or NONE]
Recovery actions taken: [LIST or NONE]

## 7. KNOWLEDGE GAPS UPDATE

New gaps identified: [LIST or NONE]
Gaps resolved this week: [LIST or NONE]
Priority extraction queue changes: [LIST or NONE]

## 8. NEW DIRECTIVES DETECTED

Potential new directives from Tim's communications this week:
[LIST or NONE — each must be confirmed with Tim before adding]

## 9. SYSTEM HEALTH SCORE

| Layer | Status | Score |
|:------|:-------|:------|
| Layer 1: Fireproof Safe | [Status] | /25 |
| Layer 2: Village Crier | [Status] | /25 |
| Layer 3: Checkpoint | [Status] | /25 |
| Layer 4: Watchtower | [Status] | /25 |
| **TOTAL** | | **/100** |

## 10. RECOMMENDATIONS

[Any recommended changes to directives, protocols, or system configuration]

## 11. TIM'S REVIEW

[Space for Tim's comments — 2 minutes expected]
Approved: YES/NO
Date: [DATE]

═══════════════════════════════════════════════════════════
END WEEKLY MONDAY AUDIT
═══════════════════════════════════════════════════════════
```

---

## 6. Recovery Protocol

When drift is detected at any trigger point, the following recovery protocol activates:

### Step 1: IDENTIFY

Determine the type and severity of drift:

| Severity | Criteria | Response Time |
|:---------|:---------|:-------------|
| **CRITICAL** | Tier 1 NEVER-COMPRESS item missing or altered | Immediate — halt all work |
| **HIGH** | Active directive forgotten, softened, or reinterpreted | Before next subtask |
| **MEDIUM** | Preference drift or scope creep detected | Before end of session |
| **LOW** | Minor inconsistency in non-directive content | Next weekly audit |

### Step 2: CORRECT

| Drift Type | Correction Action |
|:-----------|:-----------------|
| Directive Amnesia | Re-read directive from file. Re-inject into working context. |
| Directive Softening | Replace softened language with original directive text. |
| Directive Reinterpretation | Compare current interpretation to original text. Revert to original. |
| Scope Creep | Review directive scope. Apply as originally written. |
| Priority Inversion | Re-establish authority hierarchy (Constitution > Directives > Preferences). |
| Silent Override | Flag the override. Present both options to Tim. |
| Compression Loss | Execute full Constitutional Reload (Trigger 1). |

### Step 3: LOG

Record the drift event in DECISIONS.md:

```markdown
### DEC-[NUMBER]: Drift Detected — [Type]

**Date**: [DATE] | **Source**: Drift Detection (Trigger [NUMBER])
**Drift Type**: [Type from Section 4]
**Severity**: [CRITICAL/HIGH/MEDIUM/LOW]
**What Drifted**: [Specific item that drifted]
**Original State**: [What it should have been]
**Drifted State**: [What it had become]
**Correction**: [What was done to fix it]
**Prevention**: [What systemic change prevents recurrence]
```

### Step 4: STRENGTHEN

After correcting the drift, strengthen the system to prevent recurrence:

| Prevention Action | When to Apply |
|:-----------------|:-------------|
| Move item to higher NEVER-COMPRESS tier | If compression caused the drift |
| Add explicit language to directive | If ambiguity caused the drift |
| Add to injection domain mapping | If injection filter missed the directive |
| Add to Verification Gate extraction list | If the gate missed the element |
| Propose directive amendment to Tim | If the directive itself needs updating |

---

## 7. Drift Detection Self-Check

The Watchtower must also watch itself. At every Weekly Monday Audit, include this meta-check:

| Self-Check Question | Expected Answer | If Wrong |
|:-------------------|:---------------|:---------|
| Is drift detection active? | YES | CRITICAL — re-read this file immediately |
| Are all 5 triggers operational? | YES | Identify and fix the broken trigger |
| Was the last weekly audit completed? | YES (with date) | Schedule and complete immediately |
| Are NEVER-COMPRESS rules being enforced? | YES | Re-read Section 3 and enforce |
| Is this file (DRIFT_DETECTION.md) current version? | YES (with version number) | Pull latest from GitHub |

> **The Watchtower that does not watch itself is no watchtower at all.**

---

*Layer 4: The Watchtower detects the invisible — the slow erosion of intent that no single check catches.*
*Drift is the enemy of trust. The Watchtower never sleeps.*
*Last updated: 2026-03-04 (Horizon 3).*
