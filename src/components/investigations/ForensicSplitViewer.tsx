import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Maximize2,
  Download,
  Eye,
  Flame,
  Check
} from 'lucide-react';
import type { ForensicArtifactFile } from '../../types/forensic';

interface ForensicSplitViewerProps {
  currentFile: ForensicArtifactFile;
  onOpenLightbox?: () => void;
}

export const ForensicSplitViewer: React.FC<ForensicSplitViewerProps> = ({
  currentFile,
  onOpenLightbox,
}) => {
  const [splitPos, setSplitPos] = useState<number>(55);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isHeatmapFull, setIsHeatmapFull] = useState<boolean>(false);
  const [isNormalFull, setIsNormalFull] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = Math.max(5, Math.min(95, (offsetX / rect.width) * 100));
    setSplitPos(percentage);
    setIsHeatmapFull(false);
    setIsNormalFull(false);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handlePointerMove(e.clientX);
      }
    };
    const onMouseUp = () => {
      setIsDragging(false);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handlePointerMove(e.touches[0].clientX);
      }
    };
    const onTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, handlePointerMove]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSplitPos((prev) => Math.max(5, prev - 3));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSplitPos((prev) => Math.min(95, prev + 3));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSplitPos(5);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSplitPos(95);
    }
  };

  const handleNormalViewToggle = () => {
    setIsNormalFull(true);
    setIsHeatmapFull(false);
    setSplitPos(98);
  };

  const handleHeatmapToggle = () => {
    if (isHeatmapFull) {
      setIsHeatmapFull(false);
      setSplitPos(55);
    } else {
      setIsHeatmapFull(true);
      setIsNormalFull(false);
      setSplitPos(2);
    }
  };

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 1800);
  };

  const activeSplit = isHeatmapFull ? 0 : isNormalFull ? 100 : splitPos;

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col justify-between space-y-3">
      {/* Header & Toolbar */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center font-mono">
              2
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Document View & Analysis
              </h2>
              <p className="text-[11px] text-slate-500">
                Preview file and explore extracted forensic evidence
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
          <span className="font-mono text-slate-800 text-[11px] font-semibold truncate max-w-[180px]">
            {currentFile.name}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Zoom Controls */}
            <div className="flex items-center bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-[11px] font-mono shadow-xs">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                className="w-5 h-5 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
                title="Zoom out"
                aria-label="Zoom out"
              >
                -
              </button>
              <span className="px-1.5 text-blue-700 font-bold">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
                className="w-5 h-5 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
                title="Zoom in"
                aria-label="Zoom in"
              >
                +
              </button>
            </div>

            {/* Lightbox Modal Button */}
            <button
              type="button"
              onClick={onOpenLightbox}
              className="w-7 h-7 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              title="Fullscreen Lightbox"
              aria-label="Open Fullscreen Lightbox"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="w-7 h-7 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors relative shadow-xs cursor-pointer"
              title="Download Artifact"
              aria-label="Download Artifact"
            >
              {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Split-Reveal Comparison Viewer */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-inner select-none cursor-ew-resize group"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Forensic image split reveal viewer. Use arrow keys to adjust split."
      >
        {/* Underneath Layer: Watermark Heatmap Representation */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
        >
          <div className="relative w-full h-full bg-[#051428] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[#0a2244]/40 opacity-70 p-6 flex flex-col justify-between font-mono text-[10px] text-sky-200/50">
              <div className="flex justify-between border-b border-sky-500/20 pb-2">
                <span>INDIAN NAVY MISSION PLAN - BRAVO</span>
                <span>SECURE PROVENANCE</span>
              </div>
              <div className="flex justify-center opacity-30">
                <div className="w-48 h-32 border border-dashed border-sky-400 rounded-lg flex items-center justify-center text-xs">
                  WARFARE OPERATIONAL THEATRE
                </div>
              </div>
              <div className="flex justify-between border-t border-sky-500/20 pt-2 text-[8px]">
                <span>TOP SECRET // ML-DSA-65 SIGNED</span>
                <span>NONCE: 9A38F71C</span>
              </div>
            </div>

            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute top-[38%] right-[28%] w-32 h-32 rounded-full opacity-90 blur-xl"
                style={{
                  background: 'radial-gradient(circle, rgba(239,68,68,0.95) 0%, rgba(245,158,11,0.85) 35%, rgba(16,185,129,0.5) 60%, rgba(56,189,248,0.2) 80%, transparent 100%)'
                }}
              />
              <div
                className="absolute top-[22%] right-[35%] w-24 h-24 rounded-full opacity-85 blur-lg"
                style={{
                  background: 'radial-gradient(circle, rgba(245,158,11,0.95) 0%, rgba(16,185,129,0.7) 45%, rgba(56,189,248,0.3) 75%, transparent 100%)'
                }}
              />
              <div
                className="absolute bottom-[28%] right-[22%] w-28 h-28 rounded-full opacity-80 blur-xl"
                style={{
                  background: 'radial-gradient(circle, rgba(239,68,68,0.9) 0%, rgba(245,158,11,0.75) 40%, rgba(56,189,248,0.3) 70%, transparent 100%)'
                }}
              />
              <div
                className="absolute top-[55%] right-[32%] w-16 h-16 rounded-full opacity-95 blur-md"
                style={{
                  background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(239,68,68,0.9) 30%, rgba(245,158,11,0.6) 70%, transparent 100%)'
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#0284c715_1px,transparent_1px),linear-gradient(to_bottom,#0284c715_1px,transparent_1px)] bg-[size:16px_16px]" />
            </div>

            <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-sky-950/80 border border-sky-400/40 text-[9px] font-mono text-sky-300 font-bold shadow-lg">
              SPECTRAL REVEAL: SVD COEFFICIENTS
            </div>
          </div>
        </div>

        {/* Top Clipped Layer */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{
            clipPath: `polygon(0% 0%, ${activeSplit}% 0%, ${activeSplit}% 100%, 0% 100%)`
          }}
        >
          <div
            className="w-full h-full bg-[#fbf8f4] text-slate-900 p-6 flex flex-col justify-between relative shadow-2xl"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
          >
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-slate-800 rounded-full flex items-center justify-center font-bold text-slate-900 text-xs">
                  IN
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-wider uppercase leading-tight">
                    INDIAN NAVY
                  </h3>
                  <div className="text-xs font-bold text-slate-800 tracking-wide">
                    MISSION PLAN - BRAVO
                  </div>
                  <div className="text-[9.5px] text-slate-600 font-mono">
                    WESTERN FLEET OPERATIONS
                  </div>
                </div>
              </div>
              <div className="text-right text-[9px] font-mono text-slate-700">
                <span>DOC-ID: MP-2026-BRV</span><br />
                <span>ORIGIN: WNC MUMBAI</span>
              </div>
            </div>

            <div className="my-auto grid grid-cols-2 gap-4 items-center">
              <div className="border border-slate-400/60 p-2 rounded bg-slate-100/70">
                <div className="text-[8.5px] font-mono text-slate-600 font-bold mb-1">
                  FLAGSHIP TASK FORCE D66
                </div>
                <div className="h-20 bg-slate-300/60 rounded flex items-center justify-center text-slate-700 text-[10px] font-bold">
                  [ DESTROYER INS VISAKHAPATNAM ]
                </div>
              </div>

              <div className="border border-slate-400/60 p-2 rounded bg-slate-100/70 text-[9px] font-mono space-y-1">
                <div className="text-slate-600 font-bold">OPERATIONAL SECTOR ZETA</div>
                <div className="text-slate-700">LAT: 18° 55' N | LON: 72° 50' E</div>
                <div className="text-slate-700">FREQ: 324.500 MHz (ENCR)</div>
                <div className="text-slate-700">EMCON: AIR-GAPPED</div>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 rotate-[-12deg] border-2 border-red-600 px-3 py-1 rounded bg-red-50 text-red-600 font-black tracking-widest text-xs uppercase shadow-xs">
              TOP SECRET<br />CODEWORD
            </div>

            <div className="border-t border-slate-400 pt-1 flex justify-between text-[8px] font-mono text-slate-600">
              <span>UNAUTHORIZED DISCLOSURE SUBJECT TO NAVAL DISCIPLINE ACT</span>
              <span>PAGE 1 OF 12</span>
            </div>
          </div>
        </div>

        {/* Draggable Divider Handle */}
        <div
          className="absolute top-0 bottom-0 z-20 flex items-center justify-center cursor-ew-resize group"
          style={{ left: `${activeSplit}%`, transform: 'translateX(-50%)' }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="w-[2px] h-full bg-blue-500 shadow-sm" />
          <div className="absolute w-7 h-7 rounded-full bg-white border-2 border-blue-600 text-blue-600 flex items-center justify-center shadow-md group-hover:scale-110 group-active:scale-95 transition-transform text-[10px] font-bold font-mono select-none">
            &lt;&gt;
          </div>
        </div>
      </div>

      {/* Bottom View Switchers */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={handleNormalViewToggle}
          className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            isNormalFull
              ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-blue-600" />
          <span>Normal View</span>
        </button>

        <button
          type="button"
          onClick={handleHeatmapToggle}
          className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
            isHeatmapFull
              ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Watermark Heatmap</span>
          </div>

          <div className={`w-8 h-4 rounded-full transition-colors relative p-0.5 ${
            isHeatmapFull ? 'bg-blue-600' : 'bg-slate-300'
          }`}>
            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${
              isHeatmapFull ? 'translate-x-4' : 'translate-x-0'
            }`} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default ForensicSplitViewer;
