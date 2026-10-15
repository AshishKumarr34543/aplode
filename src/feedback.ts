export type Severity = "nitpick" | "change request" | "panic";

export type FeedbackNode = {
  id: string;
  name: string;
  type: string;
};

export type Feedback = {
  id: string;
  category: string;
  label: string;
  severity: Severity;
  text: string;
  targetName?: string;
};

type Category = {
  id: string;
  label: string;
  severity: Severity;
  words: string[];
  note: (target?: FeedbackNode) => string;
};

export const categories: Category[] = [
  { id: "logo-size", label: "Logo size", severity: "nitpick", words: ["logo", "mark", "brand symbol"], note: (target) => `Can we make ${target?.name || "the logo"} bigger? I can almost see it.` },
  { id: "color", label: "Color", severity: "change request", words: ["fill", "color", "swatch"], note: () => "What if we tried this in blue? Like a different blue. You know the one." },
  { id: "copy", label: "Copy", severity: "change request", words: ["text", "copy", "headline", "title"], note: (target) => `Could ${target?.name || "the copy"} say the same thing, just with more sparkle?` },
  { id: "layout", label: "Layout", severity: "change request", words: ["frame", "grid", "layout", "section"], note: () => "Can we move everything around but keep the exact layout? Thanks!" },
  { id: "whitespace", label: "Whitespace", severity: "nitpick", words: ["frame", "section", "background"], note: () => "There is a lot of empty space here. Could we fill it with something important?" },
  { id: "branding", label: "Branding", severity: "panic", words: ["logo", "brand", "identity"], note: () => "It looks nice, but does it feel like our brand? I changed the brand yesterday." },
  { id: "nephew", label: "My nephew", severity: "panic", words: [], note: () => "My nephew could do this in Canva. He is 14 and has very strong opinions." },
  { id: "competitor", label: "Competitor", severity: "change request", words: [], note: () => "Can you make it more like our competitor, but also make sure it looks nothing like them?" },
  { id: "scope-creep", label: "Last minute scope", severity: "panic", words: ["frame", "section", "page"], note: () => "Tiny last-minute thing: can we add a whole checkout flow before the meeting?" },
  { id: "mobile", label: "Mobile", severity: "change request", words: ["frame", "mobile", "phone"], note: () => "Looks great on desktop. What does the 47-screen mobile version look like?" },
  { id: "accessibility", label: "Accessibility", severity: "nitpick", words: ["text", "button", "icon"], note: (target) => `Is ${target?.name || "this"} readable for everyone, including people who can't see pale gray?` },
  { id: "stakeholder", label: "Stakeholder alignment", severity: "panic", words: ["frame", "page", "section"], note: () => "The CEO's friend saw it and has one small thought. We need to start over." },
];

function matchingNode(category: Category, nodes: FeedbackNode[]) {
  return nodes.find((node) => {
    const text = `${node.name} ${node.type}`.toLowerCase();
    return category.words.some((word) => text.includes(word));
  });
}

export function makeFeedback(nodes: FeedbackNode[], random: () => number = Math.random, count = 10): Feedback[] {
  const ranked = categories.map((category) => ({ category, target: matchingNode(category, nodes), score: random() }));
  ranked.sort((a, b) => Number(Boolean(b.target)) - Number(Boolean(a.target)) || a.score - b.score);

  return ranked.slice(0, Math.min(count, categories.length)).map(({ category, target }) => ({
    id: category.id,
    category: category.id,
    label: category.label,
    severity: category.severity,
    text: category.note(target),
    ...(target ? { targetName: target.name } : {}),
  }));
}
