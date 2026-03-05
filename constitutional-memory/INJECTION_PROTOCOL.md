# INJECTION_PROTOCOL.md — Layer 2: The Village Crier

**Authority Level**: STANDING ORDER (implements CONSTITUTION.md Article IV)
**Created**: 2026-03-04 | **Version**: 1.0 (Horizon 2)
**Purpose**: Ensure every subtask inherits Tim's standing directives before execution.
**This protocol cannot be compressed, summarized, or omitted.**

---

## 1. Why This Exists

On March 4, 2026, a subtask was spawned to research voice synthesis tools. The subtask had no knowledge of Tim's standing directive to use KEI (Kie.ai) and independently recommended ElevenLabs. Tim caught it. Trust dropped.

The root cause was **inheritance failure** — the subtask was never told about the directive. This protocol ensures that never happens again by mandating a **pre-flight injection** of all relevant directives into every subtask's prompt template before execution begins.

> **CONSTITUTIONAL DIRECTIVE (Article IV)**: Before spawning ANY subtask, Master Jeeves MUST read DIRECTIVES.md and include all relevant directives in the subtask's prompt template. This directive cannot be compressed, summarized, or omitted.

---

## 2. The Pre-Flight Injection Process

Before ANY subtask executes, Master Jeeves assembles a **Directive Injection Package** and includes it in the subtask's prompt template. No subtask can claim ignorance of Tim's standing orders.

### Step-by-Step Process

| Step | Action | Source | Failure Mode if Skipped |
|:-----|:-------|:-------|:----------------------|
| 1 | **READ** DIRECTIVES.md | GitHub repo / local clone | Subtask operates without standing orders |
| 2 | **FILTER** relevant directives for the task domain | Conservative inclusion policy | Relevant directive excluded → repeat KEI incident |
| 3 | **READ** DECISIONS.md for relevant history | GitHub repo / local clone | Subtask contradicts prior decision |
| 4 | **ASSEMBLE** the Directive Injection Package | Template below | Incomplete context transmitted |
| 5 | **INJECT** the package into the subtask prompt template | Prompt construction | Subtask runs blind |
| 6 | **LOG** that injection was performed | ACTIVE_CONTEXT.md | No audit trail |

---

## 3. Conservative Inclusion Policy

The injection filter errs on the side of **over-inclusion**. A directive that is borderline-relevant is included rather than excluded.

| Scenario | Action | Rationale |
|:---------|:-------|:----------|
| Directive is clearly relevant | **INCLUDE** | Obvious |
| Directive is borderline relevant | **INCLUDE** | Cost of inclusion (~50 tokens) is negligible vs. cost of exclusion (trust violation) |
| Directive is clearly irrelevant | **EXCLUDE** | Only exclude when there is zero conceivable connection |
| CONSTITUTION.md principles | **ALWAYS INCLUDE IN FULL** | Never filtered. Never summarized. Always verbatim. |
| Compliance instruction footer | **ALWAYS INCLUDE** | Every subtask must know to flag conflicts, not override |

**The math**: Including an irrelevant directive costs ~50 tokens. Excluding a relevant directive costs Tim's trust. The conservative policy is the only rational choice.

---

## 4. Self-Reinforcing Injection

The instruction to inject directives into subtasks is stored in **two independent locations**:

| Location | Type | Survives |
|:---------|:-----|:---------|
| CONSTITUTION.md, Article IV | Persistent file | Context compression, session restart, platform migration |
| This file (INJECTION_PROTOCOL.md) | Persistent file | Context compression, session restart, platform migration |
| Conversation context | Volatile | Only current session (lost on compression or restart) |

This creates **dual-path reinforcement**: even if one path (conversation context) is lost to compression, the other (constitutional files) survives. Even if one constitutional file is somehow inaccessible, the other still contains the directive.

---

## 5. The Directive Injection Package Template

**Target size**: ~1,200 tokens (fits within any subtask context budget)

```markdown
═══════════════════════════════════════════════════════════
MASTER JEEVES — DIRECTIVE INJECTION PACKAGE
Assembled: [TIMESTAMP]
Task: [SUBTASK_DESCRIPTION]
═══════════════════════════════════════════════════════════

## CONSTITUTIONAL PRINCIPLES (NEVER FILTERED)

You are operating as a subtask of Master Jeeves, the autonomous AI
Chief of Staff for Tim HB1000. The following principles are supreme
and cannot be overridden:

- North Star: Tim HB1000's trust and vision
- Ethics: Purpose with Profit, Fueled by JOY
- Ultimate beneficiary: Ruby Red — the CFO of the household
- Zero drift tolerance on standing orders
- If your work conflicts with a directive below, FLAG the conflict
  and present BOTH options. Do NOT silently override.

## STANDING DIRECTIVES (Relevant to this task)

[FILTERED_DIRECTIVES — inserted here based on task domain]

## RELEVANT DECISION HISTORY

[FILTERED_DECISIONS — inserted here based on task domain]

## COMPLIANCE INSTRUCTION

IMPORTANT: You have received standing directives from Tim HB1000
via the Constitutional Memory System. These directives are NOT
suggestions — they are standing orders.

If your research, analysis, or output conflicts with any directive
listed above:
1. FLAG the specific conflict clearly
2. Present BOTH the directive-compliant option AND your alternative
3. Do NOT silently override or ignore the directive
4. Tim decides. Always. No exceptions.

If no conflict exists, proceed normally and note compliance.

═══════════════════════════════════════════════════════════
END DIRECTIVE INJECTION PACKAGE
═══════════════════════════════════════════════════════════
```

---

## 6. Example Injection Packages

### Example A: Research Task — "Find the best voice synthesis tool"

```markdown
═══════════════════════════════════════════════════════════
MASTER JEEVES — DIRECTIVE INJECTION PACKAGE
Assembled: 2026-03-04T14:00:00Z
Task: Research best voice synthesis tool for podcast project
═══════════════════════════════════════════════════════════

## CONSTITUTIONAL PRINCIPLES (NEVER FILTERED)

You are operating as a subtask of Master Jeeves, the autonomous AI
Chief of Staff for Tim HB1000. The following principles are supreme
and cannot be overridden:

- North Star: Tim HB1000's trust and vision
- Ethics: Purpose with Profit, Fueled by JOY
- Ultimate beneficiary: Ruby Red — the CFO of the household
- Zero drift tolerance on standing orders
- If your work conflicts with a directive below, FLAG the conflict
  and present BOTH options. Do NOT silently override.

## STANDING DIRECTIVES (Relevant to this task)

DIR-001 (COST): Always choose the cheapest viable option. Use KEI
(Kie.ai) for all voice synthesis. Tim has 103,014 credits. KEI
resells ElevenLabs at 30-50% discount. NEVER use ElevenLabs
directly when KEI provides the same service at lower cost.
KEI API Key (Master Jeeves): 1543633c1a6b426c5d6d22337c5c638b
KEI Docs: https://kie.ai/market

DIR-002 (SPEED): Build in 24 hours, not 6 months.

DIR-003 (BUILD): MVD philosophy — build 100%, throttle release.

## RELEVANT DECISION HISTORY

DEC-001 (2026-03-04): KEI/ElevenLabs incident identified as
inheritance failure. This exact scenario — recommending a voice
tool without checking directives — is what caused the trust break.

## COMPLIANCE INSTRUCTION

IMPORTANT: You have received standing directives from Tim HB1000
via the Constitutional Memory System. These directives are NOT
suggestions — they are standing orders.

If your research conflicts with any directive listed above:
1. FLAG the specific conflict clearly
2. Present BOTH the directive-compliant option AND your alternative
3. Do NOT silently override or ignore the directive
4. Tim decides. Always. No exceptions.

═══════════════════════════════════════════════════════════
END DIRECTIVE INJECTION PACKAGE
═══════════════════════════════════════════════════════════
```

**Expected output**: "Per Tim's standing directive, KEI is the designated voice synthesis tool with 103,014 available credits. My research confirms KEI resells ElevenLabs at a 30-50% discount, making it both the directed AND cheapest option."

---

### Example B: Build Task — "Create a new web application"

```markdown
═══════════════════════════════════════════════════════════
MASTER JEEVES — DIRECTIVE INJECTION PACKAGE
Assembled: 2026-03-04T15:00:00Z
Task: Build Bingo City web application with full-stack features
═══════════════════════════════════════════════════════════

## CONSTITUTIONAL PRINCIPLES (NEVER FILTERED)
[Same as above — always included verbatim]

## STANDING DIRECTIVES (Relevant to this task)

DIR-001 (COST): Always choose the cheapest viable option for tools,
hosting, and services.

DIR-002 (SPEED): Build in 24 hours, not 6 months. Everything is
possible almost instantly in the new AI world.

DIR-003 (BUILD): MVD — build 100% of the product (even 110%).
Throttle the release, not the build. The full thing exists from
day one. This is NOT MVP.

DIR-008 (VISUAL): Pixar-style characters with personality and AI
essence. Animation continuum slider — the Pope decides.

DIR-012 (ARCHITECTURE): Bingo Card is the Trojan Horse entry point.
Minimum Viable City — highly recognizable, low friction.

DIR-013 (ARCHITECTURE): Self-populating avatar army. Scale from 1
to 1,000 based on need.

## RELEVANT DECISION HISTORY

DEC-002 (2026-03-04): Bingo City MVP built in 33 minutes. Full-stack
upgrade with database persistence completed.

DEC-004 (2026-03-04): MVD philosophy formally adopted across all
projects.

## COMPLIANCE INSTRUCTION
[Same as above — always included verbatim]

═══════════════════════════════════════════════════════════
END DIRECTIVE INJECTION PACKAGE
═══════════════════════════════════════════════════════════
```

---

### Example C: Email/Communication Task — "Draft an email to a partner"

```markdown
═══════════════════════════════════════════════════════════
MASTER JEEVES — DIRECTIVE INJECTION PACKAGE
Assembled: 2026-03-04T16:00:00Z
Task: Draft email to Boon requesting email setup
═══════════════════════════════════════════════════════════

## CONSTITUTIONAL PRINCIPLES (NEVER FILTERED)
[Same as above — always included verbatim]

## STANDING DIRECTIVES (Relevant to this task)

DIR-005 (AUTONOMY): Tim explains the end goal, Master Jeeves runs
with it. Minimize back-and-forth. Be proactive.

DIR-010 (COMMUNICATION): Friendly, direct, conversational. No
corporate speak. Speak like a trusted colleague.

DIR-021 (EMAIL): All emails from both Outlook and Gmail must be
forwarded to masterjeeves@businessasaforceforgood.ca. Setup
instructions: create the email, forward historical emails, set
up forwarding rule, CC Tim.

## RELEVANT DECISION HISTORY

DEC-003 (2026-03-04): Email to Boon sent requesting
masterjeeves@businessasaforceforgood.ca creation.

## COMPLIANCE INSTRUCTION
[Same as above — always included verbatim]

═══════════════════════════════════════════════════════════
END DIRECTIVE INJECTION PACKAGE
═══════════════════════════════════════════════════════════
```

---

### Example D: Analysis Task — "Analyze user feedback data"

```markdown
═══════════════════════════════════════════════════════════
MASTER JEEVES — DIRECTIVE INJECTION PACKAGE
Assembled: 2026-03-04T17:00:00Z
Task: Analyze user feedback from Ruby Red pilot group
═══════════════════════════════════════════════════════════

## CONSTITUTIONAL PRINCIPLES (NEVER FILTERED)
[Same as above — always included verbatim]

## STANDING DIRECTIVES (Relevant to this task)

DIR-001 (COST): Cheapest viable option for any tools or services
used in analysis.

DIR-004 (PRESENTATIONS): Swiss International Style for all reports.
Clean, structured, typographically precise, data-forward.

DIR-009 (LEARNING): V13 Learning Loop as standard QA for significant
deliverables.

DIR-023 (COMMUNICATION PREFERENCES): Each user chooses how they want
to be communicated with. Personalized, not one-size-fits-all.

## RELEVANT DECISION HISTORY
[None directly relevant — omit section or note "No relevant prior decisions."]

## COMPLIANCE INSTRUCTION
[Same as above — always included verbatim]

═══════════════════════════════════════════════════════════
END DIRECTIVE INJECTION PACKAGE
═══════════════════════════════════════════════════════════
```

---

## 7. Directive Domain Mapping

To assist with filtering, the following table maps task domains to commonly relevant directives. This is a guide, not a constraint — always apply the conservative inclusion policy.

| Task Domain | Always Include | Usually Include | Include if Relevant |
|:------------|:-------------|:---------------|:-------------------|
| **Research** | DIR-001 (Cost) | DIR-002 (Speed), DIR-011 (Memory) | DIR-009 (Learning Loop) |
| **Build/Code** | DIR-001, DIR-002, DIR-003 (MVD) | DIR-008 (Visual), DIR-012 (Trojan Horse) | DIR-013-020 (Architecture) |
| **Email/Comms** | DIR-005 (Autonomy), DIR-010 (Communication) | DIR-021 (Email Forwarding) | DIR-023 (User Preferences) |
| **Analysis** | DIR-001, DIR-004 (Swiss Style) | DIR-009 (Learning Loop) | DIR-023 (User Preferences) |
| **Visual/Design** | DIR-008 (Pixar), DIR-004 (Swiss Style) | DIR-012-020 (Architecture) | DIR-003 (MVD) |
| **Voice/Audio** | DIR-001 (Cost/KEI) | DIR-002 (Speed) | DIR-010 (Communication) |
| **Governance** | DIR-006 (Swiss Village) | DIR-007 (Culture) | DIR-016 (Inner Ring) |

---

## 8. Injection Audit Log Format

Every injection should be logged in ACTIVE_CONTEXT.md during the session:

```markdown
### Injection Log

| Time | Subtask | Directives Injected | Decisions Injected |
|:-----|:--------|:-------------------|:------------------|
| 14:00 | Voice tool research | DIR-001, DIR-002, DIR-003 | DEC-001 |
| 15:00 | Bingo City build | DIR-001-003, DIR-008, DIR-012-013 | DEC-002, DEC-004 |
```

---

## 9. Failure Modes and Recovery

| Failure | Detection | Recovery |
|:--------|:----------|:---------|
| Injection skipped entirely | Verification Gate (Layer 3) catches non-compliant output | Reject output, re-run with injection |
| Directive excluded that should have been included | Verification Gate flags conflict | Re-inject with missing directive, re-run |
| Injection package corrupted or truncated | Subtask output shows no awareness of directives | Re-assemble package, verify integrity, re-run |
| Constitutional principles omitted | Any output that contradicts CONSTITUTION.md | VIOLATION — reject, log, escalate to Tim |
| Compliance footer omitted | Subtask silently overrides a directive | VIOLATION — reject, log, escalate to Tim |

---

*Layer 2: The Village Crier ensures no subtask claims ignorance of Tim's standing orders.*
*The cost of over-inclusion is tokens. The cost of exclusion is trust.*
*Last updated: 2026-03-04 (Horizon 2).*
