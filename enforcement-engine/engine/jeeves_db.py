"""
jeeves_db.py — The Database Layer for the Jeeves Enforcement Engine

Provides structured SQLite storage for operational data while keeping
the markdown files as the human-readable source of truth.

Tables:
    directives        — Structured directive records with domain tags, status, version
    decisions         — Append-only decision log with timestamps and references
    injection_log     — Audit trail of every injection package assembled
    verification_log  — Audit trail of every gate check performed
    drift_events      — Log of all drift detection events
    audit_reports     — Weekly audit report history
    compression_events — Log of context compression events and NEVER-COMPRESS verification

Infrastructure cost: $0 (SQLite is free)
"""

import sqlite3
import json
import os
import hashlib
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, asdict
from contextlib import contextmanager
from pathlib import Path


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DEFAULT_DB_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "data", "jeeves.db"
)


# ---------------------------------------------------------------------------
# Schema Definition
# ---------------------------------------------------------------------------

SCHEMA_SQL = """
-- Table 1: directives — Structured directive records parsed from DIRECTIVES.md
CREATE TABLE IF NOT EXISTS directives (
    id              TEXT PRIMARY KEY,          -- e.g. DIR-001
    name            TEXT NOT NULL,             -- Human-readable name
    category        TEXT NOT NULL,             -- e.g. COST, SPEED, BUILD, ARCHITECTURE
    status          TEXT NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE | SUPERSEDED | ARCHIVED
    authority_level TEXT NOT NULL DEFAULT 'STANDING_ORDER',
    source          TEXT,                      -- e.g. "Direct", "CB P4"
    date_created    TEXT NOT NULL,             -- ISO 8601
    date_modified   TEXT,                      -- ISO 8601
    content         TEXT NOT NULL,             -- Full directive text
    domains         TEXT NOT NULL DEFAULT '[]', -- JSON array of domain tags
    version         INTEGER NOT NULL DEFAULT 1,
    superseded_by   TEXT,                      -- ID of superseding directive
    checksum        TEXT NOT NULL,             -- SHA-256 of content for sync verification
    raw_markdown    TEXT                       -- Original markdown section
);

-- Table 2: decisions — Append-only decision log
CREATE TABLE IF NOT EXISTS decisions (
    id              TEXT PRIMARY KEY,          -- e.g. DEC-001
    date_created    TEXT NOT NULL,             -- ISO 8601
    description     TEXT NOT NULL,
    directives_referenced TEXT DEFAULT '[]',   -- JSON array of directive IDs
    related_decisions TEXT DEFAULT '[]',       -- JSON array of decision IDs
    tags            TEXT DEFAULT '[]',         -- JSON array of tags
    source          TEXT,                      -- Who/what created this entry
    checksum        TEXT NOT NULL
);

-- Table 3: injection_log — Audit trail of every injection package assembled
CREATE TABLE IF NOT EXISTS injection_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp       TEXT NOT NULL,             -- ISO 8601
    task_id         TEXT,                      -- External task identifier
    task_description TEXT NOT NULL,
    directives_included TEXT NOT NULL,         -- JSON array of directive IDs
    constitution_included BOOLEAN NOT NULL DEFAULT 1,
    compliance_footer_included BOOLEAN NOT NULL DEFAULT 1,
    token_count     INTEGER,
    package_checksum TEXT NOT NULL,            -- SHA-256 of assembled package
    status          TEXT NOT NULL DEFAULT 'ASSEMBLED', -- ASSEMBLED | INJECTED | FAILED
    error_message   TEXT
);

-- Table 4: verification_log — Audit trail of every gate check performed
CREATE TABLE IF NOT EXISTS verification_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp       TEXT NOT NULL,             -- ISO 8601
    task_id         TEXT,
    output_hash     TEXT NOT NULL,             -- SHA-256 of the output text
    classification  TEXT NOT NULL,             -- COMPLIANT | FLAGGED | VIOLATION
    directives_checked TEXT NOT NULL,          -- JSON array of directive IDs checked
    findings        TEXT NOT NULL DEFAULT '[]', -- JSON array of finding objects
    fresh_eyes      BOOLEAN NOT NULL DEFAULT 1, -- Was Fresh Eyes protocol followed?
    tim_override    BOOLEAN NOT NULL DEFAULT 0, -- Did Tim override?
    override_reason TEXT
);

-- Table 5: drift_events — Log of all drift detection events
CREATE TABLE IF NOT EXISTS drift_events (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp       TEXT NOT NULL,             -- ISO 8601
    trigger_type    TEXT NOT NULL,             -- session_start | pre_subtask | post_subtask | compression | weekly
    drift_type      TEXT,                      -- e.g. Directive Amnesia, Silent Override, etc.
    severity        TEXT NOT NULL DEFAULT 'INFO', -- INFO | WARNING | CRITICAL
    description     TEXT NOT NULL,
    directives_affected TEXT DEFAULT '[]',     -- JSON array of directive IDs
    resolution      TEXT,
    resolved        BOOLEAN NOT NULL DEFAULT 0,
    session_id      TEXT
);

-- Table 6: audit_reports — Weekly audit report history
CREATE TABLE IF NOT EXISTS audit_reports (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp       TEXT NOT NULL,             -- ISO 8601
    period_start    TEXT NOT NULL,             -- ISO 8601
    period_end      TEXT NOT NULL,             -- ISO 8601
    decisions_count INTEGER NOT NULL DEFAULT 0,
    compliant_count INTEGER NOT NULL DEFAULT 0,
    flagged_count   INTEGER NOT NULL DEFAULT 0,
    violation_count INTEGER NOT NULL DEFAULT 0,
    new_directives  INTEGER NOT NULL DEFAULT 0,
    compliance_score REAL,                     -- 0.0 to 100.0
    score_breakdown TEXT DEFAULT '{}',         -- JSON object with component scores
    report_markdown TEXT NOT NULL,             -- Full markdown report
    session_id      TEXT
);

-- Table 7: compression_events — Log of context compression events
CREATE TABLE IF NOT EXISTS compression_events (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp       TEXT NOT NULL,             -- ISO 8601
    items_checked   INTEGER NOT NULL,          -- Number of NEVER-COMPRESS items checked
    items_survived  INTEGER NOT NULL,          -- Number that survived compression
    items_missing   INTEGER NOT NULL DEFAULT 0, -- Number that were lost
    missing_items   TEXT DEFAULT '[]',         -- JSON array of missing item identifiers
    reinjected      BOOLEAN NOT NULL DEFAULT 0, -- Were missing items re-injected?
    session_id      TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_directives_status ON directives(status);
CREATE INDEX IF NOT EXISTS idx_directives_category ON directives(category);
CREATE INDEX IF NOT EXISTS idx_injection_log_timestamp ON injection_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_verification_log_timestamp ON verification_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_verification_log_classification ON verification_log(classification);
CREATE INDEX IF NOT EXISTS idx_drift_events_trigger ON drift_events(trigger_type);
CREATE INDEX IF NOT EXISTS idx_drift_events_severity ON drift_events(severity);
CREATE INDEX IF NOT EXISTS idx_audit_reports_timestamp ON audit_reports(timestamp);
"""


# ---------------------------------------------------------------------------
# Database Manager
# ---------------------------------------------------------------------------

class JeevesDB:
    """
    SQLite database manager for the Jeeves Enforcement Engine.
    
    Zero cost, zero infrastructure. Provides structured storage for
    operational data while keeping markdown files as the human-readable
    source of truth.
    
    Implements dual-write strategy: every critical write is also
    exportable to JSON for GitHub backup (DA-4 resolution).
    """

    def __init__(self, db_path: str = DEFAULT_DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self._init_db()

    def _init_db(self):
        """Initialize the database with the schema."""
        with self._connect() as conn:
            conn.executescript(SCHEMA_SQL)

    @contextmanager
    def _connect(self):
        """Context manager for database connections."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL")
        conn.execute("PRAGMA foreign_keys=ON")
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.close()

    @staticmethod
    def _now() -> str:
        """Return current UTC timestamp in ISO 8601 format."""
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def _checksum(content: str) -> str:
        """Compute SHA-256 checksum of content."""
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    # -------------------------------------------------------------------
    # Directives CRUD
    # -------------------------------------------------------------------

    def upsert_directive(self, directive: Dict[str, Any]) -> None:
        """Insert or update a directive record."""
        directive.setdefault("date_modified", self._now())
        directive.setdefault("domains", [])
        directive.setdefault("version", 1)
        directive.setdefault("authority_level", "STANDING_ORDER")
        directive["checksum"] = self._checksum(directive.get("content", ""))
        if isinstance(directive.get("domains"), list):
            directive["domains"] = json.dumps(directive["domains"])

        with self._connect() as conn:
            conn.execute(
                """INSERT INTO directives 
                   (id, name, category, status, authority_level, source, 
                    date_created, date_modified, content, domains, version,
                    superseded_by, checksum, raw_markdown)
                   VALUES (:id, :name, :category, :status, :authority_level, :source,
                           :date_created, :date_modified, :content, :domains, :version,
                           :superseded_by, :checksum, :raw_markdown)
                   ON CONFLICT(id) DO UPDATE SET
                       name=excluded.name, category=excluded.category,
                       status=excluded.status, date_modified=excluded.date_modified,
                       content=excluded.content, domains=excluded.domains,
                       version=excluded.version, superseded_by=excluded.superseded_by,
                       checksum=excluded.checksum, raw_markdown=excluded.raw_markdown
                """,
                directive,
            )

    def get_directive(self, directive_id: str) -> Optional[Dict[str, Any]]:
        """Get a single directive by ID."""
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM directives WHERE id = ?", (directive_id,)
            ).fetchone()
            if row:
                d = dict(row)
                d["domains"] = json.loads(d["domains"])
                return d
            return None

    def get_all_directives(self, status: str = "ACTIVE") -> List[Dict[str, Any]]:
        """Get all directives, optionally filtered by status."""
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM directives WHERE status = ? ORDER BY id",
                (status,),
            ).fetchall()
            result = []
            for row in rows:
                d = dict(row)
                d["domains"] = json.loads(d["domains"])
                result.append(d)
            return result

    def get_directives_by_domain(self, domain: str) -> List[Dict[str, Any]]:
        """Get directives that match a specific domain tag."""
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM directives WHERE status = 'ACTIVE' ORDER BY id"
            ).fetchall()
            result = []
            for row in rows:
                d = dict(row)
                d["domains"] = json.loads(d["domains"])
                if domain.lower() in [dom.lower() for dom in d["domains"]]:
                    result.append(d)
            return result

    def get_directive_count(self) -> int:
        """Get count of active directives."""
        with self._connect() as conn:
            row = conn.execute(
                "SELECT COUNT(*) as cnt FROM directives WHERE status = 'ACTIVE'"
            ).fetchone()
            return row["cnt"]

    # -------------------------------------------------------------------
    # Decisions CRUD (Append-Only)
    # -------------------------------------------------------------------

    def append_decision(self, decision: Dict[str, Any]) -> None:
        """Append a decision to the log. Append-only — no edits, no deletions."""
        decision.setdefault("date_created", self._now())
        decision.setdefault("directives_referenced", [])
        decision.setdefault("related_decisions", [])
        decision.setdefault("tags", [])
        decision["checksum"] = self._checksum(decision.get("description", ""))

        for field in ("directives_referenced", "related_decisions", "tags"):
            if isinstance(decision.get(field), list):
                decision[field] = json.dumps(decision[field])

        with self._connect() as conn:
            conn.execute(
                """INSERT INTO decisions
                   (id, date_created, description, directives_referenced,
                    related_decisions, tags, source, checksum)
                   VALUES (:id, :date_created, :description, :directives_referenced,
                           :related_decisions, :tags, :source, :checksum)
                """,
                decision,
            )

    def get_decisions(
        self, directive_id: Optional[str] = None, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Query decision history, optionally filtered by directive reference."""
        with self._connect() as conn:
            if directive_id:
                rows = conn.execute(
                    """SELECT * FROM decisions 
                       WHERE directives_referenced LIKE ? 
                       ORDER BY date_created DESC LIMIT ?""",
                    (f'%"{directive_id}"%', limit),
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT * FROM decisions ORDER BY date_created DESC LIMIT ?",
                    (limit,),
                ).fetchall()
            result = []
            for row in rows:
                d = dict(row)
                for field in ("directives_referenced", "related_decisions", "tags"):
                    d[field] = json.loads(d[field])
                result.append(d)
            return result

    # -------------------------------------------------------------------
    # Injection Log
    # -------------------------------------------------------------------

    def log_injection(self, entry: Dict[str, Any]) -> int:
        """Log an injection package assembly event. Returns the log ID."""
        entry.setdefault("timestamp", self._now())
        entry.setdefault("constitution_included", True)
        entry.setdefault("compliance_footer_included", True)
        entry.setdefault("status", "ASSEMBLED")

        if isinstance(entry.get("directives_included"), list):
            entry["directives_included"] = json.dumps(entry["directives_included"])

        with self._connect() as conn:
            cursor = conn.execute(
                """INSERT INTO injection_log
                   (timestamp, task_id, task_description, directives_included,
                    constitution_included, compliance_footer_included, token_count,
                    package_checksum, status, error_message)
                   VALUES (:timestamp, :task_id, :task_description, :directives_included,
                           :constitution_included, :compliance_footer_included, :token_count,
                           :package_checksum, :status, :error_message)
                """,
                entry,
            )
            return cursor.lastrowid

    def get_injection_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent injection log entries."""
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM injection_log ORDER BY timestamp DESC LIMIT ?",
                (limit,),
            ).fetchall()
            result = []
            for row in rows:
                d = dict(row)
                d["directives_included"] = json.loads(d["directives_included"])
                result.append(d)
            return result

    # -------------------------------------------------------------------
    # Verification Log
    # -------------------------------------------------------------------

    def log_verification(self, entry: Dict[str, Any]) -> int:
        """Log a verification gate check. Returns the log ID."""
        entry.setdefault("timestamp", self._now())
        entry.setdefault("fresh_eyes", True)
        entry.setdefault("tim_override", False)
        entry.setdefault("findings", [])

        for field in ("directives_checked", "findings"):
            if isinstance(entry.get(field), list):
                entry[field] = json.dumps(entry[field])

        with self._connect() as conn:
            cursor = conn.execute(
                """INSERT INTO verification_log
                   (timestamp, task_id, output_hash, classification,
                    directives_checked, findings, fresh_eyes,
                    tim_override, override_reason)
                   VALUES (:timestamp, :task_id, :output_hash, :classification,
                           :directives_checked, :findings, :fresh_eyes,
                           :tim_override, :override_reason)
                """,
                entry,
            )
            return cursor.lastrowid

    def get_verification_logs(
        self, classification: Optional[str] = None, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get recent verification log entries."""
        with self._connect() as conn:
            if classification:
                rows = conn.execute(
                    """SELECT * FROM verification_log 
                       WHERE classification = ?
                       ORDER BY timestamp DESC LIMIT ?""",
                    (classification, limit),
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT * FROM verification_log ORDER BY timestamp DESC LIMIT ?",
                    (limit,),
                ).fetchall()
            result = []
            for row in rows:
                d = dict(row)
                d["directives_checked"] = json.loads(d["directives_checked"])
                d["findings"] = json.loads(d["findings"])
                result.append(d)
            return result

    # -------------------------------------------------------------------
    # Drift Events
    # -------------------------------------------------------------------

    def log_drift_event(self, entry: Dict[str, Any]) -> int:
        """Log a drift detection event. Returns the event ID."""
        entry.setdefault("timestamp", self._now())
        entry.setdefault("severity", "INFO")
        entry.setdefault("resolved", False)

        if isinstance(entry.get("directives_affected"), list):
            entry["directives_affected"] = json.dumps(entry["directives_affected"])

        with self._connect() as conn:
            cursor = conn.execute(
                """INSERT INTO drift_events
                   (timestamp, trigger_type, drift_type, severity, description,
                    directives_affected, resolution, resolved, session_id)
                   VALUES (:timestamp, :trigger_type, :drift_type, :severity,
                           :description, :directives_affected, :resolution,
                           :resolved, :session_id)
                """,
                entry,
            )
            return cursor.lastrowid

    def get_drift_events(
        self, severity: Optional[str] = None, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get recent drift events."""
        with self._connect() as conn:
            if severity:
                rows = conn.execute(
                    """SELECT * FROM drift_events 
                       WHERE severity = ?
                       ORDER BY timestamp DESC LIMIT ?""",
                    (severity, limit),
                ).fetchall()
            else:
                rows = conn.execute(
                    "SELECT * FROM drift_events ORDER BY timestamp DESC LIMIT ?",
                    (limit,),
                ).fetchall()
            result = []
            for row in rows:
                d = dict(row)
                d["directives_affected"] = json.loads(d["directives_affected"])
                result.append(d)
            return result

    # -------------------------------------------------------------------
    # Audit Reports
    # -------------------------------------------------------------------

    def save_audit_report(self, report: Dict[str, Any]) -> int:
        """Save a weekly audit report. Returns the report ID."""
        report.setdefault("timestamp", self._now())

        if isinstance(report.get("score_breakdown"), dict):
            report["score_breakdown"] = json.dumps(report["score_breakdown"])

        with self._connect() as conn:
            cursor = conn.execute(
                """INSERT INTO audit_reports
                   (timestamp, period_start, period_end, decisions_count,
                    compliant_count, flagged_count, violation_count,
                    new_directives, compliance_score, score_breakdown,
                    report_markdown, session_id)
                   VALUES (:timestamp, :period_start, :period_end, :decisions_count,
                           :compliant_count, :flagged_count, :violation_count,
                           :new_directives, :compliance_score, :score_breakdown,
                           :report_markdown, :session_id)
                """,
                report,
            )
            return cursor.lastrowid

    def get_latest_audit(self) -> Optional[Dict[str, Any]]:
        """Get the most recent audit report."""
        with self._connect() as conn:
            row = conn.execute(
                "SELECT * FROM audit_reports ORDER BY timestamp DESC LIMIT 1"
            ).fetchone()
            if row:
                d = dict(row)
                d["score_breakdown"] = json.loads(d["score_breakdown"])
                return d
            return None

    def get_compliance_trend(self, limit: int = 12) -> List[Dict[str, Any]]:
        """Get compliance score trend over recent audits."""
        with self._connect() as conn:
            rows = conn.execute(
                """SELECT timestamp, compliance_score, score_breakdown
                   FROM audit_reports ORDER BY timestamp DESC LIMIT ?""",
                (limit,),
            ).fetchall()
            result = []
            for row in rows:
                d = dict(row)
                d["score_breakdown"] = json.loads(d["score_breakdown"])
                result.append(d)
            return list(reversed(result))

    # -------------------------------------------------------------------
    # Compression Events
    # -------------------------------------------------------------------

    def log_compression_event(self, entry: Dict[str, Any]) -> int:
        """Log a context compression event. Returns the event ID."""
        entry.setdefault("timestamp", self._now())
        entry.setdefault("reinjected", False)

        if isinstance(entry.get("missing_items"), list):
            entry["missing_items"] = json.dumps(entry["missing_items"])

        with self._connect() as conn:
            cursor = conn.execute(
                """INSERT INTO compression_events
                   (timestamp, items_checked, items_survived, items_missing,
                    missing_items, reinjected, session_id)
                   VALUES (:timestamp, :items_checked, :items_survived, :items_missing,
                           :missing_items, :reinjected, :session_id)
                """,
                entry,
            )
            return cursor.lastrowid

    # -------------------------------------------------------------------
    # Health & Stats
    # -------------------------------------------------------------------

    def get_health_stats(self) -> Dict[str, Any]:
        """Get overall system health statistics."""
        with self._connect() as conn:
            stats = {}
            stats["directive_count"] = conn.execute(
                "SELECT COUNT(*) FROM directives WHERE status = 'ACTIVE'"
            ).fetchone()[0]
            stats["decision_count"] = conn.execute(
                "SELECT COUNT(*) FROM decisions"
            ).fetchone()[0]
            stats["injection_count"] = conn.execute(
                "SELECT COUNT(*) FROM injection_log"
            ).fetchone()[0]
            stats["verification_count"] = conn.execute(
                "SELECT COUNT(*) FROM verification_log"
            ).fetchone()[0]
            stats["violation_count"] = conn.execute(
                "SELECT COUNT(*) FROM verification_log WHERE classification = 'VIOLATION'"
            ).fetchone()[0]
            stats["drift_event_count"] = conn.execute(
                "SELECT COUNT(*) FROM drift_events"
            ).fetchone()[0]
            stats["critical_drift_count"] = conn.execute(
                "SELECT COUNT(*) FROM drift_events WHERE severity = 'CRITICAL'"
            ).fetchone()[0]
            stats["audit_count"] = conn.execute(
                "SELECT COUNT(*) FROM audit_reports"
            ).fetchone()[0]

            latest_audit = self.get_latest_audit()
            stats["latest_compliance_score"] = (
                latest_audit["compliance_score"] if latest_audit else None
            )
            stats["db_size_bytes"] = os.path.getsize(self.db_path)
            stats["timestamp"] = self._now()
            return stats

    # -------------------------------------------------------------------
    # Export for GitHub Backup (DA-4 Resolution)
    # -------------------------------------------------------------------

    def export_to_json(self, output_dir: str) -> Dict[str, str]:
        """Export all tables to JSON files for GitHub backup."""
        os.makedirs(output_dir, exist_ok=True)
        exported = {}

        tables = [
            "directives", "decisions", "injection_log",
            "verification_log", "drift_events", "audit_reports",
            "compression_events",
        ]

        with self._connect() as conn:
            for table in tables:
                rows = conn.execute(f"SELECT * FROM {table}").fetchall()
                data = [dict(row) for row in rows]
                filepath = os.path.join(output_dir, f"{table}.json")
                with open(filepath, "w") as f:
                    json.dump(data, f, indent=2, default=str)
                exported[table] = filepath

        return exported

    def import_from_json(self, input_dir: str) -> Dict[str, int]:
        """Import data from JSON backup files. Used for recovery."""
        imported = {}
        tables = [
            "directives", "decisions", "injection_log",
            "verification_log", "drift_events", "audit_reports",
            "compression_events",
        ]

        for table in tables:
            filepath = os.path.join(input_dir, f"{table}.json")
            if not os.path.exists(filepath):
                continue
            with open(filepath, "r") as f:
                data = json.load(f)
            if not data:
                imported[table] = 0
                continue

            with self._connect() as conn:
                for row in data:
                    columns = ", ".join(row.keys())
                    placeholders = ", ".join(["?" for _ in row])
                    try:
                        conn.execute(
                            f"INSERT OR IGNORE INTO {table} ({columns}) VALUES ({placeholders})",
                            list(row.values()),
                        )
                    except sqlite3.Error:
                        pass
                imported[table] = len(data)

        return imported

    # -------------------------------------------------------------------
    # Lifecycle
    # -------------------------------------------------------------------

    def close(self) -> None:
        """Close the database connection (no-op for context-manager pattern)."""
        # SQLite connections are opened/closed per operation via _connect()
        # This method exists for API compatibility with the engine shutdown.
        pass

    def get_table_list(self) -> List[str]:
        """Get a list of all tables in the database."""
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
            ).fetchall()
            return [row["name"] for row in rows]
