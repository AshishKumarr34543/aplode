import type { Feedback } from "./feedback";

export type UiCard = { nodeId: string; feedback: Feedback; status: "open" | "addressed" };
export type UiMessage =
  | { type: "generated"; target: "selection" | "page"; cards: Array<{ nodeId: string; feedback: Feedback }> }
  | { type: "error"; message: string }
  | { type: "dismiss" | "address"; nodeId: string };

export function updateCards(cards: UiCard[], message: UiMessage): UiCard[] {
  if (message.type === "generated") {
    return message.cards.map((card) => ({ ...card, status: "open" }));
  }
  if (message.type === "error") return cards;
  if (message.type === "dismiss") return cards.filter((card) => card.nodeId !== message.nodeId);
  return cards.map((card) => card.nodeId === message.nodeId ? { ...card, status: "addressed" } : card);
}
