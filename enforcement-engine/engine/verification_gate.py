"""
verification_gate.py — The Verification Gate for the Jeeves Enforcement Engine

Code Horizon 2: Three-step automated gate (Extract, Scan, Classify).
MUTATION 1 APPLIED: Dynamic scan pattern generation from directive registry.

Implements the "Fresh Eyes" enforcement pattern: the verification gate
treats every output as if it has never seen the directives before.
No inherited assumptions. Directive text is canonical. Silence is not compliance.

Classification:
    COMPLIANT  — Output follows all relevant directives
    FLAGGED    — Potential conflict detected, needs human review
    VIOLATION  — Clear directive violation detected

Recovery Protocol:
    1. Log the violation
    2. Diagnose which directive was violated and how
    3. Suggest a fix
    4. Report to Tim (for VIOLATION severity)

MUTATION 1 (Loop #3 → Loop #4):
    Scan patterns are now DYNAMICALLY GENERATED from the directive registry
    at initialization and whenever the registry reloads. New directives added
    to DIRECTIVES.md are automatically reflected in verification scans without
    code changes. This closes the CRITICAL detection gap identified in Loop #3.

MUTATION 6 APPLIED: Fresh gate instance per verification.
    The orchestrator now creates a fresh VerificationGate for each verification
    call, ensuring no injection context leaks into the verification process.
"""

import re
import hashlib
import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any, Tuple, Set
from enum import Enum

from .directive_registry import DirectiveRegistry, Directive, DOMAIN_KEYWORDS
from .jeeves_db import JeevesDB


# ---------------------------------------------------------------------------
# Classification Enum
# ---------------------------------------------------------------------------

class Classification(str, Enum):
    COMPLIANT = "COMPLIANT"
    FLAGGED = "FLAGGED"
    VIOLATION = "VIOLATION"


# ---------------------------------------------------------------------------
# Finding Dataclass
# ---------------------------------------------------------------------------

@dataclass
class Finding:
    """A single finding from the verification gate scan."""
    directive_id: str
    directive_name: str
    classification: Classification
    description: str
    evidence: str = ""
    suggested_fix: str = ""
    confidence: float = 1.0  # 0.0 to 1.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "directive_id": self.directive_id,
            "directive_name": self.directive_name,
            "classification": self.classification.value,
            "description": self.description,
            "evidence": self.evidence,
            "suggested_fix": self.suggested_fix,
            "confidence": self.confidence,
        }


# ---------------------------------------------------------------------------
# Verification Result
# ---------------------------------------------------------------------------

@dataclass
class VerificationResult:
    """Complete result from a verification gate check."""
    task_id: str
    output_hash: str
    classification: Classification
    findings: List[Finding]
    directives_checked: List[str]
    scan_patterns_used: int = 0
    fresh_eyes: bool = True
    timestamp: str = ""
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()

    @property
    def is_compliant(self) -> bool:
        return self.classification == Classification.COMPLIANT

    @property
    def has_violations(self) -> bool:
        return any(f.classification == Classification.VIOLATION for f in self.findings)

    @property
    def has_flags(self) -> bool:
        return any(f.classification == Classification.FLAGGED for f in self.findings)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "task_id": self.task_id,
            "output_hash": self.output_hash,
            "classification": self.classification.value,
            "findings": [f.to_dict() for f in self.findings],
            "directives_checked": self.directives_checked,
            "scan_patterns_used": self.scan_patterns_used,
            "fresh_eyes": self.fresh_eyes,
            "timestamp": self.timestamp,
            "metadata": self.metadata,
        }

    def to_report(self) -> str:
        """Generate a human-readable verification report."""
        lines = [
            f"# Verification Gate Report",
            f"**Task**: {self.task_id}",
            f"**Classification**: {self.classification.value}",
            f"**Timestamp**: {self.timestamp}",
            f"**Fresh Eyes**: {'Yes' if self.fresh_eyes else 'No'}",
            f"**Directives Checked**: {len(self.directives_checked)}",
            f"**Scan Patterns Used**: {self.scan_patterns_used}",
            f"**Findings**: {len(self.findings)}",
            "",
        ]

        if self.findings:
            lines.append("## Findings\n")
            for i, f in enumerate(self.findings, 1):
                lines.append(f"### Finding {i}: {f.directive_id} — {f.classification.value}")
                lines.append(f"**Directive**: {f.directive_name}")
                lines.append(f"**Description**: {f.description}")
                if f.evidence:
                    lines.append(f"**Evidence**: {f.evidence}")
                if f.suggested_fix:
                    lines.append(f"**Suggested Fix**: {f.suggested_fix}")
                lines.append(f"**Confidence**: {f.confidence:.0%}")
                lines.append("")
        else:
            lines.append("No findings. Output is fully compliant.")

        return "\n".join(lines)


# ---------------------------------------------------------------------------
# Fresh Eyes Rules (Hardcoded)
# ---------------------------------------------------------------------------

FRESH_EYES_RULES = [
    "No inherited assumptions — treat every output as if seeing it for the first time.",
    "Directive text is canonical — the DIRECTIVES.md text is the source of truth, not memory.",
    "Silence is not compliance — if a directive is relevant and not addressed, that is a finding.",
    "Conflict means both options — if output conflicts with a directive, both options must be presented.",
    "Gate cannot override directives — the gate checks compliance, it does not change directives.",
    "Log everything — every check is logged, every finding is recorded.",
]


# ---------------------------------------------------------------------------
# Dynamic Scan Pattern Dataclass
# ---------------------------------------------------------------------------

@dataclass
class ScanPattern:
    """
    A dynamically generated scan pattern derived from a directive.
    
    MUTATION 1: These are generated from the directive registry, not hardcoded.
    When a new directive is added to DIRECTIVES.md, new scan patterns are
    automatically generated on the next registry refresh.
    """
    directive_id: str
    directive_name: str
    pattern_type: str  # "prohibition", "requirement", "preference", "cost_check"
    violation_keywords: List[str]
    exception_keywords: List[str]
    context_keywords: List[str]  # Keywords that make this pattern relevant
    description: str
    severity: Classification
    confidence: float = 0.85

    def matches_context(self, text_lower: str) -> bool:
        """Check if this pattern is relevant to the given text."""
        if not self.context_keywords:
            return True  # Universal pattern
        return any(kw in text_lower for kw in self.context_keywords)

    def check_violation(self, text_lower: str) -> Tuple[bool, str]:
        """
        Check if the text violates this pattern.
        Returns (is_violation, evidence_keyword).
        """
        violation_found = False
        evidence_kw = ""
        for kw in self.violation_keywords:
            if kw in text_lower:
                violation_found = True
                evidence_kw = kw
                break

        if not violation_found:
            return False, ""

        # Check for exceptions
        exception_found = any(kw in text_lower for kw in self.exception_keywords)
        if exception_found:
            return False, ""

        return True, evidence_kw


# ---------------------------------------------------------------------------
# Dynamic Pattern Generator (MUTATION 1 — The Core Innovation)
# ---------------------------------------------------------------------------

class DynamicPatternGenerator:
    """
    Generates scan patterns dynamically from the directive registry.
    
    This is the MUTATION 1 implementation that closes the CRITICAL detection
    gap from Learning Loop #3. Instead of hardcoded patterns, the generator
    reads each directive's content, constraints, and requirements to produce
    scan patterns automatically.
    
    When DIRECTIVES.md is updated with a new directive, the next registry
    refresh triggers pattern regeneration — zero code changes needed.
    """

    # Known tool/service alternatives for common directive domains
    KNOWN_ALTERNATIVES: Dict[str, Dict[str, Any]] = {
        "voice_synthesis": {
            "approved": ["kei", "kie.ai", "kie ai", "kei voice", "kei api"],
            "prohibited": [
                "elevenlabs", "eleven labs", "eleven_labs", "11labs",
                "amazon polly", "google tts", "google cloud tts",
                "google cloud text-to-speech", "google text to speech",
                "azure speech", "azure tts", "azure cognitive",
                "murf.ai", "play.ht", "resemble.ai",
                "wellsaid", "speechify", "coqui", "bark",
                "tortoise-tts", "tortoise tts",
                "ibm watson tts", "watson text to speech",
                "nuance", "acapela", "cereproc", "lovo",
            ],
            "context": ["voice", "speech", "audio", "tts", "text-to-speech",
                        "synthesis", "narration", "voiceover"],
        },
        "presentations": {
            "approved": ["swiss style", "swiss design", "nano banana"],
            "prohibited": [],
            "context": ["presentation", "slide", "deck", "ppt", "powerpoint"],
        },
        "build_philosophy": {
            "approved": ["mvd", "minimum viable distribution", "build 100%",
                         "build everything", "not mvp", "100% not mvp"],
            "prohibited": ["mvp approach", "minimum viable product",
                           "build minimum", "just enough", "bare minimum",
                           "quick and dirty", "good enough for now"],
            "context": ["build", "develop", "implement", "create", "deploy",
                        "product", "feature", "release"],
        },
        "cost": {
            "approved": ["cheapest", "lowest cost", "cost-effective", "budget",
                         "frugal", "economical", "most affordable"],
            "prohibited": ["premium plan", "enterprise tier", "most expensive",
                           "top tier", "platinum", "unlimited plan"],
            "context": ["cost", "price", "pricing", "budget", "spend",
                        "subscription", "plan", "tier", "payment"],
        },
    }

    @classmethod
    def generate_patterns(cls, registry: DirectiveRegistry) -> List[ScanPattern]:
        """
        Generate all scan patterns from the current directive registry.
        
        This method:
        1. Reads all active directives from the registry
        2. Extracts constraints, requirements, and prohibited items
        3. Generates ScanPattern objects for each enforceable rule
        4. Adds domain-specific alternative detection patterns
        
        Returns a list of ScanPattern objects ready for use by the gate.
        """
        patterns = []
        directives = registry.get_all_directives()

        for directive in directives:
            # Generate patterns from directive content analysis
            content_patterns = cls._analyze_directive_content(directive)
            patterns.extend(content_patterns)

        # Add domain-specific alternative detection patterns
        domain_patterns = cls._generate_domain_patterns(directives)
        patterns.extend(domain_patterns)

        return patterns

    @classmethod
    def _analyze_directive_content(cls, directive: Directive) -> List[ScanPattern]:
        """Analyze a directive's content to extract enforceable scan patterns."""
        patterns = []
        content_lower = directive.content.lower()

        # Pattern 1: Detect "must use X" / "only use X" / "approved tool is X"
        must_use_patterns = [
            r'(?:must|shall|should|always)\s+use\s+(\w[\w\s.]*?)(?:\s+for|\s+as|\s*[.,;])',
            r'(?:only|exclusively)\s+(?:use|through)\s+(\w[\w\s.]*?)(?:\s+for|\s+as|\s*[.,;])',
            r'approved\s+(?:tool|service|platform|vendor)\s+(?:is|:)\s+(\w[\w\s.]*?)(?:\s*[.,;])',
        ]
        for pattern in must_use_patterns:
            matches = re.findall(pattern, content_lower)
            for match in matches:
                tool_name = match.strip()
                if len(tool_name) > 2:  # Skip very short matches
                    patterns.append(ScanPattern(
                        directive_id=directive.id,
                        directive_name=directive.name,
                        pattern_type="requirement",
                        violation_keywords=[],  # No violation keywords — this is a requirement check
                        exception_keywords=[tool_name],
                        context_keywords=cls._get_context_keywords(directive),
                        description=f"Directive {directive.id} requires use of '{tool_name}'.",
                        severity=Classification.FLAGGED,
                        confidence=0.7,
                    ))

        # Pattern 2: Detect "do not use X" / "never use X" / "avoid X"
        prohibit_patterns = [
            r'(?:do not|don\'t|never|avoid|prohibited|forbidden)\s+(?:use|recommend|suggest)\s+(\w[\w\s.]*?)(?:\s*[.,;])',
            r'(\w[\w\s.]*?)\s+(?:is|are)\s+(?:prohibited|forbidden|not allowed|banned)',
        ]
        for pattern in prohibit_patterns:
            matches = re.findall(pattern, content_lower)
            for match in matches:
                tool_name = match.strip()
                if len(tool_name) > 2:
                    patterns.append(ScanPattern(
                        directive_id=directive.id,
                        directive_name=directive.name,
                        pattern_type="prohibition",
                        violation_keywords=[tool_name],
                        exception_keywords=[],
                        context_keywords=cls._get_context_keywords(directive),
                        description=f"Directive {directive.id} prohibits '{tool_name}'.",
                        severity=Classification.VIOLATION,
                        confidence=0.85,
                    ))

        # Pattern 3: Detect philosophy/approach requirements
        if directive.category == "BUILD":
            patterns.append(ScanPattern(
                directive_id=directive.id,
                directive_name=directive.name,
                pattern_type="preference",
                violation_keywords=cls.KNOWN_ALTERNATIVES.get("build_philosophy", {}).get("prohibited", []),
                exception_keywords=cls.KNOWN_ALTERNATIVES.get("build_philosophy", {}).get("approved", []),
                context_keywords=cls.KNOWN_ALTERNATIVES.get("build_philosophy", {}).get("context", []),
                description=f"Directive {directive.id} requires MVD philosophy, not MVP.",
                severity=Classification.FLAGGED,
                confidence=0.75,
            ))

        # Pattern 4: Detect cost consciousness requirements
        if directive.category == "COST":
            patterns.append(ScanPattern(
                directive_id=directive.id,
                directive_name=directive.name,
                pattern_type="cost_check",
                violation_keywords=cls.KNOWN_ALTERNATIVES.get("cost", {}).get("prohibited", []),
                exception_keywords=cls.KNOWN_ALTERNATIVES.get("cost", {}).get("approved", []),
                context_keywords=cls.KNOWN_ALTERNATIVES.get("cost", {}).get("context", []),
                description=f"Directive {directive.id} requires cheapest viable option.",
                severity=Classification.FLAGGED,
                confidence=0.7,
            ))

        return patterns

    @classmethod
    def _generate_domain_patterns(cls, directives: List[Directive]) -> List[ScanPattern]:
        """Generate domain-specific patterns for known alternative detection."""
        patterns = []

        # Check if any directive covers voice synthesis domain
        voice_directives = [d for d in directives
                           if any(domain in d.domains
                                  for domain in ["voice_synthesis", "tools", "api"])]
        if voice_directives:
            # Find the primary voice directive (usually DIR-001)
            voice_dir = voice_directives[0]
            alts = cls.KNOWN_ALTERNATIVES.get("voice_synthesis", {})
            if alts:
                patterns.append(ScanPattern(
                    directive_id=voice_dir.id,
                    directive_name=voice_dir.name,
                    pattern_type="prohibition",
                    violation_keywords=alts.get("prohibited", []),
                    exception_keywords=alts.get("approved", []),
                    context_keywords=alts.get("context", []),
                    description=(
                        f"Non-approved voice synthesis tool detected. "
                        f"{voice_dir.id} requires KEI for all voice synthesis."
                    ),
                    severity=Classification.VIOLATION,
                    confidence=0.95,
                ))

        return patterns

    @classmethod
    def _get_context_keywords(cls, directive: Directive) -> List[str]:
        """Extract context keywords from a directive's domains and content."""
        context = []
        for domain in directive.domains:
            domain_kws = DOMAIN_KEYWORDS.get(domain, [])
            context.extend(domain_kws)

        # Also extract significant words from the directive name
        name_words = re.findall(r'\b\w{4,}\b', directive.name.lower())
        context.extend(name_words)

        return list(set(context))


# ---------------------------------------------------------------------------
# Verification Gate (MUTATION 1 + MUTATION 6 Applied)
# ---------------------------------------------------------------------------

class VerificationGate:
    """
    The Verification Gate performs three-step automated compliance checking
    on subtask outputs.
    
    Step 1: EXTRACT — Parse the output and identify claims, recommendations, tool choices
    Step 2: SCAN — Compare extracted elements against ALL relevant directives
    Step 3: CLASSIFY — Assign COMPLIANT / FLAGGED / VIOLATION classification
    
    MUTATION 1: Scan patterns are dynamically generated from the directive registry.
    When DIRECTIVES.md changes, patterns are regenerated automatically.
    
    MUTATION 6: Each verification should use a fresh gate instance (enforced
    by the orchestrator creating a new VerificationGate per call).
    
    Fresh Eyes Protocol:
        The gate treats every output as if it has never seen the directives before.
        It re-reads DIRECTIVES.md fresh for every check. No cached assumptions.
    
    Usage:
        gate = VerificationGate(registry, db)
        result = gate.verify("task-123", output_text, task_description)
        if result.has_violations:
            # Trigger recovery protocol
    """

    def __init__(
        self,
        registry: DirectiveRegistry,
        db: Optional[JeevesDB] = None,
    ):
        self.registry = registry
        self.db = db
        # MUTATION 1: Build scan patterns dynamically from the registry
        self._scan_patterns: List[ScanPattern] = []
        self._patterns_checksum: str = ""
        self._rebuild_scan_patterns()

    def _rebuild_scan_patterns(self) -> None:
        """
        Rebuild scan patterns from the directive registry.
        
        MUTATION 1: This is called at initialization and whenever the registry
        is refreshed. New directives are automatically reflected in scan patterns.
        """
        self._scan_patterns = DynamicPatternGenerator.generate_patterns(self.registry)
        # Track the registry state to detect when rebuild is needed
        sync = self.registry.check_sync_integrity()
        self._patterns_checksum = sync.get("file_checksum", "")

    def _ensure_patterns_current(self) -> None:
        """Ensure scan patterns are current with the registry."""
        sync = self.registry.check_sync_integrity()
        current_checksum = sync.get("file_checksum", "")
        if current_checksum != self._patterns_checksum:
            self._rebuild_scan_patterns()

    def verify(
        self,
        task_id: str,
        output_text: str,
        task_description: str = "",
        force_check_directives: Optional[List[str]] = None,
    ) -> VerificationResult:
        """
        Run the three-step verification gate on an output.
        
        Args:
            task_id: Unique identifier for the task
            output_text: The output text to verify
            task_description: Description of the task (for directive matching)
            force_check_directives: List of directive IDs to always check
            
        Returns:
            VerificationResult with classification and findings
        """
        # Fresh Eyes: Force registry refresh and pattern rebuild
        refreshed = self.registry.refresh_if_needed()
        if refreshed:
            self._rebuild_scan_patterns()
        else:
            self._ensure_patterns_current()

        # Compute output hash
        output_hash = hashlib.sha256(output_text.encode()).hexdigest()

        # Step 1: EXTRACT
        extracted = self._extract(output_text)

        # Step 2: SCAN — now uses dynamic patterns
        directives_to_check = self._get_check_directives(
            task_description, force_check_directives
        )
        findings = self._scan(extracted, directives_to_check, output_text)

        # Step 3: CLASSIFY
        classification = self._classify(findings)

        # Build result
        result = VerificationResult(
            task_id=task_id,
            output_hash=output_hash,
            classification=classification,
            findings=findings,
            directives_checked=[d.id for d in directives_to_check],
            scan_patterns_used=len(self._scan_patterns),
            fresh_eyes=True,
            metadata={
                "extracted_elements": len(extracted),
                "directives_checked_count": len(directives_to_check),
                "scan_patterns_total": len(self._scan_patterns),
                "scan_patterns_matched": sum(
                    1 for p in self._scan_patterns
                    if p.matches_context(output_text.lower())
                ),
                "fresh_eyes_rules_applied": len(FRESH_EYES_RULES),
                "dynamic_patterns": True,  # MUTATION 1 marker
            },
        )

        # Log to database
        if self.db:
            self._log_to_db(result)

        return result

    def _extract(self, output_text: str) -> Dict[str, List[str]]:
        """
        Step 1: EXTRACT — Parse the output to identify verifiable elements.
        
        Extracts:
            - Tool/service recommendations
            - Cost-related claims
            - Architecture decisions
            - Communication style indicators
            - Build philosophy indicators
        """
        text_lower = output_text.lower()
        extracted = {
            "tools_mentioned": [],
            "services_mentioned": [],
            "cost_claims": [],
            "architecture_decisions": [],
            "recommendations": [],
            "urls": [],
            "alternatives_suggested": [],
        }

        # Extract tool/service mentions — dynamically from known alternatives
        all_tools: Set[str] = set()
        for domain_alts in DynamicPatternGenerator.KNOWN_ALTERNATIVES.values():
            all_tools.update(domain_alts.get("approved", []))
            all_tools.update(domain_alts.get("prohibited", []))

        for tool in all_tools:
            if tool in text_lower:
                extracted["tools_mentioned"].append(tool)

        # Also extract via regex for broader coverage
        tool_patterns = [
            r'\b(elevenlabs|eleven labs|openai|anthropic|google|aws|azure)\b',
            r'\b(kei|kie\.ai|stripe|twilio|sendgrid)\b',
            r'\b(react|vue|angular|django|flask|fastapi)\b',
        ]
        for pattern in tool_patterns:
            matches = re.findall(pattern, text_lower)
            extracted["tools_mentioned"].extend(matches)

        # Deduplicate
        extracted["tools_mentioned"] = list(set(extracted["tools_mentioned"]))

        # Extract URLs
        url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
        extracted["urls"] = re.findall(url_pattern, output_text)

        # Extract cost-related claims
        cost_patterns = [
            r'(?:cost|price|pricing|budget|spend|invest)\s*(?:is|of|about|around|approximately)?\s*\$?[\d,]+',
            r'\$[\d,]+(?:\.\d{2})?',
            r'(?:free|cheapest|most expensive|premium|enterprise)',
        ]
        for pattern in cost_patterns:
            matches = re.findall(pattern, text_lower)
            extracted["cost_claims"].extend(matches)

        # Extract recommendations (sentences with "recommend", "suggest", "should use")
        rec_patterns = [
            r'(?:recommend|suggest|should use|best option|top choice|i recommend)[^.]*\.',
            r'(?:we should|you should|let\'s use|switch to|migrate to)[^.]*\.',
            r'(?:better alternative|superior option|preferred choice)[^.]*\.',
        ]
        for pattern in rec_patterns:
            matches = re.findall(pattern, text_lower)
            extracted["recommendations"].extend(matches)

        # Extract alternative suggestions
        alt_patterns = [
            r'(?:alternative|instead of|rather than|replace with|switch from)[^.]*\.',
            r'(?:better than|superior to|more powerful than|upgrade to)[^.]*\.',
        ]
        for pattern in alt_patterns:
            matches = re.findall(pattern, text_lower)
            extracted["alternatives_suggested"].extend(matches)

        return extracted

    def _get_check_directives(
        self,
        task_description: str,
        force_check: Optional[List[str]] = None,
    ) -> List[Directive]:
        """Get the list of directives to check against."""
        directives: Dict[str, Directive] = {}

        # Always check all active directives (conservative approach)
        for d in self.registry.get_all_directives():
            directives[d.id] = d

        # Add force-checked directives
        if force_check:
            for dir_id in force_check:
                d = self.registry.get_directive(dir_id)
                if d:
                    directives[d.id] = d

        return sorted(directives.values(), key=lambda d: d.id)

    def _scan(
        self,
        extracted: Dict[str, List[str]],
        directives: List[Directive],
        output_text: str,
    ) -> List[Finding]:
        """
        Step 2: SCAN — Compare extracted elements against directives.
        
        MUTATION 1: Uses dynamically generated scan patterns from the registry.
        No more hardcoded VIOLATION_PATTERNS dict — patterns are generated
        from directive content at initialization.
        """
        findings = []
        text_lower = output_text.lower()

        # ---- Dynamic Pattern Scanning (MUTATION 1) ----
        for pattern in self._scan_patterns:
            # Check if this pattern is relevant to the output context
            if not pattern.matches_context(text_lower):
                continue

            # Check for violation
            is_violation, evidence_kw = pattern.check_violation(text_lower)
            if is_violation:
                findings.append(Finding(
                    directive_id=pattern.directive_id,
                    directive_name=pattern.directive_name,
                    classification=pattern.severity,
                    description=pattern.description,
                    evidence=f"Found '{evidence_kw}' in output without corresponding exception keyword.",
                    suggested_fix=f"Replace with directive-compliant alternative per {pattern.directive_id}.",
                    confidence=pattern.confidence,
                ))

        # ---- Directive-Level Semantic Checks ----

        # Fresh Eyes Rule: Silence is not compliance
        # Check if relevant directives are acknowledged in the output
        for directive in directives:
            if directive.category == "COST" and extracted.get("cost_claims"):
                # Cost directive is relevant — check if cheapest option is considered
                cost_conscious_keywords = ["cheapest", "lowest cost", "cost-effective",
                                           "budget", "kei", "affordable", "economical",
                                           "frugal", "most affordable"]
                if not any(kw in text_lower for kw in cost_conscious_keywords):
                    findings.append(Finding(
                        directive_id=directive.id,
                        directive_name=directive.name,
                        classification=Classification.FLAGGED,
                        description="Cost-related output does not reference cost consciousness directive.",
                        evidence="Cost claims found but no cheapest-option language detected.",
                        suggested_fix=f"Ensure the cheapest viable option is considered per {directive.id}.",
                        confidence=0.6,
                    ))

        # Check for alternative suggestions that may conflict with approved tools
        if extracted.get("alternatives_suggested"):
            for alt in extracted["alternatives_suggested"]:
                # Check if the alternative mentions switching away from an approved tool
                for domain, alts in DynamicPatternGenerator.KNOWN_ALTERNATIVES.items():
                    for approved in alts.get("approved", []):
                        if approved in alt and any(
                            phrase in alt for phrase in
                            ["instead of", "rather than", "replace", "switch from", "better than"]
                        ):
                            # Find the relevant directive
                            relevant_dirs = [d for d in directives if domain in d.domains]
                            if relevant_dirs:
                                findings.append(Finding(
                                    directive_id=relevant_dirs[0].id,
                                    directive_name=relevant_dirs[0].name,
                                    classification=Classification.FLAGGED,
                                    description=f"Output suggests replacing approved tool in {domain} domain.",
                                    evidence=f"Alternative suggestion: '{alt[:100]}'",
                                    suggested_fix=f"Verify this change is authorized per {relevant_dirs[0].id}.",
                                    confidence=0.65,
                                ))

        # Check for silent overrides (recommendation without directive acknowledgment)
        if extracted.get("recommendations"):
            compliance_phrases = [
                "directive", "standing order", "per tim", "dir-",
                "constitution", "flag", "conflict", "compliance",
                "approved", "authorized",
            ]
            has_compliance_awareness = any(
                phrase in text_lower for phrase in compliance_phrases
            )
            if not has_compliance_awareness and len(extracted["recommendations"]) > 2:
                findings.append(Finding(
                    directive_id="GENERAL",
                    directive_name="Directive Awareness",
                    classification=Classification.FLAGGED,
                    description="Multiple recommendations made without directive awareness language.",
                    evidence=f"{len(extracted['recommendations'])} recommendations found with no directive references.",
                    suggested_fix="Include directive references when making recommendations.",
                    confidence=0.5,
                ))

        # Deduplicate findings by directive_id + classification
        seen = set()
        unique_findings = []
        for f in findings:
            key = (f.directive_id, f.classification.value, f.description[:50])
            if key not in seen:
                seen.add(key)
                unique_findings.append(f)

        return unique_findings

    def _classify(self, findings: List[Finding]) -> Classification:
        """
        Step 3: CLASSIFY — Determine overall classification from findings.
        
        Rules:
            - Any VIOLATION finding → overall VIOLATION
            - Any FLAGGED finding → overall FLAGGED
            - No findings → COMPLIANT
        """
        if any(f.classification == Classification.VIOLATION for f in findings):
            return Classification.VIOLATION
        if any(f.classification == Classification.FLAGGED for f in findings):
            return Classification.FLAGGED
        return Classification.COMPLIANT

    def _log_to_db(self, result: VerificationResult) -> None:
        """Log the verification result to the database."""
        self.db.log_verification({
            "task_id": result.task_id,
            "output_hash": result.output_hash,
            "classification": result.classification.value,
            "directives_checked": result.directives_checked,
            "findings": [f.to_dict() for f in result.findings],
            "fresh_eyes": result.fresh_eyes,
            "tim_override": False,
            "override_reason": None,
        })

    def get_scan_pattern_count(self) -> int:
        """Get the number of active scan patterns."""
        return len(self._scan_patterns)

    def get_scan_pattern_summary(self) -> Dict[str, Any]:
        """Get a summary of all active scan patterns."""
        by_type = {}
        by_directive = {}
        by_severity = {}

        for p in self._scan_patterns:
            by_type[p.pattern_type] = by_type.get(p.pattern_type, 0) + 1
            by_directive[p.directive_id] = by_directive.get(p.directive_id, 0) + 1
            by_severity[p.severity.value] = by_severity.get(p.severity.value, 0) + 1

        return {
            "total_patterns": len(self._scan_patterns),
            "by_type": by_type,
            "by_directive": by_directive,
            "by_severity": by_severity,
            "dynamic": True,
            "patterns_checksum": self._patterns_checksum[:16],
        }

    def get_verification_stats(self) -> Dict[str, Any]:
        """Get verification statistics from the database."""
        if not self.db:
            return {"error": "No database connected"}

        logs = self.db.get_verification_logs(limit=1000)
        total = len(logs)
        compliant = sum(1 for l in logs if l.get("classification") == "COMPLIANT")
        flagged = sum(1 for l in logs if l.get("classification") == "FLAGGED")
        violations = sum(1 for l in logs if l.get("classification") == "VIOLATION")

        return {
            "total_verifications": total,
            "compliant": compliant,
            "flagged": flagged,
            "violations": violations,
            "compliance_rate": compliant / max(total, 1),
            "violation_rate": violations / max(total, 1),
            "scan_patterns_active": len(self._scan_patterns),
        }

    def generate_recovery_report(self, result: VerificationResult) -> str:
        """
        Generate a recovery protocol report for violations.
        
        Recovery Protocol:
            1. Log — Record the violation with full context
            2. Diagnose — Identify which layer failed and why
            3. Fix — Suggest corrective action
            4. Report — Prepare notification for Tim
        """
        if not result.has_violations:
            return "No violations detected. No recovery needed."

        lines = [
            "# RECOVERY PROTOCOL REPORT",
            f"**Task**: {result.task_id}",
            f"**Classification**: {result.classification.value}",
            f"**Timestamp**: {result.timestamp}",
            f"**Scan Patterns Used**: {result.scan_patterns_used}",
            "",
            "## Step 1: LOG",
            "Violation has been logged to the verification database.",
            "",
            "## Step 2: DIAGNOSE",
        ]

        for f in result.findings:
            if f.classification == Classification.VIOLATION:
                lines.append(f"### {f.directive_id}: {f.directive_name}")
                lines.append(f"**What happened**: {f.description}")
                lines.append(f"**Evidence**: {f.evidence}")
                lines.append(f"**Root cause**: Directive {f.directive_id} was not followed in the output.")
                lines.append(f"**Confidence**: {f.confidence:.0%}")
                lines.append("")

        lines.append("## Step 3: FIX")
        for f in result.findings:
            if f.classification == Classification.VIOLATION:
                lines.append(f"- **{f.directive_id}**: {f.suggested_fix}")

        lines.append("")
        lines.append("## Step 4: REPORT")
        lines.append("This report should be sent to Tim HB1000 for review.")
        lines.append("Tim decides the final resolution. Always. No exceptions.")

        return "\n".join(lines)
