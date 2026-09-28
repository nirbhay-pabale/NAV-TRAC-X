import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { leakAttributionEngine } from '../services/leakAttributionEngine';
import { geminiForensicService } from '../services/geminiForensicService';
import crypto from 'crypto';

export const artifactsRouter = Router();

// GET /api/artifacts/ai/status - Check Gemini AI service & API key status
artifactsRouter.get('/ai/status', (_req: Request, res: Response) => {
  try {
    const status = geminiForensicService.getApiKeyStatus();
    res.json({
      success: true,
      provider: 'Google Gemini Generative AI',
      ...status,
      activeModels: ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-flash-latest']
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/artifacts (or /api/investigations/artifacts) - List all uploaded artifacts
artifactsRouter.get('/', (_req: Request, res: Response) => {
  try {
    const artifacts = db.getArtifacts();
    res.json(artifacts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/artifacts - Uploads forensic artifact (PDF, PNG, JPG, JPEG, DOCX, PPTX)
artifactsRouter.post('/', (req: Request, res: Response) => {
  try {
    const { filename, fileContent, documentId, size, mimeType } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const hash = crypto
      .createHash('sha256')
      .update(fileContent || filename + Date.now().toString())
      .digest('hex');

    const artifact = db.createArtifact({
      filename,
      documentId: documentId || '',
      size: size || '2.1 MB',
      mime_type: mimeType || (filename.endsWith('.png') ? 'image/png' : filename.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
      format: (filename.split('.').pop() || 'JPG').toUpperCase(),
      hash: `SHA256: ${hash}`,
      analysisStatus: 'PENDING',
    });

    res.status(201).json(artifact);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/artifacts/:id - Get artifact details
artifactsRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const art = db.getArtifactById(req.params.id);
    if (!art) {
      return res.status(404).json({ error: 'Artifact not found' });
    }
    res.json(art);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/artifacts/:id/analyze - Run full forensic attribution pipeline + AI Assessment
artifactsRouter.post('/:id/analyze', async (req: Request, res: Response) => {
  try {
    const art = db.getArtifactById(req.params.id);
    if (!art) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    const result = leakAttributionEngine.analyzeArtifact(art.id);
    
    // Synthesize Google Gemini AI Threat Assessment
    try {
      const aiAssessment = await geminiForensicService.generateAssessment(art, result);
      result.aiAssessment = aiAssessment;
    } catch {
      // Fallback already handled inside service
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/artifacts/:id/intelligence - Complete Right-Panel Leak Intelligence Payload + AI Assessment
artifactsRouter.get('/:id/intelligence', async (req: Request, res: Response) => {
  try {
    const art = db.getArtifactById(req.params.id);
    if (!art) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    const result = leakAttributionEngine.analyzeArtifact(art.id);

    // Provide Google Gemini AI Threat Assessment
    try {
      const aiAssessment = await geminiForensicService.generateAssessment(art, result);
      result.aiAssessment = aiAssessment;
    } catch {
      // Fallback already handled inside service
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/artifacts/:id/ai-assessment - Force regenerate Gemini AI Assessment
artifactsRouter.post('/:id/ai-assessment', async (req: Request, res: Response) => {
  try {
    const art = db.getArtifactById(req.params.id);
    if (!art) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    const result = leakAttributionEngine.analyzeArtifact(art.id);
    const aiAssessment = await geminiForensicService.generateAssessment(art, result);
    res.json(aiAssessment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/artifacts/:id/matches - Get document matches
artifactsRouter.get('/:id/matches', (req: Request, res: Response) => {
  try {
    const result = leakAttributionEngine.analyzeArtifact(req.params.id);
    res.json({ document: result.document, distribution: result.distribution });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/artifacts/:id/attribution - Get attribution candidates
artifactsRouter.get('/:id/attribution', (req: Request, res: Response) => {
  try {
    const result = leakAttributionEngine.analyzeArtifact(req.params.id);
    res.json(result.identification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/artifacts/:id/evidence - Get evidence convergence
artifactsRouter.get('/:id/evidence', (req: Request, res: Response) => {
  try {
    const result = leakAttributionEngine.analyzeArtifact(req.params.id);
    res.json({ evidence: result.evidence, whyThisMatch: result.whyThisMatch });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/artifacts/:id/leak-path - Get leak path analysis
artifactsRouter.get('/:id/leak-path', (req: Request, res: Response) => {
  try {
    const result = leakAttributionEngine.analyzeArtifact(req.params.id);
    res.json(result.leakPath);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/artifacts/:id/timeline - Get leak timeline
artifactsRouter.get('/:id/timeline', (req: Request, res: Response) => {
  try {
    const result = leakAttributionEngine.analyzeArtifact(req.params.id);
    res.json(result.timeline);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/artifacts/:id/analyst-review - Persist manual analyst assessment
artifactsRouter.post('/:id/analyst-review', (req: Request, res: Response) => {
  try {
    let { status, action, reviewer, note } = req.body;
    status = (status || action || '').toUpperCase();
    if (status === 'CONFIRM') status = 'CONFIRMED';
    if (status === 'REJECT') status = 'REJECTED';
    if (!status || !['CONFIRMED', 'UNRESOLVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Status is required (CONFIRMED, UNRESOLVED, REJECTED)' });
    }

    const art = db.getArtifactById(req.params.id);
    if (!art) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    const updated = db.updateArtifactAnalystReview(art.id, status, reviewer, note);
    if (!updated) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    res.json({
      success: true,
      message: `Analyst assessment recorded: ${status}`,
      artifact: updated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
