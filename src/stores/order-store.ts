import { create } from "zustand";
import {
  EMPTY_ORDER,
  type OptionId,
  type Order,
  type TicketId,
} from "@/lib/tickets";

type OrderState = Order & {
  booked: boolean;
  setQuantity: (id: TicketId, quantity: number) => void;
  toggleOption: (id: OptionId) => void;
  book: () => void;
  reset: () => void;
};

export const useOrderStore = create<OrderState>()((set) => ({
  ...EMPTY_ORDER,
  booked: false,

  setQuantity: (id, quantity) =>
    set((state) => ({
      quantities: { ...state.quantities, [id]: Math.max(0, quantity) },
      booked: false,
    })),

  toggleOption: (id) =>
    set((state) => ({
      options: { ...state.options, [id]: !state.options[id] },
      booked: false,
    })),

  book: () => set({ booked: true }),

  reset: () => set({ ...EMPTY_ORDER, booked: false }),
}));
