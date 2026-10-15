import { handlePluginMessage, type PluginApi } from "./plugin";

figma.showUI(__html__, { width: 380, height: 620 });
figma.ui.onmessage = (message) => {
  void handlePluginMessage(figma as unknown as PluginApi, message);
};
