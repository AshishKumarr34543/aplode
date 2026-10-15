export type SceneLike = {
  id: string;
  name: string;
  type: string;
  children?: SceneLike[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type NodeSummary = {
  id: string;
  name: string;
  type: string;
  bounds?: { x: number; y: number; width: number; height: number };
};

export function summarizeNodes(selection: SceneLike[], pageChildren: SceneLike[], maxNodes = 60): NodeSummary[] {
  const roots = selection.length ? selection : pageChildren;
  const found: NodeSummary[] = [];
  const visit = (node: SceneLike) => {
    if (found.length >= maxNodes) return;
    const summary: NodeSummary = { id: node.id, name: node.name, type: node.type };
    if ([node.x, node.y, node.width, node.height].every((value) => typeof value === "number")) {
      summary.bounds = { x: node.x!, y: node.y!, width: node.width!, height: node.height! };
    }
    found.push(summary);
    for (const child of node.children || []) visit(child);
  };

  for (const node of roots) {
    visit(node);
    if (found.length >= maxNodes) break;
  }
  return found;
}
