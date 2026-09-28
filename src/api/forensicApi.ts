import { z } from 'zod';

// ===================================================================
// ZOD SCHEMAS FOR SOVEREIGN FORENSIC API
// ===================================================================

export const EngineHealthSchema = z.object({
  status: z.enum(['ok', 'degraded', 'offline']),
  engine: z.string(),
  timestamp: z.string(),
  components: z.object({
    watermark_engine: z.object({
      name: z.string(),
      status: z.string(),
      codec: z.string(),
      algorithm: z.string(),
    }),
    ledger: z.object({
      name: z.string(),
      status: z.string(),
      total_blocks: z.number(),
      tampered_blocks: z.number(),
    }),
    signature_service: z.object({
      name: z.string(),
      status: z.string(),
      scheme: z.string(),
    }),
    text_provider: z.object({
      provider: z.string(),
      model: z.string().optional(),
      status: z.string(),
      air_gapped: z.boolean(),
    }),
  }),
});

export type EngineHealth = z.infer<typeof EngineHealthSchema>;

export const BenchmarkArtifactSchema = z.object({
  id: z.string(),
  benchmark_id: z.string(),
  title: z.string(),
  description: z.string(),
  filename: z.string(),
  expected_outcome: z.string(),
  file_size: z.string(),
  sha3_256: z.string(),
});

export const BenchmarkListSchema = z.array(BenchmarkArtifactSchema);
export type BenchmarkArtifact = z.infer<typeof BenchmarkArtifactSchema>;

export const ArtifactUploadResponseSchema = z.object({
  id: z.string(),
  filename: z.string(),
  mime_type: z.string(),
  file_size: z.string(),
  sha3_256: z.string(),
  uploaded_at: z.string(),
});

export type ArtifactUploadResponse = z.infer<typeof ArtifactUploadResponseSchema>;

export const ArtifactDetailSchema = z.object({
  id: z.string(),
  filename: z.string(),
  file_size: z.string(),
  mime_type: z.string(),
  sha3_256: z.string(),
  is_benchmark: z.boolean(),
  has_been_analyzed: z.boolean(),
  file_url: z.string(),
  benchmark_id: z.string().nullable().optional(),
  expected_outcome: z.string().nullable().optional(),
  uploaded_at: z.string().optional(),
});

export const ArtifactListSchema = z.array(ArtifactDetailSchema);
export type ArtifactDetail = z.infer<typeof ArtifactDetailSchema>;

export const StageResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['passed', 'failed', 'skipped', 'running', 'pending']),
  duration_ms: z.number(),
  detail: z.string(),
  raw_evidence: z.record(z.string(), z.any()),
  error: z.string().nullable().optional(),
});

export type StageResult = z.infer<typeof StageResultSchema>;

export const CaptureTransformationsSchema = z.object({
  jpeg_quality_estimate: z.number().nullable().optional(),
  crop_percentage: z.number().optional(),
  perspective_skew_detected: z.boolean().optional(),
  blur_laplacian_var: z.number().optional(),
  color_shift_detected: z.boolean().optional(),
  moire_fft_peaks: z.number().optional(),
  primary_capture_method: z.string(),
  method_confidence: z.number(),
  is_computed: z.boolean().default(true),
});

export type CaptureTransformations = z.infer<typeof CaptureTransformationsSchema>;

export const RecipientRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  rank: z.string(),
  pno: z.string(),
  unit_vessel: z.string(),
  station: z.string(),
  clearance_level: z.string(),
  email: z.string(),
});

export type RecipientRecord = z.infer<typeof RecipientRecordSchema>;

export const DocumentRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  classification: z.string(),
  sha3_hash: z.string(),
  status: z.string(),
  current_version: z.string().optional(),
});

export type DocumentRecord = z.infer<typeof DocumentRecordSchema>;

export const ForensicResultSchema = z.object({
  outcome: z.enum(['Verified', 'Manipulation Suspected', 'Contradictory', 'Unresolved', 'No Match']),
  confidence: z.number(),
  confidence_breakdown: z.object({
    fragment_recovery_pct: z.number(),
    ecc_health_pct: z.number(),
    cryptographic_agreement_pct: z.number(),
    channel_noise_penalty_pct: z.number(),
    formula: z.string(),
  }).optional(),
  benchmark_validation: z.object({
    is_benchmark: z.boolean(),
    benchmark_id: z.string().nullable().optional(),
    expected_outcome: z.string().nullable().optional(),
    matches_expectation: z.boolean(),
  }).optional(),
  stages: z.array(StageResultSchema),
  transformations: CaptureTransformationsSchema.optional(),
  visual_evidence: z.object({
    heatmap_url: z.string(),
    spectral_url: z.string(),
    fingerprint_map_url: z.string(),
    processed_url: z.string(),
    original_url: z.string(),
  }).optional(),
  recipient: RecipientRecordSchema.nullable().optional(),
  document: DocumentRecordSchema.nullable().optional(),
  decryption_event: z.object({
    event_id: z.string(),
    device_id: z.string(),
    session_id: z.string(),
    distribution_id: z.string(),
    timestamp: z.string(),
    signature: z.string().optional(),
    signature_scheme: z.string().optional(),
  }).nullable().optional(),
  ledger_block: z.object({
    block_number: z.number(),
    current_hash: z.string(),
    prev_hash: z.string(),
    merkle_root: z.string(),
    timestamp: z.string(),
    is_tampered: z.boolean(),
  }).nullable().optional(),
  narratives: z.object({
    why_match: z.object({
      text: z.string(),
      source: z.enum(['llm', 'template']),
    }),
    leak_path: z.object({
      text: z.string(),
      source: z.enum(['llm', 'template']),
    }),
    dossier_prose: z.object({
      text: z.string(),
      source: z.enum(['llm', 'template']),
    }),
    security_message: z.object({
      text: z.string(),
      source: z.enum(['llm', 'template']),
    }),
  }).optional(),
  hot_regions: z.array(z.object({
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
    fragment_id: z.string(),
    layer: z.string(),
    confidence: z.number(),
    bits_recovered: z.string(),
  })).optional(),
});

export type ForensicResult = z.infer<typeof ForensicResultSchema>;

export const StartAnalysisResponseSchema = z.object({
  job_id: z.string(),
  artifact_id: z.string(),
  case_id: z.string(),
  status: z.string(),
  stream_url: z.string(),
});

export type StartAnalysisResponse = z.infer<typeof StartAnalysisResponseSchema>;

export const InvestigationCaseSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  status: z.string(),
  outcome: z.string().nullable().optional(),
  confidence: z.number().nullable().optional(),
  artifact_id: z.string().nullable().optional(),
  top_recipient_id: z.string().nullable().optional(),
  analyst_notes: z.string().nullable().optional(),
  reviewed_by: z.string().nullable().optional(),
  reviewed_at: z.string().nullable().optional(),
  review_action: z.string().nullable().optional(),
  created_at: z.string().optional(),
});

export const InvestigationCaseListSchema = z.array(InvestigationCaseSchema);
export type InvestigationCase = z.infer<typeof InvestigationCaseSchema>;

// ===================================================================
// API CALLS WITH STRICT ZOD VALIDATION
// ===================================================================

export async function fetchEngineHealth(): Promise<EngineHealth> {
  const res = await fetch('/api/engine/health');
  if (!res.ok) {
    throw new Error(`Engine health fetch failed: ${res.statusText}`);
  }
  const data = await res.json();
  return EngineHealthSchema.parse(data);
}

export async function fetchBenchmarks(): Promise<BenchmarkArtifact[]> {
  const res = await fetch('/api/benchmarks');
  if (!res.ok) {
    throw new Error(`Failed to load benchmarks: ${res.statusText}`);
  }
  const data = await res.json();
  return BenchmarkListSchema.parse(data);
}

export async function uploadArtifactFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ArtifactUploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/artifacts');

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const pct = Math.round((evt.loaded / evt.total) * 100);
          onProgress(pct);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const parsed = ArtifactUploadResponseSchema.parse(JSON.parse(xhr.responseText));
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      } else {
        try {
          const errJson = JSON.parse(xhr.responseText);
          reject(new Error(errJson.detail || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during file upload'));

    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
}

export async function fetchArtifacts(): Promise<ArtifactDetail[]> {
  const res = await fetch('/api/artifacts');
  if (!res.ok) throw new Error('Failed to fetch artifacts');
  const data = await res.json();
  return ArtifactListSchema.parse(data);
}

export async function deleteArtifact(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/artifacts/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to delete artifact');
  }
  return data;
}

export async function startForensicAnalysis(
  artifactId: string,
  caseId: string = 'INV-2026-0042'
): Promise<StartAnalysisResponse> {
  const formData = new FormData();
  formData.append('artifact_id', artifactId);
  formData.append('case_id', caseId);

  const res = await fetch('/api/analysis', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to trigger forensic analysis');
  }

  const data = await res.json();
  return StartAnalysisResponseSchema.parse(data);
}

export async function cancelForensicAnalysis(jobId: string): Promise<void> {
  await fetch(`/api/analysis/${jobId}/cancel`, { method: 'POST' });
}

export async function fetchAnalysisResult(idOrCaseId: string): Promise<ForensicResult> {
  const res = await fetch(`/api/analysis/${idOrCaseId}/result`);
  if (!res.ok) {
    throw new Error(`Failed to fetch result: ${res.statusText}`);
  }
  const data = await res.json();
  return ForensicResultSchema.parse(data);
}

export async function fetchCases(): Promise<InvestigationCase[]> {
  const res = await fetch('/api/cases');
  if (!res.ok) throw new Error('Failed to fetch cases');
  const data = await res.json();
  return InvestigationCaseListSchema.parse(data);
}

export async function updateCaseTriage(
  caseId: string,
  action: 'CONFIRM' | 'ESCALATE' | 'DISMISS',
  reason: string,
  reviewer?: string
): Promise<any> {
  const res = await fetch(`/api/cases/${caseId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, reason, reviewer }),
  });
  if (!res.ok) throw new Error('Failed to update case triage');
  return res.json();
}

export async function sendSecurityNotification(payload: {
  case_id: string;
  recipient_email: string;
  subject: string;
  message: string;
  severity: string;
}): Promise<any> {
  const res = await fetch('/api/notifications/security', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to send security notification');
  return res.json();
}
