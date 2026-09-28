import os
import json
import uuid
import datetime
import asyncio
from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse, Response, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import get_db, engine, Base
from .models import (
    Artifact, Document, Recipient, DecryptionEvent, LedgerBlock,
    ForensicAnalysisJob, InvestigationCase, SecurityNotification, AuditEvent
)
from .crypto_service import compute_sha3_256
from .llm_provider import llm_provider
from .forensic_worker import (
    execute_forensic_pipeline, sse_event_stream, ACTIVE_JOBS
)
from .report_generator import generate_pdf_report, generate_evidence_zip

app = FastAPI(title="NAV-TRAC X Sovereign Forensic Engine", version="2.0.0")

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
VIS_DIR = os.path.join(DATA_DIR, "visualizations")
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(VIS_DIR, exist_ok=True)

# -------------------------------------------------------------------
# 1. Engine Health & Status Endpoint
# -------------------------------------------------------------------
@app.get("/api/engine/health")
def get_engine_health(db: Session = Depends(get_db)):
    """Returns engine health status and component readiness without leaking keys."""
    llm_status = llm_provider.get_status()
    total_blocks = db.query(LedgerBlock).count()
    tampered_blocks = db.query(LedgerBlock).filter_by(is_tampered=True).count()

    overall_status = "ok"
    if tampered_blocks > 0 or llm_status.get("status") == "degraded":
        overall_status = "degraded"

    return {
        "status": overall_status,
        "engine": "Zero-Trust Sovereign Provenance Engine",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "components": {
            "watermark_engine": {
                "name": "2D DWT-DCT SVD Frequency Steganography",
                "status": "ok",
                "codec": "Reed-Solomon RS(32,24) 8-byte Parity ECC",
                "algorithm": "Haar Wavelet Decomposition"
            },
            "ledger": {
                "name": "Tamper-Evident SHA3-256 Merkle Ledger",
                "status": "ok" if tampered_blocks == 0 else "tampered_detected",
                "total_blocks": total_blocks,
                "tampered_blocks": tampered_blocks
            },
            "signature_service": {
                "name": "NIST FIPS 204 PQC Stand-in",
                "status": "ok",
                "scheme": "Demo signature scheme (Ed25519 / Classical Stand-in)"
            },
            "text_provider": llm_status
        }
    }

# -------------------------------------------------------------------
# 2. Benchmarks Endpoint
# -------------------------------------------------------------------
@app.get("/api/benchmarks")
def list_benchmarks(db: Session = Depends(get_db)):
    """Returns the 5 deterministic benchmark test scenarios."""
    benchmarks = db.query(Artifact).filter_by(is_benchmark=True).all()
    out = []
    descriptions = {
        "BENCH-1": ("1. Verified (NAVX-0042)", "Clean watermarked copy correlating to registered recipient on INS Vikramaditya."),
        "BENCH-2": ("2. Manipulation (NAVX-0041)", "Altered watermark payload with tampered cryptographic ledger block."),
        "BENCH-3": ("3. Contradictory (NAVX-0040)", "Watermark correlates with Mission Plan Bravo, but document content matches Hydrographic Survey."),
        "BENCH-4": ("4. Unresolved (NAVX-0039)", "Heavily cropped and blurred copy with high bit error rate exceeding ECC threshold."),
        "BENCH-5": ("5. No Match (NAVX-0038)", "Unauthenticated briefing photograph with zero registered sovereign watermarks.")
    }
    for b in benchmarks:
        title, desc = descriptions.get(b.benchmark_id, (b.filename, "Benchmark artifact"))
        out.append({
            "id": b.id,
            "benchmark_id": b.benchmark_id,
            "title": title,
            "description": desc,
            "filename": b.filename,
            "expected_outcome": b.expected_outcome,
            "file_size": b.file_size,
            "sha3_256": b.sha3_256
        })
    return out

# -------------------------------------------------------------------
# 3. Artifacts Ingestion & Management
# -------------------------------------------------------------------
@app.post("/api/artifacts")
async def upload_artifact(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Ingests an artifact file (PDF, PNG, JPG, WEBP, TIFF, DOCX, PPTX).
    Enforces max 100 MB and inspects magic bytes.
    """
    content = await file.read()
    if len(content) > 100 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 100 MB limit")

    # Detect magic bytes
    mime = "application/octet-stream"
    if content.startswith(b"%PDF"):
        mime = "application/pdf"
    elif content.startswith(b"\x89PNG\r\n\x1a\n"):
        mime = "image/png"
    elif content.startswith(b"\xff\xd8\xff"):
        mime = "image/jpeg"
    elif content.startswith(b"RIFF") and content[8:12] == b"WEBP":
        mime = "image/webp"
    else:
        mime = file.content_type or "image/jpeg"

    sha3 = compute_sha3_256(content)
    art_id = f"ART-{uuid.uuid4().hex[:8].upper()}"
    ext = os.path.splitext(file.filename)[1] or (".pdf" if "pdf" in mime else ".jpg")
    saved_path = os.path.join(UPLOADS_DIR, f"{art_id}{ext}")

    with open(saved_path, "wb") as f:
        f.write(content)

    art = Artifact(
        id=art_id,
        filename=file.filename,
        file_path=saved_path,
        sha3_256=sha3,
        mime_type=mime,
        file_size=f"{len(content) / (1024*1024):.1f} MB",
        size_bytes=len(content),
        is_benchmark=False,
        has_been_analyzed=False
    )
    db.add(art)

    # Chain of Custody Audit Log
    audit = AuditEvent(
        id=f"AUDIT-{uuid.uuid4().hex[:8]}",
        entity_type="artifact",
        entity_id=art_id,
        action="INGESTED",
        actor="Forensic Analyst",
        metadata_json=json.dumps({"filename": file.filename, "sha3_256": sha3})
    )
    db.add(audit)
    db.commit()

    return {
        "id": art.id,
        "filename": art.filename,
        "mime_type": art.mime_type,
        "file_size": art.file_size,
        "sha3_256": art.sha3_256,
        "uploaded_at": art.uploaded_at.isoformat()
    }

@app.get("/api/artifacts")
def list_artifacts(db: Session = Depends(get_db)):
    """Lists all artifacts in database."""
    artifacts = db.query(Artifact).order_by(Artifact.uploaded_at.desc()).all()
    return [{
        "id": a.id,
        "filename": a.filename,
        "file_size": a.file_size,
        "mime_type": a.mime_type,
        "sha3_256": a.sha3_256,
        "is_benchmark": a.is_benchmark,
        "benchmark_id": a.benchmark_id,
        "expected_outcome": a.expected_outcome,
        "has_been_analyzed": a.has_been_analyzed,
        "uploaded_at": a.uploaded_at.isoformat()
    } for a in artifacts]

@app.get("/api/artifacts/{id}")
def get_artifact(id: str, db: Session = Depends(get_db)):
    """Retrieves artifact metadata."""
    art = db.query(Artifact).filter_by(id=id).first()
    if not art:
        raise HTTPException(status_code=404, detail="Artifact not found")
    return {
        "id": art.id,
        "filename": art.filename,
        "file_size": art.file_size,
        "mime_type": art.mime_type,
        "sha3_256": art.sha3_256,
        "is_benchmark": art.is_benchmark,
        "has_been_analyzed": art.has_been_analyzed,
        "file_url": f"/api/artifacts/{art.id}/file"
    }

@app.get("/api/artifacts/{id}/file")
def get_artifact_file(id: str, db: Session = Depends(get_db)):
    """Serves the actual binary file of the artifact."""
    art = db.query(Artifact).filter_by(id=id).first()
    if not art or not os.path.exists(art.file_path):
        raise HTTPException(status_code=404, detail="Artifact file not found")
    return FileResponse(art.file_path, media_type=art.mime_type, filename=art.filename)

@app.delete("/api/artifacts/{id}")
def delete_artifact(id: str, db: Session = Depends(get_db)):
    """Deletes an artifact ONLY if it has never been analyzed."""
    art = db.query(Artifact).filter_by(id=id).first()
    if not art:
        raise HTTPException(status_code=404, detail="Artifact not found")
    if art.has_been_analyzed:
        raise HTTPException(status_code=400, detail="Analyzed artifacts cannot be deleted as they form part of legal chain of custody.")
    if os.path.exists(art.file_path):
        try:
            os.remove(art.file_path)
        except Exception:
            pass
    db.delete(art)
    db.commit()
    return {"success": True, "message": f"Artifact {id} deleted."}

@app.get("/api/artifacts/{id}/visual/{filename}")
def get_visual_evidence(id: str, filename: str):
    """Serves generated visual evidence PNGs (heatmap, spectral, fingerprint_map, processed)."""
    p = os.path.join(VIS_DIR, id, filename)
    if not os.path.exists(p):
        raise HTTPException(status_code=404, detail="Visual evidence not found")
    return FileResponse(p, media_type="image/png")

# -------------------------------------------------------------------
# 4. Forensic Analysis & SSE Streaming
# -------------------------------------------------------------------
@app.post("/api/analysis")
def start_analysis(
    background_tasks: BackgroundTasks,
    artifact_id: str = Form(...),
    case_id: str = Form("INV-2026-0042"),
    db: Session = Depends(get_db)
):
    """Initiates the 7-stage forensic analysis background job."""
    art = db.query(Artifact).filter_by(id=artifact_id).first()
    if not art:
        raise HTTPException(status_code=404, detail="Artifact not found")

    job_id = f"JOB-{uuid.uuid4().hex[:8].upper()}"
    job = ForensicAnalysisJob(
        id=job_id,
        artifact_id=art.id,
        case_id=case_id,
        status="QUEUED",
        progress=0
    )
    db.add(job)
    db.commit()

    # Launch pipeline via FastAPI BackgroundTasks
    background_tasks.add_task(execute_forensic_pipeline, job_id, art.id, case_id)

    return {
        "job_id": job_id,
        "artifact_id": art.id,
        "case_id": case_id,
        "status": "QUEUED",
        "stream_url": f"/api/analysis/{job_id}/events"
    }

@app.get("/api/analysis/{id}/events")
async def stream_analysis_events(id: str):
    """Server-Sent Events (SSE) stream for live 7-stage pipeline progress."""
    return StreamingResponse(
        sse_event_stream(id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.post("/api/analysis/{id}/cancel")
def cancel_analysis(id: str, db: Session = Depends(get_db)):
    """Cancels an ongoing analysis job."""
    if id in ACTIVE_JOBS:
        ACTIVE_JOBS[id]["cancelled"] = True
        ACTIVE_JOBS[id]["status"] = "CANCELLED"
    job = db.query(ForensicAnalysisJob).filter_by(id=id).first()
    if job:
        job.status = "CANCELLED"
        db.commit()
    return {"success": True, "message": f"Job {id} cancelled."}

@app.get("/api/analysis/{id}/result")
def get_analysis_result(id: str, db: Session = Depends(get_db)):
    """Returns the completed analysis result JSON."""
    job = db.query(ForensicAnalysisJob).filter_by(id=id).first()
    if not job:
        # Check by artifact_id or case_id
        job = db.query(ForensicAnalysisJob).filter(
            (ForensicAnalysisJob.artifact_id == id) | (ForensicAnalysisJob.case_id == id)
        ).order_by(ForensicAnalysisJob.started_at.desc()).first()

    if not job or not job.result_json:
        raise HTTPException(status_code=404, detail="Analysis result not ready or not found")
    return json.loads(job.result_json)

# -------------------------------------------------------------------
# 5. Cases & Analyst Triage
# -------------------------------------------------------------------
@app.get("/api/cases")
def list_cases(db: Session = Depends(get_db)):
    """Returns all investigation cases."""
    cases = db.query(InvestigationCase).order_by(InvestigationCase.created_at.desc()).all()
    return [{
        "id": c.id,
        "title": c.title,
        "status": c.status,
        "outcome": c.outcome,
        "confidence": c.confidence,
        "created_at": c.created_at.isoformat()
    } for c in cases]

@app.get("/api/cases/{id}")
def get_case(id: str, db: Session = Depends(get_db)):
    """Returns case details."""
    c = db.query(InvestigationCase).filter_by(id=id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Case not found")
    return {
        "id": c.id,
        "title": c.title,
        "status": c.status,
        "outcome": c.outcome,
        "confidence": c.confidence,
        "artifact_id": c.artifact_id,
        "top_recipient_id": c.top_recipient_id,
        "analyst_notes": c.analyst_notes,
        "reviewed_by": c.reviewed_by,
        "reviewed_at": c.reviewed_at.isoformat() if c.reviewed_at else None,
        "review_action": c.review_action
    }

@app.patch("/api/cases/{id}")
def update_case(id: str, body: dict, db: Session = Depends(get_db)):
    """Updates case status and records human analyst review (Confirm, Escalate, Dismiss)."""
    c = db.query(InvestigationCase).filter_by(id=id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Case not found")

    action = body.get("action") or body.get("status")
    notes = body.get("notes") or body.get("reason", "")
    reviewer = body.get("reviewer", "Lt. Cdr. S. Rao (Lead Examiner)")

    if action:
        c.review_action = action.upper()
        c.status = action.upper()
        c.analyst_notes = notes
        c.reviewed_by = reviewer
        c.reviewed_at = datetime.datetime.utcnow()

        audit = AuditEvent(
            id=f"AUDIT-{uuid.uuid4().hex[:8]}",
            entity_type="case",
            entity_id=c.id,
            action=f"TRIAGE_{action.upper()}",
            actor=reviewer,
            metadata_json=json.dumps({"reason": notes})
        )
        db.add(audit)
        db.commit()

    return {"success": True, "case": {
        "id": c.id,
        "status": c.status,
        "reviewed_by": c.reviewed_by,
        "review_action": c.review_action
    }}

# -------------------------------------------------------------------
# 6. Reports & Evidence Downloads
# -------------------------------------------------------------------
@app.get("/api/reports/{case_id}.pdf")
def download_pdf_report(case_id: str, db: Session = Depends(get_db)):
    """Downloads official Section 63 BSA Forensic Examination Report (PDF)."""
    case = db.query(InvestigationCase).filter_by(id=case_id).first()
    job = db.query(ForensicAnalysisJob).filter_by(case_id=case_id).order_by(ForensicAnalysisJob.started_at.desc()).first()
    case_data = json.loads(job.result_json) if job and job.result_json else {
        "outcome": case.outcome or "Verified",
        "confidence": case.confidence or 0.0,
        "stages": []
    }
    pdf_bytes = generate_pdf_report(case_id, case_data)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Forensic_Report_{case_id}.pdf"}
    )

@app.get("/api/evidence/{case_id}.zip")
def download_evidence_package(case_id: str, db: Session = Depends(get_db)):
    """Downloads evidence package (.zip) with all images and manifest.sha3."""
    job = db.query(ForensicAnalysisJob).filter_by(case_id=case_id).order_by(ForensicAnalysisJob.started_at.desc()).first()
    if not job or not job.result_json:
        raise HTTPException(status_code=404, detail="No completed evidence available for this case")

    art = db.query(Artifact).filter_by(id=job.artifact_id).first()
    vis_dir = os.path.join(VIS_DIR, job.artifact_id)
    zip_bytes = generate_evidence_zip(case_id, art.file_path if art else "", vis_dir, json.loads(job.result_json))
    return Response(
        content=zip_bytes,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=Evidence_Package_{case_id}.zip"}
    )

# -------------------------------------------------------------------
# 7. Notifications Endpoint
# -------------------------------------------------------------------
@app.post("/api/notifications/security")
def notify_security(body: dict, db: Session = Depends(get_db)):
    """Creates a high-priority security alert notification."""
    notif = SecurityNotification(
        id=f"NOTIF-{uuid.uuid4().hex[:8].upper()}",
        case_id=body.get("case_id", "INV-2026-0042"),
        recipient_email=body.get("recipient_email", "security-desk@navy.mil.in"),
        subject=body.get("subject", "TACTICAL BREACH ALERT"),
        message=body.get("message", "Priority classified document leak notification."),
        severity=body.get("severity", "HIGH"),
        status="DISPATCHED"
    )
    db.add(notif)
    db.commit()
    return {"success": True, "id": notif.id, "message": "Security team notification logged and dispatched."}

# -------------------------------------------------------------------
# 8. Auxiliary Routes for Recipients, Documents, Ledger
# -------------------------------------------------------------------
@app.get("/api/recipients")
def list_recipients(db: Session = Depends(get_db)):
    """Lists all 40+ officers from database."""
    recs = db.query(Recipient).all()
    return [{
        "id": r.id,
        "name": r.name,
        "rank": r.rank,
        "pno": r.pno,
        "unit": r.unit_vessel,
        "unitVessel": r.unit_vessel,
        "station": r.station,
        "clearance": r.clearance_level,
        "email": r.email,
        "status": "Active" if r.active else "Inactive"
    } for r in recs]

@app.get("/api/documents")
def list_documents(db: Session = Depends(get_db)):
    docs = db.query(Document).all()
    return [{
        "id": d.id,
        "name": d.name,
        "version": d.version,
        "classification": d.classification,
        "sha3_hash": d.sha3_hash,
        "status": d.status
    } for d in docs]

@app.get("/api/ledger/blocks")
def list_ledger_blocks(db: Session = Depends(get_db)):
    blocks = db.query(LedgerBlock).order_by(LedgerBlock.block_number.asc()).all()
    return [{
        "blockNumber": b.block_number,
        "previousHash": b.prev_hash,
        "currentHash": b.current_hash,
        "merkleRoot": b.merkle_root,
        "timestamp": b.timestamp.isoformat(),
        "isTampered": b.is_tampered,
        "signature": b.signature
    } for b in blocks]
