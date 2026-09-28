import type { MonitoringJob, LeakCandidate, DocumentRecord } from '../types/domain';

/**
 * NAV-TRAC X Simulated External Leak Monitoring & Similarity Engine
 * Fully air-gapped simulation for detecting leaked artifacts across:
 * - Open Websites, Defense Forums, Social Media, Paste Sites, Dark Web
 * Implements deterministic text, visual, structural, and fingerprint similarity calculation.
 */

export class MonitoringEngine {
  /**
   * Calculates multidimensional similarity between an artifact and a document record
   */
  public calculateSimilarity(
    artifactText: string,
    doc: DocumentRecord
  ): {
    textSimilarity: number;
    visualSimilarity: number;
    structuralSimilarity: number;
    fingerprintSimilarity: number;
    compositeSimilarity: number;
  } {
    const artLower = artifactText.toLowerCase();
    const docNameLower = doc.name.toLowerCase();

    // 1. Text Similarity (Deterministic substring and tag overlap)
    let textScore = 20.0;
    if (doc.tags.some((t) => artLower.includes(t.toLowerCase()))) {
      textScore += 35.0;
    }
    if (artLower.includes(doc.masterDocId.toLowerCase()) || artLower.includes(doc.id.toLowerCase())) {
      textScore += 40.0;
    }
    if (docNameLower.includes('bravo') && artLower.includes('bravo')) {
      textScore = 98.4;
    }

    // 2. Perceptual/Structural Similarity
    const structuralSimilarity = doc.id === 'NAV-DOC-2026-0042' ? 97.2 : 45.0;
    const visualSimilarity = doc.id === 'NAV-DOC-2026-0042' ? 98.8 : 38.0;
    const fingerprintSimilarity = doc.id === 'NAV-DOC-2026-0042' ? 99.8 : 12.0;

    const compositeSimilarity = Number(
      (
        textScore * 0.35 +
        structuralSimilarity * 0.2 +
        visualSimilarity * 0.2 +
        fingerprintSimilarity * 0.25
      ).toFixed(1)
    );

    return {
      textSimilarity: Number(textScore.toFixed(1)),
      visualSimilarity,
      structuralSimilarity,
      fingerprintSimilarity,
      compositeSimilarity,
    };
  }

  /**
   * Runs a simulated scanning job across designated external repository channels
   */
  public scanSourceCategory(
    category: MonitoringJob['sourceCategory'],
    documents: DocumentRecord[]
  ): LeakCandidate[] {
    const candidates: LeakCandidate[] = [];

    if (category === 'Dark Web' || category === 'Forums') {
      const targetDoc = documents.find((d) => d.id === 'NAV-DOC-2026-0042') || documents[0];
      if (targetDoc) {
        candidates.push({
          id: `LEAK-CAND-${Date.now().toString().slice(-4)}`,
          jobId: `JOB-${category.toUpperCase().replace(/\s+/g, '-')}`,
          sourceName: category === 'Dark Web' ? 'Tor .onion Tactical Paste' : 'Defense Discussion Board',
          discoveredAt: new Date().toISOString(),
          artifactFileName: 'leaked_strike_plan_sample.pdf',
          similarityScore: 99.4,
          matchedDocumentId: targetDoc.id,
          matchedDocumentName: targetDoc.name,
          matchedFingerprintId: 'FP-0042-REC-01',
          matchedVersion: 'v2.1',
          extractedRecipientName: 'Attributed Recipient (REC-01)',
          status: 'Investigation Opened',
        });
      }
    }

    return candidates;
  }
}

export const monitoringEngine = new MonitoringEngine();
