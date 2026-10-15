# Release check

Checked locally on 2026-10-15.

- `npm test -- --run`: 6 test files and 17 tests passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: produced `dist/main.js`, `dist/ui.html`, and `dist/manifest.json`.
- Bundle inspection: manifest entry paths exist, and the UI bundle contains the generate, Dismiss, and Mark as addressed controls.
- `npm audit --audit-level=moderate`: zero vulnerabilities.

Figma is not installed in this environment, so loading the manifest and creating cards in a live Figma document still needs an editor-side check.
