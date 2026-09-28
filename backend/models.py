import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey
)
from .database import Base

class Recipient(Base):
    __tablename__ = "recipients"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    rank = Column(String, nullable=False)
    pno = Column(String, nullable=False, unique=True, index=True)
    unit_vessel = Column(String, nullable=False)
    station = Column(String, nullable=False)
    clearance_level = Column(String, nullable=False)
    email = Column(String, nullable=False)
    hardware_device_id = Column(String, nullable=False)
    active = Column(Boolean, default=True)

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    master_doc_id = Column(String, nullable=False)
    version = Column(String, nullable=False)
    classification = Column(String, nullable=False)
    size_bytes = Column(Integer, default=0)
    sha3_hash = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    status = Column(String, default="Active")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Distribution(Base):
    __tablename__ = "distributions"

    id = Column(String, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    version = Column(String, nullable=False)
    sender = Column(String, nullable=False)
    recipient_ids_json = Column(Text, nullable=False) # JSON list
    broadcast_at = Column(DateTime, default=datetime.datetime.utcnow)
    capsule_id = Column(String, nullable=False)

class DecryptionEvent(Base):
    __tablename__ = "decryption_events"

    id = Column(String, primary_key=True, index=True) # e.g. EVT-88421
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    recipient_id = Column(String, ForeignKey("recipients.id"), nullable=False)
    distribution_id = Column(String, ForeignKey("distributions.id"), nullable=False)
    session_id = Column(String, nullable=False)
    hardware_device_id = Column(String, nullable=False)
    decrypted_at = Column(DateTime, default=datetime.datetime.utcnow)
    ledger_block_number = Column(Integer, nullable=False)
    watermark_payload = Column(String, nullable=False) # Hex payload embedded
    status = Column(String, default="CONFIRMED_ON_CHAIN")

class LedgerBlock(Base):
    __tablename__ = "ledger_blocks"

    block_number = Column(Integer, primary_key=True, index=True)
    prev_hash = Column(String, nullable=False)
    current_hash = Column(String, nullable=False)
    merkle_root = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    event_id = Column(String, nullable=False)
    is_tampered = Column(Boolean, default=False)
    signature = Column(String, nullable=False)
    signature_scheme = Column(String, default="Demo signature scheme (Ed25519 / Classical Stand-in)")

class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    sha3_256 = Column(String, nullable=False, index=True)
    mime_type = Column(String, nullable=False)
    file_size = Column(String, nullable=False)
    size_bytes = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)
    uploader = Column(String, default="Forensic Analyst")
    is_benchmark = Column(Boolean, default=False)
    benchmark_id = Column(String, nullable=True)
    expected_outcome = Column(String, nullable=True) # Verified, Manipulation Suspected, Contradictory, Unresolved, No Match
    thumbnail_path = Column(String, nullable=True)
    has_been_analyzed = Column(Boolean, default=False)

class ForensicAnalysisJob(Base):
    __tablename__ = "forensic_analysis_jobs"

    id = Column(String, primary_key=True, index=True)
    artifact_id = Column(String, ForeignKey("artifacts.id"), nullable=False)
    case_id = Column(String, nullable=False, index=True)
    status = Column(String, default="QUEUED") # QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED
    progress = Column(Integer, default=0)
    stages_json = Column(Text, default="[]")
    outcome = Column(String, nullable=True) # Verified, Manipulation Suspected, Contradictory, Unresolved, No Match
    confidence = Column(Float, default=0.0)
    result_json = Column(Text, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(String, nullable=True)

class InvestigationCase(Base):
    __tablename__ = "investigation_cases"

    id = Column(String, primary_key=True, index=True) # e.g. INV-2026-0042
    title = Column(String, nullable=False)
    artifact_id = Column(String, nullable=True)
    document_id = Column(String, nullable=True)
    status = Column(String, default="ACTIVE") # ACTIVE, CONFIRMED, ESCALATED, DISMISSED
    outcome = Column(String, nullable=True)
    confidence = Column(Float, default=0.0)
    top_recipient_id = Column(String, nullable=True)
    analyst_notes = Column(Text, nullable=True)
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    review_action = Column(String, nullable=True) # CONFIRMED, ESCALATED, DISMISSED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SecurityNotification(Base):
    __tablename__ = "security_notifications"

    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, nullable=False)
    recipient_email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, default="HIGH")
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="DISPATCHED")

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True, index=True)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=False)
    action = Column(String, nullable=False)
    actor = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    metadata_json = Column(Text, default="{}")
