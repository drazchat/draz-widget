import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import styles from "./index.css?inline";
import { ShadowRootProvider } from "./context/shadow-root";

// Create isolated Shadow DOM container
function createWidgetContainer() {
  const hostId = "draz-widget-shadow-host";
  let host = document.getElementById(hostId) as HTMLDivElement;

  if (!host) {
    host = document.createElement("div");
    host.id = hostId;
    host.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 0;
      height: 0;
      border: 0;
      margin: 0;
      padding: 0;
      overflow: visible;
      z-index: 2147483646;
    `;
    document.body.appendChild(host);
  }

  // Check if shadow root already exists
  let shadowRoot = host.shadowRoot;
  if (!shadowRoot) {
    shadowRoot = host.attachShadow({ mode: "open" });
  } else {
    // Clear existing content if any (hot reload support-ish)
    shadowRoot.innerHTML = "";
  }

  // Inject Styles via Style Tag
  const styleElement = document.createElement("style");
  styleElement.textContent = styles;
  shadowRoot.appendChild(styleElement);

  // App Container
  const container = document.createElement("div");
  container.id = "draz-widget-root";
  container.style.cssText = `
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.5;
  `;
  shadowRoot.appendChild(container);

  return { container, shadowRoot };
}

function initWidget() {
  const { container, shadowRoot } = createWidgetContainer();

  // Mock config for testing
  window.__DRAZ_WIDGET_CONFIG__ = { workspaceId: "test-id" };

  createRoot(container).render(
    <StrictMode>
      <ShadowRootProvider shadowRoot={shadowRoot}>
        <App />
      </ShadowRootProvider>
    </StrictMode>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWidget);
} else {
  initWidget();
}
