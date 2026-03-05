"""
constitution_loader.py — The Constitution Loader for the Jeeves Enforcement Engine

Loads, parses, and provides programmatic access to CONSTITUTION.md.
The Constitution is the SUPREME authority — nothing overrides it.

Features:
    - Parse CONSTITUTION.md into structured Article objects
    - Provide the full constitutional text for injection packages
    - Verify constitutional integrity via checksums
    - Extract amendment history
    - Enforce the authority hierarchy programmatically
"""

import re
import os
import hashlib
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any


# ---------------------------------------------------------------------------
# Article Dataclass
# ---------------------------------------------------------------------------

@dataclass
class ConstitutionalArticle:
    """A single article from CONSTITUTION.md."""
    number: str          # e.g. "I", "II", "III"
    title: str           # e.g. "Identity"
    content: str         # Full article text
    raw_markdown: str    # Original markdown

    def to_dict(self) -> Dict[str, Any]:
        return {
            "number": self.number,
            "title": self.title,
            "content": self.content,
        }


@dataclass
class Amendment:
    """A single amendment from the changelog."""
    date: str
    description: str
    authorized_by: str

    def to_dict(self) -> Dict[str, Any]:
        return {
            "date": self.date,
            "description": self.description,
            "authorized_by": self.authorized_by,
        }


# ---------------------------------------------------------------------------
# Constitution Loader
# ---------------------------------------------------------------------------

class ConstitutionLoader:
    """
    Loads and provides programmatic access to CONSTITUTION.md.
    
    The Constitution is the SUPREME governing document. It cannot be
    overridden by any other file, directive, subtask, or instruction.
    
    Usage:
        loader = ConstitutionLoader("/path/to/repo")
        articles = loader.get_articles()
        north_star = loader.get_article("II")
        full_text = loader.get_full_text()
    """

    ARTICLE_PATTERN = re.compile(
        r'##\s+Article\s+([IVXLC]+):\s+(.+?)(?:\n|$)'
    )

    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.constitution_path = os.path.join(repo_path, "CONSTITUTION.md")
        self._articles: List[ConstitutionalArticle] = []
        self._amendments: List[Amendment] = []
        self._raw_text: str = ""
        self._checksum: str = ""
        self._loaded: bool = False
        self.load()

    def load(self) -> None:
        """Load and parse CONSTITUTION.md."""
        if not os.path.exists(self.constitution_path):
            raise FileNotFoundError(
                f"CONSTITUTION.md not found at {self.constitution_path}. "
                "The supreme governing document MUST exist."
            )

        with open(self.constitution_path, "r", encoding="utf-8") as f:
            self._raw_text = f.read()

        self._checksum = hashlib.sha256(self._raw_text.encode()).hexdigest()
        self._articles = self._parse_articles(self._raw_text)
        self._amendments = self._parse_amendments(self._raw_text)
        self._loaded = True

    def _parse_articles(self, content: str) -> List[ConstitutionalArticle]:
        """Parse articles from the constitution text."""
        articles = []
        sections = re.split(r'(?=##\s+Article\s+[IVXLC]+)', content)

        for section in sections:
            match = self.ARTICLE_PATTERN.search(section)
            if not match:
                continue

            number = match.group(1)
            title = match.group(2).strip()

            # Get content (everything after the header)
            content_text = section[match.end():].strip()
            # Stop at the next section or end
            next_section = re.search(r'\n##\s+', content_text)
            if next_section:
                content_text = content_text[:next_section.start()].strip()

            articles.append(ConstitutionalArticle(
                number=number,
                title=title,
                content=content_text,
                raw_markdown=section.strip(),
            ))

        return articles

    def _parse_amendments(self, content: str) -> List[Amendment]:
        """Parse the amendment changelog."""
        amendments = []
        changelog_match = re.search(r'##\s+Changelog\s*\n(.*?)(?:\n---|\Z)', content, re.DOTALL)
        if not changelog_match:
            return amendments

        changelog = changelog_match.group(1)
        # Parse table rows
        rows = re.findall(r'\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|', changelog)
        for date, desc, auth in rows:
            amendments.append(Amendment(
                date=date.strip(),
                description=desc.strip(),
                authorized_by=auth.strip(),
            ))

        return amendments

    def get_articles(self) -> List[ConstitutionalArticle]:
        """Get all constitutional articles."""
        return self._articles

    def get_article(self, number: str) -> Optional[ConstitutionalArticle]:
        """Get a specific article by Roman numeral."""
        for article in self._articles:
            if article.number == number:
                return article
        return None

    def get_full_text(self) -> str:
        """Get the full raw text of the constitution."""
        return self._raw_text

    def get_checksum(self) -> str:
        """Get the SHA-256 checksum of the constitution."""
        return self._checksum

    def verify_integrity(self) -> bool:
        """Verify the constitution file has not been modified since loading."""
        if not os.path.exists(self.constitution_path):
            return False
        with open(self.constitution_path, "rb") as f:
            current = hashlib.sha256(f.read()).hexdigest()
        return current == self._checksum

    def get_amendments(self) -> List[Amendment]:
        """Get the amendment history."""
        return self._amendments

    def get_north_star(self) -> str:
        """Get the North Star statement (Article II)."""
        article = self.get_article("II")
        if article:
            return article.content
        return "Tim HB1000's trust and vision."

    def get_ethics_framework(self) -> str:
        """Get the ethics framework (Article III)."""
        article = self.get_article("III")
        if article:
            return article.content
        return "Purpose with Profit, fueled by JOY."

    def get_injection_requirements(self) -> str:
        """Get the subtask inheritance requirements (Article IV)."""
        article = self.get_article("IV")
        if article:
            return article.content
        return ""

    def to_summary(self) -> str:
        """Generate a human-readable summary."""
        lines = [f"# Constitution Summary ({len(self._articles)} Articles)\n"]
        for a in self._articles:
            lines.append(f"- **Article {a.number}**: {a.title}")
        lines.append(f"\n**Amendments**: {len(self._amendments)}")
        lines.append(f"**Checksum**: {self._checksum[:16]}...")
        return "\n".join(lines)
