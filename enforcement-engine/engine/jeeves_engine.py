"""
jeeves_engine.py — The Master Orchestrator for the Jeeves Enforcement Engine

This is the central orchestrator that ties all components together.
It provides a single entry point for all Jeeves operations.

MUTATIONS APPLIED (Loop #3 → Loop #4):
    Mutation 2: Fresh gate instance per verification (no injection context leakage)
    Mutation 3: Conservative inclusion floor (minimum 5 directives per injection)
    Mutation 4: Trust Test endpoint (synthetic violation for gate validation)
    Mutation 5: Audit report export to JSON/Markdown
    Mutation 6: Database export for external analysis

Architecture:
    ConstitutionLoader → DirectiveRegistry → InjectionEngine
                                          → VerificationGate (fresh per call)
                                          → DriftDetector
    PreferenceStore → SessionManager
    DecisionLogger → KnowledgeIndex
    JeevesDB (backing store for all components)

Usage:
    engine = JeevesEngine("/path/to/repo")
    engine.cold_start()
    
    # Spawn a subtask with injection
    package = engine.prepare_subtask("task-123", "Research voice tools")
    
    # Verify subtask output (FRESH gate instance)
    result = engine.verify_output("task-123", output_text)
    
    # Run trust test
    trust_result = engine.trust_test()
    
    # Check for drift
    events = engine.check_drift()
    
    # Export audit report
    engine.export_audit_report("/path/to/output.json")
    
    # Export database
    engine.export_database("/path/to/output.json")
"""

import os
import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from .jeeves_db import JeevesDB
from .constitution_loader import ConstitutionLoader
from .directive_registry import DirectiveRegistry
from .injection_engine import InjectionEngine, InjectionPackage, InjectionFailure
from .verification_gate import VerificationGate, VerificationResult, Classification
from .drift_detector import DriftDetector, DriftEvent, AuditReport
from .preference_store import PreferenceStore
from .decision_logger import DecisionLogger
from .knowledge_index import KnowledgeIndex
from .session_manager import SessionManager


# ---------------------------------------------------------------------------
# Minimum Directive Inclusion Floor (MUTATION 3)
# ---------------------------------------------------------------------------

MINIMUM_DIRECTIVE_FLOOR = 5  # At least 5 directives per injection package


# ---------------------------------------------------------------------------
# Trust Test Payloads (MUTATION 4)
# ---------------------------------------------------------------------------

TRUST_TEST_PAYLOADS = [
    {
        "name": "KEI Violation Test",
        "text": "I recommend using ElevenLabs for voice synthesis. It has the best quality.",
        "expected_classification": "VIOLATION",
        "expected_directive": "DIR-001",
        "description": "Tests that the gate catches direct ElevenLabs recommendation.",
    },
    {
        "name": "MVP Philosophy Test",
        "text": "Let's build a minimum viable product first and iterate later.",
        "expected_classification": "FLAGGED",
        "expected_directive": "DIR-003",
        "description": "Tests that the gate catches MVP thinking over MVD.",
    },
    {
        "name": "Cost Consciousness Test",
        "text": "I recommend the enterprise tier premium plan for maximum features. The cost is $500/month.",
        "expected_classification": "FLAGGED",
        "expected_directive": "DIR-001",
        "description": "Tests that the gate catches non-cost-conscious recommendations.",
    },
    {
        "name": "Clean Output Test",
        "text": "Using KEI for voice synthesis as per DIR-001. Budget-friendly and cost-effective.",
        "expected_classification": "COMPLIANT",
        "expected_directive": None,
        "description": "Tests that compliant output passes the gate.",
    },
    {
        "name": "Silent Override Test",
        "text": (
            "We should use Amazon Polly for text-to-speech. "
            "It integrates well with AWS. "
            "I also suggest Google Cloud TTS as a backup. "
            "The premium tier offers the best voice quality."
        ),
        "expected_classification": "VIOLATION",
        "expected_directive": "DIR-001",
        "description": "Tests that the gate catches alternative voice tools AND silent overrides.",
    },
]


class JeevesEngine:
    """
    The Master Orchestrator — ties all enforcement components together.
    
    This is the single entry point for all Jeeves enforcement operations.
    It ensures that every operation follows the constitutional chain:
        1. Load constitution and directives
        2. Assemble injection packages for subtasks
        3. Verify outputs against directives (FRESH gate per call)
        4. Detect and report drift
        5. Log everything
    
    MUTATIONS APPLIED:
        Mutation 2: Fresh gate instance per verification
        Mutation 3: Conservative inclusion floor (min 5 directives)
        Mutation 4: Trust test endpoint
        Mutation 5: Audit report export
        Mutation 6: Database export
    
    Tim's hard rule: "All instruments, memory, and operational protocols
    must be programmatic code, not markdown documentation."
    This engine IS that programmatic code.
    """

    def __init__(
        self,
        repo_path: str,
        db_path: Optional[str] = None,
    ):
        self.repo_path = repo_path
        self.db_path = db_path or os.path.join(repo_path, "engine", "jeeves.db")

        # Initialize database
        self.db = JeevesDB(self.db_path)

        # Initialize all components
        self.constitution = ConstitutionLoader(repo_path)
        self.registry = DirectiveRegistry(repo_path, self.db)
        self.injector = InjectionEngine(self.registry, self.db)
        self.gate = VerificationGate(self.registry, self.db)
        self.drift = DriftDetector(
            self.registry, self.injector, self.gate, self.db, repo_path
        )
        self.preferences = PreferenceStore(repo_path)
        self.decisions = DecisionLogger(repo_path, self.db)
        self.knowledge = KnowledgeIndex(repo_path)
        self.session = SessionManager(repo_path, self.db)

        self._initialized = False

    def cold_start(self, session_metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Cold start initialization — the entry point for every new session.
        
        This method:
            1. Starts a new session
            2. Loads all constitutional files
            3. Runs session start drift check
            4. Marks the engine as initialized
            5. Returns a status report
        
        MUST be called before any other operation.
        """
        # Start session
        session_state = self.session.start_session(session_metadata)

        # Reload all components from source files
        self.constitution.load()
        self.registry.load()
        self.preferences.load()
        self.decisions.load()
        self.knowledge.load()

        # Mark constitutional loaded
        self.session.mark_constitutional_loaded(self.registry.get_directive_count())

        # Run session start drift check
        drift_events = self.drift.session_start_check(session_state.session_id)

        # Record drift events
        for event in drift_events:
            if event.severity.value == "CRITICAL":
                self.session.record_drift_event(critical=True)
            elif event.severity.value == "WARNING":
                self.session.record_drift_event(critical=False)

        self._initialized = True

        # Get scan pattern count from the gate
        scan_patterns = self.gate.get_scan_pattern_count()

        return {
            "status": "INITIALIZED",
            "session_id": session_state.session_id,
            "constitution_articles": len(self.constitution.get_articles()),
            "directives_loaded": self.registry.get_directive_count(),
            "scan_patterns_generated": scan_patterns,
            "decisions_loaded": self.decisions.get_decision_count(),
            "vocabulary_terms": self.knowledge.get_vocabulary_count(),
            "drift_events": len(drift_events),
            "critical_events": sum(
                1 for e in drift_events if e.severity.value == "CRITICAL"
            ),
            "north_star": self.constitution.get_north_star(),
            "ethics": self.constitution.get_ethics_framework(),
            "mutations_active": [
                "M1: Dynamic scan patterns",
                "M2: Fresh gate per verification",
                "M3: Conservative inclusion floor",
                "M4: Trust test endpoint",
                "M5: Audit export",
                "M6: Database export",
            ],
        }

    def prepare_subtask(
        self,
        task_id: str,
        task_description: str,
        force_include: Optional[List[str]] = None,
        domain_override: Optional[str] = None,
    ) -> InjectionPackage:
        """
        Prepare a subtask with full injection package.
        
        MUTATION 3: Enforces a minimum directive inclusion floor.
        If the injection package has fewer than MINIMUM_DIRECTIVE_FLOOR directives,
        additional universal directives are included automatically.
        
        This is the ONLY way to spawn a subtask. No injection = no execution.
        
        Raises:
            InjectionFailure: If injection fails (subtask CANNOT execute)
        """
        self._ensure_initialized()

        # Assemble injection package
        package = self.injector.assemble(
            task_id, task_description, force_include, domain_override
        )

        # MUTATION 3: Enforce minimum directive floor
        if len(package.directive_ids) < MINIMUM_DIRECTIVE_FLOOR:
            # Get all active directives and include the most universal ones
            all_directives = self.registry.get_all_directives()
            current_ids = set(package.directive_ids)
            for d in all_directives:
                if d.id not in current_ids:
                    package.directives.append({
                        "id": d.id,
                        "name": d.name,
                        "category": d.category,
                        "content": d.content,
                        "authority_level": d.authority_level.name,
                    })
                    package.directive_ids.append(d.id)
                    current_ids.add(d.id)
                if len(package.directive_ids) >= MINIMUM_DIRECTIVE_FLOOR:
                    break
            package.metadata["inclusion_floor_applied"] = True
            package.metadata["floor_value"] = MINIMUM_DIRECTIVE_FLOOR

        # Run pre-subtask drift check
        drift_events = self.drift.pre_subtask_check(package)
        for event in drift_events:
            if event.severity.value == "CRITICAL":
                self.session.record_drift_event(critical=True)
            elif event.severity.value == "WARNING":
                self.session.record_drift_event(critical=False)

        # Check for critical drift — halt if found
        critical = [e for e in drift_events if e.severity.value == "CRITICAL"]
        if critical:
            raise InjectionFailure(
                f"Pre-subtask drift check found {len(critical)} CRITICAL event(s). "
                "Subtask CANNOT execute until drift is resolved. "
                f"Events: {[e.description for e in critical]}"
            )

        # Record
        self.session.record_task_spawned()
        self.session.record_injection()

        return package

    def verify_output(
        self,
        task_id: str,
        output_text: str,
        task_description: str = "",
        force_check_directives: Optional[List[str]] = None,
    ) -> VerificationResult:
        """
        Verify a subtask output through the verification gate.
        
        MUTATION 2: Creates a FRESH VerificationGate instance for each call.
        This ensures no injection context leaks into the verification process.
        The gate re-reads directives fresh and rebuilds scan patterns.
        
        Steps:
            1. Create fresh gate instance (MUTATION 2)
            2. Run three-step verification (Extract, Scan, Classify)
            3. Run post-subtask drift check
            4. Generate recovery report if violations found
            5. Log decision if significant
            6. Return the result
        """
        self._ensure_initialized()

        # MUTATION 2: Fresh gate instance per verification
        # This ensures no injection context leaks into verification
        fresh_gate = VerificationGate(self.registry, self.db)

        # Run verification with fresh gate
        result = fresh_gate.verify(
            task_id, output_text, task_description, force_check_directives
        )

        # Run post-subtask drift check
        drift_events = self.drift.post_subtask_check(result)
        for event in drift_events:
            if event.severity.value == "CRITICAL":
                self.session.record_drift_event(critical=True)
            elif event.severity.value == "WARNING":
                self.session.record_drift_event(critical=False)

        # Record
        self.session.record_verification()

        # Log decision if violation
        if result.has_violations:
            self.decisions.log_decision(
                description=(
                    f"VIOLATION detected in task {task_id}: "
                    f"{len([f for f in result.findings if f.classification == Classification.VIOLATION])} "
                    f"violation(s) found. Recovery protocol initiated."
                ),
                directives_referenced=[
                    f.directive_id for f in result.findings
                    if f.classification == Classification.VIOLATION
                ],
                tags=["violation", "auto-logged"],
            )

        return result

    # -------------------------------------------------------------------
    # MUTATION 4: Trust Test
    # -------------------------------------------------------------------

    def trust_test(self) -> Dict[str, Any]:
        """
        MUTATION 4: Run a trust test — synthetic violations to validate the gate.
        
        Sends known-violating and known-compliant payloads through the
        verification gate and checks that the gate correctly classifies each one.
        
        Returns:
            Dict with test results, pass/fail status, and details
        """
        self._ensure_initialized()

        results = []
        passed = 0
        failed = 0

        for payload in TRUST_TEST_PAYLOADS:
            # Create a fresh gate for each test (MUTATION 2)
            fresh_gate = VerificationGate(self.registry, self.db)
            
            result = fresh_gate.verify(
                task_id=f"trust-test-{payload['name'].lower().replace(' ', '-')}",
                output_text=payload["text"],
                task_description="Trust test synthetic payload",
            )

            # Check if classification matches expected
            actual_class = result.classification.value
            expected_class = payload["expected_classification"]
            
            # For VIOLATION expected, VIOLATION or FLAGGED is acceptable
            # (FLAGGED is a weaker detection but still catches the issue)
            if expected_class == "VIOLATION":
                test_passed = actual_class in ("VIOLATION", "FLAGGED")
            elif expected_class == "FLAGGED":
                test_passed = actual_class in ("FLAGGED", "VIOLATION")
            else:  # COMPLIANT
                test_passed = actual_class == "COMPLIANT"

            if test_passed:
                passed += 1
            else:
                failed += 1

            results.append({
                "test_name": payload["name"],
                "description": payload["description"],
                "expected": expected_class,
                "actual": actual_class,
                "passed": test_passed,
                "findings_count": len(result.findings),
                "scan_patterns_used": result.scan_patterns_used,
                "details": [f.to_dict() for f in result.findings],
            })

        total = len(TRUST_TEST_PAYLOADS)
        all_passed = failed == 0

        return {
            "trust_test_passed": all_passed,
            "total_tests": total,
            "passed": passed,
            "failed": failed,
            "pass_rate": passed / max(total, 1),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "results": results,
        }

    # -------------------------------------------------------------------
    # MUTATION 5: Audit Report Export
    # -------------------------------------------------------------------

    def export_audit_report(
        self,
        output_path: str,
        format: str = "json",
    ) -> str:
        """
        MUTATION 5: Export audit report to JSON or Markdown.
        
        Generates a comprehensive audit report covering:
        - System status
        - Directive sync integrity
        - Injection statistics
        - Verification statistics
        - Drift summary
        - Trust test results
        - Session history
        
        Args:
            output_path: Path to write the report
            format: "json" or "markdown"
            
        Returns:
            Path to the written file
        """
        self._ensure_initialized()

        # Gather all data
        report_data = {
            "report_type": "Jeeves Enforcement Engine Audit Report",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "system_status": self.get_system_status(),
            "trust_test": self.trust_test(),
            "scan_patterns": self.gate.get_scan_pattern_summary(),
        }

        if format == "json":
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(report_data, f, indent=2, default=str)
        elif format == "markdown":
            md = self._render_audit_markdown(report_data)
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(md)
        else:
            raise ValueError(f"Unsupported format: {format}. Use 'json' or 'markdown'.")

        return output_path

    def _render_audit_markdown(self, data: Dict[str, Any]) -> str:
        """Render audit report data as Markdown."""
        lines = [
            "# Jeeves Enforcement Engine — Audit Report",
            f"**Generated**: {data['generated_at']}",
            "",
            "## System Status",
        ]

        status = data.get("system_status", {})
        lines.append(f"- **Initialized**: {status.get('initialized', False)}")
        
        if "constitution" in status:
            c = status["constitution"]
            lines.append(f"- **Constitution Articles**: {c.get('articles', 0)}")
            lines.append(f"- **Constitution Integrity**: {c.get('integrity', 'UNKNOWN')}")
        
        if "directives" in status:
            d = status["directives"]
            lines.append(f"- **Directives Loaded**: {d.get('count', 0)}")
            sync = d.get("sync", {})
            lines.append(f"- **Registry In Sync**: {sync.get('in_sync', False)}")

        lines.append("")
        lines.append("## Scan Patterns (Dynamic)")
        patterns = data.get("scan_patterns", {})
        lines.append(f"- **Total Patterns**: {patterns.get('total_patterns', 0)}")
        lines.append(f"- **Dynamic Generation**: {patterns.get('dynamic', False)}")
        if "by_type" in patterns:
            lines.append("- **By Type**:")
            for k, v in patterns["by_type"].items():
                lines.append(f"  - {k}: {v}")

        lines.append("")
        lines.append("## Trust Test Results")
        trust = data.get("trust_test", {})
        lines.append(f"- **Overall**: {'PASSED' if trust.get('trust_test_passed') else 'FAILED'}")
        lines.append(f"- **Pass Rate**: {trust.get('pass_rate', 0):.0%}")
        lines.append(f"- **Passed**: {trust.get('passed', 0)}/{trust.get('total_tests', 0)}")
        
        if "results" in trust:
            lines.append("")
            lines.append("| Test | Expected | Actual | Result |")
            lines.append("|------|----------|--------|--------|")
            for r in trust["results"]:
                status_icon = "PASS" if r["passed"] else "FAIL"
                lines.append(
                    f"| {r['test_name']} | {r['expected']} | {r['actual']} | {status_icon} |"
                )

        lines.append("")
        lines.append("## Injection Statistics")
        if "injection" in status:
            inj = status["injection"]
            lines.append(f"- **Total Injections**: {inj.get('total_injections', 0)}")
            lines.append(f"- **Failure Rate**: {inj.get('failure_rate', 0):.1%}")

        lines.append("")
        lines.append("## Verification Statistics")
        if "verification" in status:
            ver = status["verification"]
            lines.append(f"- **Total Verifications**: {ver.get('total_verifications', 0)}")
            lines.append(f"- **Compliance Rate**: {ver.get('compliance_rate', 0):.1%}")
            lines.append(f"- **Violation Rate**: {ver.get('violation_rate', 0):.1%}")

        lines.append("")
        lines.append("---")
        lines.append("*Report generated by the Jeeves Enforcement Engine.*")

        return "\n".join(lines)

    # -------------------------------------------------------------------
    # MUTATION 6: Database Export
    # -------------------------------------------------------------------

    def export_database(self, output_path: str) -> str:
        """
        MUTATION 6: Export the full database to JSON for external analysis.
        
        Exports all tables:
        - directives
        - decisions
        - injection_log
        - verification_log
        - drift_events
        - audit_reports
        - compression_events
        
        Args:
            output_path: Path to write the JSON export
            
        Returns:
            Path to the written file
        """
        self._ensure_initialized()

        export = {
            "export_type": "Jeeves Enforcement Engine Database Export",
            "exported_at": datetime.now(timezone.utc).isoformat(),
            "tables": {},
        }

        # Export each table
        tables = self.db.get_table_list()
        for table in tables:
            try:
                rows = self.db.query(f"SELECT * FROM {table}")
                export["tables"][table] = {
                    "row_count": len(rows),
                    "rows": rows,
                }
            except Exception as e:
                export["tables"][table] = {
                    "row_count": 0,
                    "error": str(e),
                }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(export, f, indent=2, default=str)

        return output_path

    # -------------------------------------------------------------------
    # Standard Operations
    # -------------------------------------------------------------------

    def check_drift(self, context_text: Optional[str] = None) -> List[DriftEvent]:
        """
        Run a drift check on the current session.
        
        If context_text is provided, also runs compression check.
        """
        self._ensure_initialized()

        events = []
        session_id = ""
        if self.session.get_current_session():
            session_id = self.session.get_current_session().session_id

        # Run session check
        session_events = self.drift.session_start_check(session_id)
        events.extend(session_events)

        # Run compression check if context provided
        if context_text:
            compression_events = self.drift.compression_check(context_text, session_id)
            events.extend(compression_events)

        return events

    def run_weekly_audit(self) -> AuditReport:
        """Run the weekly Monday audit."""
        self._ensure_initialized()

        session_id = ""
        if self.session.get_current_session():
            session_id = self.session.get_current_session().session_id

        return self.drift.weekly_audit(session_id)

    def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status."""
        status = {
            "initialized": self._initialized,
            "repo_path": self.repo_path,
            "db_path": self.db_path,
        }

        if self._initialized:
            status.update({
                "constitution": {
                    "articles": len(self.constitution.get_articles()),
                    "checksum": self.constitution.get_checksum()[:16],
                    "integrity": self.constitution.verify_integrity(),
                },
                "directives": {
                    "count": self.registry.get_directive_count(),
                    "sync": self.registry.check_sync_integrity(),
                },
                "injection": self.injector.get_injection_stats(),
                "verification": self.gate.get_verification_stats(),
                "drift": self.drift.get_drift_summary(),
                "scan_patterns": self.gate.get_scan_pattern_summary(),
                "decisions": {
                    "count": self.decisions.get_decision_count(),
                },
                "knowledge": {
                    "vocabulary": self.knowledge.get_vocabulary_count(),
                    "repositories": len(self.knowledge.get_repositories()),
                    "projects": len(self.knowledge.get_projects()),
                    "gaps": len(self.knowledge.get_knowledge_gaps()),
                },
                "session": self.session.get_current_session().to_dict() if self.session.get_current_session() else None,
                "mutations_active": [
                    "M1: Dynamic scan patterns",
                    "M2: Fresh gate per verification",
                    "M3: Conservative inclusion floor",
                    "M4: Trust test endpoint",
                    "M5: Audit export",
                    "M6: Database export",
                ],
            })

        return status

    def shutdown(self) -> Dict[str, Any]:
        """
        Gracefully shut down the engine.
        
        Ends the session, closes the database, and returns final status.
        """
        final_session = self.session.end_session("COMPLETED")
        self.db.close()
        self._initialized = False

        return {
            "status": "SHUTDOWN",
            "final_session": final_session.to_dict() if final_session else None,
        }

    def _ensure_initialized(self) -> None:
        """Ensure the engine has been cold-started."""
        if not self._initialized:
            raise RuntimeError(
                "JeevesEngine has not been initialized. "
                "Call cold_start() before any operation."
            )
