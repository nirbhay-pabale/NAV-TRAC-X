import { useState, useEffect, useCallback, useRef } from 'react';

export type ScreenLeakMethod = 'SCREENSHOT' | 'SCREEN_RECORDING' | 'PRINT_SCREEN' | 'WINDOW_CAPTURE';

export interface ScreenLeakEvent {
  id: string;
  method: ScreenLeakMethod;
  timestamp: string;
  timestampZ: string;
  documentId: string;
  documentName: string;
  recipientName: string;
  recipientRank: string;
  recipientUnit: string;
  deviceId: string;
  sessionId: string;
  investigationId: string;
  severity: 'CRITICAL';
  violationType: 'SCREEN_LEAK';
}

interface UseScreenLeakDetectionOptions {
  documentId?: string;
  documentName?: string;
  recipientName?: string;
  recipientRank?: string;
  recipientUnit?: string;
  deviceId?: string;
  sessionId?: string;
  enabled?: boolean;
}

const STORAGE_KEY = 'NAVTRAC_SCREEN_LEAK_EVENTS';

function loadStoredEvents(): ScreenLeakEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: ScreenLeakEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // ignore
  }
}

let _globalLeakEvents: ScreenLeakEvent[] = loadStoredEvents();
const _listeners: Set<() => void> = new Set();

function notifyListeners() {
  _listeners.forEach((fn) => fn());
}

function addLeakEvent(event: ScreenLeakEvent) {
  _globalLeakEvents = [event, ..._globalLeakEvents];
  saveEvents(_globalLeakEvents);
  notifyListeners();
}

export function getStoredLeakEvents(): ScreenLeakEvent[] {
  return _globalLeakEvents;
}

export function clearStoredLeakEvents() {
  _globalLeakEvents = [];
  saveEvents([]);
  notifyListeners();
}

let _invCounter = loadStoredEvents().length + 1;

function generateInvestigationId(): string {
  return `NAVX-SCR-${String(_invCounter++).padStart(4, '0')}`;
}

function nowIST(): string {
  return new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }) + ' IST';
}

function nowZ(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z';
}

// ─────────────────────────────────────────────────────────────
// useScreenLeakDetection Hook
// ─────────────────────────────────────────────────────────────
export function useScreenLeakDetection(options: UseScreenLeakDetectionOptions = {}) {
  const {
    documentId = 'NAV-DOC-2026-0061',
    documentName = 'Carrier_Air_Wing_Sortie_Schedule.pptx',
    recipientName = 'Lt. Priya Singh',
    recipientRank = 'Lieutenant',
    recipientUnit = 'INS Visakhapatnam (D66)',
    deviceId = 'HW-HSM-9402',
    sessionId = 'SES-882193',
    enabled = true,
  } = options;

  const [leakEvents, setLeakEvents] = useState<ScreenLeakEvent[]>(() => loadStoredEvents());
  const [latestEvent, setLatestEvent] = useState<ScreenLeakEvent | null>(null);
  const [showLeakAlert, setShowLeakAlert] = useState(false);
  const cooldownRef = useRef(false);

  // Subscribe to global store changes
  useEffect(() => {
    const handler = () => {
      setLeakEvents([..._globalLeakEvents]);
    };
    _listeners.add(handler);
    return () => {
      _listeners.delete(handler);
    };
  }, []);

  const fireLeakEvent = useCallback(
    (method: ScreenLeakMethod) => {
      if (!enabled || cooldownRef.current) return;

      cooldownRef.current = true;
      setTimeout(() => {
        cooldownRef.current = false;
      }, 3000); // 3s cooldown to prevent event spam

      const event: ScreenLeakEvent = {
        id: `SLEAK-${Date.now()}`,
        method,
        timestamp: nowIST(),
        timestampZ: nowZ(),
        documentId,
        documentName,
        recipientName,
        recipientRank,
        recipientUnit,
        deviceId,
        sessionId,
        investigationId: generateInvestigationId(),
        severity: 'CRITICAL',
        violationType: 'SCREEN_LEAK',
      };

      addLeakEvent(event);
      setLatestEvent(event);
      setShowLeakAlert(true);
    },
    [enabled, documentId, documentName, recipientName, recipientRank, recipientUnit, deviceId, sessionId]
  );

  // ── Detection Strategy 1: PrintScreen / Keyboard ──
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        fireLeakEvent('PRINT_SCREEN');
        return;
      }
      // Ctrl+Shift+S / Ctrl+S (common screenshot shortcuts on Windows)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 's') {
        fireLeakEvent('SCREENSHOT');
        return;
      }
      // Windows Game Bar: Win+Alt+PrtSc or Win+G
      if (e.key === 'G' && e.metaKey && e.altKey) {
        fireLeakEvent('SCREEN_RECORDING');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [enabled, fireLeakEvent]);

  // ── Detection Strategy 2: Screen Capture API (MediaDevices) ──
  useEffect(() => {
    if (!enabled) return;

    const originalGetDisplayMedia = navigator.mediaDevices?.getDisplayMedia?.bind(
      navigator.mediaDevices
    );
    if (!originalGetDisplayMedia) return;

    const patchedGetDisplayMedia = async (constraints?: DisplayMediaStreamOptions) => {
      fireLeakEvent('SCREEN_RECORDING');
      return originalGetDisplayMedia(constraints);
    };

    try {
      (navigator.mediaDevices as any).getDisplayMedia = patchedGetDisplayMedia;
    } catch {
      // may be read-only in some browsers
    }

    return () => {
      try {
        (navigator.mediaDevices as any).getDisplayMedia = originalGetDisplayMedia;
      } catch {
        // ignore
      }
    };
  }, [enabled, fireLeakEvent]);

  // ── Detection Strategy 3: Clipboard image paste ──
  useEffect(() => {
    if (!enabled) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          fireLeakEvent('SCREENSHOT');
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste, true);
    return () => window.removeEventListener('paste', handlePaste, true);
  }, [enabled, fireLeakEvent]);

  // ── Detection Strategy 4: Visibility/blur heuristic ──
  const lastBlurRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleBlur = () => {
      lastBlurRef.current = Date.now();
    };

    const handleFocus = () => {
      if (lastBlurRef.current !== null) {
        const elapsed = Date.now() - lastBlurRef.current;
        if (elapsed > 0 && elapsed < 800) {
          fireLeakEvent('SCREENSHOT');
        }
        lastBlurRef.current = null;
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [enabled, fireLeakEvent]);

  const dismissAlert = useCallback(() => {
    setShowLeakAlert(false);
    setLatestEvent(null);
  }, []);

  return {
    leakEvents,
    latestEvent,
    showLeakAlert,
    dismissAlert,
    fireLeakEvent,
  };
}
