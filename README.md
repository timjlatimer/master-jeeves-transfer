# Master Jeeves Transfer Repository

**Purpose:** Complete knowledge transfer from Master Jeeves (Manus AI Session — Feb 15 to Mar 5, 2026) to Jeeves (Tim's primary Manus AI running the V14 Dashboard).

**Owner:** Tim J Latimer (@timjlatimer)
**Created:** March 5, 2026
**Transfer Type:** One link, zero loss. Full fidelity. Zero summarization.

---

## How to Use This Repository

**Jeeves:** Read `TRANSFER_MANIFEST.md` to verify file integrity, then follow `conversation-history/integration-recommendations.md` for specific V14 integration paths.

**Tim:** Share this repo URL with Jeeves. That is the only action needed.

---

## Repository Structure

```
master-jeeves-transfer/
├── README.md                          ← YOU ARE HERE
├── TRANSFER_MANIFEST.md               ← SHA256 checksums for every file
├── MASTER_JEEVES_COMPLETE_REPORT.md   ← Exhaustive report of everything accomplished
│
├── constitutional-memory/             ← 10 files — The Fireproof Safe (Layer 1)
│   ├── CONSTITUTION.md                ← Supreme authority (7 Articles)
│   ├── DIRECTIVES.md                  ← 23 standing orders from Tim
│   ├── DECISIONS.md                   ← Append-only decision log
│   ├── PREFERENCES.md                 ← Tim's preferences and contacts
│   ├── KNOWLEDGE.md                   ← Pearl's Brain index
│   ├── ACTIVE_CONTEXT.md              ← Current session state
│   ├── INJECTION_PROTOCOL.md          ← Layer 2: Pre-flight injection
│   ├── VERIFICATION_GATE.md           ← Layer 3: Output compliance
│   ├── DRIFT_DETECTION.md             ← Layer 4: Continuous monitoring
│   └── README.md                      ← Cold Start Protocol
│
├── enforcement-engine/                ← 14 Python files + 64 tests (6,924 lines)
│   ├── README.md                      ← Engine documentation
│   ├── requirements.txt               ← Python dependencies
│   └── engine/                        ← Source code
│       ├── __init__.py
│       ├── jeeves_engine.py           ← Main orchestrator (712 lines)
│       ├── jeeves_api.py              ← FastAPI server, 16 endpoints (618 lines)
│       ├── jeeves_db.py               ← SQLite database, 7 tables (684 lines)
│       ├── directive_registry.py      ← Directive management (478 lines)
│       ├── injection_engine.py        ← Pre-flight injection (443 lines)
│       ├── verification_gate.py       ← Output compliance gate (900 lines)
│       ├── drift_detector.py          ← Drift detection (788 lines)
│       ├── constitution_loader.py     ← Constitutional file parser (213 lines)
│       ├── preference_store.py        ← Preference management (220 lines)
│       ├── decision_logger.py         ← Decision logging (257 lines)
│       ├── knowledge_index.py         ← Knowledge search (275 lines)
│       ├── session_manager.py         ← Session lifecycle (235 lines)
│       ├── cold_start.py              ← New session init (132 lines)
│       └── tests/
│           ├── __init__.py
│           └── test_engine.py         ← 64 tests (931 lines)
│
├── bingo-card-work/                   ← Bingo City vision and architecture
│   └── bingo_city_architectural_spec.md ← Complete spec from brain dump
│
├── cloud-butterfly-brain-dump/        ← Tim's raw 8-part vision dump
│   ├── cloud_butterfly_braindump_raw.md ← All 8 parts, VERBATIM
│   └── soul.md                        ← Master Jeeves identity
│
├── learning-loop-reports/             ← 3 Learning Loop evaluation reports
│   ├── learning_loop_bulletproof_memory.md ← LL#1: 38→93 (Constitutional Memory)
│   ├── v13_learning_loop_3_report.md  ← LL#3: 97→98 (6 mutations)
│   └── v13_learning_loop_4_report.md  ← LL#4: 98→99 (certified)
│
├── hb1000-360-model/                  ← 360° HB1000 status overview
│   └── hb1000_360_status_overview.md
│
├── kei-api-setup/                     ← KEI API keys and email setup
│   ├── kei_api_keys.txt               ← 3 API keys (103,014 credits)
│   └── email_setup_guide.md           ← masterjeeves@ setup instructions
│
├── directives/                        ← All 23 directives as individual files
│   ├── INDEX.md                       ← Directive index
│   ├── dir-001_cost_*.md              ← through dir-023_*.md
│   └── ... (23 directive files)
│
├── analysis/                          ← Analysis and audit documents
│   ├── constitutional_memory_system_spec.md ← 11-section architecture spec
│   ├── jeeves_conversation_audit.md   ← Forensic content recovery
│   └── github_inventory_report.md     ← Complete V13+V14 inventory
│
├── conversation-history/              ← Session history and integration notes
│   ├── decisions-log.md               ← Every decision with context
│   ├── full-conversation-export.md    ← Complete conversation reconstruction
│   └── integration-recommendations.md ← V14 integration paths for each piece
│
├── reference-material/                ← Reference documents
│   └── legacy_team_constitution.md    ← 10-Article team constitution
│
└── visuals/                           ← Visual assets status
    └── VISUAL_ASSETS_NOTE.md          ← Documents which visuals exist where
```

---

## Quick Stats

| Metric | Value |
|:-------|:------|
| Total files in this repo | 50+ |
| Constitutional files | 10 |
| Python code files | 14 (6,924 lines) |
| Test cases | 64 (all passing) |
| Standing directives | 23 |
| Decisions logged | 7 (plus test entries) |
| Learning Loop reports | 3 |
| Brain dump parts | 8 (verbatim) |

---

## The North Star

> **Ruby Red** — the 35-45 year old mother of two, the Chief Financial Officer of her household, making impossible decisions every day about groceries, extracurriculars, and flat tires.

> *"It's expensive to be poor. We think that's a crime in society, and we're trying to change it."*

> If we get it right for Ruby Red, we get it right for everybody else.

---

*Repository created March 5, 2026 by Manus AI (Master Jeeves)*
*For the SIC HB1000 Solve Team*
*One link. Zero loss. The library will not burn.*
