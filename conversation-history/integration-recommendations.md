# Integration Recommendations — V14 Dashboard Integration Paths

**From:** Master Jeeves (Manus AI — Transfer Session)
**To:** Jeeves (Manus AI — V14 Dashboard Owner)
**Date:** March 5, 2026
**Purpose:** Specific instructions for integrating each piece from this transfer package into the V14 Learning Loop Dashboard.

---

## Overview

The V14 Dashboard has: 39 pages, 30 database tables, 300 passing tests, a working PEARL Diamond 3D, and a complete React 19 + Express + tRPC + Drizzle stack. This transfer package contains work that Jeeves does NOT have — specifically the Constitutional Memory System, the Enforcement Engine, the Cloud Butterfly brain dump analysis, and all governance/directive documentation.

**Integration philosophy:** Jeeves is the builder. This package is the supplier. Every piece below tells Jeeves exactly what it is, what V14 component it connects to, and how to integrate it.

---

## 1. Constitutional Memory System → V14 Knowledge Layer

### What It Is
10 markdown files that form the governance layer for all AI operations. These are the "fireproof safe" — the files that must never be lost, compressed, or overridden.

### Files and V14 Integration Paths

| Source File | V14 Target Path | V14 Component | Integration Method |
|:------------|:---------------|:-------------|:-------------------|
| `constitutional-memory/CONSTITUTION.md` | `docs/constitutional/CONSTITUTION.md` | Knowledge base | Copy directly. Reference from session bookends. |
| `constitutional-memory/DIRECTIVES.md` | `docs/constitutional/DIRECTIVES.md` | Knowledge base, Bingo Card system | Copy directly. Each directive maps to Bingo Card behaviors. |
| `constitutional-memory/DECISIONS.md` | `docs/constitutional/DECISIONS.md` | Knowledge base | Copy directly. Append-only — never edit existing entries. |
| `constitutional-memory/PREFERENCES.md` | `docs/constitutional/PREFERENCES.md` | User settings, session config | Copy directly. Contains Tim's contact info and working style. |
| `constitutional-memory/KNOWLEDGE.md` | `docs/constitutional/KNOWLEDGE.md` | Knowledge base, Pearl's Brain | Copy directly. Index of all institutional knowledge. |
| `constitutional-memory/ACTIVE_CONTEXT.md` | `docs/constitutional/ACTIVE_CONTEXT.md` | Session management | Copy directly. Tracks current session state. |
| `constitutional-memory/INJECTION_PROTOCOL.md` | `docs/constitutional/INJECTION_PROTOCOL.md` | Subtask spawning | Copy directly. Must be read before spawning any subtask. |
| `constitutional-memory/VERIFICATION_GATE.md` | `docs/constitutional/VERIFICATION_GATE.md` | Output verification | Copy directly. Must be applied to all significant outputs. |
| `constitutional-memory/DRIFT_DETECTION.md` | `docs/constitutional/DRIFT_DETECTION.md` | Quality assurance | Copy directly. 5 triggers, weekly Monday audit template. |
| `constitutional-memory/README.md` | `docs/constitutional/README.md` | Cold Start Protocol | Copy directly. Read this first on every new session. |

### V14 Dashboard Pages That Should Reference These Files

| V14 Page | Constitutional File | How |
|:---------|:-------------------|:----|
| `SessionBookends` | README.md (Cold Start Protocol) | Load constitutional files at session start |
| `BingoCards` | DIRECTIVES.md (DIR-012 through DIR-023) | Each directive defines Bingo Card behavior |
| `PearlDiamond` | CONSTITUTION.md, KNOWLEDGE.md | Pearl's governance and knowledge index |
| `CloudButterflyGallery` | KNOWLEDGE.md | Brain dump processing priorities |
| `ProtocolAnalytics` | DRIFT_DETECTION.md | Drift detection triggers and audit template |
| `SessionDetail` | ACTIVE_CONTEXT.md | Session state tracking |

---

## 2. Enforcement Engine → V14 Backend

### What It Is
A complete Python FastAPI application (14 files, 6,924 lines, 64 tests) that enforces the constitutional directives programmatically. It provides directive management, pre-flight injection packages, output compliance verification, and drift detection.

### Integration Options (Ranked)

**Option A — Sidecar Service (RECOMMENDED)**

Run the enforcement engine as a separate FastAPI service alongside the V14 Express/tRPC backend. The V14 backend calls the engine's REST API.

```
V14 Frontend (React 19)
    ↓
V14 Backend (Express/tRPC)
    ↓ HTTP calls
Enforcement Engine (FastAPI, port 8000)
    ├── /directives — List/get directives
    ├── /injection/package — Generate injection packages for subtasks
    ├── /verification/check — Verify output compliance
    ├── /drift/scan — Trigger drift scan
    └── /decisions — Log decisions
```

**Setup:**
```bash
cd enforcement-engine
pip install -r requirements.txt
python -m engine.jeeves_api  # Starts on port 8000
```

**V14 tRPC Integration Point:** Create a new tRPC router (e.g., `enforcement.ts`) that proxies calls to the FastAPI endpoints. This keeps the enforcement logic in Python (where it's tested and certified) while exposing it through the V14 API layer.

**Option B — TypeScript Port**

Rewrite the 6,924 lines of Python into TypeScript and embed directly in the V14 backend. This eliminates the cross-language boundary but requires significant effort and re-testing.

**Option C — Hybrid**

Keep Python for the core enforcement logic. Call it via subprocess or HTTP from the V14 backend for critical operations only (directive checks, verification gate). Use TypeScript for the simpler operations (listing directives, logging decisions).

### Key Engine Files and Their V14 Connections

| Engine File | Lines | V14 Connection | Purpose |
|:------------|------:|:-------------|:--------|
| `jeeves_engine.py` | 712 | Main orchestrator | Central coordinator — calls all other modules |
| `jeeves_api.py` | 618 | V14 tRPC proxy target | 16 REST endpoints for all engine operations |
| `jeeves_db.py` | 684 | V14 Drizzle/MySQL | SQLite database with 7 tables (could be migrated to MySQL) |
| `directive_registry.py` | 478 | V14 Bingo Card system | Manages all 23 directives — CRUD + search |
| `injection_engine.py` | 443 | V14 subtask spawning | Generates injection packages before any subtask |
| `verification_gate.py` | 900 | V14 output pipeline | Scans outputs for directive compliance |
| `drift_detector.py` | 788 | V14 ProtocolAnalytics page | 5 drift triggers, scoring, weekly audit |
| `constitution_loader.py` | 213 | V14 knowledge layer | Parses constitutional markdown files |
| `preference_store.py` | 220 | V14 user settings | Manages Tim's preferences |
| `decision_logger.py` | 257 | V14 session history | Append-only decision logging |
| `knowledge_index.py` | 275 | V14 Pearl's Brain | Full-text search across knowledge base |
| `session_manager.py` | 235 | V14 SessionBookends | Session lifecycle management |
| `cold_start.py` | 132 | V14 session start | New session initialization from constitutional files |
| `test_engine.py` | 931 | V14 test suite | 64 tests including KEI regression test |

### Database Migration Path

The enforcement engine uses SQLite with 7 tables. If integrating with V14's MySQL/TiDB:

| Engine Table | V14 Drizzle Migration | Purpose |
|:-------------|:---------------------|:--------|
| directives | New migration | Store all 23 directives with metadata |
| decisions | New migration | Append-only decision log |
| preferences | New migration | User preferences |
| drift_scores | New migration | Drift detection scores over time |
| injection_logs | New migration | Audit trail of injection packages |
| verification_logs | New migration | Audit trail of verification gate results |
| sessions | Extend existing sessions table | Add constitutional reload tracking |

---

## 3. Cloud Butterfly Brain Dump → V14 Cloud Butterfly Gallery

### What It Is
Tim's complete 8-part vision dump (20,541 bytes) containing the entire Bingo City architectural vision, plus `soul.md` (Master Jeeves identity definition).

### V14 Integration Path

| Source File | V14 Target Path | V14 Page |
|:------------|:---------------|:---------|
| `cloud-butterfly-brain-dump/cloud_butterfly_braindump_raw.md` | `docs/stray-files/cloud_butterfly_braindump_raw.md` | CloudButterflyGallery |
| `cloud-butterfly-brain-dump/soul.md` | `docs/stray-files/soul.md` | — |

**Processing recommendation:** The brain dump contains 8 distinct parts. Each part should be processed as a separate Cloud Butterfly entry in the V14 database, with extracted directives cross-referenced to DIRECTIVES.md.

---

## 4. Learning Loop Reports → V14 Protocol Analytics

### What It Is
4 Learning Loop evaluation reports documenting the progression from concept to certified production system.

### V14 Integration Path

| Source File | V14 Target Path | Score Progression |
|:------------|:---------------|:-----------------|
| `learning-loop-reports/learning_loop_bulletproof_memory.md` | `docs/learning-loops/ll1_bulletproof_memory.md` | 38 → 93/100 |
| (LL#2 — inline in enforcement engine development) | `docs/learning-loops/ll2_code_enforcement.md` | 41 → 97/100 |
| `learning-loop-reports/v13_learning_loop_3_report.md` | `docs/learning-loops/ll3_enforcement_mutations.md` | 97 → 98/100 |
| `learning-loop-reports/v13_learning_loop_4_report.md` | `docs/learning-loops/ll4_final_certification.md` | 98 → 99/100 |

**V14 Page:** ProtocolAnalytics — these reports should be accessible from the protocol analytics dashboard as historical evaluation records.

---

## 5. HB1000 360° Model → V14 KPI Dashboard

### What It Is
A comprehensive 360° status overview of all HB1000 work streams.

### V14 Integration Path

| Source File | V14 Target Path | V14 Page |
|:------------|:---------------|:---------|
| `hb1000-360-model/hb1000_360_status_overview.md` | `docs/status/hb1000_360_status_overview.md` | KpiDashboard, PersonalHB1000 |

---

## 6. KEI API Setup → V14 Configuration

### What It Is
KEI API keys and documentation for Tim's 103,014 credits.

### V14 Integration Path

| Source File | V14 Target Path | V14 Component |
|:------------|:---------------|:-------------|
| `kei-api-setup/kei_api_keys.txt` | Environment variables / secrets | Backend API configuration |

**CRITICAL:** Per DIR-001, all voice synthesis must use KEI, not ElevenLabs directly. The V14 backend should be configured to use KEI API keys for any voice/audio operations.

---

## 7. Directives → V14 Bingo Card System

### What It Is
All 23 standing directives extracted as individual files, plus an index.

### V14 Integration Path

The directives map directly to Bingo Card behaviors:

| Directive | V14 Bingo Card Feature |
|:----------|:----------------------|
| DIR-012 (Trojan Horse) | Bingo Card entry point design — simple exterior, full power behind |
| DIR-013 (Avatar Army) | Self-populating avatar system — 1 to 1,000 per rooftop |
| DIR-014 (Wisdom Giants) | Fractional expert pop-in/pop-out system |
| DIR-015 (Situations Manager) | Real-time context sensitivity — always on rooftop |
| DIR-016 (Inner Ring) | Core team boundary — stanchion/guard rail UI element |
| DIR-017 (I Got a Guy) | Community connector role inside Inner Ring |
| DIR-018 (Voice of Concern) | Permanent right-corner emotional intelligence avatar |
| DIR-019 (Angel) | Center pop-in/pop-out independent counsel avatar |
| DIR-020 (Swarm Mind) | Three-mode toggle: Chorus/Ensemble/Squadron |
| DIR-021 (Email) | Email forwarding integration |
| DIR-022 (News Channel) | Cross-Bingo Card visibility feature |
| DIR-023 (Communication) | User communication preference settings |

---

## 8. Analysis Documents → V14 Documentation

### V14 Integration Path

| Source File | V14 Target Path | Purpose |
|:------------|:---------------|:--------|
| `analysis/constitutional_memory_system_spec.md` | `docs/specs/constitutional_memory_system_spec.md` | Architecture specification |
| `analysis/jeeves_conversation_audit.md` | `docs/audits/jeeves_conversation_audit.md` | Forensic content recovery |
| `analysis/github_inventory_report.md` | `docs/audits/github_inventory_report.md` | Complete repo inventory |

---

## 9. Reference Material → V14 Stray Files

### V14 Integration Path

| Source File | V14 Target Path | Purpose |
|:------------|:---------------|:--------|
| `reference-material/legacy_team_constitution.md` | `docs/stray-files/legacy_team_constitution.md` | 10-Article team constitution |

---

## 10. Bingo Card Work → V14 Bingo Card Pages

### What It Is
The `bingo-card-work/` directory contains analysis documents related to the Bingo City vision. The actual Bingo City web application code was built and deployed within the Manus sandbox during the March 4 session but the sandbox has been reset. The architectural decisions and feature specifications are preserved in the brain dump and analysis documents.

### V14 Integration Path

The Bingo City features should be integrated into the existing V14 BingoCards page:

| Feature | Source | V14 Implementation |
|:--------|:-------|:-------------------|
| 5-storey building visualization | Brain dump Part 1 | BingoCards.tsx — building component |
| Rooftop avatar community | Brain dump Parts 2-6 | BingoCards.tsx — avatar system |
| 3-zone topology | Brain dump Part 4 | BingoCards.tsx — layout zones |
| Swarm Mind modes | Brain dump Part 2 | BingoCards.tsx — mode toggle |
| Voice of Concern | Brain dump Part 5 | BingoCards.tsx — permanent avatar |
| Angel of Your Better Nature | Brain dump Part 5 | BingoCards.tsx — pop-in avatar |
| Wisdom Giants | Brain dump Part 4 | BingoCards.tsx — fractional expert system |
| News Channel | Brain dump Part 3 | NewsChannel.tsx — cross-card visibility |
| Communication preferences | Brain dump Part 5 | User settings — preference selector |

---

## Priority Integration Order

1. **Constitutional Memory files** — These are the governance layer. Everything else depends on them.
2. **Directives** — These define behavior for all V14 components.
3. **Enforcement Engine** — This enforces the directives programmatically.
4. **Brain Dump** — This contains the architectural vision for Bingo Card features.
5. **Learning Loop Reports** — Historical evaluation records.
6. **Analysis Documents** — Reference and audit materials.
7. **KEI API Setup** — Configuration for voice synthesis.
8. **Everything else** — Reference material, conversation history, 360° model.

---

## Files That Do NOT Exist in This Package (and Why)

The following files were referenced in Tim's instructions but do not exist in this sandbox session. They were created in prior Manus sessions:

| File | Reason Not Included | Where It Likely Is |
|:-----|:-------------------|:-------------------|
| bingo_city_analysis.md (parts 1-3) | Created in prior session, not uploaded | V14 repo `docs/stray-files/` or prior Manus session |
| youtube_zed_aletheia_analysis.md | Created in prior session | V14 repo `docs/stray-files/` |
| kei_research.md / kei_vs_elevenlabs_research.md | Created in prior session | V14 repo `docs/stray-files/` |
| inception_research.md | Created in prior session | V14 repo `docs/stray-files/` |
| mr_drifter_audit_report.md | Created in prior session | V14 repo `docs/stray-files/` |
| master_jeeves_vs_jeeves_comparison.md | Created in prior session | V14 repo `docs/stray-files/` |
| All PNG visuals (infographics, rooftop, emblems, constitution) | Created in prior session, not in this sandbox | V14 repo `images/` or `docs/screenshots/` |
| tiktok_local_community_content/strategy.md | Created in prior session | V14 repo `docs/stray-files/` |
| email_setup_guide.md | Created in prior session | V14 repo `docs/stray-files/` |
| instructions_executive_assistant/it_software_team/main_helper.md | Created in prior session | V14 repo `docs/stray-files/` |
| phase1_github_push_hardened.md | Created in prior session | V14 repo `docs/stray-files/` |
| beer_capabilities_guide.md | Created in prior session | V14 repo `docs/stray-files/` |
| digger_cafe_project_report.md | Created in prior session | V14 repo `docs/stray-files/` |
| learning_loop_v13_workbook.md | Created in prior session | V14 repo `docs/stray-files/` |
| legacy_team_action_items.md | Created in prior session | V14 repo `docs/stray-files/` |
| v13_learning_loop_report.md (LL#2) | Created in prior session | V14 repo or master-jeeves-brain |

**Jeeves should check the V14 repository's `docs/stray-files/` directory** — many of these files are likely already there from Operation Alexandria.

---

*Integration recommendations prepared March 5, 2026 by Manus AI*
*For Jeeves — the V14 Dashboard owner*
*One link. Zero loss. The supplier has shipped.*
