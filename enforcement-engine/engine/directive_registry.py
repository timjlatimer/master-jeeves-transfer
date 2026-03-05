"""
directive_registry.py — The Directive Registry for the Jeeves Enforcement Engine

Parses DIRECTIVES.md (the human-readable source of truth) into structured
Python dataclass objects with queryable attributes. Replaces manual reading
and interpretation of markdown with programmatic access.

Features:
    - Parse DIRECTIVES.md into structured Directive dataclass objects
    - Query directives by ID, domain, category, or keyword
    - Authority level enforcement via IntEnum
    - Automatic re-parsing when source file changes (checksum-based)
    - Conservative inclusion policy for domain matching
    - Version tracking with supersession support

The Registry reads DIRECTIVES.md as its source of truth but maintains an
in-memory structured index. When DIRECTIVES.md changes, the Registry
rebuilds its index automatically.
"""

import re
import os
import hashlib
import json
from dataclasses import dataclass, field, asdict
from enum import IntEnum
from typing import List, Optional, Dict, Any, Set
from datetime import datetime, timezone

from .jeeves_db import JeevesDB


# ---------------------------------------------------------------------------
# Authority Level Hierarchy (Mutation 1 from Phase 5)
# ---------------------------------------------------------------------------

class AuthorityLevel(IntEnum):
    """
    Programmatic enforcement of the authority hierarchy from CONSTITUTION.md.
    When two directives conflict, the higher-authority directive wins automatically.
    """
    SUPREME = 6         # CONSTITUTION.md
    STANDING_ORDER = 5  # DIRECTIVES.md
    GUIDANCE = 4        # PREFERENCES.md
    RECORD = 3          # DECISIONS.md
    CURRENT = 2         # ACTIVE_CONTEXT.md
    PROTOCOL = 1        # README.md


# ---------------------------------------------------------------------------
# Domain Ontology (Mutation 2 from Phase 5)
# ---------------------------------------------------------------------------

# Default domain mapping for directive categories
CATEGORY_DOMAIN_MAP: Dict[str, List[str]] = {
    "COST": ["finance", "procurement", "tools", "services", "voice_synthesis", "api"],
    "SPEED": ["development", "execution", "planning", "all"],
    "BUILD": ["development", "product", "deployment", "all"],
    "PRESENTATIONS": ["communication", "visual", "reports", "deliverables"],
    "AUTONOMY": ["execution", "decision_making", "all"],
    "GOVERNANCE": ["organization", "escalation", "decision_making", "culture"],
    "CULTURE": ["organization", "operations", "culture", "all"],
    "VISUAL": ["design", "visual", "avatars", "ui"],
    "LEARNING": ["quality_assurance", "review", "improvement"],
    "COMMUNICATION": ["communication", "interaction", "all"],
    "MEMORY": ["memory", "context", "persistence", "all"],
    "ARCHITECTURE": ["design", "product", "avatars", "bingo_card", "platform"],
    "OPERATIONS": ["operations", "email", "communication", "infrastructure"],
}

# Keywords that trigger domain matching
DOMAIN_KEYWORDS: Dict[str, List[str]] = {
    "voice_synthesis": ["voice", "speech", "audio", "tts", "text-to-speech", "elevenlabs", "kei", "kie"],
    "finance": ["cost", "price", "budget", "cheap", "expensive", "money", "payment", "credit"],
    "development": ["build", "code", "develop", "implement", "deploy", "software", "app"],
    "design": ["design", "visual", "ui", "ux", "style", "layout", "pixar", "avatar"],
    "communication": ["email", "message", "present", "report", "communicate", "telegram"],
    "research": ["research", "analyze", "investigate", "study", "compare", "evaluate"],
    "tools": ["tool", "service", "platform", "api", "software", "library"],
    "all": [],  # Universal domain — matches everything
}


# ---------------------------------------------------------------------------
# Directive Dataclass
# ---------------------------------------------------------------------------

@dataclass
class Directive:
    """
    Structured representation of a single directive from DIRECTIVES.md.
    
    Replaces: Manual reading of DIRECTIVES.md prose
    Enables: registry.get_directives(domain="voice_synthesis")
    """
    id: str                                    # e.g. DIR-001
    name: str                                  # Human-readable name
    category: str                              # e.g. COST, SPEED, BUILD
    status: str = "ACTIVE"                     # ACTIVE | SUPERSEDED | ARCHIVED
    authority_level: AuthorityLevel = AuthorityLevel.STANDING_ORDER
    source: str = ""                           # e.g. "Direct", "CB P4"
    date_created: str = ""                     # ISO 8601
    date_modified: str = ""                    # ISO 8601
    content: str = ""                          # Full directive text
    domains: List[str] = field(default_factory=list)
    version: int = 1
    superseded_by: Optional[str] = None
    checksum: str = ""                         # SHA-256 of content
    raw_markdown: str = ""                     # Original markdown section

    def __post_init__(self):
        if not self.checksum and self.content:
            self.checksum = hashlib.sha256(self.content.encode()).hexdigest()
        if not self.domains and self.category:
            self.domains = CATEGORY_DOMAIN_MAP.get(self.category, ["general"])

    def matches_domain(self, domain: str) -> bool:
        """Check if this directive matches a given domain."""
        if "all" in self.domains:
            return True
        return domain.lower() in [d.lower() for d in self.domains]

    def matches_keywords(self, text: str) -> float:
        """
        Calculate relevance score based on keyword matching.
        Returns a float between 0.0 and 1.0.
        Conservative inclusion: even low scores count.
        """
        text_lower = text.lower()
        content_lower = self.content.lower()
        name_lower = self.name.lower()

        score = 0.0
        # Check if directive name keywords appear in the text
        name_words = set(name_lower.split())
        text_words = set(text_lower.split())
        name_overlap = len(name_words & text_words)
        if name_overlap > 0:
            score += 0.3 * (name_overlap / max(len(name_words), 1))

        # Check domain keyword matches
        for domain, keywords in DOMAIN_KEYWORDS.items():
            if domain in self.domains:
                for kw in keywords:
                    if kw in text_lower:
                        score += 0.2
                        break

        # Check if any content keywords appear in the text
        content_words = set(re.findall(r'\b\w{4,}\b', content_lower))
        content_overlap = len(content_words & text_words)
        if content_overlap > 0:
            score += 0.2 * min(content_overlap / 5, 1.0)

        # Universal directives always get a base score
        if "all" in self.domains:
            score = max(score, 0.15)

        return min(score, 1.0)

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for serialization."""
        d = asdict(self)
        d["authority_level"] = self.authority_level.name
        return d


# ---------------------------------------------------------------------------
# Markdown Parser
# ---------------------------------------------------------------------------

class DirectiveParser:
    """
    Parses DIRECTIVES.md into structured Directive objects.
    
    The parser understands the specific markdown format used in the
    Constitutional Memory System's DIRECTIVES.md file.
    """

    DIRECTIVE_PATTERN = re.compile(
        r'###\s+(DIR-\d+):\s+(.+?)(?:\n|$)'
    )
    STATUS_PATTERN = re.compile(
        r'\*\*Status\*\*:\s*(\w+)'
    )
    DATE_PATTERN = re.compile(
        r'\*\*Date\*\*:\s*([\d-]+)'
    )
    SOURCE_PATTERN = re.compile(
        r'\*\*Source\*\*:\s*(.+?)(?:\n|$)'
    )

    @classmethod
    def parse_file(cls, filepath: str) -> List[Directive]:
        """Parse a DIRECTIVES.md file into a list of Directive objects."""
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        return cls.parse_content(content)

    @classmethod
    def parse_content(cls, content: str) -> List[Directive]:
        """Parse DIRECTIVES.md content into Directive objects."""
        directives = []

        # Split by directive headers
        sections = re.split(r'(?=###\s+DIR-\d+)', content)

        for section in sections:
            match = cls.DIRECTIVE_PATTERN.search(section)
            if not match:
                continue

            dir_id = match.group(1)
            raw_name = match.group(2).strip()

            # Parse name — split on colon or dash for category extraction
            name_parts = re.split(r'\s*[—–-]\s*', raw_name, maxsplit=1)
            category_hint = name_parts[0].strip().upper() if len(name_parts) > 1 else ""
            name = name_parts[-1].strip() if len(name_parts) > 1 else raw_name

            # Extract status
            status_match = cls.STATUS_PATTERN.search(section)
            status = status_match.group(1) if status_match else "ACTIVE"

            # Extract date
            date_match = cls.DATE_PATTERN.search(section)
            date_str = date_match.group(1) if date_match else ""

            # Extract source
            source_match = cls.SOURCE_PATTERN.search(section)
            source = source_match.group(1).strip() if source_match else ""

            # Extract category from the directive index if available
            category = cls._infer_category(dir_id, category_hint, section)

            # Get full content (everything after the metadata line)
            content_lines = section.strip().split("\n")
            # Skip header and metadata lines
            content_text = "\n".join(content_lines).strip()

            directive = Directive(
                id=dir_id,
                name=name,
                category=category,
                status=status,
                source=source,
                date_created=date_str,
                content=content_text,
                raw_markdown=section.strip(),
            )
            directives.append(directive)

        return directives

    @staticmethod
    def _infer_category(dir_id: str, hint: str, section: str) -> str:
        """Infer the category of a directive from context."""
        # Known categories from the directive index
        KNOWN_CATEGORIES = {
            "DIR-001": "COST", "DIR-002": "SPEED", "DIR-003": "BUILD",
            "DIR-004": "PRESENTATIONS", "DIR-005": "AUTONOMY",
            "DIR-006": "GOVERNANCE", "DIR-007": "CULTURE",
            "DIR-008": "VISUAL", "DIR-009": "LEARNING",
            "DIR-010": "COMMUNICATION", "DIR-011": "MEMORY",
            "DIR-012": "ARCHITECTURE", "DIR-013": "ARCHITECTURE",
            "DIR-014": "ARCHITECTURE", "DIR-015": "ARCHITECTURE",
            "DIR-016": "ARCHITECTURE", "DIR-017": "ARCHITECTURE",
            "DIR-018": "ARCHITECTURE", "DIR-019": "ARCHITECTURE",
            "DIR-020": "ARCHITECTURE", "DIR-021": "OPERATIONS",
            "DIR-022": "ARCHITECTURE", "DIR-023": "ARCHITECTURE",
        }
        if dir_id in KNOWN_CATEGORIES:
            return KNOWN_CATEGORIES[dir_id]
        if hint and hint in CATEGORY_DOMAIN_MAP:
            return hint
        return "GENERAL"


# ---------------------------------------------------------------------------
# Directive Registry
# ---------------------------------------------------------------------------

class DirectiveRegistry:
    """
    The programmatic replacement for 'read DIRECTIVES.md and figure out
    what is relevant.'
    
    Parses the markdown source files into structured Python objects with
    queryable attributes. Maintains an in-memory index that auto-refreshes
    when the source file changes.
    
    Usage:
        registry = DirectiveRegistry("/path/to/repo")
        directives = registry.get_directives(domain="voice_synthesis")
        kei = registry.get_directive("DIR-001")
    """

    def __init__(self, repo_path: str, db: Optional[JeevesDB] = None):
        self.repo_path = repo_path
        self.directives_path = os.path.join(repo_path, "DIRECTIVES.md")
        self.db = db
        self._directives: Dict[str, Directive] = {}
        self._file_checksum: str = ""
        self._last_parsed: Optional[str] = None
        self.load()

    def load(self) -> int:
        """
        Load/reload directives from DIRECTIVES.md.
        Returns the number of directives loaded.
        """
        if not os.path.exists(self.directives_path):
            raise FileNotFoundError(
                f"DIRECTIVES.md not found at {self.directives_path}. "
                "The constitutional source file must exist."
            )

        current_checksum = self._compute_file_checksum()
        if current_checksum == self._file_checksum and self._directives:
            return len(self._directives)  # No change

        directives = DirectiveParser.parse_file(self.directives_path)
        self._directives = {d.id: d for d in directives}
        self._file_checksum = current_checksum
        self._last_parsed = datetime.now(timezone.utc).isoformat()

        # Sync to database if available
        if self.db:
            self._sync_to_db()

        return len(self._directives)

    def _compute_file_checksum(self) -> str:
        """Compute SHA-256 checksum of the directives file."""
        with open(self.directives_path, "rb") as f:
            return hashlib.sha256(f.read()).hexdigest()

    def _sync_to_db(self) -> None:
        """Sync parsed directives to the database."""
        for directive in self._directives.values():
            self.db.upsert_directive({
                "id": directive.id,
                "name": directive.name,
                "category": directive.category,
                "status": directive.status,
                "authority_level": directive.authority_level.name,
                "source": directive.source,
                "date_created": directive.date_created,
                "date_modified": directive.date_modified or directive.date_created,
                "content": directive.content,
                "domains": directive.domains,
                "version": directive.version,
                "superseded_by": directive.superseded_by,
                "checksum": directive.checksum,
                "raw_markdown": directive.raw_markdown,
            })

    def needs_refresh(self) -> bool:
        """Check if the source file has changed since last parse."""
        if not os.path.exists(self.directives_path):
            return False
        return self._compute_file_checksum() != self._file_checksum

    def refresh_if_needed(self) -> bool:
        """Refresh the registry if the source file has changed. Returns True if refreshed."""
        if self.needs_refresh():
            self.load()
            return True
        return False

    # -------------------------------------------------------------------
    # Query Methods
    # -------------------------------------------------------------------

    def get_directive(self, directive_id: str) -> Optional[Directive]:
        """Get a single directive by ID."""
        self.refresh_if_needed()
        return self._directives.get(directive_id)

    def get_all_directives(self, status: str = "ACTIVE") -> List[Directive]:
        """Get all directives, optionally filtered by status."""
        self.refresh_if_needed()
        return [
            d for d in self._directives.values()
            if d.status == status
        ]

    def get_directives_by_domain(self, domain: str) -> List[Directive]:
        """Get all active directives matching a domain."""
        self.refresh_if_needed()
        return [
            d for d in self._directives.values()
            if d.status == "ACTIVE" and d.matches_domain(domain)
        ]

    def get_directives_by_category(self, category: str) -> List[Directive]:
        """Get all active directives in a category."""
        self.refresh_if_needed()
        return [
            d for d in self._directives.values()
            if d.status == "ACTIVE" and d.category.upper() == category.upper()
        ]

    def get_relevant_directives(
        self, task_description: str, threshold: float = 0.05
    ) -> List[Directive]:
        """
        Get directives relevant to a task description.
        
        Uses keyword matching with CONSERVATIVE inclusion policy:
        When in doubt, INCLUDE the directive. The cost of over-inclusion
        (~50 tokens) is negligible compared to the cost of another KEI incident.
        
        Args:
            task_description: Description of the task
            threshold: Minimum relevance score (default 0.05 — very conservative)
        
        Returns:
            List of relevant directives, sorted by relevance score descending
        """
        self.refresh_if_needed()
        scored = []
        for d in self._directives.values():
            if d.status != "ACTIVE":
                continue
            score = d.matches_keywords(task_description)
            if score >= threshold:
                scored.append((score, d))

        # Sort by score descending, then by ID for stability
        scored.sort(key=lambda x: (-x[0], x[1].id))
        return [d for _, d in scored]

    def get_directive_ids(self) -> List[str]:
        """Get all active directive IDs."""
        return [d.id for d in self.get_all_directives()]

    def get_directive_count(self) -> int:
        """Get count of active directives."""
        return len([d for d in self._directives.values() if d.status == "ACTIVE"])

    def resolve_conflict(self, dir_a: str, dir_b: str) -> str:
        """
        Resolve a conflict between two directives using the authority hierarchy.
        Returns the ID of the winning directive.
        """
        a = self.get_directive(dir_a)
        b = self.get_directive(dir_b)
        if not a or not b:
            raise ValueError(f"Directive not found: {dir_a if not a else dir_b}")
        if a.authority_level >= b.authority_level:
            return a.id
        return b.id

    def check_sync_integrity(self) -> Dict[str, Any]:
        """
        Check if the in-memory registry matches the current DIRECTIVES.md file.
        Returns a sync status report.
        """
        current_checksum = self._compute_file_checksum()
        in_sync = current_checksum == self._file_checksum

        return {
            "in_sync": in_sync,
            "file_checksum": current_checksum,
            "registry_checksum": self._file_checksum,
            "directive_count": self.get_directive_count(),
            "last_parsed": self._last_parsed,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def to_summary(self) -> str:
        """Generate a human-readable summary of all active directives."""
        directives = self.get_all_directives()
        lines = [f"# Active Directives ({len(directives)} total)\n"]
        for d in directives:
            lines.append(f"- **{d.id}**: {d.name} [{d.category}]")
        return "\n".join(lines)
