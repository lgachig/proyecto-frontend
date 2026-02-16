import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useParkingStore = create(
  persist(
    (set, get) => ({
      // ===== STATE =====
      slots: [],
      zones: [],
      lastUpdate: Date.now(),

      // ===== ACTIONS =====
      setSlots: (slots) =>
        set({
          slots: slots ?? [],
          lastUpdate: Date.now(),
        }),

      setZones: (zones) =>
        set({
          zones: zones ?? [],
          lastUpdate: Date.now(),
        }),

      updateSlot: (slot) =>
        set((state) => ({
          slots: state.slots.map((s) =>
            s.id === slot.id ? { ...s, ...slot } : s
          ),
          lastUpdate: Date.now(),
        })),

      addSlot: (slot) =>
        set((state) => ({
          slots: [...state.slots, slot],
          lastUpdate: Date.now(),
        })),

      removeSlot: (id) =>
        set((state) => ({
          slots: state.slots.filter((s) => s.id !== id),
          lastUpdate: Date.now(),
        })),

      touch: () => set({ lastUpdate: Date.now() }),

      reset: () =>
        set({
          slots: [],
          zones: [],
          lastUpdate: Date.now(),
        }),
    }),
    {
      name: 'uce-parking-cache',
    }
  )
);