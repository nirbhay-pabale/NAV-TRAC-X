import React, { useEffect, useRef, useState, memo } from 'react';
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from 'pdfjs-dist';

interface PageCanvasProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  zoomScale: number; // e.g. 1.0, 1.5, 2.0
  rotation: number; // 0, 90, 180, 270
  sampleWatermark?: boolean;
  sampleOverlay?: boolean;
  isViewOnly?: boolean;
  onPageRendered?: (pageNumber: number, width: number, height: number) => void;
  className?: string;
}

export const PageCanvas: React.FC<PageCanvasProps> = memo(({
  pdfDoc,
  pageNumber,
  zoomScale,
  rotation,
  sampleWatermark = false,
  sampleOverlay = false,
  isViewOnly = false,
  onPageRendered,
  className = '',
}) => {
  const showSampleOverlay = sampleWatermark || sampleOverlay;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 595, height: 842 });
  const [isRendering, setIsRendering] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const activeRenderTaskRef = useRef<RenderTask | null>(null);
  const onPageRenderedRef = useRef(onPageRendered);
  onPageRenderedRef.current = onPageRendered;

  useEffect(() => {
    let isCancelled = false;

    async function renderPage() {
      try {
        setError(null);

        // Cancel previous ongoing render task if any
        if (activeRenderTaskRef.current) {
          try {
            activeRenderTaskRef.current.cancel();
          } catch {
            // ignore cancel exception
          }
          activeRenderTaskRef.current = null;
        }

        const page: PDFPageProxy = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        // Calculate viewport
        const viewport = page.getViewport({ scale: zoomScale, rotation });
        const width = viewport.width;
        const height = viewport.height;
        setDimensions({ width, height });

        if (onPageRenderedRef.current) {
          onPageRenderedRef.current(pageNumber, width, height);
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Use devicePixelRatio for razor-sharp text rendering on HiDPI/Retina
        const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${Math.floor(width)}px`;
        canvas.style.height = `${Math.floor(height)}px`;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        // Clear and scale context for DPR
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas,
          intent: 'display',
        };

        const renderTask = page.render(renderContext as any);
        activeRenderTaskRef.current = renderTask;

        await renderTask.promise;
        if (!isCancelled) {
          setIsRendering(false);
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException' && !isCancelled) {
          console.error(`Error rendering page ${pageNumber}:`, err);
          setError(err.message || 'Page rendering failed');
          setIsRendering(false);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (activeRenderTaskRef.current) {
        try {
          activeRenderTaskRef.current.cancel();
        } catch {
          // ignore
        }
        activeRenderTaskRef.current = null;
      }
    };
  }, [pdfDoc, pageNumber, zoomScale, rotation]);

  return (
    <div
      className={`relative mx-auto bg-white shadow-md border border-slate-300 rounded-sm transition-all duration-150 ${
        isViewOnly ? 'select-none pointer-events-none' : ''
      } ${className}`}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}
      data-page-number={pageNumber}
    >
      {/* Canvas Element */}
      <canvas ref={canvasRef} className="block w-full h-full rounded-sm" />

      {/* Loading Skeleton Indicator */}
      {isRendering && (
        <div className="absolute inset-0 bg-white/75 backdrop-blur-2xs flex items-center justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 text-white text-xs font-mono shadow-md">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>Rendering Page {pageNumber}…</span>
          </div>
        </div>
      )}

      {/* Error Fallback */}
      {error && (
        <div className="absolute inset-0 bg-red-50/90 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-xs font-bold text-red-700">Failed to render page {pageNumber}</p>
          <p className="text-[10px] text-red-500 font-mono mt-1">{error}</p>
        </div>
      )}

      {/* Optional Fixed Sample Overlay (No real names or fingerprint IDs) */}
      {showSampleOverlay && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center select-none overflow-hidden">
          <span className="text-slate-900/10 text-6xl md:text-7xl font-black uppercase tracking-widest rotate-[-35deg] border-4 border-slate-900/10 px-8 py-2 rounded-xl">
            PREVIEW ONLY
          </span>
        </div>
      )}
    </div>
  );
});

PageCanvas.displayName = 'PageCanvas';
