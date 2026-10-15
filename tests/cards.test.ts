import { describe, expect, it } from "vitest";
import { cardContent, layoutCards } from "../src/cards";
import type { Feedback } from "../src/feedback";

const comment: Feedback = {
  id: "logo-size",
  category: "logo-size",
  label: "Logo size",
  severity: "panic",
  text: "Make it huge.",
};

describe("canvas card helpers", () => {
  it("marks card names so the plugin can find its own nodes", () => {
    expect(cardContent(comment).name).toContain("Client Simulator");
  });

  it("shows severity and addressed state on the card", () => {
    const open = cardContent(comment);
    const done = cardContent(comment, "addressed");
    expect(open.title).toContain("PANIC");
    expect(open.status).toBe("OPEN");
    expect(done.status).toBe("ADDRESSED");
  });

  it("places cards beside the anchor and keeps them inside the page bounds", () => {
    const positions = layoutCards(2, { x: 800, y: 120, width: 150, height: 80 }, { x: 0, y: 0, width: 1000, height: 900 });
    expect(positions).toEqual([{ x: 456, y: 120 }, { x: 456, y: 316 }]);
  });
});
