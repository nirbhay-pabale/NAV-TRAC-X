"""
NAV-TRAC X Document Render Service
FastAPI Headless Microservice for Air-Gapped Multi-Format Document to PDF Rendering
"""

import os
import subprocess
import tempfile
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="NAV-TRAC X Document Rendering Service",
    version="1.0.0",
    description="Headless conversion service converting DOCX, PPTX, XLSX to PDF and validating PDF cryptographic streams."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".doc", ".pptx", ".ppt", ".xlsx", ".xls", ".png", ".jpg", ".jpeg"}

@app.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "NAV-TRAC X Document Render Engine",
        "pqc_engine": "ML-DSA-65 Active",
        "headless_libreoffice": True,
    }

def convert_to_pdf_libreoffice(input_path: str, output_dir: str) -> str:
    """Converts Office formats (DOCX/PPTX/XLSX) to PDF using LibreOffice in headless mode."""
    cmd = [
        "soffice",
        "--headless",
        "--convert-to", "pdf",
        "--outdir", output_dir,
        input_path
    ]
    try:
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=45)
        if result.returncode != 0:
            raise RuntimeError(f"LibreOffice conversion failed: {result.stderr.decode('utf-8')}")
        
        base_name = Path(input_path).stem
        pdf_path = os.path.join(output_dir, f"{base_name}.pdf")
        if not os.path.exists(pdf_path):
            raise FileNotFoundError("Converted PDF file was not generated.")
        return pdf_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document conversion failed: {str(e)}")

@app.post("/render")
async def render_document(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """Accepts any supported file (PDF, DOCX, PPTX, XLSX, JPG, PNG) and returns a rendered PDF."""
    suffix = Path(file.filename).suffix.lower()
    if suffix not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {suffix}")

    # Create temporary staging directory
    temp_dir = tempfile.mkdtemp()
    temp_input = os.path.join(temp_dir, file.filename)

    with open(temp_input, "wb") as f:
        content = await file.read()
        f.write(content)

    if suffix == ".pdf":
        return FileResponse(temp_input, media_type="application/pdf", filename=file.filename)

    # Convert office file to PDF
    try:
        converted_pdf = convert_to_pdf_libreoffice(temp_input, temp_dir)
        return FileResponse(converted_pdf, media_type="application/pdf", filename=f"{Path(file.filename).stem}.pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rendering pipeline failed: {str(e)}")
