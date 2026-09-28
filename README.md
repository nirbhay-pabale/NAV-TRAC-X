# NAV-TRAC X
### Sovereign Naval Document Provenance, Forensic Attribution & Tactical EMCON Platform

---

## Executive Summary

**NAV-TRAC X** is an enterprise-grade, sovereign provenance and anti-leak forensic intelligence platform engineered specifically for maritime defense, naval fleet command headquarters, and air-gapped operational environments. The platform guarantees the end-to-end security, immutable auditing, zero-knowledge recipient tracking, and mathematical leak attribution of high-classification naval documents (orders of battle, satellite frequency allocations, tactical corridor charts, and operational maneuvers).

Operating under rigorous defense security standards, NAV-TRAC X binds every recipient access session to an imperceptible, frequency-domain steganographic watermark resistant to visual degradation, cropping, warping, and screen capture. When classified artifacts surface in unauthorized channels, the platform's multi-stage forensic analysis engine isolates the unique cryptographic footprint, cross-references it with an immutable Merkle ledger, and produces legally admissible forensic dossiers with complete chain-of-custody verification.

---

## Core System Architecture & Capabilities

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             NAV-TRAC X SOVEREIGN SYSTEM                          │
├─────────────────────────┬────────────────────────────┬───────────────────────────┤
│    COMMAND & EMCON      │    FORENSIC ATTRIBUTION    │   RECIPIENT & PROVENANCE  │
├─────────────────────────┼────────────────────────────┼───────────────────────────┤
│ • Real-Time Naval Map   │ • DWT-DCT Steganography    │ • Air-Gapped Decryption   │
│ • Fleet Kinematics Sim  │ • Reed-Solomon RS(32,24)   │ • Screen-Leak Deterrent   │
│ • EMCON Radio Silence   │ • Multi-Spectral Heatmaps  │ • HSM / Device Binding    │
│ • Coastal Radar Zones   │ • Gemini AI Analysis Engine│ • PQC Kyber/Dilithium Prep│
│ • Transit Corridors     │ • Automated PDF Dossiers   │ • Merkle-Tree Ledger      │
└─────────────────────────┴────────────────────────────┴───────────────────────────┘
```

### 1. Sovereign Command Center & Tactical Operational Map
* **Live Fleet Telemetry & Kinematics Engine**: Real-time maritime tracking displaying aircraft carriers, guided-missile destroyers, stealth frigates, attack submarines, UAV surveillance squadrons, and fast interceptor craft across western coastal sectors.
* **Geospatial Tactical Overlays**: Visualizes 200 Nautical Mile Exclusive Economic Zone (EEZ) boundaries, Mumbai approach corridors, tactical air corridors, and multi-tier coastal radar surveillance rings.
* **Dual Cartographic Views**: Instant switching between CartoDB Tactical Dark Map mode and Esri World Satellite Imagery with zero external API key requirements.
* **Responsive Command Controls**: Auto-calibrated viewport scaling (`MapResizeSync`), interactive vessel telemetry popups with RF frequency band allocation, and dedicated multi-modal fullscreen controls with keyboard escape handling.

### 2. Forensic Watermarking & Frequency-Domain Extraction
* **DWT-DCT Hybrid Steganography**: Embeds 256-bit cryptographically structured identification payloads directly into the Discrete Wavelet Transform (Haar sub-bands) and Discrete Cosine Transform middle-frequency coefficients.
* **Forward Error Correction (FEC)**: Utilizes Reed-Solomon `RS(32, 24)` codecs (24 message bytes + 8 parity bytes) enabling exact payload recovery even under high-ratio JPEG compression, screen photograph moiré distortions, severe cropping, rotations, and color spectrum loss.
* **Multi-Spectral Forensic Heatmaps**: Generates localized steganographic energy density maps, frequency subband variance visualizations, and spatial correlation matrix heatmaps for courtroom and military inquiry presentations.
* **AI-Assisted Threat Synthesis**: Integrates a Google Gemini forensic intelligence engine with sovereign on-premise heuristic fallback to synthesize investigative findings, leak vectors, and recommended security escalations.

### 3. Merkle Cryptographic Ledger & Reconciliation
* **Immutable Provenance Chain**: Every document publication, recipient decryption, key revocation, and policy override is hashed via SHA3-256 and sealed in sequential cryptographic Merkle blocks.
* **Air-Gap Reconciliation Engine**: Enables disconnected naval units operating under EMCON (Emission Control) radio silence to accumulate local cryptographic event trees and seamlessly verify and reconcile them with Fleet Command upon reconnect.
* **Cryptographic Tamper Detection**: Validates Merkle roots and block parent hashes in real time, pinpointing the exact byte, timestamp, and block number of any unauthorized ledger alteration.

### 4. Recipient Security & Screen-Leak Deterrence
* **Zero-Knowledge Decryption Portal**: Recipients access compartmentalized documents via strictly governed cryptographic grants tied to hardware security modules (HSM) and device fingerprints.
* **Client-Side Canvas Defense**: Enforces dynamic forensic canvas rendering with dynamic luminance watermarking, anti-screenshot detection heuristics, window blur auto-locking, and strict session expiration.
* **Direct RF Alert Dispatch**: Real-time integration with secure communication protocols to alert security officers immediately upon unauthorized decryption attempts or credential revocations.

---

## Detailed Technology Stack

### Frontend Architecture
* **Core Framework**: React 19 (`react`, `react-dom`) leveraging modern concurrent rendering and transition primitives.
* **Build System & Tooling**: Vite 8.3 with Lightning HMR and Rolldown-optimized client chunking.
* **Language & Type System**: TypeScript 5.9 / 6.0 in strict mode (`tsc -b`).
* **Styling & UI Engine**: 
  * Tailwind CSS v4 configured via `@tailwindcss/vite`.
  * Vanilla CSS design system with custom tactical dark palettes (`#030d1a`, `#0a1628`, `#0d2137`), glassmorphism, and radar scope animations.
  * Typography: JetBrains Mono (monospaced telemetry & cryptographic hashes) and Inter / Montserrat (command console typography).
* **Geospatial & Cartographic Mapping**:
  * Leaflet 1.9.4 & React-Leaflet 5.0 with bundled style containment.
  * CartoDB Dark Matter tile service and Esri World Imagery Satellite layers.
  * Custom dynamic SVG divIcons with animated heading vectors, EMCON pulsing status indicators, and tactical radar rings.
  * Custom `MapResizeSync` observer ensuring immediate map invalidation during transitions and resizing.
* **Document Rendering & Forensic Canvas**:
  * PDF.js (`pdfjs-dist`) with custom Web Workers, CMaps, and standard font decoders.
  * PDF-Lib for on-the-fly watermark injection and multi-layer evidence overlay.
* **State Management & Network Layer**:
  * TanStack React Query v5 for asynchronous cache management, optimistic updates, and background telemetry polling.
  * React Router DOM v7 for declarative, clearance-guarded application routing.
* **Data Visualization & Graph Layout**:
  * `@xyflow/react` (React Flow) combined with `dagre` hierarchical graph algorithms for document-to-recipient lineage trees.
  * Recharts for forensic confidence metrics, severity distributions, and telemetry charts.
  * TanStack React Virtual v3 for high-performance rendering of audit logs and recipient registers.
* **Component Primitives & Icons**: Lucide React tactical symbol library, Framer Motion transitions, React Dropzone, and React Hook Form with Zod schema validation.

### Sovereign Forensic Backend (Python)
* **API Framework**: FastAPI running asynchronously on Python 3.11 with high-throughput Uvicorn ASGI server.
* **Computer Vision & Signal Processing**:
  * OpenCV (`cv2`) for affine transformations, perspective deskewing, homography matrix estimation, and spatial spatial filtering.
  * NumPy for DWT/DCT matrix decomposition and high-frequency coefficient extraction.
  * Reed-Solomon Error Correction Codec (`reedsolo`) for forward error recovery.
  * PyMuPDF (Fitz) and Pillow (PIL) for lossless vector-to-raster document rasterization.
* **Forensic Pipeline Execution**:
  * Asynchronous Background Task Workers with Server-Sent Events (SSE) streaming real-time stage progress to the command center.
  * Multi-stage pipeline: Rasterization → Geometric Normalization → Multi-Spectral Filtering → Subband Correlation → Reed-Solomon Decoding → Merkle Verification.
* **Forensic Intelligence & Reporting**:
  * Google Generative AI (Gemini) with fallback on-premise forensic heuristics.
  * ReportLab PDF generation for automated military evidence dossiers and cryptographic ZIP dossier bundling.

### Enterprise Orchestration Server (Node.js & TypeScript)
* **Application Framework**: Express 5.2 executing natively on Node.js via `tsx` TypeScript execution runtime.
* **Security & Post-Quantum Cryptography Services**:
  * Native Web Crypto API & Node.js `crypto` implementing SHA3-256, HMAC-SHA256, and AES-256-GCM.
  * Merkle Tree generation service for cryptographic block construction and tamper verification seals.
  * Post-Quantum Cryptography (PQC) abstraction layer prepared for NIST FIPS 203 (ML-KEM / Kyber) and FIPS 204 (ML-DSA / Dilithium).
* **Communication & Notification**: Google APIs (`googleapis`) client integrating OAuth 2.0 Gmail dispatch for cryptographic defense bulletins.

### Database & Persistence Layer
* **Primary Relational Engine**: SQLite with Write-Ahead Logging (WAL) mode for low-latency concurrent reads and crash-resilient transactions.
* **ORM & Data Mapping**:
  * SQLAlchemy ORM (Python) for forensic analysis jobs, evidence artifacts, and case models.
  * Type-safe database service layer (TypeScript) with parameterized queries for document lifecycle and audit logs.
* **Database Schemas & Entities**:
  * `Artifacts`: Uploaded leak evidence, cryptographic file hashes, file sizes, and metadata.
  * `Documents`: Classified defense document registry, classification levels (Unclassified, Restricted, Secret, Top Secret, Codeword), and lifecycle state.
  * `Recipients`: Defense personnel profiles, security clearance compartments, biometric/device serial bindings, and unit assignments.
  * `DecryptionEvents`: Unique session records capturing timestamp (Z), recipient ID, document ID, session hash, and IP location.
  * `LedgerBlocks`: Immutable Merkle blocks containing block index, timestamp, previous hash, Merkle root, transaction count, and verification seals.
  * `ForensicAnalysisJobs`: Pipeline tracking records detailing correlation coefficients, detected anomalies, and payload recovery status.
  * `InvestigationCases`: Formal investigation dossiers with suspect rankings, confidence percentages, and chain-of-custody logs.
  * `CommunicationLogs` & `AuditEvents`: Comprehensive RF transmission records and EMCON compliance event registers.

---

## Forensic Pipeline Lifecycle

```
[Leaked Artifact (Image/Scan/PDF)]
               │
               ▼
[Step 1: Multi-Page Rasterization (PyMuPDF / Fitz)]
               │
               ▼
[Step 2: Geometric & Perspective Normalization (OpenCV)]
               │
               ▼
[Step 3: Discrete Wavelet Transform (DWT) Decomposition]
               │
               ▼
[Step 4: Discrete Cosine Transform (DCT) Subband Correlation]
               │
               ▼
[Step 5: Reed-Solomon RS(32, 24) Error Correction & Payload Extraction]
               │
               ▼
[Step 6: Cryptographic Hash & Merkle Ledger Cross-Verification]
               │
               ▼
[Step 7: AI Intelligence Synthesis & Formal Forensic Dossier Export]
```

---

## Security, Standards & Governance

* **Classification Compartments**: Strict partition between standard staff documentation and Codeword-level Western Fleet tactical plans.
* **Cryptographic Standards**: SHA3-256 for all block digests, payload hashing, and tamper proofing.
* **Chain of Custody Guarantee**: Forensic dossiers include SHA3 file signatures, extraction matrices, and cryptographic ledger verification stamps admissible in military courts of inquiry.
* **Zero External Telemetry**: Fully autonomous operation without mandatory external cloud connections, ensuring zero data leakage in mission-critical sovereign environments.
