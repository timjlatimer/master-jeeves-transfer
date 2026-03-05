"""
drift_detector.py — The Drift Detector for the Jeeves Enforcement Engine

Code Horizon 3: 5 triggers as code hooks + scheduled audit.

Drift Detection Triggers:
    1. session_start    — Constitutional reload at session start
    2. pre_subtask      — Injection integrity check before subtask spawn
    3. post_subtask     — Output compliance scan after subtask completion
    4. compression      — NEVER-COMPRESS safeguard during context compression
    5. weekly           — Scheduled weekly Monday audit

Drift Types:
    - Directive Amnesia: Directive exists but is not being followed
    - Silent Override: Directive is being overridden without flagging
    - Scope Creep: Directive interpretation has expanded beyond original intent
    - Compression Loss: Critical content lost during context compression
    - Sync Drift: In-memory state diverged from source files
    - Inheritance Failure: Subtask spawned without proper injection
    - Version Drift: Directive version mismatch between registry and source

Seven drift types. Five triggers. Zero tolerance.
"""

import hashlib
import json
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any, Tuple
from enum import Enum

from .directive_registry import DirectiveRegistry, Directive
from .injection_engine import InjectionEngine, InjectionPackage
from .verification_gate import VerificationGate, VerificationResult, Classification
from .jeeves_db import JeevesDB


# ---------------------------------------------------------------------------
# Drift Types
# ---------------------------------------------------------------------------

class DriftType(str, Enum):
    DIRECTIVE_AMNESIA = "Directive Amnesia"
    SILENT_OVERRIDE = "Silent Override"
    SCOPE_CREEP = "Scope Creep"
    COMPRESSION_LOSS = "Compression Loss"
    SYNC_DRIFT = "Sync Drift"
    INHERITANCE_FAILURE = "Inheritance Failure"
    VERSION_DRIFT = "Version Drift"


class DriftSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


# ---------------------------------------------------------------------------
# NEVER-COMPRESS Items (Absolute Tier)
# ---------------------------------------------------------------------------

NEVER_COMPRESS_ABSOLUTE = [
    {
        "id": "NC-001",
        "description": "Constitutional Directive — Subtask Inheritance (Article IV)",
        "check_text": "Before spawning ANY subtask, Master Jeeves MUST read DIRECTIVES.md",
        "source": "CONSTITUTION.md",
    },
    {
        "id": "NC-002",
        "description": "KEI Voice Synthesis Directive (DIR-001)",
        "check_text": "KEI",
        "source": "DIRECTIVES.md DIR-001",
    },
    {
        "id": "NC-003",
        "description": "Zero Drift Tolerance (Article V)",
        "check_text": "Zero drift",
        "source": "CONSTITUTION.md",
    },
    {
        "id": "NC-004",
        "description": "Compliance Instruction Footer",
        "check_text": "Flag conflicts, don't override",
        "source": "INJECTION_PROTOCOL.md",
    },
    {
        "id": "NC-005",
        "description": "Ruby Red — North Star Client",
        "check_text": "Ruby Red",
        "source": "CONSTITUTION.md Article III",
    },
]

NEVER_COMPRESS_CRITICAL = [
    {
        "id": "NC-006",
        "description": "MVD Philosophy (DIR-003)",
        "check_text": "Minimum Viable Distribution",
        "source": "DIRECTIVES.md DIR-003",
    },
    {
        "id": "NC-007",
        "description": "24 Hours Not 6 Months (DIR-002)",
        "check_text": "24 hours",
        "source": "DIRECTIVES.md DIR-002",
    },
    {
        "id": "NC-008",
        "description": "Swiss Village Governance (DIR-006)",
        "check_text": "Swiss village",
        "source": "DIRECTIVES.md DIR-006",
    },
]


# ---------------------------------------------------------------------------
# Drift Event
# ---------------------------------------------------------------------------

@dataclass
class DriftEvent:
    """A single drift detection event."""
    trigger_type: str
    drift_type: Optional[DriftType]
    severity: DriftSeverity
    description: str
    directives_affected: List[str] = field(default_factory=list)
    resolution: Optional[str] = None
    resolved: bool = False
    session_id: Optional[str] = None
    timestamp: str = ""

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "trigger_type": self.trigger_type,
            "drift_type": self.drift_type.value if self.drift_type else None,
            "severity": self.severity.value,
            "description": self.description,
            "directives_affected": self.directives_affected,
            "resolution": self.resolution,
            "resolved": self.resolved,
            "session_id": self.session_id,
            "timestamp": self.timestamp,
        }


# ---------------------------------------------------------------------------
# Audit Report
# ---------------------------------------------------------------------------

@dataclass
class AuditReport:
    """A complete weekly audit report."""
    period_start: str
    period_end: str
    decisions_count: int = 0
    compliant_count: int = 0
    flagged_count: int = 0
    violation_count: int = 0
    new_directives: int = 0
    drift_events: List[DriftEvent] = field(default_factory=list)
    compliance_score: float = 100.0
    score_breakdown: Dict[str, float] = field(default_factory=dict)
    recommendations: List[str] = field(default_factory=list)
    timestamp: str = ""

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()

    def to_markdown(self) -> str:
        """Generate the full weekly audit report in markdown."""
        lines = [
            "# Weekly Monday Audit Report",
            f"**Period**: {self.period_start} to {self.period_end}",
            f"**Generated**: {self.timestamp}",
            f"**Compliance Score**: {self.compliance_score:.1f}/100",
            "",
            "## Summary",
            "",
            "| Metric | Count |",
            "|:-------|------:|",
            f"| Decisions Logged | {self.decisions_count} |",
            f"| Compliant Checks | {self.compliant_count} |",
            f"| Flagged Checks | {self.flagged_count} |",
            f"| Violations | {self.violation_count} |",
            f"| New Directives | {self.new_directives} |",
            f"| Drift Events | {len(self.drift_events)} |",
            "",
        ]

        if self.score_breakdown:
            lines.append("## Score Breakdown\n")
            lines.append("| Component | Score |")
            lines.append("|:----------|------:|")
            for component, score in self.score_breakdown.items():
                lines.append(f"| {component} | {score:.1f} |")
            lines.append("")

        if self.drift_events:
            lines.append("## Drift Events\n")
            for i, event in enumerate(self.drift_events, 1):
                status = "RESOLVED" if event.resolved else "OPEN"
                lines.append(
                    f"{i}. **[{event.severity.value}]** {event.description} "
                    f"({event.drift_type.value if event.drift_type else 'Unknown'}) — {status}"
                )
            lines.append("")

        if self.recommendations:
            lines.append("## Recommendations\n")
            for i, rec in enumerate(self.recommendations, 1):
                lines.append(f"{i}. {rec}")
            lines.append("")

        lines.append("---")
        lines.append("*Generated by the Jeeves Enforcement Engine — Drift Detector*")
        return "\n".join(lines)


# ---------------------------------------------------------------------------
# Drift Detector
# ---------------------------------------------------------------------------

class DriftDetector:
    """
    The Drift Detector monitors for constitutional drift across all operations.
    
    Five triggers, seven drift types, zero tolerance.
    
    Usage:
        detector = DriftDetector(registry, injection_engine, gate, db)
        
        # Trigger 1: Session start
        events = detector.session_start_check(session_id)
        
        # Trigger 2: Pre-subtask
        events = detector.pre_subtask_check(package)
        
        # Trigger 3: Post-subtask
        events = detector.post_subtask_check(result)
        
        # Trigger 4: Compression
        events = detector.compression_check(context_text, session_id)
        
        # Trigger 5: Weekly audit
        report = detector.weekly_audit()
    """

    def __init__(
        self,
        registry: DirectiveRegistry,
        injection_engine: Optional[InjectionEngine] = None,
        verification_gate: Optional[VerificationGate] = None,
        db: Optional[JeevesDB] = None,
        repo_path: Optional[str] = None,
    ):
        self.registry = registry
        self.injection_engine = injection_engine
        self.verification_gate = verification_gate
        self.db = db
        self.repo_path = repo_path or registry.repo_path

    # -------------------------------------------------------------------
    # Trigger 1: Session Start — Constitutional Reload
    # -------------------------------------------------------------------

    def session_start_check(self, session_id: str = "") -> List[DriftEvent]:
        """
        Trigger 1: Session start constitutional reload.
        
        Verifies:
            - All constitutional files exist
            - Registry is in sync with source files
            - Database is accessible
            - No unresolved critical drift events
        """
        events = []

        # Check constitutional files exist
        required_files = [
            "CONSTITUTION.md", "DIRECTIVES.md", "DECISIONS.md",
            "PREFERENCES.md", "KNOWLEDGE.md", "ACTIVE_CONTEXT.md",
        ]
        for filename in required_files:
            filepath = os.path.join(self.repo_path, filename)
            if not os.path.exists(filepath):
                events.append(DriftEvent(
                    trigger_type="session_start",
                    drift_type=DriftType.SYNC_DRIFT,
                    severity=DriftSeverity.CRITICAL,
                    description=f"Constitutional file missing: {filename}",
                    session_id=session_id,
                ))

        # Check registry sync
        sync_status = self.registry.check_sync_integrity()
        if not sync_status["in_sync"]:
            self.registry.load()
            events.append(DriftEvent(
                trigger_type="session_start",
                drift_type=DriftType.SYNC_DRIFT,
                severity=DriftSeverity.WARNING,
                description="Registry was out of sync with DIRECTIVES.md. Re-synced.",
                resolution="Registry reloaded from source file.",
                resolved=True,
                session_id=session_id,
            ))

        # Check for unresolved critical drift events
        if self.db:
            critical_events = self.db.get_drift_events(severity="CRITICAL")
            unresolved = [e for e in critical_events if not e.get("resolved")]
            if unresolved:
                events.append(DriftEvent(
                    trigger_type="session_start",
                    drift_type=None,
                    severity=DriftSeverity.WARNING,
                    description=f"{len(unresolved)} unresolved CRITICAL drift events from previous sessions.",
                    session_id=session_id,
                ))

        # Log clean start if no issues
        if not events:
            events.append(DriftEvent(
                trigger_type="session_start",
                drift_type=None,
                severity=DriftSeverity.INFO,
                description="Session start check passed. All constitutional files present. Registry in sync.",
                resolved=True,
                session_id=session_id,
            ))

        # Log all events to database
        if self.db:
            for event in events:
                self.db.log_drift_event(event.to_dict())

        return events

    # -------------------------------------------------------------------
    # Trigger 2: Pre-Subtask — Injection Integrity Check
    # -------------------------------------------------------------------

    def pre_subtask_check(self, package: InjectionPackage) -> List[DriftEvent]:
        """
        Trigger 2: Pre-subtask injection integrity check.
        
        Verifies:
            - Package contains constitutional principles
            - Package contains compliance footer
            - Package checksum is valid
            - Directives in package match current registry
        """
        events = []

        # Verify constitutional principles present
        if not package.constitutional_text:
            events.append(DriftEvent(
                trigger_type="pre_subtask",
                drift_type=DriftType.INHERITANCE_FAILURE,
                severity=DriftSeverity.CRITICAL,
                description="Injection package missing constitutional principles.",
                directives_affected=["CONSTITUTION"],
            ))

        # Verify compliance footer present
        if not package.compliance_footer:
            events.append(DriftEvent(
                trigger_type="pre_subtask",
                drift_type=DriftType.INHERITANCE_FAILURE,
                severity=DriftSeverity.CRITICAL,
                description="Injection package missing compliance footer.",
            ))

        # Verify package integrity
        if self.injection_engine and not self.injection_engine.verify_package_integrity(package):
            events.append(DriftEvent(
                trigger_type="pre_subtask",
                drift_type=DriftType.VERSION_DRIFT,
                severity=DriftSeverity.WARNING,
                description="Injection package checksum mismatch — package may have been modified.",
            ))

        # Verify directives are current
        current_ids = set(self.registry.get_directive_ids())
        package_ids = set(package.directive_ids)
        missing = current_ids - package_ids
        # Only flag if critical directives are missing
        critical_missing = [d for d in missing if d in ("DIR-001", "DIR-002", "DIR-003", "DIR-011")]
        if critical_missing:
            events.append(DriftEvent(
                trigger_type="pre_subtask",
                drift_type=DriftType.DIRECTIVE_AMNESIA,
                severity=DriftSeverity.WARNING,
                description=f"Critical directives missing from injection package: {critical_missing}",
                directives_affected=critical_missing,
            ))

        if not events:
            events.append(DriftEvent(
                trigger_type="pre_subtask",
                drift_type=None,
                severity=DriftSeverity.INFO,
                description="Pre-subtask injection integrity check passed.",
                resolved=True,
            ))

        if self.db:
            for event in events:
                self.db.log_drift_event(event.to_dict())

        return events

    # -------------------------------------------------------------------
    # Trigger 3: Post-Subtask — Output Compliance Scan
    # -------------------------------------------------------------------

    def post_subtask_check(self, result: VerificationResult) -> List[DriftEvent]:
        """
        Trigger 3: Post-subtask output compliance scan.
        
        Converts verification findings into drift events.
        """
        events = []

        if result.has_violations:
            for finding in result.findings:
                if finding.classification == Classification.VIOLATION:
                    events.append(DriftEvent(
                        trigger_type="post_subtask",
                        drift_type=DriftType.SILENT_OVERRIDE,
                        severity=DriftSeverity.CRITICAL,
                        description=f"Violation in task {result.task_id}: {finding.description}",
                        directives_affected=[finding.directive_id],
                    ))

        if result.has_flags:
            for finding in result.findings:
                if finding.classification == Classification.FLAGGED:
                    events.append(DriftEvent(
                        trigger_type="post_subtask",
                        drift_type=DriftType.SCOPE_CREEP,
                        severity=DriftSeverity.WARNING,
                        description=f"Flag in task {result.task_id}: {finding.description}",
                        directives_affected=[finding.directive_id],
                    ))

        if not events:
            events.append(DriftEvent(
                trigger_type="post_subtask",
                drift_type=None,
                severity=DriftSeverity.INFO,
                description=f"Post-subtask check passed for task {result.task_id}.",
                resolved=True,
            ))

        if self.db:
            for event in events:
                self.db.log_drift_event(event.to_dict())

        return events

    # -------------------------------------------------------------------
    # Trigger 4: Compression — NEVER-COMPRESS Safeguard
    # -------------------------------------------------------------------

    def compression_check(
        self, context_text: str, session_id: str = ""
    ) -> List[DriftEvent]:
        """
        Trigger 4: Context compression NEVER-COMPRESS safeguard.
        
        Checks that all NEVER-COMPRESS items survive context compression.
        If any are missing, they are flagged for re-injection.
        """
        events = []
        text_lower = context_text.lower()

        all_items = NEVER_COMPRESS_ABSOLUTE + NEVER_COMPRESS_CRITICAL
        items_checked = len(all_items)
        items_survived = 0
        items_missing = 0
        missing_items = []

        for item in all_items:
            if item["check_text"].lower() in text_lower:
                items_survived += 1
            else:
                items_missing += 1
                missing_items.append(item["id"])
                tier = "ABSOLUTE" if item in NEVER_COMPRESS_ABSOLUTE else "CRITICAL"
                severity = DriftSeverity.CRITICAL if tier == "ABSOLUTE" else DriftSeverity.WARNING
                events.append(DriftEvent(
                    trigger_type="compression",
                    drift_type=DriftType.COMPRESSION_LOSS,
                    severity=severity,
                    description=f"NEVER-COMPRESS item lost: {item['description']} ({item['id']})",
                    session_id=session_id,
                ))

        # Log compression event
        if self.db:
            self.db.log_compression_event({
                "items_checked": items_checked,
                "items_survived": items_survived,
                "items_missing": items_missing,
                "missing_items": missing_items,
                "reinjected": False,
                "session_id": session_id,
            })

        if not events:
            events.append(DriftEvent(
                trigger_type="compression",
                drift_type=None,
                severity=DriftSeverity.INFO,
                description=f"Compression check passed. {items_survived}/{items_checked} items survived.",
                resolved=True,
                session_id=session_id,
            ))

        if self.db:
            for event in events:
                self.db.log_drift_event(event.to_dict())

        return events

    # -------------------------------------------------------------------
    # Trigger 5: Weekly Monday Audit
    # -------------------------------------------------------------------

    def weekly_audit(self, session_id: str = "") -> AuditReport:
        """
        Trigger 5: Scheduled weekly Monday audit.
        
        Generates a comprehensive audit report covering:
            - Decision log review
            - Verification statistics
            - Drift event summary
            - Directive sync check
            - Compliance score calculation
            - Recommendations
        """
        now = datetime.now(timezone.utc)
        period_end = now.isoformat()
        period_start = (now - timedelta(days=7)).isoformat()

        # Gather statistics
        decisions_count = 0
        compliant_count = 0
        flagged_count = 0
        violation_count = 0
        drift_events_list = []

        if self.db:
            decisions = self.db.get_decisions(limit=1000)
            decisions_count = len([
                d for d in decisions
                if d.get("date_created", "") >= period_start
            ])

            verifications = self.db.get_verification_logs(limit=1000)
            recent_verifications = [
                v for v in verifications
                if v.get("timestamp", "") >= period_start
            ]
            compliant_count = sum(
                1 for v in recent_verifications
                if v.get("classification") == "COMPLIANT"
            )
            flagged_count = sum(
                1 for v in recent_verifications
                if v.get("classification") == "FLAGGED"
            )
            violation_count = sum(
                1 for v in recent_verifications
                if v.get("classification") == "VIOLATION"
            )

            drift_events_raw = self.db.get_drift_events(limit=1000)
            for e in drift_events_raw:
                if e.get("timestamp", "") >= period_start:
                    drift_events_list.append(DriftEvent(
                        trigger_type=e.get("trigger_type", ""),
                        drift_type=DriftType(e["drift_type"]) if e.get("drift_type") else None,
                        severity=DriftSeverity(e.get("severity", "INFO")),
                        description=e.get("description", ""),
                        directives_affected=e.get("directives_affected", []),
                        resolution=e.get("resolution"),
                        resolved=bool(e.get("resolved")),
                        session_id=e.get("session_id"),
                        timestamp=e.get("timestamp", ""),
                    ))

        # Run sync check
        sync_status = self.registry.check_sync_integrity()
        if not sync_status["in_sync"]:
            drift_events_list.append(DriftEvent(
                trigger_type="weekly",
                drift_type=DriftType.SYNC_DRIFT,
                severity=DriftSeverity.WARNING,
                description="Registry out of sync with DIRECTIVES.md during weekly audit.",
                session_id=session_id,
            ))

        # Calculate compliance score
        score_breakdown = self._calculate_compliance_score(
            compliant_count, flagged_count, violation_count,
            drift_events_list, sync_status,
        )
        compliance_score = score_breakdown.get("total", 100.0)

        # Generate recommendations
        recommendations = self._generate_recommendations(
            compliance_score, violation_count, flagged_count,
            drift_events_list, sync_status,
        )

        # Build report
        report = AuditReport(
            period_start=period_start,
            period_end=period_end,
            decisions_count=decisions_count,
            compliant_count=compliant_count,
            flagged_count=flagged_count,
            violation_count=violation_count,
            new_directives=0,
            drift_events=drift_events_list,
            compliance_score=compliance_score,
            score_breakdown=score_breakdown,
            recommendations=recommendations,
        )

        # Save to database
        if self.db:
            self.db.save_audit_report({
                "period_start": period_start,
                "period_end": period_end,
                "decisions_count": decisions_count,
                "compliant_count": compliant_count,
                "flagged_count": flagged_count,
                "violation_count": violation_count,
                "new_directives": 0,
                "compliance_score": compliance_score,
                "score_breakdown": score_breakdown,
                "report_markdown": report.to_markdown(),
                "session_id": session_id,
            })

        return report

    def _calculate_compliance_score(
        self,
        compliant: int,
        flagged: int,
        violations: int,
        drift_events: List[DriftEvent],
        sync_status: Dict[str, Any],
    ) -> Dict[str, float]:
        """Calculate the compliance score with component breakdown."""
        # Verification component (40% weight)
        total_checks = compliant + flagged + violations
        if total_checks > 0:
            verification_score = (compliant / total_checks) * 100
        else:
            verification_score = 100.0

        # Drift component (30% weight)
        critical_drifts = sum(
            1 for e in drift_events if e.severity == DriftSeverity.CRITICAL
        )
        warning_drifts = sum(
            1 for e in drift_events if e.severity == DriftSeverity.WARNING
        )
        drift_penalty = (critical_drifts * 15) + (warning_drifts * 5)
        drift_score = max(0, 100 - drift_penalty)

        # Sync component (15% weight)
        sync_score = 100.0 if sync_status.get("in_sync", True) else 70.0

        # Directive coverage component (15% weight)
        directive_count = self.registry.get_directive_count()
        coverage_score = min(100, (directive_count / 23) * 100)  # 23 known directives

        # Weighted total
        total = (
            verification_score * 0.40
            + drift_score * 0.30
            + sync_score * 0.15
            + coverage_score * 0.15
        )

        return {
            "verification": round(verification_score, 1),
            "drift": round(drift_score, 1),
            "sync": round(sync_score, 1),
            "coverage": round(coverage_score, 1),
            "total": round(total, 1),
        }

    def _generate_recommendations(
        self,
        score: float,
        violations: int,
        flagged: int,
        drift_events: List[DriftEvent],
        sync_status: Dict[str, Any],
    ) -> List[str]:
        """Generate actionable recommendations based on audit findings."""
        recs = []

        if violations > 0:
            recs.append(
                f"CRITICAL: {violations} violation(s) detected this period. "
                "Review and resolve immediately. Tim must be notified."
            )

        if flagged > 0:
            recs.append(
                f"Review {flagged} flagged output(s) for potential directive conflicts."
            )

        critical_drifts = [
            e for e in drift_events if e.severity == DriftSeverity.CRITICAL
        ]
        if critical_drifts:
            recs.append(
                f"CRITICAL: {len(critical_drifts)} critical drift event(s) detected. "
                "Investigate root causes and strengthen affected layers."
            )

        if not sync_status.get("in_sync", True):
            recs.append(
                "Registry is out of sync with DIRECTIVES.md. "
                "Run registry.load() to re-sync."
            )

        if score >= 95:
            recs.append("System health is excellent. Maintain current protocols.")
        elif score >= 80:
            recs.append("System health is good. Address flagged items to improve score.")
        elif score >= 60:
            recs.append("System health needs attention. Review all findings and drift events.")
        else:
            recs.append(
                "CRITICAL: System health is below acceptable threshold. "
                "Immediate review required."
            )

        return recs

    def get_drift_summary(self) -> Dict[str, Any]:
        """Get a summary of all drift events."""
        if not self.db:
            return {"error": "No database connected"}

        events = self.db.get_drift_events(limit=1000)
        total = len(events)
        by_type = {}
        by_severity = {"INFO": 0, "WARNING": 0, "CRITICAL": 0}
        by_trigger = {}
        unresolved = 0

        for e in events:
            dt = e.get("drift_type", "Unknown")
            if dt:
                by_type[dt] = by_type.get(dt, 0) + 1
            sev = e.get("severity", "INFO")
            by_severity[sev] = by_severity.get(sev, 0) + 1
            trig = e.get("trigger_type", "unknown")
            by_trigger[trig] = by_trigger.get(trig, 0) + 1
            if not e.get("resolved"):
                unresolved += 1

        return {
            "total_events": total,
            "unresolved": unresolved,
            "by_type": by_type,
            "by_severity": by_severity,
            "by_trigger": by_trigger,
        }
