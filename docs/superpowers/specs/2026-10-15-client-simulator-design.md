# Client Simulator design

## Goal

Make a Figma plugin that creates funny, useful client revision feedback from the current selection or page. The comments should be editable canvas objects so the feedback stays visible in the design file.

## Approach

Use a small HTML plugin UI for choosing the target, generating feedback, and managing comment status. The plugin main thread inspects selected nodes (or page nodes when nothing is selected), then creates native Figma frames and text nodes beside the design. Each card includes its comment and one of three severity labels: nitpick, change request, or panic. The UI lists generated cards with Dismiss and Mark as addressed controls; those controls update the corresponding canvas card so it remains actionable without relying on an unsupported comment-write API.

Feedback comes from a local set of at least ten categories: logo size, color, copy, layout, whitespace, branding, nephew comparison, competitor comparison, last-minute scope, and mobile/responsive concerns. Rules inspect node names and types to add context-specific remarks when matching content exists, with generic fallback comments for categories that do not match.

## Flow and boundaries

1. Read current selection and page summary, including names and node types.
2. Generate a varied set of comments with category, severity, and optional target name.
3. Place comment cards in a tidy column near the selection bounds, or near the page content when selection is empty.
4. Keep card IDs in plugin UI state for dismiss/address actions during the plugin session; encode a stable plugin marker in node names so status is also visible on canvas.

The plugin does not call external services and does not edit existing design nodes. It creates only feedback cards. Dismiss removes the generated card; Mark as addressed changes its canvas styling and status label.

## Verification

Unit tests cover category variety, severity assignment, selection-aware tailoring, and card text/status formatting. A production build verifies the plugin bundles, and the manifest points to the generated main and UI files. Manual loading in Figma is needed to prove the live plugin API behavior.

## Known API constraint

The Figma Plugin API documents comment reactions in the API comparison, but does not document creating regular threaded file comments from a plugin. FigJam stickies are FigJam-specific. This design therefore uses editable canvas cards that behave as comments, rather than claiming they are native threaded comments.
