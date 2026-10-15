import type { Feedback } from "./feedback";

export type Box = { x: number; y: number; width: number; height: number };
export type CardStatus = "open" | "addressed";
export type CardContent = { name: string; title: string; body: string; status: string };

export const CARD_WIDTH = 320;
export const CARD_HEIGHT = 172;
export const CARD_GAP = 24;

export function cardContent(feedback: Feedback, state: CardStatus = "open"): CardContent {
  return {
    name: `Client Simulator · ${feedback.id}`,
    title: `${feedback.severity.toUpperCase()} · ${feedback.label}`,
    body: feedback.text,
    status: state === "addressed" ? "ADDRESSED" : "OPEN",
  };
}

export function layoutCards(count: number, anchor?: Box, page?: Box): Array<{ x: number; y: number }> {
  const startX = anchor ? anchor.x + anchor.width + CARD_GAP : (page?.x || 0) + CARD_GAP;
  const startY = anchor ? anchor.y : (page?.y || 0) + CARD_GAP;
  let x = startX;

  if (page && startX + CARD_WIDTH > page.x + page.width) {
    x = anchor ? anchor.x - CARD_GAP - CARD_WIDTH : page.x + page.width - CARD_WIDTH - CARD_GAP;
  }
  if (page) x = Math.max(page.x + CARD_GAP, Math.min(x, page.x + page.width - CARD_WIDTH - CARD_GAP));

  return Array.from({ length: Math.max(0, count) }, (_, index) => ({
    x,
    y: startY + index * (CARD_HEIGHT + CARD_GAP),
  }));
}
