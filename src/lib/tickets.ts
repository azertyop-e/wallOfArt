export const TICKET_IDS = [
  "adult",
  "youth",
  "senior",
  "jobseeker",
  "accessibility",
  "child",
  "toddler",
  "group",
] as const;

export type TicketId = (typeof TICKET_IDS)[number];

export type Ticket = {
  id: TicketId;
  label: string;
  detail: string;
  price: number;
  minimum?: number;
};

export const TICKETS: Ticket[] = [
  { id: "adult", label: "Adult", detail: "26 and over", price: 24 },
  { id: "youth", label: "Youth", detail: "12 to 25 years", price: 18 },
  { id: "senior", label: "Senior", detail: "65 and over", price: 18 },
  {
    id: "jobseeker",
    label: "Jobseeker",
    detail: "On proof of status",
    price: 18,
  },
  {
    id: "accessibility",
    label: "Reduced mobility",
    detail: "Companion included",
    price: 18,
  },
  { id: "child", label: "Child", detail: "Under 12", price: 12 },
  { id: "toddler", label: "Toddler", detail: "Under 5", price: 0 },
  {
    id: "group",
    label: "Group",
    detail: "Per person, from 10 people",
    price: 15,
    minimum: 10,
  },
];

export const OPTION_IDS = ["audioGuide", "printedGuide", "map"] as const;

export type OptionId = (typeof OPTION_IDS)[number];

export type TicketOption = {
  id: OptionId;
  label: string;
  detail: string;
  price: number;
};

export const OPTIONS: TicketOption[] = [
  {
    id: "audioGuide",
    label: "Audio guide",
    detail: "Per visitor, eight languages",
    price: 2,
  },
  {
    id: "printedGuide",
    label: "Printed guide",
    detail: "Per visitor, illustrated",
    price: 4,
  },
  {
    id: "map",
    label: "Museum map",
    detail: "Handed out at the front desk",
    price: 0,
  },
];

export type Order = {
  quantities: Record<TicketId, number>;
  options: Record<OptionId, boolean>;
};

export const EMPTY_ORDER: Order = {
  quantities: Object.fromEntries(
    TICKET_IDS.map((id) => [id, 0]),
  ) as Order["quantities"],
  options: Object.fromEntries(
    OPTION_IDS.map((id) => [id, false]),
  ) as Order["options"],
};

export const formatAmount = (amount: number) => `€${amount}`;

export const formatPrice = (price: number) =>
  price === 0 ? "Free" : formatAmount(price);

export const countVisitors = (order: Order) =>
  TICKET_IDS.reduce((total, id) => total + order.quantities[id], 0);

export type SummaryLine = {
  id: string;
  label: string;
  detail: string;
  amount: number;
};

export type OrderSummary = {
  lines: SummaryLine[];
  visitors: number;
  total: number;
};

export function summariseOrder(order: Order): OrderSummary {
  const visitors = countVisitors(order);

  const ticketLines = TICKETS.flatMap<SummaryLine>((ticket) => {
    const quantity = order.quantities[ticket.id];
    if (quantity === 0) return [];

    return {
      id: ticket.id,
      label: ticket.label,
      detail: `${quantity} x ${formatPrice(ticket.price)}`,
      amount: quantity * ticket.price,
    };
  });

  const optionLines =
    visitors === 0
      ? []
      : OPTIONS.flatMap<SummaryLine>((option) => {
          if (!order.options[option.id]) return [];

          return {
            id: option.id,
            label: option.label,
            detail:
              option.price === 0
                ? "Included"
                : `${visitors} x ${formatAmount(option.price)}`,
            amount: visitors * option.price,
          };
        });

  const lines = [...ticketLines, ...optionLines];

  return {
    lines,
    visitors,
    total: lines.reduce((total, line) => total + line.amount, 0),
  };
}
