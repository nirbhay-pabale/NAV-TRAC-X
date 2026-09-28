import { sha256Sync } from './cryptoService';
import type { WatermarkLayer } from '../types/domain';

/**
 * NAV-TRAC X Local Watermarking Engine
 * Supports unique dynamic watermark synthesis per recipient and session.
 * Features simulated frequency-domain (DCT/DWT) transformations:
 * - Original, JPEG Compressed, Cropped, Screenshot, Photographed, Scanned
 */

export class WatermarkEngine {
  public generateWatermark(
    documentId: string,
    recipientPseudonym: string,
    sessionId: string,
    transformation: WatermarkLayer['transformationType'] = 'Original'
  ): WatermarkLayer {
    const watermarkId = `WM-${documentId.slice(-4)}-${sha256Sync(recipientPseudonym).slice(0, 6)}`;
    
    // Confidence degradation per simulated physical/digital channel attack
    let recoveryConfidence = 99.8;
    let regions = 144;

    switch (transformation) {
      case 'Original':
        recoveryConfidence = 99.8;
        regions = 144;
        break;
      case 'JPEG Compressed':
        recoveryConfidence = 96.4;
        regions = 138;
        break;
      case 'Screenshot':
        recoveryConfidence = 98.2;
        regions = 140;
        break;
      case 'Photographed':
        recoveryConfidence = 91.5;
        regions = 112;
        break;
      case 'Scanned':
        recoveryConfidence = 89.0;
        regions = 98;
        break;
      case 'Cropped':
        recoveryConfidence = 84.2;
        regions = 76;
        break;
    }

    return {
      watermarkId,
      documentId,
      recipientPseudonym,
      sessionId,
      transformationType: transformation,
      embeddedRegionCount: regions,
      frequencyBand: 'DCT Mid-Frequency + DWT LL2',
      recoveryConfidence,
    };
  }

  /**
   * Generates a dynamic SVG data URI for visual rendering in the split-reveal viewer
   */
  public generateWatermarkSvg(
    recipientName: string,
    recipientPno: string,
    sessionId: string,
    opacity: number = 0.35
  ): string {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const token = sha256Sync(`${recipientName}:${recipientPno}:${sessionId}`).slice(0, 16);

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <defs>
          <pattern id="wm-pattern" width="300" height="200" patternUnits="userSpaceOnUse" patternTransform="rotate(-25)">
            <text x="20" y="40" fill="#f2b134" opacity="${opacity}" font-family="monospace" font-size="12px" font-weight="bold">
              CLASSIFIED // RESTRICTED ACCESS
            </text>
            <text x="20" y="70" fill="#38bdf8" opacity="${opacity * 1.1}" font-family="sans-serif" font-size="14px" font-weight="900">
              ${recipientName} (${recipientPno})
            </text>
            <text x="20" y="95" fill="#f2b134" opacity="${opacity * 0.9}" font-family="monospace" font-size="10px">
              SESSION: ${sessionId.slice(0, 12)} • ${timestamp}
            </text>
            <text x="20" y="115" fill="#94a3b8" opacity="${opacity * 0.7}" font-family="monospace" font-size="9px">
              PROVENANCE TOKEN: 0x${token}
            </text>
            <circle cx="150" cy="140" r="3" fill="#10b981" opacity="${opacity}" />
            <circle cx="170" cy="140" r="3" fill="#ef4444" opacity="${opacity}" />
            <circle cx="190" cy="140" r="3" fill="#3b82f6" opacity="${opacity}" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wm-pattern)" />
      </svg>
    `;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}

export const watermarkEngine = new WatermarkEngine();
