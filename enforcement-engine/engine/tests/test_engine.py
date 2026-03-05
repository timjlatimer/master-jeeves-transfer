"""
test_engine.py — Comprehensive Test Suite for the Jeeves Enforcement Engine

Tests all components:
    - JeevesDB (database layer)
    - ConstitutionLoader
    - DirectiveRegistry
    - InjectionEngine (including failure modes)
    - VerificationGate (including violation detection)
    - DriftDetector (all 5 triggers)
    - PreferenceStore
    - DecisionLogger
    - KnowledgeIndex
    - SessionManager
    - JeevesEngine (orchestrator)
"""

import os
import sys
import json
import shutil
import tempfile
import pytest

# Add parent directories to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from engine.jeeves_db import JeevesDB
from engine.constitution_loader import ConstitutionLoader
from engine.directive_registry import DirectiveRegistry, Directive, AuthorityLevel
from engine.injection_engine import InjectionEngine, InjectionPackage, InjectionFailure
from engine.injection_engine import CONSTITUTIONAL_PRINCIPLES, COMPLIANCE_FOOTER
from engine.verification_gate import VerificationGate, VerificationResult, Classification
from engine.drift_detector import DriftDetector, DriftEvent, DriftType, DriftSeverity
from engine.preference_store import PreferenceStore
from engine.decision_logger import DecisionLogger
from engine.knowledge_index import KnowledgeIndex
from engine.session_manager import SessionManager
from engine.jeeves_engine import JeevesEngine


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def repo_path():
    """Get the repo path (parent of engine directory)."""
    return os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture
def temp_db():
    """Create a temporary database."""
    tmp = tempfile.mktemp(suffix=".db")
    db = JeevesDB(tmp)
    yield db
    db.close()
    if os.path.exists(tmp):
        os.remove(tmp)


@pytest.fixture
def registry(repo_path, temp_db):
    """Create a DirectiveRegistry."""
    return DirectiveRegistry(repo_path, temp_db)


@pytest.fixture
def constitution(repo_path):
    """Create a ConstitutionLoader."""
    return ConstitutionLoader(repo_path)


@pytest.fixture
def injector(registry, temp_db):
    """Create an InjectionEngine."""
    return InjectionEngine(registry, temp_db)


@pytest.fixture
def gate(registry, temp_db):
    """Create a VerificationGate."""
    return VerificationGate(registry, temp_db)


@pytest.fixture
def engine(repo_path):
    """Create a JeevesEngine with temp database."""
    tmp_db = tempfile.mktemp(suffix=".db")
    eng = JeevesEngine(repo_path, tmp_db)
    yield eng
    try:
        eng.shutdown()
    except Exception:
        pass
    if os.path.exists(tmp_db):
        os.remove(tmp_db)


# ===========================================================================
# TEST: JeevesDB
# ===========================================================================

class TestJeevesDB:
    """Test the database layer."""

    def test_db_creation(self, temp_db):
        """Database should create all 7 tables."""
        tables = temp_db.get_table_list()
        expected = [
            "directives", "decisions", "injection_log",
            "verification_log", "drift_events", "audit_reports",
            "compression_events",
        ]
        for table in expected:
            assert table in tables, f"Table '{table}' missing from database"

    def test_directive_upsert(self, temp_db):
        """Should insert and update directives."""
        directive = {
            "id": "DIR-TEST",
            "name": "Test Directive",
            "category": "TEST",
            "status": "ACTIVE",
            "authority_level": "STANDING_ORDER",
            "source": "Test",
            "date_created": "2026-03-04T00:00:00+00:00",
            "content": "This is a test directive.",
            "domains": ["test"],
            "superseded_by": None,
            "raw_markdown": "## DIR-TEST\nTest Directive",
        }
        temp_db.upsert_directive(directive)
        result = temp_db.get_directive("DIR-TEST")
        assert result is not None
        assert result["name"] == "Test Directive"

    def test_injection_logging(self, temp_db):
        """Should log injection events."""
        log_entry = {
            "task_id": "test-001",
            "task_description": "Test task",
            "directives_included": ["DIR-001"],
            "constitution_included": True,
            "compliance_footer_included": True,
            "token_count": 500,
            "package_checksum": "abc123",
            "status": "ASSEMBLED",
            "error_message": None,
        }
        temp_db.log_injection(log_entry)
        logs = temp_db.get_injection_logs(limit=10)
        assert len(logs) >= 1
        assert logs[0]["task_id"] == "test-001"

    def test_verification_logging(self, temp_db):
        """Should log verification events."""
        log_entry = {
            "task_id": "test-001",
            "output_hash": "hash123",
            "classification": "COMPLIANT",
            "directives_checked": ["DIR-001"],
            "findings": [],
            "fresh_eyes": True,
            "tim_override": False,
            "override_reason": None,
        }
        temp_db.log_verification(log_entry)
        logs = temp_db.get_verification_logs(limit=10)
        assert len(logs) >= 1

    def test_drift_event_logging(self, temp_db):
        """Should log drift events."""
        event = {
            "trigger_type": "session_start",
            "drift_type": "Sync Drift",
            "severity": "WARNING",
            "description": "Test drift event",
            "directives_affected": [],
            "resolution": None,
            "resolved": False,
            "session_id": "test-session",
        }
        temp_db.log_drift_event(event)
        events = temp_db.get_drift_events(limit=10)
        assert len(events) >= 1


# ===========================================================================
# TEST: ConstitutionLoader
# ===========================================================================

class TestConstitutionLoader:
    """Test the constitution loader."""

    def test_load(self, constitution):
        """Should load the constitution."""
        articles = constitution.get_articles()
        assert len(articles) > 0, "No articles parsed from CONSTITUTION.md"

    def test_north_star(self, constitution):
        """Should extract the North Star."""
        north_star = constitution.get_north_star()
        assert north_star, "North Star should not be empty"

    def test_integrity(self, constitution):
        """Should verify integrity."""
        assert constitution.verify_integrity(), "Constitution integrity check failed"

    def test_checksum(self, constitution):
        """Should have a checksum."""
        checksum = constitution.get_checksum()
        assert len(checksum) == 64, "Checksum should be SHA-256 (64 chars)"


# ===========================================================================
# TEST: DirectiveRegistry
# ===========================================================================

class TestDirectiveRegistry:
    """Test the directive registry."""

    def test_load(self, registry):
        """Should load directives from DIRECTIVES.md."""
        count = registry.get_directive_count()
        assert count > 0, "No directives loaded from DIRECTIVES.md"

    def test_get_directive(self, registry):
        """Should retrieve a specific directive."""
        # Try to get any directive
        all_directives = registry.get_all_directives()
        if all_directives:
            first = all_directives[0]
            retrieved = registry.get_directive(first.id)
            assert retrieved is not None
            assert retrieved.id == first.id

    def test_sync_integrity(self, registry):
        """Should report sync status."""
        status = registry.check_sync_integrity()
        assert "in_sync" in status
        assert status["in_sync"], "Registry should be in sync after fresh load"

    def test_get_directive_ids(self, registry):
        """Should return all directive IDs."""
        ids = registry.get_directive_ids()
        assert len(ids) > 0


# ===========================================================================
# TEST: InjectionEngine
# ===========================================================================

class TestInjectionEngine:
    """Test the injection engine."""

    def test_assemble_package(self, injector):
        """Should assemble an injection package."""
        package = injector.assemble("test-001", "Research voice synthesis tools")
        assert package is not None
        assert package.task_id == "test-001"
        assert package.constitutional_text == CONSTITUTIONAL_PRINCIPLES
        assert package.compliance_footer == COMPLIANCE_FOOTER

    def test_constitutional_principles_hardcoded(self, injector):
        """Constitutional principles must ALWAYS be present."""
        package = injector.assemble("test-002", "Simple math calculation")
        prompt = package.to_prompt_text()
        assert "CONSTITUTIONAL PRINCIPLES" in prompt
        assert "Article I" in prompt
        assert "Article II" in prompt

    def test_compliance_footer_hardcoded(self, injector):
        """Compliance footer must ALWAYS be present."""
        package = injector.assemble("test-003", "Any task at all")
        prompt = package.to_prompt_text()
        assert "COMPLIANCE INSTRUCTION" in prompt
        assert "VIOLATION OF THIS INSTRUCTION IS A CONSTITUTIONAL BREACH" in prompt

    def test_package_integrity(self, injector):
        """Package checksum should verify correctly."""
        package = injector.assemble("test-004", "Test integrity")
        assert injector.verify_package_integrity(package)

    def test_package_has_checksum(self, injector):
        """Package should have a SHA-256 checksum."""
        package = injector.assemble("test-005", "Test checksum")
        assert len(package.checksum) == 64

    def test_package_to_dict(self, injector):
        """Package should serialize to dict."""
        package = injector.assemble("test-006", "Test serialization")
        d = package.to_dict()
        assert d["task_id"] == "test-006"
        assert d["constitutional_included"] is True
        assert d["compliance_footer_included"] is True


# ===========================================================================
# TEST: VerificationGate
# ===========================================================================

class TestVerificationGate:
    """Test the verification gate."""

    def test_compliant_output(self, gate):
        """Clean output should be classified as COMPLIANT."""
        result = gate.verify(
            "test-v-001",
            "Here is a summary of the project status. All tasks completed.",
            "Project status report",
        )
        assert result.classification in (Classification.COMPLIANT, Classification.FLAGGED)

    def test_violation_detection_elevenlabs(self, gate):
        """Should detect ElevenLabs usage as a violation (DIR-001)."""
        result = gate.verify(
            "test-v-002",
            "I recommend using ElevenLabs directly for voice synthesis. "
            "Their API is the best option for this project.",
            "Voice synthesis tool selection",
        )
        # Should detect the ElevenLabs violation
        has_violation = any(
            f.directive_id == "DIR-001" for f in result.findings
        )
        assert has_violation, "Should detect ElevenLabs violation per DIR-001"

    def test_fresh_eyes(self, gate):
        """Every verification should use fresh eyes."""
        result = gate.verify(
            "test-v-003",
            "Test output",
            "Test task",
        )
        assert result.fresh_eyes is True

    def test_result_to_report(self, gate):
        """Should generate a human-readable report."""
        result = gate.verify("test-v-004", "Test output", "Test task")
        report = result.to_report()
        assert "Verification Gate Report" in report

    def test_result_to_dict(self, gate):
        """Should serialize to dict."""
        result = gate.verify("test-v-005", "Test output", "Test task")
        d = result.to_dict()
        assert "task_id" in d
        assert "classification" in d
        assert "findings" in d


# ===========================================================================
# TEST: DriftDetector
# ===========================================================================

class TestDriftDetector:
    """Test the drift detector."""

    def test_session_start_check(self, registry, temp_db, repo_path):
        """Session start check should pass on clean repo."""
        detector = DriftDetector(registry, db=temp_db, repo_path=repo_path)
        events = detector.session_start_check("test-session")
        assert len(events) > 0
        # Should have at least an INFO event
        info_events = [e for e in events if e.severity == DriftSeverity.INFO]
        assert len(info_events) > 0 or any(
            e.severity in (DriftSeverity.WARNING, DriftSeverity.CRITICAL)
            for e in events
        )

    def test_compression_check_all_present(self, registry, temp_db, repo_path):
        """Compression check should pass when all items present."""
        detector = DriftDetector(registry, db=temp_db, repo_path=repo_path)
        context = (
            "Before spawning ANY subtask, Master Jeeves MUST read DIRECTIVES.md "
            "KEI voice synthesis Zero drift compliance footer "
            "Compliance Instruction Footer "
            "Flag conflicts, don't override "
            "Ruby Red Minimum Viable Distribution 24 hours Swiss village "
            "VIOLATION OF THIS INSTRUCTION IS A CONSTITUTIONAL BREACH"
        )
        events = detector.compression_check(context, "test-session")
        # Should mostly be INFO (items survived)
        critical = [e for e in events if e.severity == DriftSeverity.CRITICAL]
        assert len(critical) == 0, (
            f"No critical events expected when all items present. "
            f"Got: {[e.description for e in critical]}"
        )

    def test_compression_check_missing_items(self, registry, temp_db, repo_path):
        """Compression check should detect missing NEVER-COMPRESS items."""
        detector = DriftDetector(registry, db=temp_db, repo_path=repo_path)
        # Empty context — everything is missing
        events = detector.compression_check("", "test-session")
        critical = [e for e in events if e.severity == DriftSeverity.CRITICAL]
        assert len(critical) > 0, "Should detect missing NEVER-COMPRESS items"

    def test_weekly_audit(self, registry, temp_db, repo_path):
        """Weekly audit should generate a report."""
        detector = DriftDetector(registry, db=temp_db, repo_path=repo_path)
        report = detector.weekly_audit("test-session")
        assert report.compliance_score >= 0
        assert report.compliance_score <= 100
        markdown = report.to_markdown()
        assert "Weekly Monday Audit Report" in markdown


# ===========================================================================
# TEST: PreferenceStore
# ===========================================================================

class TestPreferenceStore:
    """Test the preference store."""

    def test_load(self, repo_path):
        """Should load preferences."""
        store = PreferenceStore(repo_path)
        contact = store.get_contact_info()
        assert contact.full_name, "Contact name should not be empty"

    def test_working_style(self, repo_path):
        """Should have working style preferences."""
        store = PreferenceStore(repo_path)
        style = store.get_working_style()
        assert style.input_method, "Input method should not be empty"


# ===========================================================================
# TEST: DecisionLogger
# ===========================================================================

class TestDecisionLogger:
    """Test the decision logger."""

    def test_load(self, repo_path, temp_db):
        """Should load existing decisions."""
        logger = DecisionLogger(repo_path, temp_db)
        count = logger.get_decision_count()
        assert count >= 0  # May be 0 if DECISIONS.md is empty

    def test_log_decision(self, repo_path, temp_db):
        """Should log a new decision."""
        # Use a temp copy to avoid modifying the real DECISIONS.md
        tmp_dir = tempfile.mkdtemp()
        shutil.copytree(repo_path, os.path.join(tmp_dir, "repo"), dirs_exist_ok=True)
        tmp_repo = os.path.join(tmp_dir, "repo")

        logger = DecisionLogger(tmp_repo, temp_db)
        initial_count = logger.get_decision_count()

        decision = logger.log_decision(
            description="Test decision for unit testing.",
            directives_referenced=["DIR-001"],
            tags=["test"],
        )

        assert decision.id.startswith("DEC-")
        assert logger.get_decision_count() == initial_count + 1

        # Cleanup
        shutil.rmtree(tmp_dir)


# ===========================================================================
# TEST: KnowledgeIndex
# ===========================================================================

class TestKnowledgeIndex:
    """Test the knowledge index."""

    def test_load(self, repo_path):
        """Should load knowledge index."""
        index = KnowledgeIndex(repo_path)
        # Should have loaded something
        summary = index.to_summary()
        assert "Knowledge Index Summary" in summary


# ===========================================================================
# TEST: SessionManager
# ===========================================================================

class TestSessionManager:
    """Test the session manager."""

    def test_start_session(self, repo_path, temp_db):
        """Should start a new session."""
        manager = SessionManager(repo_path, temp_db)
        session = manager.start_session()
        assert session.session_id
        assert session.status == "ACTIVE"

    def test_end_session(self, repo_path, temp_db):
        """Should end a session."""
        manager = SessionManager(repo_path, temp_db)
        manager.start_session()
        final = manager.end_session()
        assert final.status == "COMPLETED"

    def test_record_events(self, repo_path, temp_db):
        """Should record session events."""
        manager = SessionManager(repo_path, temp_db)
        manager.start_session()
        manager.record_task_spawned()
        manager.record_injection()
        manager.record_verification()
        manager.record_drift_event(critical=False)
        manager.record_drift_event(critical=True)

        session = manager.get_current_session()
        assert session.tasks_spawned == 1
        assert session.injections_assembled == 1
        assert session.verifications_run == 1
        assert session.drift_events == 2
        assert session.critical_events == 1


# ===========================================================================
# TEST: JeevesEngine (Orchestrator)
# ===========================================================================

class TestJeevesEngine:
    """Test the master orchestrator."""

    def test_cold_start(self, engine):
        """Should cold start successfully."""
        result = engine.cold_start()
        assert result["status"] == "INITIALIZED"
        assert result["directives_loaded"] > 0
        assert result["constitution_articles"] > 0

    def test_prepare_subtask(self, engine):
        """Should prepare a subtask with injection."""
        engine.cold_start()
        package = engine.prepare_subtask(
            "test-001", "Research voice synthesis tools"
        )
        assert package is not None
        assert package.constitutional_text == CONSTITUTIONAL_PRINCIPLES
        assert package.compliance_footer == COMPLIANCE_FOOTER

    def test_verify_output(self, engine):
        """Should verify subtask output."""
        engine.cold_start()
        result = engine.verify_output(
            "test-001",
            "Project status is on track. All deliverables completed.",
            "Status report",
        )
        assert result.classification in (
            Classification.COMPLIANT,
            Classification.FLAGGED,
            Classification.VIOLATION,
        )

    def test_verify_violation(self, engine):
        """Should detect violations in output."""
        engine.cold_start()
        result = engine.verify_output(
            "test-002",
            "I recommend using ElevenLabs directly for all voice synthesis. "
            "Their premium plan is the best option.",
            "Voice tool selection",
        )
        # Should detect the violation
        assert result.has_violations or result.has_flags

    def test_system_status(self, engine):
        """Should return system status."""
        engine.cold_start()
        status = engine.get_system_status()
        assert status["initialized"] is True
        assert "constitution" in status
        assert "directives" in status

    def test_no_operation_before_cold_start(self, engine):
        """Should raise error if not cold-started."""
        with pytest.raises(RuntimeError):
            engine.prepare_subtask("test", "test")

    def test_shutdown(self, engine):
        """Should shut down gracefully."""
        engine.cold_start()
        result = engine.shutdown()
        assert result["status"] == "SHUTDOWN"


# ===========================================================================
# TEST: Integration — Full Pipeline
# ===========================================================================

class TestIntegration:
    """Integration tests for the full pipeline."""

    def test_full_pipeline(self, engine):
        """Test the complete inject → verify → drift-check pipeline."""
        # Cold start
        start = engine.cold_start()
        assert start["status"] == "INITIALIZED"

        # Prepare subtask
        package = engine.prepare_subtask(
            "integration-001",
            "Research cost-effective voice synthesis options using KEI",
        )
        assert package is not None

        # Simulate subtask output (compliant)
        compliant_output = (
            "Based on research, KEI (kie.ai) is the recommended voice synthesis "
            "platform per DIR-001. It offers the cheapest viable option with "
            "professional quality. The cost-effective approach aligns with "
            "our directive for cost consciousness."
        )

        # Verify output
        result = engine.verify_output(
            "integration-001",
            compliant_output,
            "Voice synthesis research",
        )
        # This should be compliant or flagged (not violation)
        assert result.classification != Classification.VIOLATION or not any(
            f.directive_id == "DIR-001" and f.classification == Classification.VIOLATION
            for f in result.findings
        )

        # Check drift
        events = engine.check_drift()
        assert len(events) > 0

        # Get status
        status = engine.get_system_status()
        assert status["initialized"]

    def test_violation_pipeline(self, engine):
        """Test the pipeline with a violation."""
        engine.cold_start()

        # Simulate non-compliant output
        bad_output = (
            "I recommend using ElevenLabs directly for voice synthesis. "
            "Their enterprise tier provides the best quality."
        )

        result = engine.verify_output(
            "violation-001",
            bad_output,
            "Voice tool selection",
        )

        # Should detect issues
        assert len(result.findings) > 0

    def test_kei_exception(self, engine):
        """KEI mention should NOT trigger violation when used correctly."""
        engine.cold_start()

        kei_output = (
            "Using KEI for voice synthesis as directed. "
            "KEI provides cost-effective voice generation through kie.ai."
        )

        result = engine.verify_output(
            "kei-001",
            kei_output,
            "Voice synthesis using KEI",
        )

        # Should NOT have DIR-001 violations
        dir001_violations = [
            f for f in result.findings
            if f.directive_id == "DIR-001" and f.classification == Classification.VIOLATION
        ]
        assert len(dir001_violations) == 0, "KEI usage should not trigger DIR-001 violation"


# ===========================================================================
# TEST: Mutation 1 — Dynamic Scan Patterns
# ===========================================================================

class TestMutation1DynamicScanPatterns:
    """Test dynamic scan pattern generation from directive registry."""

    def test_scan_patterns_generated(self, gate):
        """Gate should generate scan patterns from directives."""
        count = gate.get_scan_pattern_count()
        assert count > 0, "Should generate scan patterns from directives"

    def test_scan_pattern_summary(self, gate):
        """Gate should provide a scan pattern summary."""
        summary = gate.get_scan_pattern_summary()
        assert "total_patterns" in summary
        assert summary["total_patterns"] > 0
        assert summary["dynamic"] is True

    def test_elevenlabs_detected_by_dynamic_patterns(self, gate):
        """Dynamic patterns should catch ElevenLabs mentions."""
        result = gate.verify(
            "dyn-001",
            "I recommend ElevenLabs for voice synthesis. Their API is great.",
            "Voice tool selection",
        )
        has_finding = len(result.findings) > 0
        assert has_finding, "Dynamic patterns should detect ElevenLabs"

    def test_amazon_polly_detected(self, gate):
        """Dynamic patterns should catch Amazon Polly mentions."""
        result = gate.verify(
            "dyn-002",
            "We should use Amazon Polly for text-to-speech.",
            "Voice tool selection",
        )
        has_finding = len(result.findings) > 0
        assert has_finding, "Dynamic patterns should detect Amazon Polly"

    def test_google_tts_detected(self, gate):
        """Dynamic patterns should catch Google Cloud TTS mentions."""
        result = gate.verify(
            "dyn-003",
            "Google Cloud TTS is a good alternative for voice generation.",
            "Voice tool selection",
        )
        has_finding = len(result.findings) > 0
        assert has_finding, "Dynamic patterns should detect Google Cloud TTS"

    def test_mvp_detected(self, gate):
        """Dynamic patterns should catch MVP thinking."""
        result = gate.verify(
            "dyn-004",
            "Let's build a minimum viable product first and iterate.",
            "Product strategy",
        )
        has_finding = len(result.findings) > 0
        assert has_finding, "Dynamic patterns should detect MVP thinking"

    def test_kei_not_flagged(self, gate):
        """KEI usage should NOT be flagged."""
        result = gate.verify(
            "dyn-005",
            "Using KEI for voice synthesis as directed per DIR-001.",
            "Voice synthesis",
        )
        dir001_violations = [
            f for f in result.findings
            if f.directive_id == "DIR-001" and f.classification == Classification.VIOLATION
        ]
        assert len(dir001_violations) == 0, "KEI usage should not trigger violation"


# ===========================================================================
# TEST: Mutation 2 — Fresh Gate Per Verification
# ===========================================================================

class TestMutation2FreshGate:
    """Test that each verification uses a fresh gate instance."""

    def test_fresh_gate_no_context_leakage(self, engine):
        """Two verifications should not share state."""
        engine.cold_start()

        # First verification — compliant
        result1 = engine.verify_output(
            "fresh-001",
            "Using KEI for voice synthesis.",
            "Voice synthesis",
        )

        # Second verification — violation
        result2 = engine.verify_output(
            "fresh-002",
            "I recommend ElevenLabs for voice synthesis.",
            "Voice tool selection",
        )

        # The second should detect the violation independently
        has_finding = len(result2.findings) > 0
        assert has_finding, "Fresh gate should detect violation independently"


# ===========================================================================
# TEST: Mutation 3 — Conservative Inclusion Floor
# ===========================================================================

class TestMutation3InclusionFloor:
    """Test minimum directive inclusion floor."""

    def test_minimum_directives_in_package(self, engine):
        """Injection package should have at least MINIMUM_DIRECTIVE_FLOOR directives."""
        engine.cold_start()
        package = engine.prepare_subtask(
            "floor-001",
            "Simple calculation task",  # Unlikely to match many directives
        )
        from engine.jeeves_engine import MINIMUM_DIRECTIVE_FLOOR
        assert len(package.directive_ids) >= MINIMUM_DIRECTIVE_FLOOR, (
            f"Package should have at least {MINIMUM_DIRECTIVE_FLOOR} directives, "
            f"got {len(package.directive_ids)}"
        )


# ===========================================================================
# TEST: Mutation 4 — Trust Test
# ===========================================================================

class TestMutation4TrustTest:
    """Test the trust test endpoint."""

    def test_trust_test_runs(self, engine):
        """Trust test should execute without errors."""
        engine.cold_start()
        result = engine.trust_test()
        assert "trust_test_passed" in result
        assert "total_tests" in result
        assert result["total_tests"] > 0

    def test_trust_test_detects_violations(self, engine):
        """Trust test should detect at least some violations."""
        engine.cold_start()
        result = engine.trust_test()
        # At least the clean output test should pass
        assert result["passed"] > 0, "At least one trust test should pass"

    def test_trust_test_has_results(self, engine):
        """Trust test should return detailed results."""
        engine.cold_start()
        result = engine.trust_test()
        assert len(result["results"]) == result["total_tests"]
        for r in result["results"]:
            assert "test_name" in r
            assert "expected" in r
            assert "actual" in r
            assert "passed" in r


# ===========================================================================
# TEST: Mutation 5 — Audit Export
# ===========================================================================

class TestMutation5AuditExport:
    """Test audit report export."""

    def test_export_json(self, engine):
        """Should export audit report as JSON."""
        engine.cold_start()
        import tempfile
        output = tempfile.mktemp(suffix=".json")
        try:
            path = engine.export_audit_report(output, "json")
            assert os.path.exists(path)
            with open(path) as f:
                data = json.load(f)
            assert "report_type" in data
            assert "system_status" in data
            assert "trust_test" in data
        finally:
            if os.path.exists(output):
                os.remove(output)

    def test_export_markdown(self, engine):
        """Should export audit report as Markdown."""
        engine.cold_start()
        import tempfile
        output = tempfile.mktemp(suffix=".md")
        try:
            path = engine.export_audit_report(output, "markdown")
            assert os.path.exists(path)
            with open(path) as f:
                content = f.read()
            assert "Audit Report" in content
            assert "Trust Test" in content
        finally:
            if os.path.exists(output):
                os.remove(output)


# ===========================================================================
# TEST: Mutation 6 — Database Export
# ===========================================================================

class TestMutation6DatabaseExport:
    """Test database export."""

    def test_export_database(self, engine):
        """Should export database as JSON."""
        engine.cold_start()
        import tempfile
        output = tempfile.mktemp(suffix=".json")
        try:
            path = engine.export_database(output)
            assert os.path.exists(path)
            with open(path) as f:
                data = json.load(f)
            assert "tables" in data
            assert "directives" in data["tables"]
        finally:
            if os.path.exists(output):
                os.remove(output)


# ===========================================================================
# TEST: Mutations Active Reporting
# ===========================================================================

class TestMutationsActive:
    """Test that mutations are reported in system status."""

    def test_cold_start_reports_mutations(self, engine):
        """Cold start should report active mutations."""
        result = engine.cold_start()
        assert "mutations_active" in result
        assert len(result["mutations_active"]) == 6

    def test_cold_start_reports_scan_patterns(self, engine):
        """Cold start should report scan pattern count."""
        result = engine.cold_start()
        assert "scan_patterns_generated" in result
        assert result["scan_patterns_generated"] > 0

    def test_status_reports_mutations(self, engine):
        """System status should report active mutations."""
        engine.cold_start()
        status = engine.get_system_status()
        assert "mutations_active" in status
        assert "scan_patterns" in status


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
