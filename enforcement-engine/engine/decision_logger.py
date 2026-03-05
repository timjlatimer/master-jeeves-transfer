"""
decision_logger.py — The Decision Logger for the Jeeves Enforcement Engine

Manages the append-only decision log. Decisions are NEVER edited or deleted.
If a decision is reversed, a NEW entry documents the reversal.

Features:
    - Parse DECISIONS.md into structured decision objects
    - Append new decisions to both markdown and database
    - Query decision history by directive reference
    - Maintain the unbroken chain of institutional memory
    - Dual-write: markdown (human-readable) + database (queryable)
"""

import re
import os
import hashlib
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from .jeeves_db import JeevesDB


@dataclass
class Decision:
    """A single decision record."""
    id: str                                      # e.g. DEC-001
    date: str                                    # ISO 8601 date
    description: str                             # Full description
    directives_referenced: List[str] = field(default_factory=list)
    related_decisions: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    source: str = "Master Jeeves"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "date": self.date,
            "description": self.description,
            "directives_referenced": self.directives_referenced,
            "related_decisions": self.related_decisions,
            "tags": self.tags,
            "source": self.source,
        }

    def to_markdown(self) -> str:
        """Render as markdown for DECISIONS.md."""
        return f"**{self.id}**: {self.description}\n"


class DecisionLogger:
    """
    Manages the append-only decision log.
    
    DECISIONS.md is immutable after entry. Entries are never edited or deleted.
    This creates an unbroken chain of institutional memory.
    
    Dual-write strategy:
        1. Append to DECISIONS.md (human-readable, version-controlled)
        2. Insert into SQLite database (queryable, structured)
    
    Usage:
        logger = DecisionLogger("/path/to/repo", db)
        logger.log_decision(
            description="Adopted MVD philosophy across all projects.",
            directives_referenced=["DIR-003"],
        )
        history = logger.get_history()
    """

    DECISION_PATTERN = re.compile(
        r'\*\*(DEC-\d+)\*\*:\s*(.+?)(?=\n\*\*DEC-|\n---|\n\*\d|\Z)',
        re.DOTALL,
    )

    def __init__(self, repo_path: str, db: Optional[JeevesDB] = None):
        self.repo_path = repo_path
        self.decisions_path = os.path.join(repo_path, "DECISIONS.md")
        self.db = db
        self._decisions: List[Decision] = []
        self._next_id: int = 1
        self.load()

    def load(self) -> int:
        """Load existing decisions from DECISIONS.md."""
        if not os.path.exists(self.decisions_path):
            return 0

        with open(self.decisions_path, "r", encoding="utf-8") as f:
            content = f.read()

        self._decisions = []
        for match in self.DECISION_PATTERN.finditer(content):
            dec_id = match.group(1)
            description = match.group(2).strip()

            # Extract directive references from description
            dir_refs = re.findall(r'DIR-\d+', description)

            # Extract decision references
            dec_refs = re.findall(r'DEC-\d+', description)
            dec_refs = [r for r in dec_refs if r != dec_id]

            self._decisions.append(Decision(
                id=dec_id,
                date=self._extract_date(content, dec_id),
                description=description,
                directives_referenced=dir_refs,
                related_decisions=dec_refs,
            ))

        # Set next ID
        if self._decisions:
            max_num = max(
                int(d.id.replace("DEC-", "")) for d in self._decisions
            )
            self._next_id = max_num + 1
        else:
            self._next_id = 1

        # Sync to database
        if self.db:
            for decision in self._decisions:
                try:
                    self.db.append_decision({
                        "id": decision.id,
                        "date_created": decision.date,
                        "description": decision.description,
                        "directives_referenced": decision.directives_referenced,
                        "related_decisions": decision.related_decisions,
                        "tags": decision.tags,
                        "source": decision.source,
                    })
                except Exception:
                    pass  # Already exists

        return len(self._decisions)

    def _extract_date(self, content: str, dec_id: str) -> str:
        """Extract the date for a decision from the markdown context."""
        # Look for a date header before the decision
        pattern = rf'###\s+(\d{{4}}-\d{{2}}-\d{{2}}).*?{re.escape(dec_id)}'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            return match.group(1)
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")

    def log_decision(
        self,
        description: str,
        directives_referenced: Optional[List[str]] = None,
        related_decisions: Optional[List[str]] = None,
        tags: Optional[List[str]] = None,
        source: str = "Master Jeeves",
    ) -> Decision:
        """
        Log a new decision. Append-only — no edits, no deletions.
        
        Dual-writes to:
            1. DECISIONS.md (human-readable)
            2. SQLite database (queryable)
        """
        dec_id = f"DEC-{self._next_id:03d}"
        now = datetime.now(timezone.utc)
        date_str = now.strftime("%Y-%m-%d")

        decision = Decision(
            id=dec_id,
            date=date_str,
            description=description,
            directives_referenced=directives_referenced or [],
            related_decisions=related_decisions or [],
            tags=tags or [],
            source=source,
        )

        # Append to DECISIONS.md
        self._append_to_markdown(decision)

        # Insert into database
        if self.db:
            self.db.append_decision({
                "id": decision.id,
                "date_created": now.isoformat(),
                "description": decision.description,
                "directives_referenced": decision.directives_referenced,
                "related_decisions": decision.related_decisions,
                "tags": decision.tags,
                "source": decision.source,
            })

        self._decisions.append(decision)
        self._next_id += 1

        return decision

    def _append_to_markdown(self, decision: Decision) -> None:
        """Append a decision entry to DECISIONS.md."""
        if not os.path.exists(self.decisions_path):
            return

        with open(self.decisions_path, "r", encoding="utf-8") as f:
            content = f.read()

        # Find the last decision entry or the entry template section
        entry_line = decision.to_markdown()

        # Insert before the footer/template section
        insert_marker = "## Entry Template"
        if insert_marker in content:
            content = content.replace(
                insert_marker,
                f"{entry_line}\n{insert_marker}",
            )
        else:
            # Append before the footer
            footer_marker = "\n---\n\n*"
            if footer_marker in content:
                parts = content.rsplit(footer_marker, 1)
                content = parts[0] + f"\n{entry_line}" + footer_marker + parts[1]
            else:
                content += f"\n{entry_line}"

        with open(self.decisions_path, "w", encoding="utf-8") as f:
            f.write(content)

    def get_history(self, limit: int = 100) -> List[Decision]:
        """Get decision history, most recent first."""
        return list(reversed(self._decisions[-limit:]))

    def get_decision(self, dec_id: str) -> Optional[Decision]:
        """Get a specific decision by ID."""
        for d in self._decisions:
            if d.id == dec_id:
                return d
        return None

    def get_decisions_by_directive(self, directive_id: str) -> List[Decision]:
        """Get all decisions that reference a specific directive."""
        return [
            d for d in self._decisions
            if directive_id in d.directives_referenced
        ]

    def get_decision_count(self) -> int:
        """Get total number of decisions."""
        return len(self._decisions)

    def to_summary(self) -> str:
        """Generate a human-readable summary."""
        lines = [f"# Decision Log ({len(self._decisions)} decisions)\n"]
        for d in self._decisions[-10:]:
            lines.append(f"- **{d.id}** ({d.date}): {d.description[:80]}...")
        if len(self._decisions) > 10:
            lines.append(f"\n... and {len(self._decisions) - 10} more")
        return "\n".join(lines)
