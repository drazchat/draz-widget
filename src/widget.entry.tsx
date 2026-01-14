/**
 * Widget Entry Point
 *
 * This file is the entry point for the embeddable widget script.
 * It reads configuration from the script tag's data attributes and
 * initializes the widget in an isolated container.
 *
 * Usage:
 * <script
 *   src="https://widget.draz.chat/draz-widget.js"
 *   data-workspace-id="YOUR_WORKSPACE_ID"
 * ></script>
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import styles from "./index.css?inline";
import { ShadowRootProvider } from "./context";

// Get the current script tag to read data attributes
function getCurrentScript(): HTMLScriptElement | null {
  // Try document.currentScript first (works during initial execution)
  if (document.currentScript) {
    return document.currentScript as HTMLScriptElement;
  }

  // Fallback: find our script by src
  const scripts = document.querySelectorAll(
    'script[src*="draz-widget"]'
  ) as NodeListOf<HTMLScriptElement>;
  return scripts[scripts.length - 1] || null;
}

// Read configuration from script data attributes
function getWidgetConfig(): { workspaceId: string } {
  const script = getCurrentScript();

  if (!script) {
    console.error("[DrazWidget] Could not find widget script tag");
    return { workspaceId: "" };
  }

  const workspaceId = script.dataset.workspaceId || "";

  if (!workspaceId) {
    console.warn(
      "[DrazWidget] No workspace ID provided. Add data-workspace-id to the script tag."
    );
  }

  return { workspaceId };
}

// Create isolated Shadow DOM container for the widget
function createWidgetContainer(): {
  container: HTMLDivElement;
  shadowRoot: ShadowRoot;
} {
  const hostId = "draz-widget-host";

  // Check if host already exists (prevent duplicate initialization)
  let host = document.getElementById(hostId) as HTMLDivElement;
  if (host && host.shadowRoot) {
    const container = host.shadowRoot.getElementById(
      "draz-widget-root"
    ) as HTMLDivElement;
    return { container, shadowRoot: host.shadowRoot };
  }

  // Create new host element
  if (!host) {
    host = document.createElement("div");
    host.id = hostId;
    // Host ensures it's on top of everything
    host.style.cssText = `
      position: fixed;
      z-index: 2147483647;
      bottom: 0;
      right: 0;
      width: 0;
      height: 0;
      overflow: visible;
    `;
    document.body.appendChild(host);
  }

  // Attach Shadow DOM
  const shadowRoot = host.attachShadow({ mode: "open" });

  // Inject Styles
  const styleElement = document.createElement("style");
  styleElement.textContent = styles;
  shadowRoot.appendChild(styleElement);

  // Create app container inside Shadow DOM
  const container = document.createElement("div");
  container.id = "draz-widget-root";

  // Important: The container needs to be the font root
  container.style.cssText = `
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    line-height: 1.5;
  `;

  shadowRoot.appendChild(container);

  return { container, shadowRoot };
}

// Store config globally for context providers to access
declare global {
  interface Window {
    __DRAZ_WIDGET_CONFIG__?: {
      workspaceId: string;
    };
  }
}

// Initialize the widget
function initWidget(): void {
  const config = getWidgetConfig();

  // Store config globally for providers to access
  window.__DRAZ_WIDGET_CONFIG__ = config;

  const { container, shadowRoot } = createWidgetContainer();

  createRoot(container).render(
    <StrictMode>
      <ShadowRootProvider shadowRoot={shadowRoot}>
        <App />
      </ShadowRootProvider>
    </StrictMode>
  );
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWidget);
} else {
  initWidget();
}
