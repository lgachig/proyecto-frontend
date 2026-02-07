import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Client-side cache for parking data. Persisted to localStorage for offline:
 * UI shows last known data when network fails or on reload without network.
 * Updated when Supabase realtime fires or queries succeed.
 */
export const useParkingStore = create(
  persist(
    (set) => ({
      slots: [],
      zones: [],
      lastSlotsAt: null,
      lastZonesAt: null,

      setSlots: (slots) => set({ slots: slots ?? [], lastSlotsAt: Date.now() }),
      setZones: (zones) => set({ zones: zones ?? [], lastZonesAt: Date.now() }),
      reset: () => set({ slots: [], zones: [], lastSlotsAt: null, lastZonesAt: null }),
    }),
    { name: 'uce-parking-cache' }
  )
);
