import { describe, expect, it } from "vitest";
import { summarizeNodes, type SceneLike } from "../src/summary";

const pageNode: SceneLike = { id: "page-1", name: "Page logo", type: "VECTOR", children: [] };
const selected: SceneLike = { id: "selected-1", name: "Hero title", type: "TEXT", children: [] };

describe("node summaries", () => {
  it("uses the selection when there is one", () => {
    expect(summarizeNodes([selected], [pageNode]).map((item) => item.name)).toEqual(["Hero title"]);
  });

  it("uses page content when nothing is selected", () => {
    expect(summarizeNodes([], [pageNode]).map((item) => item.name)).toEqual(["Page logo"]);
  });

  it("returns an empty summary for an empty page", () => {
    expect(summarizeNodes([], [])).toEqual([]);
  });

  it("walks child nodes and stops at the requested limit", () => {
    const parent = { ...selected, children: [pageNode, { ...pageNode, id: "page-2", name: "Button" }] };
    expect(summarizeNodes([parent], [], 2).map((item) => item.name)).toEqual(["Hero title", "Page logo"]);
  });
});
