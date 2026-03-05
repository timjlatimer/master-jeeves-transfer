"""
jeeves_api.py — The FastAPI Server for the Jeeves Enforcement Engine

Code Horizon 4: Full FastAPI server with all endpoints, authentication,
GitHub webhook for auto-sync, and comprehensive API surface.

Endpoints:
    POST   /api/cold-start         — Initialize engine (cold start)
    POST   /api/inject              — Assemble injection package
    POST   /api/verify              — Run verification gate
    POST   /api/drift-check         — Run drift detection
    GET    /api/drift-check         — Get drift summary
    POST   /api/weekly-audit        — Run weekly audit
    GET    /api/status              — Get system status
    GET    /api/directives          — List all directives
    GET    /api/directives/{id}     — Get specific directive
    GET    /api/decisions           — List decisions
    POST   /api/decisions           — Log a new decision
    GET    /api/constitution        — Get constitution summary
    GET    /api/knowledge           — Get knowledge index summary
    GET    /api/preferences         — Get preferences summary
    POST   /api/webhook/github      — GitHub webhook for auto-sync
    POST   /api/trust-test          — Run trust test (MUTATION 4)
    GET    /api/scan-patterns       — Get scan pattern summary (MUTATION 1)
    POST   /api/export/audit        — Export audit report (MUTATION 5)
    POST   /api/export/database     — Export database (MUTATION 6)
    POST   /api/shutdown            — Gracefully shut down
    GET    /health                  — Health check
"""

import os
import hmac
import hashlib
import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Header, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .jeeves_engine import JeevesEngine
from .injection_engine import InjectionFailure
from .verification_gate import Classification


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

REPO_PATH = os.environ.get("JEEVES_REPO_PATH", os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
API_KEY = os.environ.get("JEEVES_API_KEY", "jeeves-dev-key-change-in-production")
GITHUB_WEBHOOK_SECRET = os.environ.get("GITHUB_WEBHOOK_SECRET", "")


# ---------------------------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Jeeves Enforcement Engine API",
    description=(
        "The programmatic enforcement layer for Master Jeeves. "
        "Zero drift. Zero memory loss. Zero silent overrides."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Engine Singleton
# ---------------------------------------------------------------------------

_engine: Optional[JeevesEngine] = None


def get_engine() -> JeevesEngine:
    """Get or create the engine singleton."""
    global _engine
    if _engine is None:
        _engine = JeevesEngine(REPO_PATH)
    return _engine


# ---------------------------------------------------------------------------
# Authentication
# ---------------------------------------------------------------------------

async def verify_api_key(x_api_key: str = Header(default="", alias="X-API-Key")):
    """Verify the API key for authenticated endpoints."""
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return x_api_key


# ---------------------------------------------------------------------------
# Request/Response Models
# ---------------------------------------------------------------------------

class ColdStartRequest(BaseModel):
    metadata: Optional[Dict[str, Any]] = None


class InjectRequest(BaseModel):
    task_id: str
    task_description: str
    force_include: Optional[List[str]] = None
    domain_override: Optional[str] = None


class VerifyRequest(BaseModel):
    task_id: str
    output_text: str
    task_description: Optional[str] = ""
    force_check_directives: Optional[List[str]] = None


class DriftCheckRequest(BaseModel):
    context_text: Optional[str] = None


class DecisionRequest(BaseModel):
    description: str
    directives_referenced: Optional[List[str]] = None
    related_decisions: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    source: Optional[str] = "Master Jeeves"


class ApiResponse(BaseModel):
    status: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------

@app.get("/health")
async def health_check():
    """Health check endpoint — no auth required."""
    return {"status": "healthy", "service": "jeeves-enforcement-engine"}


# ---------------------------------------------------------------------------
# Cold Start
# ---------------------------------------------------------------------------

@app.post("/api/cold-start", response_model=ApiResponse)
async def cold_start(
    request: ColdStartRequest,
    _: str = Depends(verify_api_key),
):
    """Initialize the engine with a cold start."""
    try:
        engine = get_engine()
        result = engine.cold_start(request.metadata)
        return ApiResponse(status="ok", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Injection
# ---------------------------------------------------------------------------

@app.post("/api/inject", response_model=ApiResponse)
async def inject(
    request: InjectRequest,
    _: str = Depends(verify_api_key),
):
    """Assemble an injection package for a subtask."""
    try:
        engine = get_engine()
        package = engine.prepare_subtask(
            request.task_id,
            request.task_description,
            request.force_include,
            request.domain_override,
        )
        return ApiResponse(
            status="ok",
            data={
                "package": package.to_dict(),
                "prompt_text": package.to_prompt_text(),
                "token_estimate": package.token_estimate,
            },
        )
    except InjectionFailure as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Verification
# ---------------------------------------------------------------------------

@app.post("/api/verify", response_model=ApiResponse)
async def verify(
    request: VerifyRequest,
    _: str = Depends(verify_api_key),
):
    """Run the verification gate on subtask output."""
    try:
        engine = get_engine()
        result = engine.verify_output(
            request.task_id,
            request.output_text,
            request.task_description or "",
            request.force_check_directives,
        )
        return ApiResponse(
            status="ok",
            data={
                "result": result.to_dict(),
                "report": result.to_report(),
                "is_compliant": result.is_compliant,
                "has_violations": result.has_violations,
            },
        )
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Drift Detection
# ---------------------------------------------------------------------------

@app.post("/api/drift-check", response_model=ApiResponse)
async def drift_check(
    request: DriftCheckRequest,
    _: str = Depends(verify_api_key),
):
    """Run a drift detection check."""
    try:
        engine = get_engine()
        events = engine.check_drift(request.context_text)
        return ApiResponse(
            status="ok",
            data={
                "events": [e.to_dict() for e in events],
                "total_events": len(events),
                "critical_count": sum(
                    1 for e in events if e.severity.value == "CRITICAL"
                ),
            },
        )
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/drift-check", response_model=ApiResponse)
async def drift_summary(_: str = Depends(verify_api_key)):
    """Get drift detection summary."""
    try:
        engine = get_engine()
        summary = engine.drift.get_drift_summary()
        return ApiResponse(status="ok", data=summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Weekly Audit
# ---------------------------------------------------------------------------

@app.post("/api/weekly-audit", response_model=ApiResponse)
async def weekly_audit(_: str = Depends(verify_api_key)):
    """Run the weekly Monday audit."""
    try:
        engine = get_engine()
        report = engine.run_weekly_audit()
        return ApiResponse(
            status="ok",
            data={
                "compliance_score": report.compliance_score,
                "score_breakdown": report.score_breakdown,
                "recommendations": report.recommendations,
                "report_markdown": report.to_markdown(),
            },
        )
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# System Status
# ---------------------------------------------------------------------------

@app.get("/api/status", response_model=ApiResponse)
async def system_status(_: str = Depends(verify_api_key)):
    """Get comprehensive system status."""
    try:
        engine = get_engine()
        status = engine.get_system_status()
        return ApiResponse(status="ok", data=status)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Directives
# ---------------------------------------------------------------------------

@app.get("/api/directives", response_model=ApiResponse)
async def list_directives(_: str = Depends(verify_api_key)):
    """List all directives."""
    try:
        engine = get_engine()
        directives = engine.registry.get_all_directives()
        return ApiResponse(
            status="ok",
            data={
                "count": len(directives),
                "directives": [d.to_dict() for d in directives],
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/directives/{directive_id}", response_model=ApiResponse)
async def get_directive(directive_id: str, _: str = Depends(verify_api_key)):
    """Get a specific directive by ID."""
    try:
        engine = get_engine()
        directive = engine.registry.get_directive(directive_id)
        if not directive:
            raise HTTPException(status_code=404, detail=f"Directive {directive_id} not found")
        return ApiResponse(status="ok", data=directive.to_dict())
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Decisions
# ---------------------------------------------------------------------------

@app.get("/api/decisions", response_model=ApiResponse)
async def list_decisions(
    limit: int = 50,
    _: str = Depends(verify_api_key),
):
    """List decisions from the decision log."""
    try:
        engine = get_engine()
        decisions = engine.decisions.get_history(limit)
        return ApiResponse(
            status="ok",
            data={
                "count": len(decisions),
                "decisions": [d.to_dict() for d in decisions],
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/decisions", response_model=ApiResponse)
async def log_decision(
    request: DecisionRequest,
    _: str = Depends(verify_api_key),
):
    """Log a new decision."""
    try:
        engine = get_engine()
        decision = engine.decisions.log_decision(
            description=request.description,
            directives_referenced=request.directives_referenced,
            related_decisions=request.related_decisions,
            tags=request.tags,
            source=request.source or "Master Jeeves",
        )
        return ApiResponse(status="ok", data=decision.to_dict())
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Constitution
# ---------------------------------------------------------------------------

@app.get("/api/constitution", response_model=ApiResponse)
async def get_constitution(_: str = Depends(verify_api_key)):
    """Get constitution summary."""
    try:
        engine = get_engine()
        articles = engine.constitution.get_articles()
        return ApiResponse(
            status="ok",
            data={
                "articles": [a.to_dict() for a in articles],
                "north_star": engine.constitution.get_north_star(),
                "ethics": engine.constitution.get_ethics_framework(),
                "integrity": engine.constitution.verify_integrity(),
                "checksum": engine.constitution.get_checksum()[:16],
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Knowledge
# ---------------------------------------------------------------------------

@app.get("/api/knowledge", response_model=ApiResponse)
async def get_knowledge(_: str = Depends(verify_api_key)):
    """Get knowledge index summary."""
    try:
        engine = get_engine()
        return ApiResponse(
            status="ok",
            data={
                "vocabulary_count": engine.knowledge.get_vocabulary_count(),
                "repositories": [r.to_dict() for r in engine.knowledge.get_repositories()],
                "projects": [p.to_dict() for p in engine.knowledge.get_projects()],
                "gaps": [g.to_dict() for g in engine.knowledge.get_knowledge_gaps()],
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Preferences
# ---------------------------------------------------------------------------

@app.get("/api/preferences", response_model=ApiResponse)
async def get_preferences(_: str = Depends(verify_api_key)):
    """Get preferences summary."""
    try:
        engine = get_engine()
        return ApiResponse(
            status="ok",
            data={
                "contact": engine.preferences.get_contact_info().to_dict(),
                "communication": engine.preferences.get_communication_prefs().to_dict(),
                "visual": engine.preferences.get_visual_prefs().to_dict(),
                "working_style": engine.preferences.get_working_style().to_dict(),
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# GitHub Webhook
# ---------------------------------------------------------------------------

@app.post("/api/webhook/github")
async def github_webhook(request: Request):
    """
    GitHub webhook for auto-sync when markdown files change.
    
    When DIRECTIVES.md, CONSTITUTION.md, or other constitutional files
    are updated via GitHub, this webhook triggers a registry reload.
    """
    # Verify webhook signature if secret is configured
    if GITHUB_WEBHOOK_SECRET:
        signature = request.headers.get("X-Hub-Signature-256", "")
        body = await request.body()
        expected = "sha256=" + hmac.new(
            GITHUB_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(signature, expected):
            raise HTTPException(status_code=401, detail="Invalid webhook signature")

    # Parse the payload
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Check if constitutional files were modified
    constitutional_files = {
        "CONSTITUTION.md", "DIRECTIVES.md", "DECISIONS.md",
        "PREFERENCES.md", "KNOWLEDGE.md",
    }

    modified_files = set()
    for commit in payload.get("commits", []):
        for f in commit.get("modified", []) + commit.get("added", []):
            if f in constitutional_files:
                modified_files.add(f)

    if modified_files:
        # Trigger reload
        engine = get_engine()
        if engine._initialized:
            engine.constitution.load()
            engine.registry.load()
            engine.preferences.load()
            engine.decisions.load()
            engine.knowledge.load()

        return {
            "status": "reloaded",
            "files_reloaded": list(modified_files),
        }

    return {"status": "no_reload_needed"}


# ---------------------------------------------------------------------------
# Trust Test (MUTATION 4)
# ---------------------------------------------------------------------------

@app.post("/api/trust-test", response_model=ApiResponse)
async def trust_test(_: str = Depends(verify_api_key)):
    """Run the trust test — synthetic violations to validate the gate."""
    try:
        engine = get_engine()
        result = engine.trust_test()
        return ApiResponse(status="ok", data=result)
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Scan Patterns
# ---------------------------------------------------------------------------

@app.get("/api/scan-patterns", response_model=ApiResponse)
async def scan_patterns(_: str = Depends(verify_api_key)):
    """Get scan pattern summary (MUTATION 1)."""
    try:
        engine = get_engine()
        summary = engine.gate.get_scan_pattern_summary()
        return ApiResponse(status="ok", data=summary)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Audit Export (MUTATION 5)
# ---------------------------------------------------------------------------

class ExportRequest(BaseModel):
    output_path: Optional[str] = None
    format: Optional[str] = "json"


@app.post("/api/export/audit", response_model=ApiResponse)
async def export_audit(
    request: ExportRequest,
    _: str = Depends(verify_api_key),
):
    """Export audit report to JSON or Markdown."""
    try:
        engine = get_engine()
        output_path = request.output_path or f"/tmp/jeeves_audit_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.{request.format or 'json'}"
        result_path = engine.export_audit_report(output_path, request.format or "json")
        return ApiResponse(status="ok", data={"path": result_path})
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Database Export (MUTATION 6)
# ---------------------------------------------------------------------------

@app.post("/api/export/database", response_model=ApiResponse)
async def export_database(
    request: ExportRequest,
    _: str = Depends(verify_api_key),
):
    """Export full database to JSON."""
    try:
        engine = get_engine()
        output_path = request.output_path or f"/tmp/jeeves_db_export_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.json"
        result_path = engine.export_database(output_path)
        return ApiResponse(status="ok", data={"path": result_path})
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Shutdown
# ---------------------------------------------------------------------------

@app.post("/api/shutdown", response_model=ApiResponse)
async def shutdown(_: str = Depends(verify_api_key)):
    """Gracefully shut down the engine."""
    try:
        engine = get_engine()
        result = engine.shutdown()
        return ApiResponse(status="ok", data=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
