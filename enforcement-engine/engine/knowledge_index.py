"""
knowledge_index.py — The Knowledge Index for the Jeeves Enforcement Engine

Pearl's Brain — the institutional knowledge index for the entire SIC HB1000
ecosystem. Catalogs what exists, where it lives, and how to access it.

Features:
    - Parse KNOWLEDGE.md into structured knowledge objects
    - Vocabulary/glossary lookup (Tim's language)
    - Repository index
    - Project index (Bingo Card Universe)
    - Skills and protocols index
    - Knowledge gap tracking
    - People and contacts directory
"""

import re
import os
import hashlib
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any


@dataclass
class VocabularyTerm:
    """A term from Tim's vocabulary dictionary."""
    concept: str
    definition: str
    directive_reference: str = ""

    def to_dict(self) -> Dict[str, str]:
        return {
            "concept": self.concept,
            "definition": self.definition,
            "directive_reference": self.directive_reference,
        }


@dataclass
class Repository:
    """A GitHub repository in the ecosystem."""
    name: str
    size: str
    contents: str
    status: str

    def to_dict(self) -> Dict[str, str]:
        return {
            "name": self.name,
            "size": self.size,
            "contents": self.contents,
            "status": self.status,
        }


@dataclass
class Project:
    """A project in the Bingo Card Universe."""
    name: str
    codename: str
    status: str
    description: str = ""

    def to_dict(self) -> Dict[str, str]:
        return {
            "name": self.name,
            "codename": self.codename,
            "status": self.status,
            "description": self.description,
        }


@dataclass
class KnowledgeGap:
    """A tracked knowledge gap."""
    priority: str
    item: str
    likely_source: str
    status: str

    def to_dict(self) -> Dict[str, str]:
        return {
            "priority": self.priority,
            "item": self.item,
            "likely_source": self.likely_source,
            "status": self.status,
        }


class KnowledgeIndex:
    """
    Pearl's Brain — the institutional knowledge index.
    
    This is an INDEX, not a store. It catalogs what exists, where it lives,
    and how to access it. It does NOT duplicate content — it points to it.
    
    Usage:
        index = KnowledgeIndex("/path/to/repo")
        term = index.lookup_term("Ruby Red")
        projects = index.get_projects()
        gaps = index.get_knowledge_gaps()
    """

    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.knowledge_path = os.path.join(repo_path, "KNOWLEDGE.md")
        self._vocabulary: Dict[str, VocabularyTerm] = {}
        self._repositories: List[Repository] = []
        self._projects: List[Project] = []
        self._gaps: List[KnowledgeGap] = []
        self._skills: Dict[str, str] = {}
        self._people: Dict[str, Dict[str, str]] = {}
        self._raw_text: str = ""
        self._checksum: str = ""
        self.load()

    def load(self) -> None:
        """Load and parse KNOWLEDGE.md."""
        if not os.path.exists(self.knowledge_path):
            return

        with open(self.knowledge_path, "r", encoding="utf-8") as f:
            self._raw_text = f.read()

        self._checksum = hashlib.sha256(self._raw_text.encode()).hexdigest()
        self._parse_vocabulary()
        self._parse_repositories()
        self._parse_projects()
        self._parse_gaps()

    def _parse_vocabulary(self) -> None:
        """Parse the vocabulary dictionary from KNOWLEDGE.md."""
        # Find the vocabulary table
        vocab_section = re.search(
            r'Key Concepts.*?\n\|.*?\n\|.*?\n((?:\|.*?\n)*)',
            self._raw_text, re.DOTALL
        )
        if not vocab_section:
            return

        rows = re.findall(
            r'\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|',
            vocab_section.group(1)
        )
        for concept, definition, ref in rows:
            term = VocabularyTerm(
                concept=concept.strip(),
                definition=definition.strip(),
                directive_reference=ref.strip(),
            )
            self._vocabulary[concept.strip().lower()] = term

    def _parse_repositories(self) -> None:
        """Parse the repository index."""
        repo_section = re.search(
            r'GitHub Repositories.*?\n\|.*?\n\|.*?\n((?:\|.*?\n)*)',
            self._raw_text, re.DOTALL
        )
        if not repo_section:
            return

        rows = re.findall(
            r'\|\s*`(.+?)`\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|',
            repo_section.group(1)
        )
        for name, size, contents, status in rows:
            self._repositories.append(Repository(
                name=name.strip(),
                size=size.strip(),
                contents=contents.strip(),
                status=status.strip(),
            ))

    def _parse_projects(self) -> None:
        """Parse the project index."""
        project_section = re.search(
            r"Bingo Card Universe.*?\n\|.*?\n\|.*?\n((?:\|.*?\n)*)",
            self._raw_text, re.DOTALL
        )
        if not project_section:
            return

        rows = re.findall(
            r'\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|',
            project_section.group(1)
        )
        for name, codename, status in rows:
            self._projects.append(Project(
                name=name.strip(),
                codename=codename.strip(),
                status=status.strip(),
            ))

    def _parse_gaps(self) -> None:
        """Parse the knowledge gaps."""
        gap_section = re.search(
            r'Knowledge Gaps.*?\n\|.*?\n\|.*?\n((?:\|.*?\n)*)',
            self._raw_text, re.DOTALL
        )
        if not gap_section:
            return

        rows = re.findall(
            r'\|\s*\*\*(.+?)\*\*\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|',
            gap_section.group(1)
        )
        for priority, item, source, status in rows:
            self._gaps.append(KnowledgeGap(
                priority=priority.strip(),
                item=item.strip(),
                likely_source=source.strip(),
                status=status.strip(),
            ))

    def lookup_term(self, term: str) -> Optional[VocabularyTerm]:
        """Look up a term in Tim's vocabulary."""
        return self._vocabulary.get(term.lower())

    def search_vocabulary(self, query: str) -> List[VocabularyTerm]:
        """Search the vocabulary for terms matching a query."""
        query_lower = query.lower()
        results = []
        for key, term in self._vocabulary.items():
            if (query_lower in key or
                query_lower in term.definition.lower() or
                query_lower in term.directive_reference.lower()):
                results.append(term)
        return results

    def get_vocabulary(self) -> Dict[str, VocabularyTerm]:
        """Get the complete vocabulary dictionary."""
        return self._vocabulary

    def get_repositories(self) -> List[Repository]:
        """Get the repository index."""
        return self._repositories

    def get_projects(self) -> List[Project]:
        """Get the project index."""
        return self._projects

    def get_knowledge_gaps(self, priority: Optional[str] = None) -> List[KnowledgeGap]:
        """Get knowledge gaps, optionally filtered by priority."""
        if priority:
            return [g for g in self._gaps if g.priority.upper() == priority.upper()]
        return self._gaps

    def get_vocabulary_count(self) -> int:
        """Get the number of vocabulary terms."""
        return len(self._vocabulary)

    def verify_integrity(self) -> bool:
        """Verify the knowledge file has not been modified since loading."""
        if not os.path.exists(self.knowledge_path):
            return True
        with open(self.knowledge_path, "rb") as f:
            current = hashlib.sha256(f.read()).hexdigest()
        return current == self._checksum

    def to_summary(self) -> str:
        """Generate a human-readable summary."""
        lines = [
            "# Knowledge Index Summary\n",
            f"**Vocabulary Terms**: {len(self._vocabulary)}",
            f"**Repositories**: {len(self._repositories)}",
            f"**Projects**: {len(self._projects)}",
            f"**Knowledge Gaps**: {len(self._gaps)}",
        ]
        high_gaps = self.get_knowledge_gaps("HIGH")
        if high_gaps:
            lines.append(f"\n**HIGH Priority Gaps**: {len(high_gaps)}")
            for g in high_gaps:
                lines.append(f"  - {g.item}")
        return "\n".join(lines)
