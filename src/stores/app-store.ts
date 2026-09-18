import { create } from "zustand";

type AppState = {
  isFirstRender: boolean;
  completeFirstRender: () => void;
};

export const useAppStore = create<AppState>()((set) => ({
  isFirstRender: true,
  completeFirstRender: () => set({ isFirstRender: false }),
}));
