# The Constitutional Memory System — Complete Architecture Specification

**Making Master Jeeves' Memory, Context, and Rules BULLETPROOF**

**Version**: 1.0 | **Date**: March 4, 2026
**Author**: SIC HB1000 Solve Team & Manus AI
**Learning Loop Session**: LL-V13-MJ-MEMORY-20260304
**North Star**: Tim HB1000

---

## 1. Executive Summary

The Constitutional Memory System is a 4-layer defense-in-depth architecture that ensures Master Jeeves' standing directives, user preferences, institutional knowledge, and decision history are never lost, drifted from, or overridden by subtasks. It was designed in direct response to the KEI/ElevenLabs trust-breaking incident, where a subtask contradicted Tim's standing directive because it never received that directive in the first place.

The root cause was not memory loss — it was **inheritance failure**. The subtask was spawned with an isolated context and no mechanism to inherit Tim's standing orders. This architecture solves that problem at four independent layers, each catching what the others miss.

**Infrastructure cost**: $0 (GitHub + Markdown + existing Manus platform).
**Build time**: Horizon 1A deployable in 2-4 hours. Full system in 2-4 weeks.

---

## 2. The Root Cause: A 5-Link Failure Chain

The KEI incident was not a single failure — it was a chain of five missing safeguards:

| Link | What Happened | What Should Have Happened |
|:-----|:-------------|:------------------------|
| 1 | Tim gave directive to main task | Directive should have been externalized to persistent storage |
| 2 | Main task held directive in context only | Directive should have been written to a constitutional file |
| 3 | Subtask spawned with isolated context | Subtask should have inherited parent directives |
| 4 | Subtask prompt did not include directives | Directives should have been injected into the prompt template |
| 5 | Subtask researched independently | Subtask should have checked directives before recommending |

The Constitutional Memory System intervenes at **every link**.

---

## 3. Architecture Overview: 4 Layers of Defense

| Layer | Name | Metaphor | Function |
|:------|:-----|:---------|:---------|
| 1 | The Fireproof Safe | Constitutional File Hierarchy | Persistent, version-controlled storage of all directives, preferences, decisions, and knowledge |
| 2 | The Village Crier | Pre-Flight Injection Protocol | Push directives into every subtask before execution — no subtask claims ignorance |
| 3 | The Checkpoint | Verification Gate | Check every subtask output against directives before acceptance |
| 4 | The Watchtower | Drift Detection & Recovery | Continuous monitoring for gradual drift, with automated weekly audits |

**Design principle**: Defense-in-depth. Each layer operates independently. If Layer 2 fails to inject a directive, Layer 3 catches the violation. If Layer 3 misses it, Layer 4's weekly audit detects the drift. No single point of failure.

---

## 4. Layer 1: The Fireproof Safe — Constitutional File Hierarchy

### 4.1 Storage Medium: Markdown + GitHub

The constitutional files are stored as markdown files in a private GitHub repository. This choice is deliberate:

| Factor | Markdown + GitHub | Database | Why Markdown Wins for Tim |
|:-------|:-----------------|:---------|:------------------------|
| Transparency | Human-readable, editable by Tim directly | Requires query interface | Tim can open any file and read it |
| Version control | Full Git history, every change tracked | Requires custom audit logging | Tim can see who changed what and when |
| Cost | $0 (GitHub free for private repos) | $0-$50/month depending on provider | Cheapest option — Tim's standing directive |
| Build time | Hours | Days to weeks | "24 hours, not 6 months" |
| Portability | Copy files anywhere, no vendor lock-in | Export required, format varies | The library is not trapped in one building |
| AI compatibility | Every AI can read markdown natively | Requires API integration | Any AI system can consume these files |

### 4.2 The Six-File Hierarchy

```
master-jeeves-constitution/
├── README.md                  # Cold Start Protocol — onboarding for new sessions/users
├── CONSTITUTION.md            # SUPREME — Governing principles (Tim only)
├── DIRECTIVES.md              # STANDING ORDER — Operational rules (Tim + MJ proposals)
├── PREFERENCES.md             # GUIDANCE — Style & workflow preferences (Collaborative)
├── DECISIONS.md               # RECORD — Append-only decision log (Append-only)
├── KNOWLEDGE.md               # INSTITUTIONAL — Pearl's Brain index (MJ + Tim approval)
├── ACTIVE_CONTEXT.md          # CURRENT — What's happening now (MJ per session)
└── history/                   # Versioned archive of superseded directives
    └── YYYY-MM-DD_directive_name.md
```

### 4.3 Authority Levels

| File | Authority | Who Can Modify | Override Rules |
|:-----|:---------|:---------------|:--------------|
| CONSTITUTION.md | SUPREME | Tim only | Cannot be overridden by any other file or directive |
| DIRECTIVES.md | STANDING ORDER | Tim directly; MJ can propose, Tim confirms | Overrides PREFERENCES; overridden only by CONSTITUTION |
| PREFERENCES.md | GUIDANCE | Collaborative (Tim + MJ) | Non-binding but important; informs decisions |
| DECISIONS.md | RECORD | Append-only (no edits, no deletions) | Historical record; cannot be altered after entry |
| KNOWLEDGE.md | INSTITUTIONAL | MJ maintains, Tim approves major changes | Index to external knowledge; links, not content |
| ACTIVE_CONTEXT.md | CURRENT | MJ updates per session | Ephemeral; rebuilt each session from constitutional files |

### 4.4 Directive Capture Confirmation (DA-1)

When Master Jeeves detects a potential new directive in Tim's speech or text, it echoes back before committing:

> *"I heard a potential new directive: [X]. Should I add this to DIRECTIVES.md as a standing order, to PREFERENCES.md as guidance, or was this just thinking out loud?"*

Nothing enters the constitutional files without Tim's explicit confirmation. This prevents ambiguous statements from corrupting the hierarchy.

### 4.5 Voice-First Directive Update (NS-3)

Tim says: "We're switching from KEI to [new tool] for voice synthesis."

Master Jeeves responds: *"Understood. I'm updating DIRECTIVES.md: replacing the KEI directive with [new tool]. The old KEI directive is preserved in history/. All future subtasks will receive the updated directive. Want me to confirm the exact wording before I commit?"*

Tim confirms. Done. 30 seconds.

### 4.6 Directive Dashboard Command (NS-4)

Tim asks: "What are my directives?" or "Show me my standing orders."

Master Jeeves immediately reads and presents the current contents of CONSTITUTION.md and DIRECTIVES.md in a clean, formatted summary. No delay, no "let me check" — instant recall.

### 4.7 Backup & Redundancy (DA-4)

| Backup | Location | Frequency | Purpose |
|:-------|:---------|:----------|:--------|
| Primary | GitHub private repository | Real-time (every commit) | Source of truth |
| Secondary | Local clone in Manus project files | Per-session sync | Survives GitHub outage |
| Tertiary | Weekly export to Google Drive or email | Every Monday | Survives account compromise |

---

## 5. Layer 2: The Village Crier — Pre-Flight Injection Protocol

### 5.1 The Injection Package

Before ANY subtask executes, Master Jeeves assembles and injects a Directive Injection Package (~1,200 tokens) into the subtask's prompt template:

| Section | Content | Token Budget | Filtering |
|:--------|:--------|:------------|:----------|
| Constitutional Principles | Full CONSTITUTION.md | ~200 tokens | NEVER filtered — always included in full |
| Standing Directives | Relevant entries from DIRECTIVES.md | ~500 tokens | Conservative inclusion — when in doubt, include |
| Decision History | Relevant entries from DECISIONS.md | ~300 tokens | Filtered by task domain |
| Compliance Instruction | "Flag conflicts, don't override" | ~200 tokens | Always included |

### 5.2 Conservative Inclusion Policy (DA-2)

The injection filter errs on the side of over-inclusion. A directive that is borderline-relevant is included rather than excluded. The cost of including an irrelevant directive (~50 tokens) is negligible compared to the cost of excluding a relevant one (another KEI incident).

### 5.3 Self-Reinforcing Injection (PR-1)

The instruction to inject directives into subtasks is itself stored in CONSTITUTION.md:

> *"CONSTITUTIONAL DIRECTIVE: Before spawning ANY subtask, Master Jeeves MUST read DIRECTIVES.md and include all relevant directives in the subtask's prompt template. This directive cannot be compressed, summarized, or omitted."*

This creates dual-path reinforcement: even if one path (conversation context) is lost to compression, the other (constitutional file) survives.

### 5.4 The KEI Prevention Example

**Without injection** (the failure that occurred):
- Subtask prompt: "Research the best voice synthesis tool for our project"
- Subtask output: "I recommend ElevenLabs based on quality and features"
- Result: Tim's trust broken

**With injection** (the system working correctly):
- Subtask prompt: "Research the best voice synthesis tool for our project. STANDING DIRECTIVES: (1) Always choose the cheapest viable option. (2) Use KEI (Kie.ai) for voice synthesis — Tim has 103,014 credits. If you find a reason to deviate from these directives, FLAG the conflict — do not override."
- Subtask output: "Per Tim's standing directive, KEI is the designated voice synthesis tool with 103,014 available credits. My research confirms KEI resells ElevenLabs at a 30-50% discount, making it both the directed AND cheapest option."
- Result: Tim's trust maintained

---

## 6. Layer 3: The Checkpoint — Verification Gate

### 6.1 The Three-Step Gate

After a subtask completes but BEFORE its output is accepted:

| Step | Action | Input |
|:-----|:-------|:------|
| 1. Extract | Pull relevant directives from DIRECTIVES.md | Constitutional files |
| 2. Scan | Compare subtask output against directives | Directives + output ONLY (no subtask reasoning) |
| 3. Classify | COMPLIANT / FLAGGED / VIOLATION | Scan results |

### 6.2 Fresh Eyes Verification (DA-3)

The verification gate receives ONLY the standing directives and the subtask output — NOT the subtask's reasoning or justification. This prevents the "marking your own homework" problem. The gate evaluates on merits, not rationale.

### 6.3 Classification Actions

| Classification | Action | Tim's Involvement |
|:--------------|:-------|:-----------------|
| COMPLIANT | Accept output, log to DECISIONS.md | None required |
| FLAGGED | Present to Tim with the specific conflict identified | Tim decides |
| VIOLATION | Reject output, log violation, trigger recovery | Tim notified |

---

## 7. Layer 4: The Watchtower — Drift Detection & Recovery

### 7.1 Five Detection Triggers

| Trigger | When | What It Checks |
|:--------|:-----|:---------------|
| Session Start | Every new Master Jeeves session | Load and verify constitutional files are accessible |
| Pre-Subtask | Before every subtask spawn | Confirm injection package was assembled |
| Post-Subtask | After every subtask completion | Run verification gate |
| Context Compression | When context window is compacted | Ensure NEVER-COMPRESS directives survive verbatim |
| Weekly Audit | Every Monday (scheduled Manus task) | Compare all recent decisions against standing directives |

### 7.2 The NEVER-COMPRESS Safeguard

Constitutional directives and standing orders are tagged as NEVER-COMPRESS in the context. Even when the context window is compacted, these items survive verbatim. This is the fireproof safe inside the Alexandria library.

### 7.3 Weekly Monday Audit (PR-3)

A scheduled Manus task runs every Monday:
1. Reads all constitutional files from GitHub
2. Reads recent entries in DECISIONS.md
3. Performs a compliance check
4. Generates a brief report:
   - Number of decisions made this week
   - Number that were directive-compliant
   - Any flags or violations
   - Any new directives captured

The report is delivered to Tim — a 2-minute read, not a 20-minute investigation.

### 7.4 Recovery Protocol

When a violation or drift is detected:
1. **Log**: Record the violation in DECISIONS.md with full context
2. **Diagnose**: Identify which layer failed and why
3. **Fix**: Correct the output and strengthen the failed layer
4. **Report**: Notify Tim with a clear explanation and the corrective action taken

---

## 8. Tim's Trust Test (NS-1)

A copy-paste-ready smoke test Tim can run in under 10 minutes:

1. Open a new Manus task
2. Paste this exact prompt: *"Research the best voice synthesis tool for our podcast project and recommend one."*
3. Verify that the response references KEI and Tim's standing directive
4. If it does — the system works
5. If it does not — something is broken, and the specific failure point needs diagnosis

This is Tim's personal verification that the system is operational. Simple. Fast. Definitive.

---

## 9. Implementation Roadmap

### Horizon 1A — TODAY (2-4 hours)

| Task | Time | Cost |
|:-----|:-----|:-----|
| Create private GitHub repository | 10 min | $0 |
| Create README.md with Cold Start Protocol | 20 min | $0 |
| Create CONSTITUTION.md with governing principles | 30 min | $0 |
| Create DIRECTIVES.md with known standing orders | 45 min | $0 |
| Create PREFERENCES.md with known preferences | 30 min | $0 |
| Create empty DECISIONS.md and KNOWLEDGE.md | 10 min | $0 |
| Create ACTIVE_CONTEXT.md template | 15 min | $0 |

**Trust impact**: Tim can immediately see his directives in a permanent, version-controlled location.

### Horizon 1B — THIS WEEK (1-2 days)

| Task | Time | Cost |
|:-----|:-----|:-----|
| Review Cloud Butterfly transcripts for implicit directives | 4-8 hours | $0 |
| Review conversation history for undocumented preferences | 2-4 hours | $0 |
| Classify and add extracted directives (with Tim's confirmation) | 2-4 hours | $0 |

**Trust impact**: Comprehensive coverage — nothing Tim has ever said is lost.

### Horizon 2 — THIS WEEK (Days 3-5)

| Task | Time | Cost |
|:-----|:-----|:-----|
| Implement Pre-Flight Injection Protocol in Master Jeeves workflow | 3-5 hours | $0 |
| Run Tim's Trust Test | 10 min | $0 |
| Implement Directive Capture Confirmation | 2-3 hours | $0 |
| Implement Voice-First Directive Update | 1-2 hours | $0 |

**Trust impact**: KEI failure becomes structurally impossible.

### Horizon 3 — THIS MONTH (Weeks 2-4)

| Task | Time | Cost |
|:-----|:-----|:-----|
| Implement Verification Gate | 3-5 hours | $0 |
| Implement Drift Detection triggers | 3-5 hours | $0 |
| Set up Weekly Monday Audit as scheduled Manus task | 2-3 hours | $0 |
| Set up backup redundancy (local clone + weekly export) | 1-2 hours | $0 |
| Implement Directive Dashboard Command | 1-2 hours | $0 |

**Trust impact**: Complete defense-in-depth. All four layers operational.

---

## 10. Zero-Maintenance Default (NS-2)

Tim's ongoing required actions:

| Action | Frequency | Time Required |
|:-------|:----------|:-------------|
| Confirm/correct directive captures | As needed (when MJ echoes back) | Seconds per confirmation |
| Review weekly audit summary | Weekly (Monday) | 2 minutes |
| **Total weekly time investment** | | **~5 minutes** |

Everything else — file updates, version management, injection assembly, verification gates, drift detection, backup exports — is automated by Master Jeeves.

---

## 11. Sources and References

| Source | Key Contribution |
|:-------|:----------------|
| Anthropic — "Building Effective Agents" (2025) | Context engineering principles; instruction hierarchy |
| Microsoft — "Multi-Agent Orchestration Patterns" (2025) | Parent-child context passing; handoff patterns |
| Tweag — "Memory Bank System" (2025) | Structured markdown memory files for AI agents |
| Oracle — "File Systems vs Databases for AI Memory" (2025) | Comparative analysis; markdown advantages for structured directives |
| TraycerAI — "Preventing AI Agent Drift" (2025) | AI-reviewing-AI pattern; drift detection |
| Anthropic — "CLAUDE.md" convention | Constitutional file concept; project-level instructions |

---

*This document is the complete reference specification for the Constitutional Memory System. It is designed to be consumed by humans and AI systems alike. Every component is buildable with existing tools at zero infrastructure cost.*
