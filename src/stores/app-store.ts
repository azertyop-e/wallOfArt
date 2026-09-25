import { create } from "zustand";

type AppState = {
  isFirstRender: boolean;
  completeFirstRender: () => void;
  scrollLocks: number;
  lockScroll: () => void;
  unlockScroll: () => void;
};

export const useAppStore = create<AppState>()((set) => ({
  isFirstRender: true,
  completeFirstRender: () => set({ isFirstRender: false }),
  scrollLocks: 0,
  lockScroll: () => set((state) => ({ scrollLocks: state.scrollLocks + 1 })),
  unlockScroll: () =>
    set((state) => ({ scrollLocks: Math.max(0, state.scrollLocks - 1) })),
}));
