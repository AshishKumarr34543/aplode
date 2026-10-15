import { cardContent, layoutCards, type Box } from "./cards";
import { makeFeedback, type Feedback, type Severity } from "./feedback";
import { summarizeNodes, type SceneLike } from "./summary";

type PluginMessage = { type: string; nodeId?: string };
type CanvasText = {
  name: string;
  characters: string;
  x: number;
  y: number;
  fontName: { family: string; style: string };
  fontSize: number;
  textAutoResize: string;
  fills: unknown[];
  resize(width: number, height: number): void;
};
type CanvasFrame = SceneLike & {
  children: Array<CanvasFrame | CanvasText>;
  fills: unknown[];
  strokes: unknown[];
  strokeWeight: number;
  cornerRadius: number;
  appendChild(node: CanvasFrame | CanvasText): void;
  resize(width: number, height: number): void;
  remove(): void;
};

export type PluginApi = {
  currentPage: {
    selection: SceneLike[];
    children: SceneLike[];
    appendChild(node: CanvasFrame): void;
  };
  viewport: { center: { x: number; y: number } };
  loadFontAsync(font: { family: string; style: string }): Promise<void>;
  createFrame(): CanvasFrame;
  createText(): CanvasText;
  getNodeByIdAsync(id: string): Promise<SceneLike | null>;
  ui: { postMessage(message: unknown): void };
};

type Palette = { background: { r: number; g: number; b: number }; edge: { r: number; g: number; b: number } };
const colors: Record<Severity, Palette> = {
  nitpick: { background: { r: 1, g: 0.96, b: 0.78 }, edge: { r: 0.76, g: 0.53, b: 0.12 } },
  "change request": { background: { r: 0.84, g: 0.91, b: 1 }, edge: { r: 0.2, g: 0.4, b: 0.78 } },
  panic: { background: { r: 1, g: 0.84, b: 0.82 }, edge: { r: 0.78, g: 0.22, b: 0.18 } },
};

function solid(color: Palette["background"]) {
  return [{ type: "SOLID", color }];
}

function bounds(nodes: SceneLike[]): Box | undefined {
  const known = nodes.filter((node) => [node.x, node.y, node.width, node.height].every((value) => typeof value === "number"));
  if (!known.length) return undefined;
  const left = Math.min(...known.map((node) => node.x!));
  const top = Math.min(...known.map((node) => node.y!));
  const right = Math.max(...known.map((node) => node.x! + node.width!));
  const bottom = Math.max(...known.map((node) => node.y! + node.height!));
  return { x: left, y: top, width: right - left, height: bottom - top };
}

function addText(api: PluginApi, frame: CanvasFrame, name: string, value: string, y: number, size: number, color = { r: 0.12, g: 0.12, b: 0.14 }, height = 32) {
  const text = api.createText();
  text.name = name;
  text.fontName = { family: "Inter", style: "Regular" };
  text.fontSize = size;
  text.fills = solid(color);
  text.textAutoResize = "HEIGHT";
  text.characters = value;
  text.x = 16;
  text.y = y;
  text.resize(288, height);
  frame.appendChild(text);
  return text;
}

function createCard(api: PluginApi, feedback: Feedback, x: number, y: number) {
  const content = cardContent(feedback);
  const palette = colors[feedback.severity];
  const frame = api.createFrame();
  frame.name = content.name;
  frame.x = x;
  frame.y = y;
  frame.fills = solid(palette.background);
  frame.strokes = solid(palette.edge);
  frame.strokeWeight = 1;
  frame.cornerRadius = 10;
  frame.resize(320, 172);
  addText(api, frame, "sim-title", content.title, 14, 12, palette.edge, 24);
  addText(api, frame, "sim-body", content.body, 48, 14, undefined, 70);
  addText(api, frame, "sim-status", content.status, 140, 10, palette.edge, 18);
  api.currentPage.appendChild(frame);
  return frame;
}

function isSimulatorCard(node: SceneLike): node is CanvasFrame {
  return node.type === "FRAME" && node.name.startsWith("Client Simulator ·");
}

async function changeCard(api: PluginApi, nodeId: string, action: "dismiss" | "address") {
  const node = await api.getNodeByIdAsync(nodeId);
  if (!node || !isSimulatorCard(node)) return;
  if (action === "dismiss") {
    node.remove();
    return;
  }

  const status = node.children.find((child) => child.name === "sim-status") as CanvasText | undefined;
  if (!status) return;
  status.characters = "ADDRESSED";
  status.fills = solid({ r: 0.14, g: 0.48, b: 0.28 });
  node.name = `${node.name} · addressed`;
  node.fills = solid({ r: 0.86, g: 0.96, b: 0.87 });
}

async function generate(api: PluginApi) {
  const page = api.currentPage;
  const pageChildren = page.children;
  const selection = page.selection;
  const summary = summarizeNodes(selection, pageChildren);
  const feedback = makeFeedback(summary);
  const anchor = bounds(selection.length ? selection : pageChildren);
  const center = api.viewport.center;
  const viewport: Box = { x: center.x - 500, y: center.y - 420, width: 1000, height: 840 };
  const positions = layoutCards(feedback.length, anchor, viewport);
  await api.loadFontAsync({ family: "Inter", style: "Regular" });
  const cards = feedback.map((item, index) => {
    const position = positions[index];
    return { nodeId: createCard(api, item, position.x, position.y).id, feedback: item };
  });
  api.ui.postMessage({ type: "generated", cards, target: selection.length ? "selection" : "page" });
}

export async function handlePluginMessage(api: PluginApi, message: PluginMessage) {
  if (message.type === "generate") {
    try {
      return await generate(api);
    } catch {
      api.ui.postMessage({ type: "error", message: "Could not make the feedback cards. Try again?" });
      return;
    }
  }
  if ((message.type === "dismiss" || message.type === "address") && message.nodeId) {
    return changeCard(api, message.nodeId, message.type);
  }
}
