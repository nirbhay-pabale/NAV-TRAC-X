import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Maximize2, 
  Download, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Flame, 
  Check, 
  ChevronDown, 
  Layers, 
  Sparkles, 
  X,
  FileText
} from 'lucide-react';
import type { CaptureTransformations } from '../../api/forensicApi';

interface HotRegion {
  x: number;
  y: number;
  w: number;
  h: number;
  fragment_id: string;
  layer: string;
  confidence: number;
  bits_recovered: string;
}

interface SplitCompareViewerProps {
  filename: string;
  fileUrl?: string;
  heatmapUrl?: string;
  processedUrl?: string;
  spectralUrl?: string;
  fingerprintUrl?: string;
  fileType?: string;
  transformations?: CaptureTransformations | null;
  hotRegions?: HotRegion[];
  onOpenLightbox?: () => void;
}

const SplitCompareViewerComponent: React.FC<SplitCompareViewerProps> = ({
  filename,
  fileUrl,
  heatmapUrl,
  processedUrl,
  spectralUrl,
  fingerprintUrl: _fingerprintUrl,
  fileType: _fileType = 'image/jpeg',
  transformations,
  hotRegions = [],
  onOpenLightbox,
}) => {
  const [splitPos, setSplitPos] = useState<number>(50); // 0 = full original, 100 = full heatmap
  const [isDraggingDivider, setIsDraggingDivider] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [overlayOpacity, setOverlayOpacity] = useState<number>(90);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [selectedHotRegion, setSelectedHotRegion] = useState<HotRegion | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const transformBoxRef = useRef<HTMLDivElement>(null);

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 10 : -10;
    setZoomLevel((prev) => Math.min(300, Math.max(40, prev + delta)));
  };

  // Drag to pan handlers
  const handleMouseDownPan = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    // only pan if not clicking divider
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMovePan = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUpPan = () => {
    setIsPanning(false);
  };

  // Draggable divider calculation
  const calculateSplit = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    setSplitPos(Math.round(pct));
  }, []);

  const handleDividerPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingDivider(true);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDraggingDivider) {
        calculateSplit(e.clientX);
      }
    };
    const handlePointerUp = () => {
      if (isDraggingDivider) {
        setIsDraggingDivider(false);
      }
    };

    if (isDraggingDivider) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingDivider, calculateSplit]);

  // Keyboard divider controls
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSplitPos((p) => Math.max(0, p - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSplitPos((p) => Math.min(100, p + 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSplitPos(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSplitPos(100);
    }
  };

  const handleFit = () => {
    setZoomLevel(100);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  const triggerDownload = (url: string, name: string) => {
    setShowDownloadMenu(false);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadToast(`Downloaded ${name}`);
    setTimeout(() => setDownloadToast(null), 2500);
  };

  const isNormalActive = splitPos === 0;
  const isHeatmapActive = splitPos === 100;

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col justify-between space-y-3">
      {/* Header & Action Toolbar */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center font-mono">
              2
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Document View & Steganographic Analysis
              </h2>
              <p className="text-[11px] text-slate-500">
                Co-registered DWT-DCT spatial heatmap overlay & transformation diagnostics
              </p>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-800 text-[11px] font-semibold truncate max-w-[150px]">
              {filename}
            </span>

            {/* Normal vs Heatmap Toggle Buttons */}
            <div className="flex items-center bg-white border border-slate-200 rounded-md p-0.5 shadow-2xs text-[10px] font-semibold">
              <button
                type="button"
                onClick={() => setSplitPos(0)}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  isNormalActive ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View full original artifact"
              >
                Normal View
              </button>
              <button
                type="button"
                onClick={() => setSplitPos(50)}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  splitPos > 0 && splitPos < 100 ? 'bg-blue-100 text-blue-800' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Split reveal comparison"
              >
                Split ({splitPos}%)
              </button>
              <button
                type="button"
                onClick={() => setSplitPos(100)}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  isHeatmapActive ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View full watermark heatmap"
              >
                Watermark Heatmap
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Opacity Slider for Overlay */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2 py-0.5 text-[10px] font-mono shadow-2xs">
              <span className="text-slate-400">Overlay:</span>
              <input
                type="range"
                min="10"
                max="100"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                title={`Overlay opacity: ${overlayOpacity}%`}
              />
              <span className="text-blue-700 font-bold">{overlayOpacity}%</span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-[11px] font-mono shadow-2xs">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(40, z - 10))}
                className="w-5 h-5 text-slate-500 hover:text-slate-900 flex items-center justify-center rounded cursor-pointer"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-3 h-3" />
              </button>

              <select
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="px-1 text-blue-700 font-bold bg-transparent border-0 cursor-pointer text-[10px] focus:outline-none"
              >
                <option value={50}>50%</option>
                <option value={75}>75%</option>
                <option value={100}>100%</option>
                <option value={150}>150%</option>
                <option value={200}>200%</option>
              </select>

              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(300, z + 10))}
                className="w-5 h-5 text-slate-500 hover:text-slate-900 flex items-center justify-center rounded cursor-pointer"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-3 h-3" />
              </button>
            </div>

            {/* Fit / Reset */}
            <button
              type="button"
              onClick={handleFit}
              className="px-2 py-1 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-semibold transition-colors shadow-2xs cursor-pointer"
              title="Fit to view and reset pan"
            >
              Fit
            </button>

            {/* Rotate Button */}
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="w-7 h-7 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              title="Rotate 90 degrees"
              aria-label="Rotate"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Lightbox / Fullscreen */}
            <button
              type="button"
              onClick={onOpenLightbox}
              className="w-7 h-7 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              title="Fullscreen Gallery & Lightbox"
              aria-label="Open Fullscreen Lightbox"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Download Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                className="h-7 px-2 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center gap-1 text-[10px] font-semibold transition-colors shadow-2xs cursor-pointer"
                title="Download artifact or forensic matrix"
              >
                <Download className="w-3.5 h-3.5" />
                <ChevronDown className="w-2.5 h-2.5" />
              </button>

              {showDownloadMenu && (
                <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white border border-slate-200 shadow-xl p-1 z-50 text-[11px] animate-fadeIn">
                  <div className="px-2 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Download Evidence Images
                  </div>
                  {fileUrl && (
                    <button
                      type="button"
                      onClick={() => triggerDownload(fileUrl, filename || 'original_artifact.jpg')}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Original Artifact</span>
                    </button>
                  )}
                  {processedUrl && (
                    <button
                      type="button"
                      onClick={() => triggerDownload(processedUrl, 'processed_matrix.png')}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-600" />
                      <span>Processed Matrix</span>
                    </button>
                  )}
                  {heatmapUrl && (
                    <button
                      type="button"
                      onClick={() => triggerDownload(heatmapUrl, 'watermark_heatmap.png')}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer flex items-center gap-1.5"
                    >
                      <Flame className="w-3.5 h-3.5 text-amber-600" />
                      <span>Heatmap PNG</span>
                    </button>
                  )}
                  {spectralUrl && (
                    <button
                      type="button"
                      onClick={() => triggerDownload(spectralUrl, 'spectral_fft_magnitude.png')}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Spectral (FFT) Magnitude</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Split-Reveal Transformed Viewer Container */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDownPan}
        onMouseMove={handleMouseMovePan}
        onMouseUp={handleMouseUpPan}
        onMouseLeave={handleMouseUpPan}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-label="Forensic image split reveal viewer. Use arrow keys to adjust divider."
        aria-valuenow={splitPos}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-inner select-none focus:outline-none ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Unified Transformed Space for Both Original & Heatmap */}
        <div
          ref={transformBoxRef}
          className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          {/* Base Layer: Real Uploaded Artifact File */}
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            {fileUrl ? (
              <img
                src={fileUrl}
                alt={filename}
                className="max-w-full max-h-full object-contain pointer-events-auto"
                draggable={false}
              />
            ) : (
              <div className="w-96 h-64 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-400 font-mono text-xs gap-2">
                <FileText className="w-8 h-8 text-slate-500" />
                <span>No artifact file loaded</span>
              </div>
            )}

            {/* Overlay Layer: Real Steganographic Heatmap Aligned in Same Coordinate Container */}
            {heatmapUrl && (
              <div
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{
                  clipPath: `inset(0 0 0 ${splitPos}%)`,
                  opacity: overlayOpacity / 100,
                  transition: isDraggingDivider ? 'none' : 'clip-path 0.05s ease-out'
                }}
              >
                <img
                  src={heatmapUrl}
                  alt="Steganographic Watermark Heatmap"
                  className="w-full h-full object-contain mix-blend-screen"
                  draggable={false}
                />
              </div>
            )}

            {/* Clickable Hot Regions (from backend DWT blocks) */}
            {hotRegions && hotRegions.length > 0 && (
              <div className="absolute inset-0 w-full h-full pointer-events-auto">
                {hotRegions.map((region, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHotRegion(region);
                    }}
                    style={{
                      left: `${region.x}%`,
                      top: `${region.y}%`,
                      width: `${region.w}%`,
                      height: `${region.h}%`,
                    }}
                    className="absolute border border-emerald-400 bg-emerald-500/20 hover:bg-emerald-400/40 rounded-xs transition-colors cursor-pointer"
                    title={`Fragment: ${region.fragment_id} (${region.confidence}% confidence)`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Draggable Divider Line */}
        <div
          style={{ left: `${splitPos}%` }}
          onPointerDown={handleDividerPointerDown}
          className="absolute top-0 bottom-0 w-1 bg-white/90 shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize z-20 flex items-center justify-center hover:w-1.5 transition-all"
        >
          <div className="w-6 h-6 rounded-full bg-white shadow-md border border-slate-300 flex items-center justify-center text-slate-700 text-[10px] font-bold select-none cursor-ew-resize">
            &harr;
          </div>
        </div>

        {/* Hot Region Popover */}
        {selectedHotRegion && (
          <div className="absolute top-4 left-4 z-30 p-3 rounded-lg bg-slate-900/95 border border-slate-700 text-white shadow-xl text-xs space-y-1.5 max-w-xs animate-fadeIn backdrop-blur-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="font-bold text-emerald-400 font-mono">
                {selectedHotRegion.fragment_id}
              </span>
              <button
                type="button"
                onClick={() => setSelectedHotRegion(null)}
                className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-[11px] text-slate-300">
              Layer: <span className="font-semibold text-white">{selectedHotRegion.layer}</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Confidence: <span className="font-bold text-emerald-400">{selectedHotRegion.confidence}%</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Bits recovered: {selectedHotRegion.bits_recovered}
            </div>
          </div>
        )}

        {/* Download Toast Notification */}
        {downloadToast && (
          <div className="absolute bottom-3 right-3 z-30 bg-white/95 border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 text-xs font-semibold animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{downloadToast}</span>
          </div>
        )}
      </div>

      {/* Detected Transformation Diagnostics Chips */}
      <div className="border-t border-slate-100 pt-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span>Physical Transformations & Exfiltration Classifier:</span>
            <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Computed
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            OpenCV Laplacian & 2D FFT Analysis
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {transformations ? (
            <>
              {/* Primary Capture Method */}
              <div className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center gap-1.5">
                <span className="text-slate-500 font-normal">Method:</span>
                <span className="font-bold">{transformations.primary_capture_method}</span>
                <span className="text-[10px] font-mono text-blue-700">
                  ({transformations.method_confidence}%)
                </span>
              </div>

              {/* JPEG Quality */}
              {transformations.jpeg_quality_estimate && (
                <div className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono">
                  JPEG q&approx;{transformations.jpeg_quality_estimate}
                </div>
              )}

              {/* Crop Percentage */}
              <div className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono">
                {transformations.crop_percentage && transformations.crop_percentage > 0
                  ? `Crop ${transformations.crop_percentage}%`
                  : 'Crop: None (0%)'}
              </div>

              {/* Perspective Skew */}
              <div className={`px-2 py-1 rounded-lg border text-xs font-mono ${
                transformations.perspective_skew_detected
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                {transformations.perspective_skew_detected ? 'Perspective Skew: Detected' : 'Perspective: Planar'}
              </div>

              {/* Moiré Detection */}
              <div className={`px-2 py-1 rounded-lg border text-xs font-mono ${
                (transformations.moire_fft_peaks || 0) > 0
                  ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}>
                {(transformations.moire_fft_peaks || 0) > 0
                  ? `Moiré: Detected (${transformations.moire_fft_peaks} FFT Peaks)`
                  : 'Moiré: Negative'}
              </div>

              {/* Blur Laplacian Variance */}
              {transformations.blur_laplacian_var !== undefined && (
                <div className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono">
                  Blur &sigma;&sup2;={transformations.blur_laplacian_var.toFixed(1)}
                </div>
              )}
            </>
          ) : (
            <div className="text-[11px] text-slate-400 italic">
              Run forensic analysis to compute exfiltration capture method and image compression artifacts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const SplitCompareViewer = React.memo(SplitCompareViewerComponent);
export default SplitCompareViewer;
