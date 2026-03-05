"""
preference_store.py — The Preference Store for the Jeeves Enforcement Engine

Loads, parses, and provides programmatic access to PREFERENCES.md.
Preferences are GUIDANCE level — they inform decisions but are not
hard constraints like directives.

Features:
    - Parse PREFERENCES.md into structured preference objects
    - Query preferences by category
    - Contact information lookup
    - Communication channel preferences
    - Visual and presentation preferences
    - Working style preferences
"""

import re
import os
import hashlib
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any


@dataclass
class ContactInfo:
    """Tim's contact information."""
    full_name: str = "Tim J Latimer"
    role: str = "Chief Visionary Officer, SIC Solve Team / HB1000 North Star"
    primary_email: str = "tim@businessasaforceforgood.ca"
    gmail: str = "timjlatimer@gmail.com"
    cell_phone: str = "780-909-6544"
    mailing_address: str = "17322-107 Ave NW, Edmonton, Alberta T5S-1E9"
    github: str = "timjlatimer"

    def to_dict(self) -> Dict[str, str]:
        return {
            "full_name": self.full_name,
            "role": self.role,
            "primary_email": self.primary_email,
            "gmail": self.gmail,
            "cell_phone": self.cell_phone,
            "mailing_address": self.mailing_address,
            "github": self.github,
        }


@dataclass
class CommunicationPrefs:
    """Communication channel preferences."""
    primary_channel: str = "Telegram"
    email_accounts: Dict[str, str] = field(default_factory=lambda: {
        "tim@businessasaforceforgood.ca": "Primary work email (Outlook)",
        "timjlatimer@gmail.com": "Gmail (consolidating)",
        "masterjeeves@businessasaforceforgood.ca": "Master Jeeves email (being set up)",
    })
    standup_time: str = "6:04 AM"
    voice_dump_system: str = "Cloud Butterfly"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "primary_channel": self.primary_channel,
            "email_accounts": self.email_accounts,
            "standup_time": self.standup_time,
            "voice_dump_system": self.voice_dump_system,
        }


@dataclass
class VisualPrefs:
    """Visual and presentation preferences."""
    rooftop_position: str = "lower-left corner"
    perspective: str = "ground-level, looking up slightly"
    avatar_style: str = "Pixar-style with personality and AI essence"
    animation_continuum: str = "Pope decides on sliding scale"

    def to_dict(self) -> Dict[str, str]:
        return {
            "rooftop_position": self.rooftop_position,
            "perspective": self.perspective,
            "avatar_style": self.avatar_style,
            "animation_continuum": self.animation_continuum,
        }


@dataclass
class WorkingStyle:
    """Tim's working style preferences."""
    thinking_style: str = "big, interconnected systems"
    pace: str = "fast — match that energy"
    transparency: str = "show the work, show the reasoning, show the options"
    input_method: str = "voice first"
    vocabulary: str = "HB1000, Bingo Cards, Trojan Horse, etc."
    current_location: str = "Italy (as of March 4, 2026)"
    input_format: str = "raw, unstructured voice dumps"

    def to_dict(self) -> Dict[str, str]:
        return {
            "thinking_style": self.thinking_style,
            "pace": self.pace,
            "transparency": self.transparency,
            "input_method": self.input_method,
            "vocabulary": self.vocabulary,
            "current_location": self.current_location,
            "input_format": self.input_format,
        }


class PreferenceStore:
    """
    Loads and provides programmatic access to PREFERENCES.md.
    
    Preferences are guidance-level information. They inform how Master Jeeves
    operates but are not hard constraints. If a preference conflicts with a
    directive, the directive wins.
    
    Usage:
        store = PreferenceStore("/path/to/repo")
        contact = store.get_contact_info()
        comms = store.get_communication_prefs()
        style = store.get_working_style()
    """

    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.preferences_path = os.path.join(repo_path, "PREFERENCES.md")
        self._raw_text: str = ""
        self._checksum: str = ""
        self._contact: ContactInfo = ContactInfo()
        self._comms: CommunicationPrefs = CommunicationPrefs()
        self._visual: VisualPrefs = VisualPrefs()
        self._working: WorkingStyle = WorkingStyle()
        self._ai_platforms: Dict[str, str] = {}
        self._loaded: bool = False
        self.load()

    def load(self) -> None:
        """Load and parse PREFERENCES.md."""
        if not os.path.exists(self.preferences_path):
            # Preferences are guidance — not fatal if missing
            return

        with open(self.preferences_path, "r", encoding="utf-8") as f:
            self._raw_text = f.read()

        self._checksum = hashlib.sha256(self._raw_text.encode()).hexdigest()
        self._parse_content()
        self._loaded = True

    def _parse_content(self) -> None:
        """Parse the preferences content into structured objects."""
        text = self._raw_text

        # Parse contact info from table
        contact_patterns = {
            "full_name": r'\*\*Full Name\*\*\s*\|\s*(.+?)(?:\s*\||\n)',
            "primary_email": r'\*\*Primary Email\*\*\s*\|\s*(.+?)(?:\s*\(|\s*\||\n)',
            "gmail": r'\*\*Gmail\*\*\s*\|\s*(.+?)(?:\s*\(|\s*\||\n)',
            "cell_phone": r'\*\*Cell Phone\*\*\s*\|\s*(.+?)(?:\s*\||\n)',
            "github": r'\*\*GitHub\*\*\s*\|\s*(.+?)(?:\s*\||\n)',
        }
        for field_name, pattern in contact_patterns.items():
            match = re.search(pattern, text)
            if match:
                setattr(self._contact, field_name, match.group(1).strip())

        # Parse AI platforms
        platform_pattern = r'\*\*(\w+)\*\*\s*\((\w+)\)\s*\|\s*(.+?)(?:\s*\||\n)'
        for match in re.finditer(platform_pattern, text):
            self._ai_platforms[match.group(1)] = match.group(3).strip()

        # Parse standup time
        standup_match = re.search(r'\*\*Time\*\*:\s*\*\*(.+?)\*\*', text)
        if standup_match:
            self._comms.standup_time = standup_match.group(1).strip()

    def get_contact_info(self) -> ContactInfo:
        """Get Tim's contact information."""
        return self._contact

    def get_communication_prefs(self) -> CommunicationPrefs:
        """Get communication channel preferences."""
        return self._comms

    def get_visual_prefs(self) -> VisualPrefs:
        """Get visual and presentation preferences."""
        return self._visual

    def get_working_style(self) -> WorkingStyle:
        """Get Tim's working style preferences."""
        return self._working

    def get_ai_platforms(self) -> Dict[str, str]:
        """Get the list of AI platforms Tim uses."""
        return self._ai_platforms

    def get_full_text(self) -> str:
        """Get the full raw text of preferences."""
        return self._raw_text

    def verify_integrity(self) -> bool:
        """Verify the preferences file has not been modified since loading."""
        if not os.path.exists(self.preferences_path):
            return True  # Missing preferences is not a failure
        with open(self.preferences_path, "rb") as f:
            current = hashlib.sha256(f.read()).hexdigest()
        return current == self._checksum

    def to_summary(self) -> str:
        """Generate a human-readable summary of preferences."""
        lines = [
            "# Preference Store Summary\n",
            f"**Contact**: {self._contact.full_name} ({self._contact.primary_email})",
            f"**Primary Channel**: {self._comms.primary_channel}",
            f"**Standup Time**: {self._comms.standup_time}",
            f"**Input Method**: {self._working.input_method}",
            f"**Pace**: {self._working.pace}",
            f"**AI Platforms**: {', '.join(self._ai_platforms.keys()) if self._ai_platforms else 'See PREFERENCES.md'}",
        ]
        return "\n".join(lines)
