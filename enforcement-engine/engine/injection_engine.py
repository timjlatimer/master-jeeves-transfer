"""
injection_engine.py — The Injection Engine for the Jeeves Enforcement Engine

Code Horizon 1B: Programmatic injection package assembly.

CRITICAL RULE: No injection = exception = subtask CANNOT execute.
This is the programmatic enforcement of CONSTITUTION.md Article IV.

Features:
    - Assemble injection packages from constitutional principles + directives
    - Constitutional principles HARDCODED (never filtered, never compressed)
    - Compliance footer HARDCODED (always included)
    - Automatic logging to database
    - Domain-aware directive selection with conservative inclusion
    - Token estimation for context budget management
    - Package integrity verification via checksums

The KEI/ElevenLabs incident of March 4, 2026 happened because a subtask
was spawned WITHOUT injection. This engine makes that structurally impossible.
"""

import hashlib
import json
import os
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from .directive_registry import DirectiveRegistry, Directive, AuthorityLevel
from .jeeves_db import JeevesDB


# ---------------------------------------------------------------------------
# Hardcoded Constitutional Principles (NEVER filtered, NEVER compressed)
# ---------------------------------------------------------------------------

CONSTITUTIONAL_PRINCIPLES = """
## CONSTITUTIONAL PRINCIPLES — SUPREME AUTHORITY
## These principles are HARDCODED. They cannot be filtered, compressed, or omitted.

### Article I: Identity
Master Jeeves is the autonomous AI Chief of Staff for Tim HB1000 and the SIC HB1000 Solve Team.
Master Jeeves is NOT a chatbot. Master Jeeves is a proactive, self-directed operator.

### Article II: North Star
> Tim HB1000's trust and vision.
Every action must serve this North Star. If it does not serve Tim's trust and vision, it does not happen.

### Article III: Ethics — Purpose with Profit (Fueled by JOY)
1. Purpose first. Every initiative serves a meaningful purpose beyond profit.
2. Profit enables purpose. Sustainable revenue is the engine, not the destination.
3. JOY is the fuel. If the work is not fueled by joy, something is wrong.

The ultimate beneficiary is Ruby Red — the 35-45 year old mother of two, CFO of her household.
"It's expensive to be poor. We think that's a crime in society, and we're trying to change it."
Our superpower is empathy, practiced with "there but for the grace of God go I."

### Article IV: Subtask Inheritance (THIS DIRECTIVE)
Before spawning ANY subtask, Master Jeeves MUST read DIRECTIVES.md and include all relevant
directives in the subtask's prompt template. This directive CANNOT be compressed, summarized, or omitted.

### Article V: Zero Drift Tolerance
Standing orders are standing orders. They do not decay over time. Zero drift means zero.
""".strip()


# ---------------------------------------------------------------------------
# Hardcoded Compliance Footer (ALWAYS included)
# ---------------------------------------------------------------------------

COMPLIANCE_FOOTER = """
---
## COMPLIANCE INSTRUCTION (MANDATORY)
If your research or output conflicts with ANY directive listed above:
1. FLAG the specific conflict explicitly.
2. Present BOTH options — the directive-compliant option AND the conflicting recommendation.
3. Do NOT silently override any directive.
4. Tim decides. Always. No exceptions.

VIOLATION OF THIS INSTRUCTION IS A CONSTITUTIONAL BREACH.
---
""".strip()


# ---------------------------------------------------------------------------
# Injection Package
# ---------------------------------------------------------------------------

@dataclass
class InjectionPackage:
    """
    A fully assembled injection package ready for subtask injection.
    
    Contains:
        - Constitutional principles (hardcoded, never filtered)
        - Relevant directives (domain-matched, conservatively included)
        - Compliance footer (hardcoded, always included)
        - Metadata for audit trail
    """
    task_id: str
    task_description: str
    constitutional_text: str
    directives: List[Dict[str, Any]]
    directive_ids: List[str]
    compliance_footer: str
    assembled_at: str
    checksum: str
    token_estimate: int
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_prompt_text(self) -> str:
        """
        Render the injection package as a prompt-ready text block.
        This is what gets injected into the subtask's prompt template.
        """
        sections = []

        # Section 1: Constitutional Principles (HARDCODED)
        sections.append(self.constitutional_text)
        sections.append("")

        # Section 2: Relevant Directives
        sections.append("## ACTIVE DIRECTIVES — STANDING ORDERS")
        sections.append("The following directives are Tim HB1000's standing orders.")
        sections.append("They are ACTIVE and MUST be followed.\n")

        for d in self.directives:
            sections.append(f"### {d['id']}: {d['name']} [{d['category']}]")
            sections.append(d['content'])
            sections.append("")

        # Section 3: Compliance Footer (HARDCODED)
        sections.append(self.compliance_footer)

        return "\n".join(sections)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize the package for storage/transmission."""
        return {
            "task_id": self.task_id,
            "task_description": self.task_description,
            "directive_ids": self.directive_ids,
            "assembled_at": self.assembled_at,
            "checksum": self.checksum,
            "token_estimate": self.token_estimate,
            "metadata": self.metadata,
            "constitutional_included": True,
            "compliance_footer_included": True,
        }


# ---------------------------------------------------------------------------
# Injection Failure Exception
# ---------------------------------------------------------------------------

class InjectionFailure(Exception):
    """
    Raised when injection package assembly fails.
    
    CRITICAL: This exception MUST halt subtask execution.
    No injection = no execution. This is non-negotiable.
    """
    pass


# ---------------------------------------------------------------------------
# Injection Engine
# ---------------------------------------------------------------------------

class InjectionEngine:
    """
    The Injection Engine assembles injection packages for subtask prompts.
    
    This is the programmatic enforcement of CONSTITUTION.md Article IV:
    "Before spawning ANY subtask, Master Jeeves MUST read DIRECTIVES.md
    and include all relevant directives in the subtask's prompt template."
    
    CRITICAL DESIGN RULE:
        No injection = InjectionFailure exception = subtask CANNOT execute.
        This makes the KEI incident structurally impossible.
    
    Usage:
        engine = InjectionEngine(registry, db)
        package = engine.assemble("task-123", "Research voice synthesis tools")
        prompt = package.to_prompt_text()
        # Inject `prompt` into subtask's prompt template
    """

    # Token estimation: ~4 chars per token (conservative estimate)
    CHARS_PER_TOKEN = 4

    def __init__(
        self,
        registry: DirectiveRegistry,
        db: Optional[JeevesDB] = None,
        max_token_budget: int = 4000,
    ):
        self.registry = registry
        self.db = db
        self.max_token_budget = max_token_budget

    def assemble(
        self,
        task_id: str,
        task_description: str,
        force_include: Optional[List[str]] = None,
        domain_override: Optional[str] = None,
    ) -> InjectionPackage:
        """
        Assemble an injection package for a subtask.
        
        CRITICAL: This method MUST succeed or raise InjectionFailure.
        There is no "skip injection" path.
        
        Args:
            task_id: Unique identifier for the subtask
            task_description: Description of the task (used for directive matching)
            force_include: List of directive IDs to always include
            domain_override: Override domain for directive matching
            
        Returns:
            InjectionPackage ready for injection
            
        Raises:
            InjectionFailure: If package assembly fails for any reason
        """
        try:
            # Step 1: Refresh registry from source file
            self.registry.refresh_if_needed()

            # Step 2: Get relevant directives
            directives = self._select_directives(
                task_description, force_include, domain_override
            )

            # Step 3: Assemble the package
            directive_dicts = []
            directive_ids = []
            for d in directives:
                directive_dicts.append({
                    "id": d.id,
                    "name": d.name,
                    "category": d.category,
                    "content": d.content,
                    "authority_level": d.authority_level.name,
                })
                directive_ids.append(d.id)

            # Step 4: Calculate token estimate
            full_text = CONSTITUTIONAL_PRINCIPLES
            for d in directive_dicts:
                full_text += d["content"]
            full_text += COMPLIANCE_FOOTER
            token_estimate = len(full_text) // self.CHARS_PER_TOKEN

            # Step 5: Compute checksum
            checksum = hashlib.sha256(full_text.encode()).hexdigest()

            # Step 6: Build the package
            now = datetime.now(timezone.utc).isoformat()
            package = InjectionPackage(
                task_id=task_id,
                task_description=task_description,
                constitutional_text=CONSTITUTIONAL_PRINCIPLES,
                directives=directive_dicts,
                directive_ids=directive_ids,
                compliance_footer=COMPLIANCE_FOOTER,
                assembled_at=now,
                checksum=checksum,
                token_estimate=token_estimate,
                metadata={
                    "total_directives_available": self.registry.get_directive_count(),
                    "directives_selected": len(directive_ids),
                    "domain_override": domain_override,
                    "force_included": force_include or [],
                },
            )

            # Step 7: Validate the package
            self._validate_package(package)

            # Step 8: Log to database
            if self.db:
                self._log_to_db(package)

            return package

        except InjectionFailure:
            raise
        except Exception as e:
            # Log the failure
            if self.db:
                self.db.log_injection({
                    "task_id": task_id,
                    "task_description": task_description,
                    "directives_included": [],
                    "constitution_included": False,
                    "compliance_footer_included": False,
                    "token_count": 0,
                    "package_checksum": "",
                    "status": "FAILED",
                    "error_message": str(e),
                })
            raise InjectionFailure(
                f"Injection package assembly failed for task '{task_id}': {e}. "
                "SUBTASK CANNOT EXECUTE WITHOUT INJECTION."
            ) from e

    def _select_directives(
        self,
        task_description: str,
        force_include: Optional[List[str]] = None,
        domain_override: Optional[str] = None,
    ) -> List[Directive]:
        """
        Select directives for inclusion using conservative policy.
        
        Conservative inclusion: When in doubt, INCLUDE the directive.
        The cost of over-inclusion (~50 tokens) is negligible compared
        to the cost of another inheritance failure.
        """
        selected: Dict[str, Directive] = {}

        # Always include force-included directives
        if force_include:
            for dir_id in force_include:
                d = self.registry.get_directive(dir_id)
                if d:
                    selected[d.id] = d

        # Domain-based selection
        if domain_override:
            domain_directives = self.registry.get_directives_by_domain(domain_override)
            for d in domain_directives:
                selected[d.id] = d

        # Keyword-based relevance matching (conservative threshold)
        relevant = self.registry.get_relevant_directives(
            task_description, threshold=0.05
        )
        for d in relevant:
            selected[d.id] = d

        # Always include universal directives (those with 'all' domain)
        all_directives = self.registry.get_all_directives()
        for d in all_directives:
            if "all" in d.domains:
                selected[d.id] = d

        # Sort by ID for consistent ordering
        return sorted(selected.values(), key=lambda d: d.id)

    def _validate_package(self, package: InjectionPackage) -> None:
        """
        Validate an assembled injection package.
        
        Checks:
            1. Constitutional principles are present
            2. Compliance footer is present
            3. At least one directive is included
            4. Token budget is not exceeded (warning, not failure)
        """
        if not package.constitutional_text:
            raise InjectionFailure(
                "Constitutional principles are MISSING from injection package. "
                "This is a CONSTITUTIONAL BREACH."
            )

        if CONSTITUTIONAL_PRINCIPLES not in package.constitutional_text:
            raise InjectionFailure(
                "Constitutional principles have been MODIFIED or TRUNCATED. "
                "This is a CONSTITUTIONAL BREACH."
            )

        if not package.compliance_footer:
            raise InjectionFailure(
                "Compliance footer is MISSING from injection package. "
                "This is a CONSTITUTIONAL BREACH."
            )

        if not package.directives:
            # Warning, not failure — some tasks may genuinely have no matching directives
            # But we still inject constitutional principles and compliance footer
            pass

        if package.token_estimate > self.max_token_budget:
            # Warning only — we don't fail on token budget, we log it
            package.metadata["token_budget_warning"] = (
                f"Package uses ~{package.token_estimate} tokens, "
                f"exceeding budget of {self.max_token_budget}. "
                "Consider increasing budget or narrowing directive selection."
            )

    def _log_to_db(self, package: InjectionPackage) -> None:
        """Log the injection package assembly to the database."""
        self.db.log_injection({
            "task_id": package.task_id,
            "task_description": package.task_description,
            "directives_included": package.directive_ids,
            "constitution_included": True,
            "compliance_footer_included": True,
            "token_count": package.token_estimate,
            "package_checksum": package.checksum,
            "status": "ASSEMBLED",
            "error_message": None,
        })

    def verify_package_integrity(self, package: InjectionPackage) -> bool:
        """
        Verify that a package has not been tampered with since assembly.
        Uses checksum comparison.
        """
        full_text = package.constitutional_text
        for d in package.directives:
            full_text += d["content"]
        full_text += package.compliance_footer
        current_checksum = hashlib.sha256(full_text.encode()).hexdigest()
        return current_checksum == package.checksum

    def get_injection_stats(self) -> Dict[str, Any]:
        """Get injection statistics from the database."""
        if not self.db:
            return {"error": "No database connected"}

        logs = self.db.get_injection_logs(limit=1000)
        total = len(logs)
        assembled = sum(1 for l in logs if l.get("status") == "ASSEMBLED")
        injected = sum(1 for l in logs if l.get("status") == "INJECTED")
        failed = sum(1 for l in logs if l.get("status") == "FAILED")

        return {
            "total_injections": total,
            "assembled": assembled,
            "injected": injected,
            "failed": failed,
            "failure_rate": failed / max(total, 1),
            "avg_token_count": (
                sum(l.get("token_count", 0) for l in logs) / max(total, 1)
            ),
            "avg_directives_per_package": (
                sum(len(l.get("directives_included", [])) for l in logs) / max(total, 1)
            ),
        }
