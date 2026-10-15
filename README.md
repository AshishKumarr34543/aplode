# aplode

## Client Simulator

A Figma plugin for rehearsing the comments that somehow arrive five minutes before handoff. It makes ten fake client feedback cards on the canvas, based on what you selected or on the current page.

### Try it in Figma

1. Install Node.js, then run `npm install`.
2. Run `npm run build`.
3. In Figma, open **Plugins → Development → Import plugin from manifest…** and choose this repo's `manifest.json`.
4. Select a few layers and run **Client Simulator**. With nothing selected, it scans the current page instead.
5. Use **Dismiss** or **Mark as addressed** beside a comment in the plugin window. The note itself is an editable card on the canvas; addressed cards stay there with an updated label.

The comments cover logo size, color, copy, layout, whitespace, branding, the nephew comparison, competitors, last-minute scope, mobile, accessibility, and stakeholder alignment. Each one is labeled nitpick, change request, or panic. A matching layer name or type makes a few notes more specific.

### Build and checks

```sh
npm test -- --run
npx tsc --noEmit
npm run build
```

Figma's documented plugin API doesn't provide a way to create regular threaded file comments. These are editable canvas frames and text nodes, with controls in the plugin UI. The build and automated tests run locally; importing and running it inside Figma is still the final real-world check.
