import { describe, expect, it } from "vitest";
import { updateCards, type UiCard, type UiMessage } from "../src/ui-state";

const first: UiCard = { nodeId: "frame-1", feedback: { id: "logo-size", category: "logo-size", label: "Logo size", severity: "nitpick", text: "Make it bigger" }, status: "open" };
const second: UiCard = { ...first, nodeId: "frame-2", feedback: { ...first.feedback, id: "copy", category: "copy", label: "Copy", severity: "panic", text: "Rewrite it" } };

describe("feedback list state", () => {
  it("replaces the old run when fresh cards arrive", () => {
    const message: UiMessage = { type: "generated", target: "selection", cards: [{ nodeId: second.nodeId, feedback: second.feedback }] };
    expect(updateCards([first], message)).toEqual([second]);
  });

  it("removes a dismissed card and addresses one without removing it", () => {
    expect(updateCards([first, second], { type: "dismiss", nodeId: "frame-1" })).toEqual([second]);
    expect(updateCards([first, second], { type: "address", nodeId: "frame-1" })[0].status).toBe("addressed");
    expect(updateCards([first, second], { type: "address", nodeId: "frame-1" })).toHaveLength(2);
  });
});
