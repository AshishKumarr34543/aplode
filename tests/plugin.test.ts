import { beforeEach, describe, expect, it } from "vitest";
import { handlePluginMessage, type PluginApi } from "../src/plugin";

const makeFake = () => {
  const page = { selection: [{ id: "logo-1", name: "Acme Logo", type: "VECTOR", x: 20, y: 30, width: 100, height: 60 }], children: [] as any[], appendChild(node: any) { this.children.push(node); } };
  const nodes = new Map<string, any>();
  let nextId = 0;
  const api: PluginApi = {
    currentPage: page as any,
    viewport: { center: { x: 500, y: 400 } },
    loadFontAsync: async () => {},
    createFrame: () => {
      const frame: any = { id: `frame-${++nextId}`, type: "FRAME", name: "", children: [], appendChild(child: any) { this.children.push(child); }, resize(width: number, height: number) { this.width = width; this.height = height; }, remove() { this.removed = true; page.children.splice(page.children.indexOf(this), 1); nodes.delete(this.id); } };
      nodes.set(frame.id, frame);
      return frame;
    },
    createText: () => ({ name: "", characters: "", x: 0, y: 0, fills: [], resize(width: number, height: number) { this.width = width; this.height = height; } } as any),
    getNodeByIdAsync: async (id) => nodes.get(id) || null,
    ui: { postMessage: () => {} },
  };
  return { api, page, nodes };
};

describe("plugin canvas actions", () => {
  let fake: ReturnType<typeof makeFake>;
  beforeEach(() => { fake = makeFake(); });

  it("creates ten canvas comment cards from the selected nodes", async () => {
    await handlePluginMessage(fake.api, { type: "generate" });
    expect(fake.page.children).toHaveLength(10);
    expect(fake.page.children.some((node) => node.name.includes("logo-size"))).toBe(true);
    expect(fake.page.children[0].children[0].characters).toMatch(/NITPICK|CHANGE REQUEST|PANIC/);
  });

  it("removes only the requested card when dismissed", async () => {
    await handlePluginMessage(fake.api, { type: "generate" });
    const card = fake.page.children[0];
    await handlePluginMessage(fake.api, { type: "dismiss", nodeId: card.id });
    expect(card.removed).toBeTruthy();
    expect(fake.page.children).toHaveLength(9);
  });

  it("marks a card as addressed and leaves it on the canvas", async () => {
    await handlePluginMessage(fake.api, { type: "generate" });
    const card = fake.page.children[0];
    await handlePluginMessage(fake.api, { type: "address", nodeId: card.id });
    expect(card.children[2].characters).toBe("ADDRESSED");
    expect(fake.page.children).toHaveLength(10);
  });

  it("reports generation errors to the open plugin UI", async () => {
    const messages: any[] = [];
    fake.api.loadFontAsync = async () => { throw new Error("font missing"); };
    fake.api.ui.postMessage = (message) => messages.push(message);
    await handlePluginMessage(fake.api, { type: "generate" });
    expect(messages).toContainEqual({ type: "error", message: "Could not make the feedback cards. Try again?" });
  });
});
