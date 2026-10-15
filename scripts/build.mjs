import { build } from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";

await mkdir("dist", { recursive: true });
await build({ entryPoints: ["src/main.ts"], outfile: "dist/main.js", bundle: true, target: "es2020", format: "iife" });
await build({ entryPoints: ["src/ui.ts"], outfile: "dist/ui.js", bundle: true, target: "es2020", format: "iife" });

const html = await readFile("src/ui.html", "utf8");
const js = await readFile("dist/ui.js", "utf8");
await writeFile("dist/ui.html", html.replace('<script src="ui.js"></script>', `<script>${js}</script>`));
await writeFile("dist/manifest.json", await readFile("manifest.json", "utf8"));
