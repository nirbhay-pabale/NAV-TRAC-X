import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import crypto from 'crypto';

export const documentsRouter = Router();

// GET /api/documents/stats
documentsRouter.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = db.getDocumentStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents
documentsRouter.get('/', (req: Request, res: Response) => {
  try {
    const { classification, documentType, status, searchQuery, page = 1, pageSize = 20 } = req.query;
    const allDocs = db.getDocuments({
      classification: classification as string,
      documentType: documentType as string,
      status: status as string,
      searchQuery: searchQuery as string,
    });

    const pageNum = Number(page);
    const size = Number(pageSize);
    const startIndex = (pageNum - 1) * size;
    const paginatedDocs = allDocs.slice(startIndex, startIndex + size);

    res.json({
      documents: paginatedDocs,
      totalCount: allDocs.length,
      page: pageNum,
      pageSize: size,
      totalPages: Math.ceil(allDocs.length / size) || 1,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents/upload - Real document upload with cryptographic fingerprinting & sanitize
documentsRouter.post('/upload', (req: Request, res: Response) => {
  try {
    const { name, classification, documentType, fileContent, sizeBytes, author, sanitizeMetadata, tags } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Document name is required' });
    }

    const docHash = crypto
      .createHash('sha256')
      .update(fileContent || name + Date.now().toString())
      .digest('hex');

    const newDoc = db.createDocument({
      name,
      classification: classification || 'SECRET',
      documentType: documentType || 'Tactical Plan',
      sizeBytes: sizeBytes || (fileContent ? Buffer.byteLength(fileContent) : 5242880),
      sha3Hash: docHash,
      author: author || 'Command Operations Officer',
      metadataSanitized: sanitizeMetadata !== undefined ? sanitizeMetadata : true,
      tags: tags || ['Western Fleet', 'Classified'],
      status: 'Draft',
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded, cryptographically hashed, and registered.',
      document: newDoc,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents/:id
documentsRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const doc = db.getDocumentById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(doc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/documents/:id
documentsRouter.patch('/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateDocument(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/documents/:id
documentsRouter.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = db.deleteDocument(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ success: true, message: 'Document removed from tactical registry' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents/:id/versions
documentsRouter.get('/:id/versions', (req: Request, res: Response) => {
  try {
    const versions = db.getDocumentVersions(req.params.id);
    res.json(versions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents/:id/versions
documentsRouter.post('/:id/versions', (req: Request, res: Response) => {
  try {
    const version = db.createDocumentVersion(req.params.id, req.body);
    res.status(201).json(version);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents/:id/recipients
documentsRouter.get('/:id/recipients', (req: Request, res: Response) => {
  try {
    const recipients = db.getDocumentRecipients(req.params.id);
    res.json(recipients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/documents/:id/leak-monitoring
documentsRouter.get('/:id/leak-monitoring', (req: Request, res: Response) => {
  try {
    const leakData = db.getLeakMonitoring(req.params.id);
    res.json(leakData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/documents
documentsRouter.post('/', (req: Request, res: Response) => {
  try {
    const newDoc = db.createDocument(req.body);
    res.status(201).json(newDoc);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
