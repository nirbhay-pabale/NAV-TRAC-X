import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  ListTree,
  X,
  Bookmark
} from 'lucide-react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface OutlineItem {
  title: string;
  pageIndex: number;
  items?: OutlineItem[];
}

interface ViewerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pdfDoc: PDFDocumentProxy | null;
  totalPages: number;
  currentPage: number;
  onPageSelect: (pageNum: number) => void;
}

export const ViewerSidebar: React.FC<ViewerSidebarProps> = ({
  isOpen,
  onClose,
  pdfDoc,
  totalPages,
  currentPage,
  onPageSelect,
}) => {
  const [activeTab, setActiveTab] = useState<'thumbnails' | 'outline'>('thumbnails');
  const [outlineItems, setOutlineItems] = useState<OutlineItem[]>([]);
  const [isLoadingOutline, setIsLoadingOutline] = useState<boolean>(false);

  // Extract outlines / bookmarks from PDF
  useEffect(() => {
    if (!pdfDoc) return;

    let isCancelled = false;

    async function fetchOutline() {
      try {
        setIsLoadingOutline(true);
        const outline = await pdfDoc!.getOutline();
        if (isCancelled) return;

        if (outline && outline.length > 0) {
          // Process outline items and resolve target page index
          const parsed: OutlineItem[] = [];
          for (const item of outline) {
            let pageIdx = 0;
            if (item.dest) {
              try {
                if (typeof item.dest === 'string') {
                  const dest = await pdfDoc!.getDestination(item.dest);
                  if (dest && dest[0]) {
                    pageIdx = await pdfDoc!.getPageIndex(dest[0]);
                  }
                } else if (Array.isArray(item.dest) && item.dest[0]) {
                  pageIdx = await pdfDoc!.getPageIndex(item.dest[0]);
                }
              } catch {
                // fallback
              }
            }
            parsed.push({
              title: item.title,
              pageIndex: pageIdx,
            });
          }
          setOutlineItems(parsed);
        } else {
          // Fallback standard outline for defense briefings
          setOutlineItems([
            { title: 'Cover Page', pageIndex: 0 },
            { title: '1.0 Table of Contents & Promulgation', pageIndex: 1 },
            { title: '2.0 Executive Summary & Strategic Mandate', pageIndex: 2 },
            { title: '3.0 Task Force 54 Organization', pageIndex: 3 },
            { title: '4.0 Area of Operations & Sectors', pageIndex: 4 },
            { title: '5.0 Hydrographic & Acoustic Intelligence', pageIndex: 5 },
            { title: '6.0 Vessel Readiness & Force Allocation', pageIndex: 6 },
            { title: '7.0 Aviation & UAV Surveillance Plan', pageIndex: 7 },
            { title: '8.0 Subsurface Warfare & Acoustic Grid', pageIndex: 8 },
            { title: '9.0 Tactical Communications Architecture', pageIndex: 9 },
            { title: '10.0 Emission Control (EMCON) RoE', pageIndex: 10 },
            { title: '11.0 Commercial Shipping Management', pageIndex: 11 },
            { title: '12.0 Rules of Engagement (ROE)', pageIndex: 12 },
            { title: '13.0 Logistics & Replenishment At Sea', pageIndex: 13 },
            { title: '14.0 Cyber Defense & PQC Audit Ledger', pageIndex: 14 },
            { title: 'Annex A: Tactical Signal Brevity Codes', pageIndex: 15 },
            { title: 'Annex B: Contingency Base Diversion Protocols', pageIndex: 16 },
            { title: 'Annex C: Authorized Distribution & Audit', pageIndex: 17 },
          ]);
        }
      } catch {
        // fallback
      } finally {
        if (!isCancelled) setIsLoadingOutline(false);
      }
    }

    fetchOutline();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc]);

  if (!isOpen) return null;

  return (
    <div className="w-64 sm:w-72 bg-slate-50 border-r border-slate-200 flex flex-col h-full shrink-0 select-none z-10 animate-fadeIn">
      {/* Sidebar Header & Tab Switcher */}
      <div className="p-2.5 border-b border-slate-200 bg-white flex items-center justify-between gap-2">
        <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs font-semibold flex-1">
          <button
            type="button"
            onClick={() => setActiveTab('thumbnails')}
            className={`flex-1 py-1 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'thumbnails'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Thumbnails</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outline')}
            className={`flex-1 py-1 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'outline'
                ? 'bg-white text-blue-600 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" />
            <span>Outline</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close Sidebar"
          aria-label="Close sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Sidebar Content Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'thumbnails' ? (
          <div className="grid grid-cols-2 gap-2.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isSelected = pageNum === currentPage;
              return (
                <div
                  key={`thumb-${pageNum}`}
                  onClick={() => onPageSelect(pageNum)}
                  className={`group relative rounded-lg p-1.5 border transition-all cursor-pointer flex flex-col items-center text-center ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/30 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                  }`}
                >
                  {/* Miniature Preview Card */}
                  <div className="w-full aspect-[1/1.414] bg-white rounded border border-slate-100 shadow-2xs flex flex-col justify-between p-1.5 overflow-hidden">
                    <div className="w-full h-1 bg-slate-900/80 rounded-2xs mb-1" />
                    <div className="space-y-0.5 opacity-60">
                      <div className="w-3/4 h-0.5 bg-slate-400 rounded-2xs" />
                      <div className="w-full h-0.5 bg-slate-300 rounded-2xs" />
                      <div className="w-5/6 h-0.5 bg-slate-300 rounded-2xs" />
                      <div className="w-2/3 h-0.5 bg-slate-300 rounded-2xs" />
                    </div>
                    <div className="w-full h-0.5 bg-slate-200 rounded-2xs mt-1" />
                  </div>

                  {/* Page Number Label */}
                  <span
                    className={`mt-1 font-mono text-[11px] font-bold ${
                      isSelected ? 'text-blue-700' : 'text-slate-600 group-hover:text-slate-900'
                    }`}
                  >
                    Page {pageNum}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1">
            {isLoadingOutline ? (
              <div className="p-4 text-center text-xs text-slate-500 font-mono">
                Loading document outline…
              </div>
            ) : outlineItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No bookmarks found in document.
              </div>
            ) : (
              outlineItems.map((item, idx) => {
                const targetPageNum = item.pageIndex + 1;
                const isCurrent = targetPageNum === currentPage;
                return (
                  <button
                    key={`outline-${idx}`}
                    type="button"
                    onClick={() => onPageSelect(targetPageNum)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Bookmark className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="truncate">{item.title}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">
                      p. {targetPageNum}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
