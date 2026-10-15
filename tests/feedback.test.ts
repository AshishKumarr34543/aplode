import { describe, expect, it } from "vitest";
import { categories, makeFeedback } from "../src/feedback";

const sampleNodes = [{ id: "12", name: "Acme Logo", type: "VECTOR" }];

describe("client feedback", () => {
  it("has at least ten separate categories", () => {
    expect(new Set(categories.map((item) => item.id)).size).toBeGreaterThanOrEqual(10);
  });

  it("makes ten comments with different categories and valid severity", () => {
    const comments = makeFeedback(sampleNodes, () => 0.37);
    expect(comments).toHaveLength(10);
    expect(new Set(comments.map((item) => item.category)).size).toBe(10);
    expect(comments.every((item) => ["nitpick", "change request", "panic"].includes(item.severity))).toBe(true);
  });

  it("mentions a logo layer when one is in the selection", () => {
    const comments = makeFeedback(sampleNodes, () => 0.37);
    const logoNote = comments.find((item) => item.category === "logo-size");
    expect(logoNote?.text.toLowerCase()).toContain("acme logo");
  });
});
