const button = document.querySelector<HTMLButtonElement>("#hello");
const status = document.querySelector<HTMLParagraphElement>("#status");

button?.addEventListener("click", () => {
  parent.postMessage({ pluginMessage: { type: "hello" } }, "*");
});

window.onmessage = (event) => {
  const message = event.data.pluginMessage;
  if (message?.type === "hello" && status) status.textContent = message.text;
};
