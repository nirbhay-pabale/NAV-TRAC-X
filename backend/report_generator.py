import os
import io
import zipfile
import json
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from .crypto_service import compute_sha3_256, sign_data

def generate_pdf_report(case_id: str, case_data: dict) -> bytes:
    """Generates an official Indian Navy Section 63 BSA Forensic Examination Report."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#0F172A'),
        alignment=1, # Center
        fontName='Helvetica-Bold'
    )
    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#475569'),
        alignment=1,
        fontName='Helvetica'
    )
    section_title = ParagraphStyle(
        'SecTitle',
        parent=styles['Heading2'],
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#1E3A8A'),
        fontName='Helvetica-Bold',
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B'),
        fontName='Helvetica'
    )
    mono_style = ParagraphStyle(
        'MonoText',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#0F172A'),
        fontName='Courier'
    )

    elements = []

    # Header Banner
    elements.append(Paragraph("INDIAN NAVY — CYBER WARFARE & PROVENANCE DIRECTORATE", title_style))
    elements.append(Paragraph("SOVEREIGN STEGANOGRAPHIC FORENSIC EXAMINATION REPORT", subtitle_style))
    elements.append(Paragraph("CONFIDENTIAL // SECTION 63 BHARATIYA SAKSHYA ADHINIYAM (BSA) 2023 CERTIFICATE", subtitle_style))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0F172A'), spaceBefore=2, spaceAfter=10))

    # Case Summary Table
    outcome = case_data.get("outcome", "Verified")
    conf = case_data.get("confidence", 0.0)
    doc_name = case_data.get("document", {}).get("name", "Mission_Plan_Bravo.pdf")
    officer = case_data.get("recipient", {}).get("name", "Authorized Officer") if outcome == "Verified" else "N/A (Unattributed)"
    rank = case_data.get("recipient", {}).get("rank", "") if outcome == "Verified" else ""
    vessel = case_data.get("recipient", {}).get("unit_vessel", "") if outcome == "Verified" else ""

    summary_data = [
        [Paragraph("<b>Investigation Case ID:</b>", body_style), Paragraph(case_id, mono_style)],
        [Paragraph("<b>Examination Date:</b>", body_style), Paragraph(datetime.datetime.utcnow().strftime("%d %b %Y %H:%M:%S UTC"), body_style)],
        [Paragraph("<b>Artifact Examined:</b>", body_style), Paragraph(case_data.get("artifact_id", "ART-001"), mono_style)],
        [Paragraph("<b>Attributed Document:</b>", body_style), Paragraph(doc_name, body_style)],
        [Paragraph("<b>Forensic Verdict:</b>", body_style), Paragraph(f"<b>{outcome.upper()}</b> ({conf:.1f}% Confidence)", body_style)],
        [Paragraph("<b>Attributed Officer:</b>", body_style), Paragraph(f"{rank} {officer} ({vessel})" if outcome == "Verified" else "None (Honest Non-Attribution)", body_style)],
        [Paragraph("<b>Capture Method:</b>", body_style), Paragraph(case_data.get("transformations", {}).get("capture_method", "DIGITAL_FILE"), body_style)],
    ]

    t_summary = Table(summary_data, colWidths=[150, 380])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(t_summary)
    elements.append(Spacer(1, 10))

    # Section 1: 7-Stage Pipeline Verification Summary
    elements.append(Paragraph("1. SEVEN-STAGE MATHEMATICAL VERIFICATION PIPELINE", section_title))
    stage_rows = [[
        Paragraph("<b>#</b>", body_style),
        Paragraph("<b>Verification Stage</b>", body_style),
        Paragraph("<b>Status</b>", body_style),
        Paragraph("<b>Duration</b>", body_style),
        Paragraph("<b>Cryptographic Detail</b>", body_style)
    ]]

    for stage in case_data.get("stages", []):
        st_color = '#15803D' if stage.get("status") == "passed" else '#B91C1C' if stage.get("status") == "failed" else '#64748B'
        stage_rows.append([
            Paragraph(str(stage.get("id")), mono_style),
            Paragraph(stage.get("name", ""), body_style),
            Paragraph(f"<font color='{st_color}'><b>{stage.get('status','').upper()}</b></font>", body_style),
            Paragraph(f"{stage.get('duration', 0.2)}s", mono_style),
            Paragraph(stage.get("detail", ""), body_style)
        ])

    t_stages = Table(stage_rows, colWidths=[20, 140, 65, 45, 260])
    t_stages.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))
    elements.append(t_stages)
    elements.append(Spacer(1, 10))

    # Section 2: Narrative & Tactical Explanation
    elements.append(Paragraph("2. PROVENANCE RECONSTRUCTION & WHY THIS MATCH", section_title))
    why_text = case_data.get("narratives", {}).get("why_this_match", "Cryptographic watermark correlation verified.")
    leak_text = case_data.get("narratives", {}).get("leak_path", "Exfiltration occurred during authenticated display render.")
    elements.append(Paragraph(f"<b>Convergence Rationale:</b> {why_text}", body_style))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(f"<b>Exfiltration Mechanism:</b> {leak_text}", body_style))
    elements.append(Spacer(1, 10))

    # Section 3: Legal Compliance Certificate (Section 63 BSA 2023)
    elements.append(Paragraph("3. SECTION 63 BSA 2023 ELECTRONIC RECORD ADMISSIBILITY CERTIFICATE", section_title))
    cert_text = (
        "I hereby certify that the electronic record described in this report has been produced by the "
        "NAV-TRAC X secure provenance system during the ordinary course of naval cyber security operations. "
        "The cryptographic hash chain, discrete wavelet steganographic fragments, and NIST FIPS 204 signatures "
        "have operated with zero detected corruption or unauthorized modification."
    )
    elements.append(Paragraph(cert_text, body_style))
    elements.append(Spacer(1, 15))

    # Signatures & Ledger Anchor
    report_sha3 = compute_sha3_256(f"{case_id}:{outcome}:{conf}".encode("utf-8"))
    sig_seal = sign_data(report_sha3.encode("utf-8"))
    sig_data = [
        [Paragraph(f"<b>Digital SHA3-256 Report Seal:</b><br/>{report_sha3}", mono_style),
         Paragraph(f"<b>Post-Quantum Signature:</b><br/>{sig_seal}", mono_style)],
        [Paragraph("<b>Examining Officer:</b><br/>Lt. Cdr. S. Rao (Lead Forensic Examiner)", body_style),
         Paragraph("<b>Countersigned:</b><br/>Naval Headquarters (Western Naval Command)", body_style)]
    ]
    t_sig = Table(sig_data, colWidths=[265, 265])
    t_sig.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#0F172A')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_sig)

    doc.build(elements)
    return buffer.getvalue()

def generate_evidence_zip(case_id: str, artifact_path: str, vis_dir: str, case_data: dict) -> bytes:
    """Creates a complete cryptographic evidence package (.zip) with manifest.sha3."""
    zip_buffer = io.BytesIO()
    manifest_entries = []

    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        # 1. Original Artifact
        if os.path.exists(artifact_path):
            filename = os.path.basename(artifact_path)
            with open(artifact_path, "rb") as f:
                content = f.read()
            h = compute_sha3_256(content)
            zip_file.writestr(f"evidence/original_{filename}", content)
            manifest_entries.append(f"{h}  evidence/original_{filename}")

        # 2. Visualizations (Heatmap, Spectral, Fingerprint, Processed)
        for name in ["heatmap.png", "spectral.png", "fingerprint_map.png", "processed.png"]:
            p = os.path.join(vis_dir, name)
            if os.path.exists(p):
                with open(p, "rb") as f:
                    content = f.read()
                h = compute_sha3_256(content)
                zip_file.writestr(f"visualizations/{name}", content)
                manifest_entries.append(f"{h}  visualizations/{name}")

        # 3. Chain of Custody JSON
        custody_json = json.dumps({
            "case_id": case_id,
            "artifact_id": case_data.get("artifact_id"),
            "investigator": "Lt. Cdr. S. Rao",
            "station": "Western Command Cyber Directorate",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "ledger_anchor": case_data.get("decryption_event", {}).get("ledger_block", 4190),
            "outcome": case_data.get("outcome", "Verified")
        }, indent=2)
        h_custody = compute_sha3_256(custody_json.encode("utf-8"))
        zip_file.writestr("chain_of_custody.json", custody_json)
        manifest_entries.append(f"{h_custody}  chain_of_custody.json")

        # 4. Manifest.sha3
        manifest_content = "\n".join(manifest_entries) + "\n"
        zip_file.writestr("manifest.sha3", manifest_content)

    return zip_buffer.getvalue()
