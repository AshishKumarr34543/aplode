import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("plugin manifest", () => {
  it("points at the bundles produced by the build", () => {
    const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
    expect(manifest.main).toBe("dist/main.js");
    expect(manifest.ui).toBe("dist/ui.html");
  });
});
