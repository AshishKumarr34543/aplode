figma.showUI(__html__, { width: 360, height: 520 });

figma.ui.onmessage = (message) => {
  if (message.type === "hello") {
    figma.ui.postMessage({ type: "hello", text: "Plugin is ready" });
  }
};
