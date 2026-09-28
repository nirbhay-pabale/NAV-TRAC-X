import React, { useState } from 'react';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCw,
  Search,
  Sidebar as SidebarIcon,
  Info,
  Download,
  Printer,
  MoreHorizontal,
  Scroll,
  Sparkles,
  Lock
} from 'lucide-react';

export type ViewMode = 'continuous' | 'single';
export type ZoomPreset = 'fit-width' | 'fit-page' | number;

interface ViewerToolbarProps {
  fileName: string;
  classification?: string;
  currentPage: number;
  totalPages: number;
  zoomScale: number;
  viewMode: ViewMode;
  isFullscreen: boolean;
  sidebarOpen: boolean;
  searchOpen: boolean;
  detailsOpen: boolean;
  sampleOverlayActive: boolean;
  mode: 'sender-preview' | 'recipient-secure';
  permissions: {
    download?: boolean;
    print?: boolean;
    edit?: boolean;
  };
  onPageChange: (newPage: number) => void;
  onZoomChange: (newScale: number) => void;
  onZoomPreset: (preset: 'fit-width' | 'fit-page') => void;
  onRotate: () => void;
  onViewModeToggle: () => void;
  onToggleSidebar: () => void;
  onToggleSearch: () => void;
  onToggleDetails: () => void;
  onToggleFullscreen: () => void;
  onToggleSampleOverlay?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
}

export const ViewerToolbar: React.FC<ViewerToolbarProps> = ({
  fileName,
  currentPage,
  totalPages,
  zoomScale,
  viewMode,
  isFullscreen,
  sidebarOpen,
  searchOpen,
  detailsOpen,
  sampleOverlayActive,
  mode,
  permissions,
  onPageChange,
  onZoomChange,
  onZoomPreset,
  onRotate,
  onViewModeToggle,
  onToggleSidebar,
  onToggleSearch,
  onToggleDetails,
  onToggleFullscreen,
  onToggleSampleOverlay,
  onDownload,
  onPrint,
}) => {
  const [pageInput, setPageInput] = useState<string>(String(currentPage));
  const [showZoomMenu, setShowZoomMenu] = useState<boolean>(false);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);

  // Sync page input when external page changes
  React.useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(pageInput, 10);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      onPageChange(val);
    } else {
      setPageInput(String(currentPage));
    }
  };

  const zoomPercent = Math.round(zoomScale * 100);

  const zoomOptions = [
    { label: 'Fit Width', action: () => onZoomPreset('fit-width') },
    { label: 'Fit Page', action: () => onZoomPreset('fit-page') },
    { label: '50%', action: () => onZoomChange(0.5) },
    { label: '75%', action: () => onZoomChange(0.75) },
    { label: '100%', action: () => onZoomChange(1.0) },
    { label: '125%', action: () => onZoomChange(1.25) },
    { label: '150%', action: () => onZoomChange(1.5) },
    { label: '200%', action: () => onZoomChange(2.0) },
    { label: '300%', action: () => onZoomChange(3.0) },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200 px-3 py-2 flex flex-nowrap items-center justify-between gap-2 select-none z-20 shrink-0 whitespace-nowrap">
      
      {/* ── LEFT SECTION: FILE CHIP & SIDEBAR TOGGLE ── */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink overflow-hidden">
        {/* Sidebar Toggle Button */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            sidebarOpen
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
          title="Toggle Thumbnails & Outline Sidebar"
          aria-label="Toggle sidebar"
        >
          <SidebarIcon className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Sidebar</span>
        </button>

        {/* File Name Tag */}
        <div className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-mono text-[11px] max-w-[110px] sm:max-w-[150px] md:max-w-[200px] truncate shrink">
          <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate font-semibold">{fileName}</span>
        </div>

        {/* Mode / Protection Chip */}
        {mode === 'sender-preview' ? (
          <>
            <span className="hidden 2xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Invisible forensic marking: ON
            </span>
            <span className="hidden xl:inline-flex 2xl:hidden items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 whitespace-nowrap" title="Invisible forensic marking: ON">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Forensic Marking: ON
            </span>
          </>
        ) : (
          <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold font-mono bg-blue-50 text-blue-700 border border-blue-200 shrink-0 whitespace-nowrap">
            <Lock className="w-3 h-3 text-blue-600" />
            Zero-Trust Enclave
          </span>
        )}
      </div>

      {/* ── CENTER SECTION: PAGE NAVIGATION BOX ── */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="flex items-center h-8 px-1 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 shadow-2xs">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="w-7 h-7 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Previous Page (PageUp / Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center px-1">
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={handlePageInputSubmit}
              className="w-9 h-6 text-center font-mono font-bold text-xs bg-white rounded border border-slate-300 focus:outline-none focus:border-blue-500 text-slate-900"
              aria-label="Current page number"
            />
            <span className="px-1.5 text-slate-500 text-[11px] font-medium">/ {totalPages}</span>
          </form>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="w-7 h-7 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Next Page (PageDown / Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── RIGHT SECTION: ZOOM, SEARCH, ROTATE, DETAILS, FULLSCREEN ── */}
      <div className="flex items-center gap-1.5 shrink-0">
        
        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center h-8 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 relative">
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(0.5, Math.round((zoomScale - 0.15) * 100) / 100))}
            disabled={zoomScale <= 0.5}
            aria-label="Zoom out"
            className="w-7 h-7 rounded-l hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Zoom Out (Ctrl -)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Zoom % dropdown trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowZoomMenu(!showZoomMenu)}
              className="px-2 h-7 font-mono text-[11px] font-bold text-slate-700 hover:bg-slate-200 flex items-center transition-colors cursor-pointer"
              title="Select Zoom Preset"
              aria-label="Zoom percentage"
            >
              {zoomPercent}%
            </button>

            {showZoomMenu && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl border border-slate-200 shadow-xl p-1 z-50 text-xs animate-fadeIn">
                {zoomOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      opt.action();
                      setShowZoomMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 font-medium text-[11px] cursor-pointer"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onZoomChange(Math.min(3.0, Math.round((zoomScale + 0.15) * 100) / 100))}
            disabled={zoomScale >= 3.0}
            aria-label="Zoom in"
            className="w-7 h-7 rounded-r hover:bg-slate-200 disabled:opacity-30 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Zoom In (Ctrl +)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* View Mode Toggle (Continuous Scroll vs. Single Page) */}
        <button
          type="button"
          onClick={onViewModeToggle}
          className={`h-8 w-8 rounded-lg border hidden lg:flex items-center justify-center transition-colors cursor-pointer ${
            viewMode === 'continuous'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
          title={viewMode === 'continuous' ? 'Switch to Single Page Mode' : 'Switch to Continuous Scroll'}
          aria-label="Toggle view mode"
        >
          <Scroll className="w-3.5 h-3.5" />
        </button>

        {/* In-Document Search Button */}
        <button
          type="button"
          onClick={onToggleSearch}
          className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
            searchOpen
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
          title="Search in Document (Ctrl + F)"
          aria-label="Search inside document"
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Rotate 90° Button */}
        <button
          type="button"
          onClick={onRotate}
          className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 hidden md:flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          title="Rotate 90° Clockwise"
          aria-label="Rotate document"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* Document Details Toggle */}
        <button
          type="button"
          onClick={onToggleDetails}
          className={`h-8 w-8 rounded-lg border hidden sm:flex items-center justify-center transition-colors cursor-pointer ${
            detailsOpen
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
          title="Document Metadata & Cryptographic Details"
          aria-label="View document details"
        >
          <Info className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Preview'}
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-blue-600" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Optional Download button if permitted */}
        {permissions.download && onDownload && (
          <button
            type="button"
            onClick={onDownload}
            className="h-8 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs hidden lg:flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="Download Document"
            aria-label="Download document"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        )}

        {/* Optional Print button if permitted */}
        {permissions.print && onPrint && (
          <button
            type="button"
            onClick={onPrint}
            className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs hidden lg:flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-300"
            title="Print Document"
            aria-label="Print document"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        )}

        {/* More Actions Menu for Narrow Screens & Extra Options */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="More Actions"
            aria-label="More actions menu"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50 text-xs space-y-0.5 animate-fadeIn">
              <button
                type="button"
                onClick={() => {
                  onRotate();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-left font-medium cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Rotate 90° Clockwise</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onViewModeToggle();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-left font-medium cursor-pointer"
              >
                <Scroll className="w-3.5 h-3.5 text-slate-500" />
                <span>{viewMode === 'continuous' ? 'Single Page Mode' : 'Continuous Scroll Mode'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onToggleDetails();
                  setShowMoreMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-left font-medium cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Document Details & Hashes</span>
              </button>

              {onToggleSampleOverlay && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleSampleOverlay();
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-left font-medium cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sample Stamp Overlay</span>
                  </span>
                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${sampleOverlayActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                    {sampleOverlayActive ? 'ON' : 'OFF'}
                  </span>
                </button>
              )}

              {permissions.download && onDownload && (
                <button
                  type="button"
                  onClick={() => {
                    onDownload();
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-left font-medium cursor-pointer border-t border-slate-100 mt-1 pt-1"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download File</span>
                </button>
              )}

              {permissions.print && onPrint && (
                <button
                  type="button"
                  onClick={() => {
                    onPrint();
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 text-left font-medium cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>Print Document</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
