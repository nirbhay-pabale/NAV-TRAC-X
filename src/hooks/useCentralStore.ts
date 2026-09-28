import { useSyncExternalStore, useRef, useCallback } from 'react';
import { centralStore } from '../data/centralStore';
import type { CentralStoreState } from '../data/centralStore';

export function useCentralStore<T>(selector: (state: CentralStoreState) => T): T {
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const lastStateRef = useRef<CentralStoreState | null>(null);
  const lastValueRef = useRef<T | null>(null);

  const getSnapshot = useCallback(() => {
    const currentState = centralStore.getState();
    if (currentState === lastStateRef.current && lastValueRef.current !== null) {
      return lastValueRef.current;
    }
    const nextVal = selectorRef.current(currentState);
    lastStateRef.current = currentState;
    lastValueRef.current = nextVal;
    return nextVal;
  }, []);

  return useSyncExternalStore(
    centralStore.subscribe.bind(centralStore),
    getSnapshot,
    getSnapshot
  );
}
