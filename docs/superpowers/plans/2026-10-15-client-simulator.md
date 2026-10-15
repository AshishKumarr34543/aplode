# Client Simulator Implementation Plan

> **For agentic workers:** Execute inline in the current session. Keep each numbered task reviewable and make one commit per task.

**Goal:** Build and test a Figma plugin that generates funny, context-aware client feedback cards on the canvas, with severity and status controls.

**Architecture:** Keep feedback rules and card formatting as pure TypeScript modules. The Figma main thread summarizes selection/page nodes and creates canvas cards; the plugin UI requests generation and shows actions tied to card IDs. A small build script bundles the main thread and embeds the UI bundle into HTML for Figma.

**Tech Stack:** TypeScript, Figma Plugin API typings, esbuild, Vitest, Node.js.

**Spec:** `docs/superpowers/specs/2026-10-15-client-simulator-design.md`

## Global Constraints

- Generate at least ten distinct feedback categories.
- Include `nitpick`, `change request`, or `panic` severity on every feedback card.
- Tailor at least some comments using selected or page node names/types.
- Render feedback as editable canvas nodes; the UI is only for generating and operating on those nodes.
- Dismiss removes the generated card; addressed state stays visible on its card.
- Do not make external network requests or edit existing design nodes.
- Do not claim plugin-created nodes are native threaded Figma comments.
- Keep code direct and casual without introducing broken behavior or fake authorship claims.
- Finish with exactly ten descriptive commits including the already-created spec commit.

## File Structure

- `manifest.json`: Figma plugin metadata and built entry points.
- `package.json`, `tsconfig.json`: build and test commands, TypeScript settings.
- `src/feedback.ts`: feedback categories, severity, and context matching.
- `src/summary.ts`: safe selection/page node summaries.
- `src/cards.ts`: card text, naming, and status data helpers.
- `src/main.ts`: Figma plugin entry point, canvas card creation and messages.
- `src/ui.html`, `src/ui.ts`: small generation/status interface.
- `scripts/build.mjs`: bundle plugin code and embed UI code into standalone HTML.
- `tests/*.test.ts`: pure feedback, summary, and card helper behavior.
- `README.md`: install, use, test, and API limitation notes.

## Tasks

### Task 1: Create Figma plugin scaffold

Files: `package.json`, `tsconfig.json`, `manifest.json`, `src/main.ts`, `src/ui.html`, `src/ui.ts`, `scripts/build.mjs`, `.gitignore`.

Add `build` and `test` scripts, Figma API typings, esbuild, and Vitest. The manifest uses `dist/main.js` and `dist/ui.html`, with a current supported API version. Build `main.ts` as an IIFE and embed a bundled UI script into `ui.html`. Start the main and UI files with the smallest compilable message handshake. Ignore dependencies and generated `dist` output.

Checks: `npm install`; `npm test -- --run`; `npm run build`; confirm the manifest paths exist in `dist`.

Commit 3: `build: scaffold Figma plugin and bundle pipeline`.

### Task 2: Implement feedback catalog and rules

Files: `src/feedback.ts`, `tests/feedback.test.ts`.

Write tests first for ten unique categories, valid severity values, stable result count, and specific logo-name matching. Implement a local catalog covering logo size, color, copy, layout, whitespace, branding, nephew comparison, competitor comparison, last-minute scope, mobile/responsive, accessibility, and stakeholder alignment. Select a mix of categories, tailoring a matching item when names or node types signal it. Use a deterministic injectable seed or category list so tests do not depend on random chance.

Run the new test red before implementing, then green. Commit 4: `feat: generate varied context-aware client feedback`.

### Task 3: Summarize selection and page nodes

Files: `src/summary.ts`, `tests/summary.test.ts`.

Define a small serializable node summary containing id, name, type, and bounds when present. Test selection priority, page fallback, empty-page behavior, and truncation of oversized pages. Traverse children recursively with a fixed maximum count so context remains bounded. Commit 5: `feat: read selection and page context safely`.

### Task 4: Define canvas card helpers and layout

Files: `src/cards.ts`, `tests/cards.test.ts`.

Test card names, severity labels, addressed copy, and deterministic placement from anchor bounds. Use a fixed card size and vertical gap, place the stack beside the target when space allows, and fall back to the page content bounds or a visible default position. Commit 6: `feat: format feedback cards for the canvas`.

### Task 5: Create canvas nodes from plugin messages

Files: `src/main.ts`, `tests/main.test.ts`.

Keep Figma calls behind small functions that accept the Figma API object so core behavior can be tested with a fake API. On a generate request, read the selection/page, call the summary and feedback modules, load Inter, create a card frame and text children for each result, and post card IDs back to the UI. On dismiss, remove only the marked card node. On addressed, update the marked card's visible status and styling. Ignore unknown message types and missing/deleted IDs safely. Test dispatch and that only simulator nodes are changed/removed. Commit 7: `feat: add and manage canvas feedback cards`.

### Task 6: Build the plugin UI actions

Files: `src/ui.html`, `src/ui.ts`, `tests/ui.test.ts`.

The interface has a generate button, selected/page mode display, a result list with severity/category, and Dismiss and Mark as addressed buttons per card. Use the Figma message API for requests and state updates. Test small pure UI state helpers for card replacement/removal and labels. Keep all feedback cards on-canvas. Commit 8: `feat: add dismiss and addressed controls`.

### Task 7: Add product copy and local install instructions

Files: `README.md`, `manifest.json`, `assets/icon.svg`.

Document import through Figma's development plugin flow, selection/page behavior, categories, severity, actions, test/build commands, and the canvas-card/native-threaded-comment distinction. Ensure the manifest name and description are Client Simulator and the icon is legible at plugin-menu size. Commit 9: `docs: explain plugin setup and feedback behavior`.

### Task 8: Final verification and package consistency

Files: relevant source/tests, build output ignored.

Run the full test suite and production build. Inspect built manifest paths and bundled UI presence; verify all expected categories are present and all action messages have handlers. Fix any failures with a regression test first. Check `git status` for generated or unrelated files. Commit 10: `chore: verify Client Simulator release bundle` with a body listing exact test/build results and remaining manual Figma runtime limitation.

## Final Self-Review

- All 12 feedback categories are covered by Task 2.
- Selection/page context and tailoring are covered by Tasks 2 and 3.
- Canvas cards, severity, and status actions are covered by Tasks 4–6.
- Unit tests and a production build are required in every applicable task and at final verification.
- Live Figma execution is still a manual check and must be disclosed if unavailable.
- Eight implementation commits plus the existing spec and this plan commit produce exactly ten commits.
