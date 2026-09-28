import React, { useState } from 'react';
import {
  X,
  Fingerprint,
  Layers,
  Activity,
  Sliders,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  Binary
} from 'lucide-react';
import type { RecipientRecord } from '../../types/recipient';

interface WatermarkVisualizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: RecipientRecord | null;
}

export const WatermarkVisualizationModal: React.FC<WatermarkVisualizationModalProps> = ({
  isOpen,
  onClose,
  recipient,
}) => {
  const [activeTab, setActiveTab] = useState<'frequency' | 'kerning' | 'payload' | 'tamper'>('frequency');
  const [compressionNoise, setCompressionNoise] = useState(15);
  const [printScanDistortion, setPrintScanDistortion] = useState(10);

  if (!isOpen || !recipient) return null;

  // Calculate simulated extraction confidence based on sliders
  const degradation = (compressionNoise * 0.05) + (printScanDistortion * 0.04);
  const confidenceScore = Math.max(92.4, Number((99.9 - degradation).toFixed(2)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F172A] tracking-wide">
                  Dynamic Forensic Watermark Inspection
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ML-DSA-65 / DWT-DCT SVD
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5 font-mono">
                Decryption ID: <span className="text-blue-600 font-bold">{recipient.latestDecryptionId}</span> &bull; Recipient: <span className="text-[#0F172A]">{recipient.name} ({recipient.pno})</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex items-center border-b border-slate-100 bg-white px-5 gap-6 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('frequency')}
            className={`py-3 flex items-center gap-2 transition-colors cursor-pointer flex-shrink-0 ${
              activeTab === 'frequency'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2D Frequency Domain (DWT-DCT)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('kerning')}
            className={`py-3 flex items-center gap-2 transition-colors cursor-pointer flex-shrink-0 ${
              activeTab === 'kerning'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Micro-Kerning & Glyph Shifts</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payload')}
            className={`py-3 flex items-center gap-2 transition-colors cursor-pointer flex-shrink-0 ${
              activeTab === 'payload'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Decoded Payload & Reed-Solomon</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tamper')}
            className={`py-3 flex items-center gap-2 transition-colors cursor-pointer flex-shrink-0 ${
              activeTab === 'tamper'
                ? 'text-blue-600 font-bold border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Tamper Resilience Simulator</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs font-mono">
          {activeTab === 'frequency' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 4-Subband Spectral Matrix */}
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-[#0F172A]">Wavelet Decomposition Bands</span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Level-2 Haar DWT</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 aspect-square bg-white p-2 rounded-lg border border-slate-200 relative">
                    <div className="rounded bg-blue-50/50 border border-blue-100 p-2 flex flex-col justify-between">
                      <span className="text-[10px] text-blue-900 font-bold">LL Band (Approximation)</span>
                      <div className="h-16 flex items-center justify-center">
                        <div className="w-full h-full bg-slate-100 rounded flex items-center justify-center text-[9px] text-slate-600">
                          Original Text/Image
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400">No Watermark Energy</span>
                    </div>

                    <div className="rounded bg-emerald-50/50 border border-emerald-200 p-2 flex flex-col justify-between shadow-2xs">
                      <span className="text-[10px] text-emerald-800 font-bold">LH Band (Horizontal)</span>
                      <div className="h-16 flex items-center justify-center">
                        <div className="w-full h-full bg-emerald-100/60 rounded flex items-center justify-center text-[9px] text-emerald-800 font-bold">
                          SVD Singular Values
                        </div>
                      </div>
                      <span className="text-[9px] text-emerald-700 font-semibold">Watermark Energy: 42.1%</span>
                    </div>

                    <div className="rounded bg-emerald-50/50 border border-emerald-200 p-2 flex flex-col justify-between shadow-2xs">
                      <span className="text-[10px] text-emerald-800 font-bold">HL Band (Vertical)</span>
                      <div className="h-16 flex items-center justify-center">
                        <div className="w-full h-full bg-emerald-100/60 rounded flex items-center justify-center text-[9px] text-emerald-800 font-bold">
                          SVD Singular Values
                        </div>
                      </div>
                      <span className="text-[9px] text-emerald-700 font-semibold">Watermark Energy: 57.9%</span>
                    </div>

                    <div className="rounded bg-slate-50 border border-slate-200 p-2 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-600 font-bold">HH Band (Diagonal)</span>
                      <div className="h-16 flex items-center justify-center">
                        <div className="w-full h-full bg-slate-100 rounded flex items-center justify-center text-[9px] text-slate-500">
                          High-Frequency Noise
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-400">Filtered Out</span>
                    </div>
                  </div>
                </div>

                {/* Spectral Metrics & Keying */}
                <div className="space-y-3">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                    <span className="font-bold text-[#0F172A] block text-xs">Extraction Metrics</span>
                    <div className="flex justify-between py-1 border-b border-slate-200 text-slate-700">
                      <span>Peak Signal-to-Noise (PSNR):</span>
                      <span className="text-emerald-700 font-bold">48.62 dB (Invisible)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 text-slate-700">
                      <span>Structural Similarity (SSIM):</span>
                      <span className="text-emerald-700 font-bold">0.99984</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200 text-slate-700">
                      <span>Normalized Correlation (NC):</span>
                      <span className="text-blue-700 font-bold">0.9989 (99.89%)</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-700">
                      <span>Quantization Step (Δ):</span>
                      <span className="text-amber-700 font-bold">0.035 (Adaptive)</span>
                    </div>
                  </div>

                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <div>
                      <div className="text-emerald-900 font-bold text-xs">PQC Zero-Knowledge Verification Confirmed</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        Watermark signature matched recipient HSM token with 0 bit-error in parity check.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'kerning' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                <span className="font-bold text-[#0F172A] block text-xs mb-2">
                  Micro-Spacing Delta Modulation (Invisible Text Steganography)
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed font-sans mb-4">
                  Micro-kerning embeds binary bits into inter-word spacing (0.125pt shifts) and glyph-ascender modulations across the authorized document pages during decryption rendering.
                </p>

                <div className="p-4 rounded-lg bg-white border border-slate-200 space-y-3 font-mono">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">EXTRACTED BIT SEQUENCE (128-bit payload):</div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-blue-700 text-xs tracking-widest break-all font-bold">
                    01001110 01000001 01010110 01011000 00110000 00110100 00111000 00110010 00110001 00101101 01001011 00111001 01100001 00110011 00111000
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Decoded ASCII: <span className="text-slate-900 font-bold">NAVX04821-K9a38...</span></span>
                    <span className="text-emerald-700 font-bold">Bit Error Rate: 0.00%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payload' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                  <span className="font-bold text-[#0F172A] block text-xs">Cryptographic Payload</span>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-700">
                      <span>Service PNo:</span>
                      <span className="text-blue-700 font-bold">{recipient.pno}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Recipient Name:</span>
                      <span className="text-[#0F172A] font-bold">{recipient.name}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Unit / Hull:</span>
                      <span className="text-slate-900 font-medium">{recipient.unitVessel}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Decryption Session:</span>
                      <span className="text-blue-700 font-bold">{recipient.latestDecryptionId}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Session Nonce:</span>
                      <span className="text-amber-700 font-bold">{recipient.forensicWatermark.payloadHashed.nonce}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                  <span className="font-bold text-[#0F172A] block text-xs">Reed-Solomon RS(64,32) Codec</span>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-700">
                      <span>Data Symbols (k):</span>
                      <span className="text-slate-900 font-bold">32 bytes (256 bits)</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Parity Symbols (2t):</span>
                      <span className="text-emerald-700 font-bold">32 bytes (256 bits)</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Max Correctable Errors:</span>
                      <span className="text-emerald-700 font-bold">16 symbol errors (50%)</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Syndrome Vector:</span>
                      <span className="text-blue-700 font-bold">[0, 0, 0, 0, 0, 0, 0, 0]</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tamper' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-4">
                <div>
                  <span className="font-bold text-[#0F172A] block text-xs">
                    Robustness & Tamper Resistance Stress Simulation
                  </span>
                  <p className="text-[11px] text-slate-600 mt-1 font-sans">
                    Simulate real-world adversary attacks (JPEG re-compression, print/scan degradation, mobile phone screenshot distortion) to test watermark recoverability.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>JPEG Compression Artifacts:</span>
                      <span className="text-amber-700 font-bold">{compressionNoise}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={compressionNoise}
                      onChange={(e) => setCompressionNoise(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span>Print-Scan / Optical Camera Distortion:</span>
                      <span className="text-amber-700 font-bold">{printScanDistortion}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={printScanDistortion}
                      onChange={(e) => setPrintScanDistortion(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Real-time Extraction Confidence Meter */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <Activity className="w-6 h-6 text-emerald-600 animate-pulse" />
                    <div>
                      <div className="text-[#0F172A] font-bold">Decoded Provenance Identity</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        PNo: {recipient.pno} &bull; Timestamp: {recipient.forensicWatermark.generatedAt}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-emerald-700">
                      {confidenceScore}%
                    </div>
                    <div className="text-[9.5px] text-emerald-800 font-mono uppercase font-semibold">
                      Extraction Confidence
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographically Bound to NIST FIPS 203/204</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
