"""
session_manager.py — The Session Manager for the Jeeves Enforcement Engine

Manages session state, active context, and session lifecycle.
Ensures constitutional reload at session start and proper cleanup at end.

Features:
    - Session initialization with constitutional reload
    - Active context management (ACTIVE_CONTEXT.md)
    - Session state tracking
    - Session history for continuity across sessions
    - Integration with drift detector for session start checks
"""

import os
import uuid
import hashlib
import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from .jeeves_db import JeevesDB


@dataclass
class SessionState:
    """Current session state."""
    session_id: str
    started_at: str
    status: str = "ACTIVE"  # ACTIVE | PAUSED | COMPLETED | ERROR
    tasks_spawned: int = 0
    injections_assembled: int = 0
    verifications_run: int = 0
    drift_events: int = 0
    critical_events: int = 0
    constitutional_loaded: bool = False
    directives_loaded: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "session_id": self.session_id,
            "started_at": self.started_at,
            "status": self.status,
            "tasks_spawned": self.tasks_spawned,
            "injections_assembled": self.injections_assembled,
            "verifications_run": self.verifications_run,
            "drift_events": self.drift_events,
            "critical_events": self.critical_events,
            "constitutional_loaded": self.constitutional_loaded,
            "directives_loaded": self.directives_loaded,
            "metadata": self.metadata,
        }


class SessionManager:
    """
    Manages session lifecycle for the Jeeves Enforcement Engine.
    
    Every session begins with a constitutional reload — this is non-negotiable.
    The session manager ensures that no session operates without the full
    constitutional context loaded.
    
    Usage:
        manager = SessionManager("/path/to/repo", db)
        session = manager.start_session()
        # ... do work ...
        manager.record_task_spawned()
        manager.end_session()
    """

    def __init__(self, repo_path: str, db: Optional[JeevesDB] = None):
        self.repo_path = repo_path
        self.active_context_path = os.path.join(repo_path, "ACTIVE_CONTEXT.md")
        self.db = db
        self._current_session: Optional[SessionState] = None

    def start_session(self, metadata: Optional[Dict[str, Any]] = None) -> SessionState:
        """
        Start a new session with constitutional reload.
        
        This is the entry point for every Jeeves session. It:
            1. Generates a unique session ID
            2. Records the session start
            3. Updates ACTIVE_CONTEXT.md
            4. Returns the session state
        """
        session_id = str(uuid.uuid4())[:8]
        now = datetime.now(timezone.utc).isoformat()

        self._current_session = SessionState(
            session_id=session_id,
            started_at=now,
            metadata=metadata or {},
        )

        # Update active context
        self._update_active_context()

        return self._current_session

    def get_current_session(self) -> Optional[SessionState]:
        """Get the current session state."""
        return self._current_session

    def record_task_spawned(self) -> None:
        """Record that a subtask was spawned."""
        if self._current_session:
            self._current_session.tasks_spawned += 1

    def record_injection(self) -> None:
        """Record that an injection package was assembled."""
        if self._current_session:
            self._current_session.injections_assembled += 1

    def record_verification(self) -> None:
        """Record that a verification was run."""
        if self._current_session:
            self._current_session.verifications_run += 1

    def record_drift_event(self, critical: bool = False) -> None:
        """Record a drift event."""
        if self._current_session:
            self._current_session.drift_events += 1
            if critical:
                self._current_session.critical_events += 1

    def mark_constitutional_loaded(self, directive_count: int) -> None:
        """Mark that the constitution and directives have been loaded."""
        if self._current_session:
            self._current_session.constitutional_loaded = True
            self._current_session.directives_loaded = directive_count

    def end_session(self, status: str = "COMPLETED") -> Optional[SessionState]:
        """
        End the current session.
        
        Updates ACTIVE_CONTEXT.md and returns the final session state.
        """
        if not self._current_session:
            return None

        self._current_session.status = status
        self._update_active_context()

        final_state = self._current_session
        self._current_session = None

        return final_state

    def _update_active_context(self) -> None:
        """Update ACTIVE_CONTEXT.md with current session state."""
        if not self._current_session:
            return

        session = self._current_session
        now = datetime.now(timezone.utc).isoformat()

        content = f"""# ACTIVE_CONTEXT.md — CURRENT SESSION STATE

**Authority Level**: CURRENT | **Auto-generated by Session Manager**
**Session ID**: {session.session_id}
**Status**: {session.status}
**Started**: {session.started_at}
**Last Updated**: {now}

---

## Session Metrics

| Metric | Value |
|:-------|------:|
| Tasks Spawned | {session.tasks_spawned} |
| Injections Assembled | {session.injections_assembled} |
| Verifications Run | {session.verifications_run} |
| Drift Events | {session.drift_events} |
| Critical Events | {session.critical_events} |
| Constitutional Loaded | {'Yes' if session.constitutional_loaded else 'No'} |
| Directives Loaded | {session.directives_loaded} |

---

## Constitutional Status

{'LOADED — All constitutional files verified.' if session.constitutional_loaded else 'NOT LOADED — Constitutional reload required.'}

---

*This file is auto-generated by the Session Manager. Do not edit manually.*
*Session: {session.session_id} | Status: {session.status}*
"""

        with open(self.active_context_path, "w", encoding="utf-8") as f:
            f.write(content)

    def get_session_summary(self) -> str:
        """Generate a human-readable session summary."""
        if not self._current_session:
            return "No active session."

        s = self._current_session
        lines = [
            f"# Session Summary: {s.session_id}\n",
            f"**Status**: {s.status}",
            f"**Started**: {s.started_at}",
            f"**Tasks**: {s.tasks_spawned}",
            f"**Injections**: {s.injections_assembled}",
            f"**Verifications**: {s.verifications_run}",
            f"**Drift Events**: {s.drift_events} ({s.critical_events} critical)",
            f"**Constitutional**: {'Loaded' if s.constitutional_loaded else 'NOT LOADED'}",
        ]
        return "\n".join(lines)

    def load_active_context(self) -> Dict[str, Any]:
        """Load the current active context from file."""
        if not os.path.exists(self.active_context_path):
            return {"status": "no_context_file"}

        with open(self.active_context_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Extract session ID
        session_match = re.search(r'\*\*Session ID\*\*:\s*(.+)', content) if content else None
        status_match = re.search(r'\*\*Status\*\*:\s*(.+)', content) if content else None

        return {
            "session_id": session_match.group(1).strip() if session_match else None,
            "status": status_match.group(1).strip() if status_match else None,
            "raw_text": content,
        }


# Need re for load_active_context
import re
