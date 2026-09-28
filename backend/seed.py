import os
import json
import random
import datetime
import cv2
from PIL import Image, ImageDraw, ImageFont
from .database import engine, SessionLocal, Base
from .models import (
    Recipient, Document, Distribution, DecryptionEvent, LedgerBlock,
    Artifact, InvestigationCase, AuditEvent
)
from .crypto_service import compute_sha3_256, sign_data, compute_merkle_root
from .watermark_engine import watermark_engine

random.seed(42)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DOCS_DIR = os.path.join(DATA_DIR, "seed_docs")
BENCH_DIR = os.path.join(DATA_DIR, "benchmarks")

os.makedirs(DOCS_DIR, exist_ok=True)
os.makedirs(BENCH_DIR, exist_ok=True)

RANKS = ["Commander", "Lieutenant Commander", "Captain", "Lieutenant", "Commodore", "Rear Admiral"]
VESSELS = [
    ("INS Vikramaditya (R33)", "Western Fleet HQ"),
    ("INS Visakhapatnam (D66)", "Western Fleet HQ"),
    ("INS Vikrant (R11)", "Southern Naval Command"),
    ("INS Kolkata (D63)", "Western Fleet HQ"),
    ("INS Chennai (D65)", "Western Fleet HQ"),
    ("INS Sandhayak (J18)", "Eastern Naval Command"),
    ("INS Delhi (D61)", "Eastern Naval Command"),
    ("INS Sahyadri (F49)", "Eastern Fleet HQ")
]

OFFICER_NAMES = [
    "Arjun Mehta", "R. Deshmukh", "S. Rao", "Priya Singh", "Karan Varma",
    "Vikramaditya Sen", "Neha Nair", "Aditya Sharma", "Rajesh Pillai", "Sunil Joshi",
    "Aakash Banerjee", "Manish Tiwari", "Ananya Roy", "Deepak Chopra", "Kavita Reddy",
    "Rohan Malhotra", "Siddharth Menon", "Amitabh Saxena", "Pooja Hegde", "Suresh Gokhale",
    "Vikas Dubey", "Gaurav Kapoor", "Naveen Jindal", "Tarun Bajaj", "Harsh Vardhan",
    "Rajat Chauhan", "Alok Nath", "Manoj Bajpayee", "Pradeep Rawat", "Abhay Deol",
    "Sanjay Dutt", "Devendra Fadnavis", "Sachin Pilot", "Jyotiraditya Scindia", "Raghav Chadha",
    "Akhilesh Yadav", "Tejasvi Surya", "Gautam Gambhir", "Anurag Thakur", "Kiren Rijiju", "Hardik Patel"
]

def draw_tactical_document(title: str, doc_id: str, classification: str, output_path: str):
    """Generates a realistic classified tactical document graphic."""
    img = Image.new("RGB", (960, 720), color=(248, 250, 252))
    draw = ImageDraw.Draw(img)

    # Document Header & Border
    draw.rectangle([(20, 20), (940, 700)], outline=(30, 41, 59), width=2)
    draw.rectangle([(28, 28), (932, 72)], fill=(15, 23, 42))

    draw.text((45, 38), "INDIAN NAVY — SECURE PROVENANCE SYSTEM", fill=(248, 250, 252))
    draw.text((680, 38), f"REF: {doc_id}", fill=(148, 163, 184))

    # Classification Banner
    draw.rectangle([(28, 76), (932, 106)], fill=(153, 27, 27) if "TOP SECRET" in classification else (194, 65, 12))
    draw.text((380, 84), classification, fill=(255, 255, 255))

    # Tactical Content Body
    draw.text((50, 130), title.upper(), fill=(15, 23, 42))
    draw.line([(50, 155), (600, 155)], fill=(30, 58, 138), width=2)

    lines = [
        "1. OPERATIONAL SITUATION & THREAT MATRIX",
        "   - Naval task group deployment coordinates verified under Fleet Directive 2026-Alpha.",
        "   - Coastal surveillance radar chain Zulu operational and synchronized.",
        "   - Underwater acoustic monitoring arrays active along continental shelf sector 4.",
        "",
        "2. CRYPTOGRAPHIC PROVENANCE & CLEARANCE INSTRUCTIONS",
        "   - Document dynamically keyed to authorized tactical hardware terminals.",
        "   - Quantum-resistant digital signatures applied via NIST FIPS 204 ML-DSA-65 standard.",
        "   - Unauthorized duplication, photography, or display transmission strictly prohibited.",
        "   - Governed under Official Secrets Act 1923 and Bharatiya Sakshya Adhiniyam 2023 Sec 63.",
        "",
        "3. TACTICAL SECTOR COORDINATES",
        "   - PRIMARY: LAT 18° 55' 22\" N | LON 72° 50' 14\" E (WESTERN COMMAND)",
        "   - SECONDARY: LAT 09° 58' 00\" N | LON 76° 16' 00\" E (SOUTHERN COMMAND)",
    ]
    y = 180
    for line in lines:
        draw.text((50, y), line, fill=(51, 65, 85))
        y += 24

    # Stylized vessel icon / grid
    draw.rectangle([(620, 160), (910, 360)], outline=(148, 163, 184), width=1)
    draw.text((640, 175), "FLEET FLOTILLA TRACKING", fill=(100, 116, 139))
    draw.rectangle([(650, 240), (880, 300)], fill=(226, 232, 240))
    draw.text((680, 260), "INS VISAKHAPATNAM [D66]", fill=(30, 41, 59))

    # Footer
    draw.line([(28, 640), (932, 640)], fill=(203, 213, 225), width=1)
    draw.text((50, 655), "CONFIDENTIAL DISCLOSURE SUBJECT TO NAVAL DISCIPLINE ACT", fill=(100, 116, 139))
    draw.text((700, 655), "SOVEREIGN PROVENANCE ID: ML-DSA-VALID", fill=(100, 116, 139))

    img.save(output_path)
    return output_path

def seed_database():
    """Initializes tables and seeds 40+ recipients, documents, ledger events, and benchmark artifacts."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        force = os.environ.get("RESEED", "false").lower() in ("true", "1", "yes")
        # Check if already seeded
        if db.query(Recipient).count() >= 40 and not force:
            print("[SEED] Database already contains 40+ recipients. Skipping full reseed.")
            return

        if force:
            Base.metadata.drop_all(bind=engine)
            Base.metadata.create_all(bind=engine)

        print("[SEED] Starting deterministic database seed (SEED=42)...")

        # 1. Seed 41 Recipients
        recipients = []
        for i, name in enumerate(OFFICER_NAMES):
            r_id = f"REC-{i+1:02d}"
            pno = "04821-K" if i == 0 else f"0{4800 + i:04d}-{'K' if i % 2 == 0 else 'M'}"
            rank = RANKS[i % len(RANKS)]
            vessel, station = VESSELS[i % len(VESSELS)]
            clearance = "Level 4 (Top Secret Codeword)" if i < 15 else "Level 3 (Secret)"
            email = f"{name.lower().replace(' ', '.')}@navy.mil.in"
            hw_id = f"HW-HSM-{9000 + i}"

            rec = Recipient(
                id=r_id,
                name=name if name.startswith("Cdr.") or name.startswith("Capt.") else f"Cdr. {name}" if i == 0 else f"{rank[:4]}. {name}",
                rank=rank,
                pno=pno,
                unit_vessel=vessel,
                station=station,
                clearance_level=clearance,
                email=email,
                hardware_device_id=hw_id,
                active=True
            )
            recipients.append(rec)
            db.add(rec)
        db.commit()
        print(f"[SEED] Seeded {len(recipients)} fictional recipients.")

        # 2. Seed Master Documents
        doc1_path = os.path.join(DOCS_DIR, "Mission_Plan_Bravo_v2_1.png")
        draw_tactical_document("Operational Mission Plan — Bravo", "NAV-DOC-2026-0042", "TOP SECRET // CODEWORD", doc1_path)
        with open(doc1_path, "rb") as f:
            doc1_sha3 = compute_sha3_256(f.read())

        doc1 = Document(
            id="NAV-DOC-2026-0042",
            name="Mission_Plan_Bravo.pdf",
            master_doc_id="DOC-9921",
            version="v2.1",
            classification="TOP SECRET // CODEWORD",
            size_bytes=os.path.getsize(doc1_path),
            sha3_hash=doc1_sha3,
            file_path=doc1_path,
            status="Active"
        )
        db.add(doc1)

        doc2_path = os.path.join(DOCS_DIR, "Hydrographic_Notes_v1_0.png")
        draw_tactical_document("Littoral Hydrographic Survey Notes", "NAV-DOC-2026-0041", "SECRET", doc2_path)
        with open(doc2_path, "rb") as f:
            doc2_sha3 = compute_sha3_256(f.read())

        doc2 = Document(
            id="NAV-DOC-2026-0041",
            name="Hydrographic_Survey_Notes.pdf",
            master_doc_id="DOC-7714",
            version="v1.0",
            classification="SECRET",
            size_bytes=os.path.getsize(doc2_path),
            sha3_hash=doc2_sha3,
            file_path=doc2_path,
            status="Active"
        )
        db.add(doc2)

        doc3_path = os.path.join(DOCS_DIR, "Coastal_Radar_SOP_v1_4.png")
        draw_tactical_document("Coastal Surveillance Radar Chain SOP", "NAV-DOC-2026-0040", "CONFIDENTIAL", doc3_path)
        with open(doc3_path, "rb") as f:
            doc3_sha3 = compute_sha3_256(f.read())

        doc3 = Document(
            id="NAV-DOC-2026-0040",
            name="Radar_Surveillance_SOP.pdf",
            master_doc_id="DOC-4481",
            version="v1.4",
            classification="CONFIDENTIAL",
            size_bytes=os.path.getsize(doc3_path),
            sha3_hash=doc3_sha3,
            file_path=doc3_path,
            status="Active"
        )
        db.add(doc3)
        db.commit()
        print("[SEED] Seeded 3 classified master documents.")

        # 3. Seed Distribution
        dist1 = Distribution(
            id="DIST-2026-0042",
            document_id=doc1.id,
            version="v2.1",
            sender="Naval Operations Centre",
            recipient_ids_json=json.dumps([r.id for r in recipients[:12]]),
            capsule_id="CAPSULE-2026-0042-ALPHA"
        )
        db.add(dist1)
        db.commit()

        # 4. Seed Decryption Events & Hash-Chained Ledger Blocks
        prev_hash = "0x0000000000000000000000000000000000000000000000000000000000000000"
        seeded_events = []
        for idx in range(12):
            rec = recipients[idx]
            evt_id = f"EVT-88{420 + idx}"
            sess_id = f"SESS-2026-9{40 + idx:02d}"
            blk_num = 4190 + idx

            # Compute block hash chain
            block_data = f"{prev_hash}:{evt_id}:{rec.id}:{doc1.id}:{blk_num}".encode("utf-8")
            cur_hash = f"0x{compute_sha3_256(block_data)}"
            merkle = compute_merkle_root([cur_hash, compute_sha3_256(rec.pno.encode("utf-8"))])
            sig = sign_data(cur_hash.encode("utf-8"))

            block = LedgerBlock(
                block_number=blk_num,
                prev_hash=prev_hash,
                current_hash=cur_hash,
                merkle_root=merkle,
                event_id=evt_id,
                is_tampered=False,
                signature=sig,
                signature_scheme="Demo signature scheme (Ed25519 / Classical Stand-in)"
            )
            db.add(block)

            evt = DecryptionEvent(
                id=evt_id,
                document_id=doc1.id,
                recipient_id=rec.id,
                distribution_id=dist1.id,
                session_id=sess_id,
                hardware_device_id=rec.hardware_device_id,
                decrypted_at=datetime.datetime.utcnow() - datetime.timedelta(hours=24 - idx),
                ledger_block_number=blk_num,
                watermark_payload=f"NAVX-{evt_id}-{sess_id[:8]}",
                status="CONFIRMED_ON_CHAIN"
            )
            db.add(evt)
            seeded_events.append(evt)
            prev_hash = cur_hash

        db.commit()
        print(f"[SEED] Seeded {len(seeded_events)} decryption events and hash-chained ledger blocks.")

        # 5. GENERATE 5 REAL BENCHMARK ARTIFACTS
        # Benchmark 1: Clean watermarked copy for REC-01 (EVT-88420) -> VERIFIED
        b1_path = os.path.join(BENCH_DIR, "bench_01_verified.png")
        watermark_engine.embed_watermark(doc1_path, b1_path, "EVT-88420", "SESS-2026-9040")
        with open(b1_path, "rb") as f:
            b1_sha3 = compute_sha3_256(f.read())

        art1 = Artifact(
            id="ART-BENCH-001",
            filename="leaked_mission_plan.jpg",
            file_path=b1_path,
            sha3_256=b1_sha3,
            mime_type="image/jpeg",
            file_size=f"{os.path.getsize(b1_path) / (1024*1024):.1f} MB",
            size_bytes=os.path.getsize(b1_path),
            is_benchmark=True,
            benchmark_id="BENCH-1",
            expected_outcome="Verified"
        )
        db.add(art1)

        # Benchmark 2: Watermarked copy with tampered signature / manipulated block -> MANIPULATION SUSPECTED
        b2_path = os.path.join(BENCH_DIR, "bench_02_manipulated.png")
        # Embed watermark for event 2, but tamper the ledger block in database
        watermark_engine.embed_watermark(doc1_path, b2_path, "EVT-88421", "SESS-2026-9041")
        # Tamper block 4191 in ledger
        blk2 = db.query(LedgerBlock).filter_by(block_number=4191).first()
        if blk2:
            blk2.is_tampered = True
            blk2.current_hash = "0xDEADBEEF4191TAMPEREDHASH000000000000000000000000000000000000000000"

        with open(b2_path, "rb") as f:
            b2_sha3 = compute_sha3_256(f.read())

        art2 = Artifact(
            id="ART-BENCH-002",
            filename="intel_notes.pdf",
            file_path=b2_path,
            sha3_256=b2_sha3,
            mime_type="image/jpeg",
            file_size=f"{os.path.getsize(b2_path) / (1024*1024):.1f} MB",
            size_bytes=os.path.getsize(b2_path),
            is_benchmark=True,
            benchmark_id="BENCH-2",
            expected_outcome="Manipulation Suspected"
        )
        db.add(art2)

        # Benchmark 3: Mark matches one event, but document content/hash matches another -> CONTRADICTORY
        b3_path = os.path.join(BENCH_DIR, "bench_03_contradictory.png")
        # Watermark with EVT-88422, but embedded on doc2 image
        watermark_engine.embed_watermark(doc2_path, b3_path, "EVT-88422", "SESS-2026-9042")
        with open(b3_path, "rb") as f:
            b3_sha3 = compute_sha3_256(f.read())

        art3 = Artifact(
            id="ART-BENCH-003",
            filename="contradictory_intel.png",
            file_path=b3_path,
            sha3_256=b3_sha3,
            mime_type="image/png",
            file_size=f"{os.path.getsize(b3_path) / (1024*1024):.1f} MB",
            size_bytes=os.path.getsize(b3_path),
            is_benchmark=True,
            benchmark_id="BENCH-3",
            expected_outcome="Contradictory"
        )
        db.add(art3)

        # Benchmark 4: Heavily degraded copy (cropped & blurred) -> UNRESOLVED
        b4_path = os.path.join(BENCH_DIR, "bench_04_unresolved.png")
        watermark_engine.embed_watermark(doc3_path, b4_path, "EVT-88423", "SESS-2026-9043")
        # Heavily degrade half the image so carrier fragments are partially detected (> 60), but error rate exceeds RS 8-byte ECC capacity!
        img4 = cv2.imread(b4_path)
        h4, w4, _ = img4.shape
        img4[h4//2:, :] = cv2.GaussianBlur(img4[h4//2:, :], (31, 31), 10)
        cv2.imwrite(b4_path, img4)

        with open(b4_path, "rb") as f:
            b4_sha3 = compute_sha3_256(f.read())

        art4 = Artifact(
            id="ART-BENCH-004",
            filename="screenshot_001.png",
            file_path=b4_path,
            sha3_256=b4_sha3,
            mime_type="image/png",
            file_size=f"{os.path.getsize(b4_path) / (1024*1024):.1f} MB",
            size_bytes=os.path.getsize(b4_path),
            is_benchmark=True,
            benchmark_id="BENCH-4",
            expected_outcome="Unresolved"
        )
        db.add(art4)

        # Benchmark 5: Clean image with no watermark -> NO MATCH
        b5_path = os.path.join(BENCH_DIR, "bench_05_nomatch.png")
        clean_img = Image.new("RGB", (960, 720), color=(220, 230, 242))
        d_clean = ImageDraw.Draw(clean_img)
        d_clean.rectangle([(50, 50), (910, 670)], outline=(100, 116, 139), width=2)
        d_clean.text((100, 100), "EXTERNAL UNAUTHENTICATED MARITIME BRIEFING", fill=(30, 41, 59))
        d_clean.text((100, 140), "Source: Public Open-Source Tactical Channel", fill=(71, 85, 105))
        clean_img.save(b5_path)

        with open(b5_path, "rb") as f:
            b5_sha3 = compute_sha3_256(f.read())

        art5 = Artifact(
            id="ART-BENCH-005",
            filename="photo_briefing.jpg",
            file_path=b5_path,
            sha3_256=b5_sha3,
            mime_type="image/jpeg",
            file_size=f"{os.path.getsize(b5_path) / (1024*1024):.1f} MB",
            size_bytes=os.path.getsize(b5_path),
            is_benchmark=True,
            benchmark_id="BENCH-5",
            expected_outcome="No Match"
        )
        db.add(art5)

        # 6. Default Investigation Case
        case1 = InvestigationCase(
            id="INV-2026-0042",
            title="Western Fleet Operation Bravo Leak Investigation",
            artifact_id=art1.id,
            document_id=doc1.id,
            status="ACTIVE",
            outcome=None,
            confidence=0.0
        )
        db.add(case1)

        db.commit()
        print("[SEED] Successfully generated all 5 real benchmark test artifacts and registered case INV-2026-0042.")

    except Exception as e:
        db.rollback()
        print(f"[SEED ERROR] {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
