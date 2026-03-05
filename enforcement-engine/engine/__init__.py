"""
Jeeves Enforcement Engine - The Programmatic Enforcement Layer

Zero drift. Zero memory loss. Zero silent overrides.
"""

from .jeeves_engine import JeevesEngine
from .jeeves_db import JeevesDB
from .constitution_loader import ConstitutionLoader
from .directive_registry import DirectiveRegistry
from .injection_engine import InjectionEngine, InjectionPackage, InjectionFailure
from .verification_gate import VerificationGate, VerificationResult, Classification
from .drift_detector import DriftDetector, DriftEvent, AuditReport
from .preference_store import PreferenceStore
from .decision_logger import DecisionLogger
from .knowledge_index import KnowledgeIndex
from .session_manager import SessionManager

__version__ = "1.0.0"
__all__ = [
    "JeevesEngine",
    "JeevesDB",
    "ConstitutionLoader",
    "DirectiveRegistry",
    "InjectionEngine",
    "InjectionPackage",
    "InjectionFailure",
    "VerificationGate",
    "VerificationResult",
    "Classification",
    "DriftDetector",
    "DriftEvent",
    "AuditReport",
    "PreferenceStore",
    "DecisionLogger",
    "KnowledgeIndex",
    "SessionManager",
]
