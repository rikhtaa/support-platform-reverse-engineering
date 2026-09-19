(function () {
  "use strict";

  const script =
    document.currentScript as HTMLScriptElement | null;

  if (!script) {
    console.error("Widget script not found.");
    return;
  }

  const organizationId =
    script.dataset.organizationId;

  if (!organizationId) {
    console.error(
      "Missing data-organization-id."
    );
    return;
  }

  const widgetUrl =
    "http://localhost:3000/embed";

  // Floating button
  const button =
    document.createElement("button");

  button.innerHTML = "💬";

  button.style.cssText = `
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: none;
    background: #3b82f6;
    color: white;
    font-size: 24px;
    cursor: pointer;
    z-index: 999999;
  `;

  document.body.appendChild(button);

  // Widget container
  const container =
    document.createElement("div");

  container.style.cssText = `
    position: fixed;
    right: 20px;
    bottom: 90px;
    width: 400px;
    height: 600px;
    max-width: calc(100vw - 40px);
    max-height: calc(100vh - 110px);
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(0,0,0,.2);
    z-index: 999998;
    display: none;
  `;

  // Widget iframe
  const iframe =
    document.createElement("iframe");

  iframe.src =
    `${widgetUrl}?organizationId=${encodeURIComponent(
      organizationId
    )}`;

  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
  `;

  container.appendChild(iframe);

  document.body.appendChild(container);

  // Open / close widget
  button.addEventListener("click", () => {
    if (container.style.display === "none") {
      container.style.display = "block";
    } else {
      container.style.display = "none";
    }
  });
})();