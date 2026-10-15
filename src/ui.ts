import { updateCards, type UiCard, type UiMessage } from "./ui-state";

const generateButton = document.querySelector<HTMLButtonElement>("#generate")!;
const list = document.querySelector<HTMLElement>("#list")!;
const targetLabel = document.querySelector<HTMLElement>("#target")!;
let cards: UiCard[] = [];

function send(message: unknown) {
  parent.postMessage({ pluginMessage: message }, "*");
}

function render() {
  list.replaceChildren();
  if (!cards.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "No feedback yet. Your client is still typing…";
    list.append(empty);
    return;
  }

  for (const card of cards) {
    const row = document.createElement("article");
    row.className = "card";
    const head = document.createElement("div");
    head.className = "card-top";
    const category = document.createElement("span");
    category.className = "category";
    category.textContent = card.feedback.label;
    const severity = document.createElement("span");
    severity.className = `severity ${card.feedback.severity.replace(/\s+/g, "-")}`;
    severity.textContent = card.feedback.severity;
    head.append(category, severity);

    const comment = document.createElement("p");
    comment.className = "comment";
    comment.textContent = card.feedback.text;
    const actions = document.createElement("div");
    actions.className = "card-actions";
    const addressed = document.createElement("button");
    addressed.className = "done";
    addressed.textContent = card.status === "addressed" ? "✓ Addressed" : "Mark as addressed";
    addressed.disabled = card.status === "addressed";
    addressed.addEventListener("click", () => {
      cards = updateCards(cards, { type: "address", nodeId: card.nodeId });
      send({ type: "address", nodeId: card.nodeId });
      render();
    });
    const dismiss = document.createElement("button");
    dismiss.textContent = "Dismiss";
    dismiss.addEventListener("click", () => {
      cards = updateCards(cards, { type: "dismiss", nodeId: card.nodeId });
      send({ type: "dismiss", nodeId: card.nodeId });
      render();
    });
    actions.append(addressed, dismiss);
    row.append(head, comment, actions);
    list.append(row);
  }
}

generateButton.addEventListener("click", () => {
  generateButton.disabled = true;
  generateButton.textContent = "Collecting client thoughts…";
  send({ type: "generate" });
});

window.onmessage = (event: MessageEvent) => {
  const message = event.data.pluginMessage as UiMessage & { target?: string };
  if (message?.type === "error") {
    generateButton.disabled = false;
    generateButton.textContent = "Generate client feedback ✦";
    targetLabel.textContent = message.message;
    return;
  }
  if (message?.type === "generated") {
    cards = updateCards(cards, message);
    targetLabel.textContent = `Based on your ${message.target}`;
    generateButton.disabled = false;
    generateButton.textContent = "Generate client feedback ✦";
    render();
  }
};

render();
