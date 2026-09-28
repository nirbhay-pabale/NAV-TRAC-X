import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ChevronUp,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react';

interface SearchMatch {
  pageNumber: number;
  matchIndex: number;
}

interface ViewerSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, caseSensitive: boolean) => void;
  matches: SearchMatch[];
  currentMatchIndex: number;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  isSearching: boolean;
}

export const ViewerSearchOverlay: React.FC<ViewerSearchOverlayProps> = ({
  isOpen,
  onClose,
  onSearch,
  matches,
  currentMatchIndex,
  onNextMatch,
  onPrevMatch,
  isSearching,
}) => {
  const [query, setQuery] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val, false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        onPrevMatch();
      } else {
        onNextMatch();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const totalMatches = matches.length;
  const matchDisplay =
    query.trim() === ''
      ? ''
      : isSearching
      ? 'Searching…'
      : totalMatches > 0
      ? `${currentMatchIndex + 1} of ${totalMatches}`
      : '0 of 0';

  return (
    <div className="absolute top-3 right-4 z-30 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-xl p-1.5 flex items-center gap-1.5 text-xs font-sans animate-fadeIn select-none">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200 w-56 sm:w-64">
        {isSearching ? (
          <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
        ) : (
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Find in document…"
          className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onSearch('', false);
            }}
            className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Match Counter Display */}
      {matchDisplay && (
        <span className="font-mono text-[11px] font-semibold text-slate-600 px-1.5 whitespace-nowrap">
          {matchDisplay}
        </span>
      )}

      {/* Prev / Next Match Controls */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onPrevMatch}
          disabled={totalMatches === 0}
          className="p-1 rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
          title="Previous Match (Shift + Enter)"
          aria-label="Previous match"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onNextMatch}
          disabled={totalMatches === 0}
          className="p-1 rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
          title="Next Match (Enter)"
          aria-label="Next match"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="w-[1px] h-4 bg-slate-200" />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
        title="Close Search (Esc)"
        aria-label="Close search"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
