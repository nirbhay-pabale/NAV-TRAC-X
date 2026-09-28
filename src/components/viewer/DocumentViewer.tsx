import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import {
  Loader2,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  Camera,
  ShieldX
} from 'lucide-react';
import { loadPdfDocument } from '../../utils/pdfWorkerSetup';
import { PageCanvas } from './PageCanvas';
import { ViewerToolbar, type ViewMode } from './ViewerToolbar';
import { ViewerSidebar } from './ViewerSidebar';
import { ViewerSearchOverlay } from './ViewerSearchOverlay';
import { ViewerDetailsDrawer } from './ViewerDetailsDrawer';
import { useScreenLeakDetection } from '../../hooks/useScreenLeakDetection';

export interface DocumentViewerProps {
  file?: File | Blob | string | null;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  classification?: string;
  masterDocId?: string;
  sha3Hash?: string;
  version?: string;
  mode?: 'sender-preview' | 'recipient-secure';
  permissions?: {
    download?: boolean;
    print?: boolean;
    edit?: boolean;
  };
  initialPage?: number;
  onClose?: () => void;
  onFullScreenToggle?: () => void;
  className?: string;
}

interface SearchMatchItem {
  pageNumber: number;
  matchIndex: number;
  textSnippet?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  file = '/Operation_Briefing_Alpha.pdf',
  fileName = 'Operation_Briefing_Alpha.pdf',
  fileType,
  fileSize = '2.4 MB',
  classification = 'SECRET // NOFORN',
  masterDocId = 'IN-DOC-2026-ALPHA-0842',
  sha3Hash = '7e9f3b2a4c6d8e1f0b5a9321c8d7e6f543210987654321abcdef0123456789ab',
  version = 'v1.4 (PQC Signed)',
  mode = 'sender-preview',
  permissions = { download: false, print: false, edit: false },
  initialPage = 1,
  onFullScreenToggle,
  className = '',
}) => {
  // Container & Viewport refs
  const viewerContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // PDF Document State
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState<number>(18);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageDimensions, setPageDimensions] = useState<Record<number, { width: number; height: number }>>({});

  // Loading, Password & Error States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState<number>(10);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [isPasswordRequired, setIsPasswordRequired] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Viewport transformation & options
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>('continuous');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Sidebar, Search & Details Drawer states
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [sampleOverlayActive, setSampleOverlayActive] = useState<boolean>(false);

  // Search indexing state
  const [searchMatches, setSearchMatches] = useState<SearchMatchItem[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [pageTexts, setPageTexts] = useState<Record<number, string>>({});

  // Recipient Security Deterrents: Auto-lock / Idle timer
  const [isAutoLocked, setIsAutoLocked] = useState<boolean>(false);
  const activeBlobUrlRef = useRef<string | null>(null);

  // ── Screen Leak Detection (active on recipient-secure mode) ──
  const isSecureMode = mode === 'recipient-secure';
  const { showLeakAlert, latestEvent, dismissAlert } = useScreenLeakDetection({
    documentId: masterDocId,
    documentName: fileName,
    recipientName: 'Lt. Priya Singh',
    recipientRank: 'Lieutenant',
    recipientUnit: 'INS Visakhapatnam (D66)',
    deviceId: 'HW-HSM-9402',
    sessionId: 'SES-882193',
    enabled: isSecureMode,
  });

  const isViewOnly = !permissions.download && !permissions.print;

  // Resolve Effective File Source & Type
  const isImageFile =
    typeof file === 'string'
      ? /\.(jpe?g|png|webp|gif|svg)$/i.test(file) || file.startsWith('data:image/')
      : file instanceof File
      ? file.type.startsWith('image/')
      : false;

  const isOfficeFile =
    typeof file === 'string'
      ? /\.(docx?|pptx?|xlsx?)$/i.test(file)
      : file instanceof File
      ? /\.(docx?|pptx?|xlsx?)$/i.test(file.name)
      : false;

  // ── 1. LOAD AND INITIALIZE DOCUMENT ──
  const loadDocumentSource = useCallback(
    async (source: File | Blob | string | null, password?: string) => {
      if (!source) {
        setIsLoading(false);
        setPdfDoc(null);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);
        setIsPasswordRequired(false);
        setPasswordError(null);
        setLoadingProgress(25);

        // Office files simulated conversion step
        if (isOfficeFile) {
          setIsConverting(true);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setIsConverting(false);
        }

        setLoadingProgress(50);

        let dataToLoad: string | ArrayBuffer | Uint8Array;

        if (typeof source === 'string') {
          dataToLoad = source;
        } else if (source instanceof File || source instanceof Blob) {
          dataToLoad = await source.arrayBuffer();
        } else {
          throw new Error('Unsupported file format');
        }

        setLoadingProgress(75);

        // Load real PDF via offline worker & cMaps
        const loadedPdf = await loadPdfDocument(dataToLoad, password);
        setPdfDoc(loadedPdf);
        setTotalPages(loadedPdf.numPages);
        setCurrentPage(Math.min(initialPage, loadedPdf.numPages));
        setLoadingProgress(100);
        setIsLoading(false);

        // Extract full text content asynchronously across all pages for in-document search
        const texts: Record<number, string> = {};
        for (let p = 1; p <= loadedPdf.numPages; p++) {
          try {
            const pageObj = await loadedPdf.getPage(p);
            const textContent = await pageObj.getTextContent();
            const textString = textContent.items.map((item: any) => item.str || '').join(' ');
            texts[p] = textString;
          } catch {
            // ignore
          }
        }
        setPageTexts(texts);
      } catch (err: any) {
        setIsLoading(false);
        setIsConverting(false);
        if (err?.name === 'PasswordException') {
          setIsPasswordRequired(true);
          setPasswordError(err.message || 'Password required to decrypt document');
        } else {
          console.error('Document loading error:', err);
          setErrorMessage(err?.message || 'Failed to parse document. The file may be corrupted or unsupported.');
        }
      }
    },
    [initialPage, isOfficeFile]
  );

  useEffect(() => {
    loadDocumentSource(file);

    return () => {
      // Revoke any created blob URLs on unmount for zero-trust memory security
      if (activeBlobUrlRef.current) {
        URL.revokeObjectURL(activeBlobUrlRef.current);
        activeBlobUrlRef.current = null;
      }
    };
  }, [file, loadDocumentSource]);

  // ── 2. FIT WIDTH & FIT PAGE CALCULATIONS ──
  const handleZoomPreset = useCallback((preset: 'fit-width' | 'fit-page') => {
    if (!scrollContainerRef.current) return;
    const containerWidth = scrollContainerRef.current.clientWidth - 48;
    const containerHeight = scrollContainerRef.current.clientHeight - 48;
    const standardPageWidth = 595;
    const standardPageHeight = 842;

    if (preset === 'fit-width') {
      const computedScale = Math.max(0.5, Math.min(2.5, containerWidth / standardPageWidth));
      setZoomScale(Math.round(computedScale * 100) / 100);
    } else {
      const computedScale = Math.max(0.5, Math.min(2.5, containerHeight / standardPageHeight));
      setZoomScale(Math.round(computedScale * 100) / 100);
    }
  }, []);

  // Set initial fit-width
  useEffect(() => {
    if (!isLoading && pdfDoc) {
      handleZoomPreset('fit-width');
    }
  }, [isLoading, !!pdfDoc, handleZoomPreset]);

  // Page Dimension callback
  const handlePageRendered = useCallback((num: number, w: number, h: number) => {
    setPageDimensions((prev) => {
      if (prev[num]?.width === w && prev[num]?.height === h) return prev;
      return { ...prev, [num]: { width: w, height: h } };
    });
  }, []);

  // ── 3. IN-DOCUMENT SEARCH LOGIC ──
  const handleSearch = useCallback(
    (query: string, caseSensitive: boolean) => {
      if (!query.trim()) {
        setSearchMatches([]);
        setCurrentMatchIndex(0);
        return;
      }

      setIsSearching(true);
      const matches: SearchMatchItem[] = [];
      const searchQuery = caseSensitive ? query : query.toLowerCase();

      Object.entries(pageTexts).forEach(([pageNumStr, text]) => {
        const pageNum = parseInt(pageNumStr, 10);
        const searchTarget = caseSensitive ? text : text.toLowerCase();

        let pos = searchTarget.indexOf(searchQuery);
        let matchCountOnPage = 0;
        while (pos !== -1) {
          matches.push({
            pageNumber: pageNum,
            matchIndex: matchCountOnPage,
            textSnippet: text.slice(Math.max(0, pos - 20), pos + query.length + 20),
          });
          matchCountOnPage++;
          pos = searchTarget.indexOf(searchQuery, pos + searchQuery.length);
        }
      });

      setSearchMatches(matches);
      setCurrentMatchIndex(0);
      setIsSearching(false);

      if (matches.length > 0) {
        handleJumpToPage(matches[0].pageNumber);
      }
    },
    [pageTexts]
  );

  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(nextIdx);
    handleJumpToPage(searchMatches[nextIdx].pageNumber);
  };

  const handlePrevMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIndex(prevIdx);
    handleJumpToPage(searchMatches[prevIdx].pageNumber);
  };

  // ── 4. PAGE SCROLL & JUMP SYNCHRONIZATION ──
  const handleJumpToPage = (pageNum: number) => {
    const clamped = Math.max(1, Math.min(totalPages, pageNum));
    setCurrentPage(clamped);

    if (viewMode === 'continuous' && scrollContainerRef.current) {
      const pageEl = scrollContainerRef.current.querySelector(`[data-page-number="${clamped}"]`);
      if (pageEl) {
        pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const scrollRafRef = useRef<number | null>(null);
  const handleScroll = useCallback(() => {
    if (viewMode !== 'continuous' || !scrollContainerRef.current) return;
    if (scrollRafRef.current) return;

    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = null;
      const container = scrollContainerRef.current;
      if (!container) return;

      const pageElements = container.querySelectorAll('[data-page-number]');
      let closestPage = currentPage;
      let minDistance = Infinity;
      const containerCenter = container.scrollTop + container.clientHeight / 3;

      pageElements.forEach((el) => {
        const pageNum = parseInt(el.getAttribute('data-page-number') || '1', 10);
        const htmlEl = el as HTMLElement;
        const elCenter = htmlEl.offsetTop;
        const dist = Math.abs(elCenter - containerCenter);
        if (dist < minDistance) {
          minDistance = dist;
          closestPage = pageNum;
        }
      });

      if (closestPage !== currentPage) {
        setCurrentPage(closestPage);
      }
    });
  }, [viewMode, currentPage]);

  // ── 5. KEYBOARD SHORTCUTS & PERMISSION INTERCEPTORS ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Security intercept: block Print / Save shortcuts in View Only mode
      if (isViewOnly && (e.ctrlKey || e.metaKey)) {
        if (e.key.toLowerCase() === 'p' || e.key.toLowerCase() === 's') {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }

      // Search (Ctrl+F)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      // Zoom In (Ctrl + / =)
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        setZoomScale((z) => Math.min(3.0, Math.round((z + 0.15) * 100) / 100));
        return;
      }

      // Zoom Out (Ctrl -)
      if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        setZoomScale((z) => Math.max(0.5, Math.round((z - 0.15) * 100) / 100));
        return;
      }

      // Zoom Reset (Ctrl 0)
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoomScale(1.0);
        return;
      }

      // Navigation: PageUp / PageDown / Arrow keys
      if (e.key === 'PageDown' || e.key === 'ArrowRight') {
        handleJumpToPage(currentPage + 1);
      } else if (e.key === 'PageUp' || e.key === 'ArrowLeft') {
        handleJumpToPage(currentPage - 1);
      } else if (e.key === 'Home') {
        handleJumpToPage(1);
      } else if (e.key === 'End') {
        handleJumpToPage(totalPages);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, isViewOnly]);

  // ── 6. RECIPIENT SECURITY DETERRENTS: IDLE AUTO-LOCK & TAB VISIBILITY ──
  useEffect(() => {
    if (mode !== 'recipient-secure') return;

    // Tab visibility change auto-lock
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsAutoLocked(true);
      }
    };

    // 5-minute idle auto-lock
    let idleTimer: number;
    const resetIdle = () => {
      window.clearTimeout(idleTimer);
      if (!isAutoLocked) {
        idleTimer = window.setTimeout(() => {
          setIsAutoLocked(true);
        }, 5 * 60 * 1000);
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetIdle, { passive: true }));
    document.addEventListener('visibilitychange', handleVisibilityChange);
    resetIdle();

    return () => {
      window.clearTimeout(idleTimer);
      events.forEach((evt) => window.removeEventListener(evt, resetIdle));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [mode, isAutoLocked]);

  // Password Unlock submit
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim()) {
      loadDocumentSource(file, passwordInput.trim());
    }
  };

  // ── 7. RENDER MAIN VIEWPORT CONTENT ──
  return (
    <div
      ref={viewerContainerRef}
      className={`relative w-full h-full flex flex-col bg-[#F1F5F9] border border-[#E6EAF2] rounded-xl overflow-hidden shadow-sm select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'min-h-[520px] flex-1'
      } ${className}`}
      onContextMenu={(e) => {
        if (isViewOnly && mode === 'recipient-secure') e.preventDefault();
      }}
    >
      {/* ── UNIFIED RESPONSIVE TOOLBAR (SINGLE ROW) ── */}
      <ViewerToolbar
        fileName={fileName}
        classification={classification}
        currentPage={currentPage}
        totalPages={totalPages}
        zoomScale={zoomScale}
        viewMode={viewMode}
        isFullscreen={isFullscreen}
        sidebarOpen={sidebarOpen}
        searchOpen={searchOpen}
        detailsOpen={detailsOpen}
        sampleOverlayActive={sampleOverlayActive}
        mode={mode}
        permissions={permissions}
        onPageChange={handleJumpToPage}
        onZoomChange={(scale) => setZoomScale(scale)}
        onZoomPreset={handleZoomPreset}
        onRotate={() => setRotation((r) => (r + 90) % 360)}
        onViewModeToggle={() => setViewMode((m) => (m === 'continuous' ? 'single' : 'continuous'))}
        onToggleSidebar={() => setSidebarOpen((s) => !s)}
        onToggleSearch={() => setSearchOpen((s) => !s)}
        onToggleDetails={() => setDetailsOpen((d) => !d)}
        onToggleFullscreen={() => {
          setIsFullscreen(!isFullscreen);
          if (onFullScreenToggle) onFullScreenToggle();
        }}
        onToggleSampleOverlay={() => setSampleOverlayActive(!sampleOverlayActive)}
      />

      {/* ── IN-DOCUMENT SEARCH OVERLAY ── */}
      <ViewerSearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSearch={handleSearch}
        matches={searchMatches}
        currentMatchIndex={currentMatchIndex}
        onNextMatch={handleNextMatch}
        onPrevMatch={handlePrevMatch}
        isSearching={isSearching}
      />

      {/* ── MAIN WORKSPACE (SIDEBAR + CANVAS VIEWPORT + DETAILS DRAWER) ── */}
      <div className="relative flex-1 flex overflow-hidden">
        
        {/* Collapsible Thumbnails & Outline Sidebar */}
        <ViewerSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          pdfDoc={pdfDoc}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageSelect={handleJumpToPage}
        />

        {/* Central Document Canvas Viewport */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`flex-1 h-full overflow-auto p-4 sm:p-6 flex flex-col items-center gap-6 bg-[#EBF0F5] transition-all relative ${
            isAutoLocked ? 'filter blur-md pointer-events-none' : ''
          }`}
        >
          {/* STATE A: LOADING PROGRESS */}
          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 max-w-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-blue-600">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Loading Document
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Verifying PQC signatures & loading pages…
                </p>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* STATE B: CONVERTING OFFICE FILE */}
          {isConverting && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 max-w-sm text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 shadow-md flex items-center justify-center text-amber-600">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Converting Document
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rendering Office payload into defense standard PDF format…
                </p>
              </div>
            </div>
          )}

          {/* STATE C: PASSWORD PROTECTED ENCLAVE */}
          {isPasswordRequired && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md w-full">
              <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Password Protected Document
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter the recipient passphrase to unlock cryptographic payload.
                  </p>
                </div>
                {passwordError && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                    {passwordError}
                  </div>
                )}
                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter document passphrase…"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    Unlock & Decrypt
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* STATE D: ERROR / CORRUPTED FILE */}
          {errorMessage && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md w-full">
              <div className="w-full bg-white rounded-2xl border border-red-200 shadow-xl p-6 space-y-3 text-center">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 border border-red-200 mx-auto flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-red-900 uppercase tracking-wider">
                    Unable to Open Document
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">{errorMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => loadDocumentSource('/Operation_Briefing_Alpha.pdf')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer border border-slate-300"
                >
                  Load Default Demo Briefing
                </button>
              </div>
            </div>
          )}

          {/* STATE E: IMAGE FILE RENDERING */}
          {isImageFile && !isLoading && !errorMessage && (
            <div
              className="relative bg-white rounded-lg shadow-md border border-slate-300 p-2 transition-transform duration-150"
              style={{
                transform: `scale(${zoomScale}) rotate(${rotation}deg)`,
                transformOrigin: 'top center',
              }}
            >
              <img
                src={typeof file === 'string' ? file : ''}
                alt={fileName}
                className="max-w-full h-auto rounded-sm block"
              />
            </div>
          )}

          {/* STATE F: REAL PDF MULTI-PAGE RENDERING WITH VIRTUAL WINDOWING */}
          {!isLoading && !errorMessage && !isPasswordRequired && pdfDoc && (
            <>
              {viewMode === 'continuous' ? (
                // Continuous Scroll: windowed page rendering for low memory usage
                Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isVisibleWindow = Math.abs(pageNum - currentPage) <= 2;
                  const estimatedWidth = (pageDimensions[pageNum]?.width || 595) * zoomScale;
                  const estimatedHeight = (pageDimensions[pageNum]?.height || 842) * zoomScale;

                  return (
                    <div key={`page-wrapper-${pageNum}`} className="w-full flex justify-center">
                      {isVisibleWindow ? (
                        <PageCanvas
                          pdfDoc={pdfDoc}
                          pageNumber={pageNum}
                          zoomScale={zoomScale}
                          rotation={rotation}
                          sampleWatermark={sampleOverlayActive}
                          isViewOnly={isViewOnly}
                          onPageRendered={handlePageRendered}
                        />
                      ) : (
                        // Lightweight placeholder card for offscreen pages
                        <div
                          data-page-number={pageNum}
                          className="bg-white shadow-sm border border-slate-200 rounded-sm flex items-center justify-center text-slate-400 font-mono text-xs"
                          style={{
                            width: `${estimatedWidth}px`,
                            height: `${estimatedHeight}px`,
                          }}
                        >
                          Page {pageNum} (Scroll to render)
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                // Single Page Mode: renders only the active page
                <div className="w-full flex justify-center">
                  <PageCanvas
                    pdfDoc={pdfDoc}
                    pageNumber={currentPage}
                    zoomScale={zoomScale}
                    rotation={rotation}
                    sampleWatermark={sampleOverlayActive}
                    isViewOnly={isViewOnly}
                    onPageRendered={handlePageRendered}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Document Details Drawer */}
        <ViewerDetailsDrawer
          isOpen={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          fileName={fileName}
          fileType={fileType}
          fileSize={fileSize}
          totalPages={totalPages}
          classification={classification}
          version={version}
          masterDocId={masterDocId}
          sha3Hash={sha3Hash}
        />
      </div>

      {/* ── AUTO-LOCK SECURITY SCREEN OVERLAY (RECIPIENT SECURE MODE) ── */}
      {isAutoLocked && mode === 'recipient-secure' && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="max-w-sm w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 border border-blue-200 mx-auto flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Session Paused for Security
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Viewer was locked due to inactivity or window change. Cryptographic session is preserved in memory.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAutoLocked(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>Resume Viewing Session</span>
            </button>
            <p className="text-[10px] text-slate-400 font-mono">
              Hardware access actively committed to audit ledger.
            </p>
          </div>
        </div>
      )}
      {/* ── SCREEN LEAK ALERT OVERLAY (flashes when screenshot/recording detected) ── */}
      {showLeakAlert && isSecureMode && (
        <div className="absolute inset-0 z-50 bg-rose-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="max-w-md w-full bg-white rounded-2xl p-6 border-2 border-rose-500 shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 border-2 border-rose-300 mx-auto flex items-center justify-center animate-pulse">
              <ShieldX className="w-7 h-7" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-black uppercase tracking-widest border border-rose-300 mb-2">
                <Camera className="w-3 h-3" />
                SCREEN CAPTURE VIOLATION
              </span>
              <h4 className="text-base font-black text-slate-900 uppercase tracking-wide mt-2">
                ⚠ Document Leak Detected
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                A{' '}
                <strong className="text-rose-700">
                  {latestEvent?.method === 'PRINT_SCREEN'
                    ? 'PrintScreen capture'
                    : latestEvent?.method === 'SCREEN_RECORDING'
                    ? 'screen recording'
                    : 'screenshot'}
                </strong>{' '}
                attempt was detected while viewing this classified document. This incident has been
                automatically logged and a forensic investigation has been initiated.
              </p>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-left space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">User:</span>
                <span className="font-bold text-slate-900">
                  {latestEvent?.recipientRank} {latestEvent?.recipientName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Document:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">
                  {latestEvent?.documentName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Case ID:</span>
                <span className="font-bold text-rose-700">{latestEvent?.investigationId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-bold text-slate-900">{latestEvent?.timestamp}</span>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
              <strong>Policy Breach §8.4:</strong> Unauthorized screen capture of classified material.
              This violation has been reported to the Investigation &amp; Forensic Analysis team.
            </div>

            <button
              type="button"
              onClick={dismissAlert}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              Acknowledge Violation &amp; Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
