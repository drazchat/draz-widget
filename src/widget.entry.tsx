/**
 * Widget Entry Point
 *
 * This file is the entry point for the embeddable widget script.
 * It reads configuration from the script tag's data attributes and
 * initializes the widget in an isolated container.
 *
 * Usage (workspace mode — legacy super-agent widget):
 * <script
 *   src="https://widget.draz.chat/draz-widget.js"
 *   data-workspace-id="YOUR_WORKSPACE_ID"
 * ></script>
 *
 * Usage (deployment mode — published chat deployment via delivery gateway):
 * <script
 *   src="https://widget.draz.chat/draz-widget.js"
 *   data-deployment-id="DEPLOYMENT_ID"
 *   data-deployment-token="PUBLIC_TOKEN"
 * ></script>
 *
 * Optional attributes:
 *   data-api-url="https://api.draz.chat"  — override the gateway origin
 *   data-mode="inline"                    — fill a container instead of floating
 *   data-target="#selector"               — container for inline mode
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import styles from "./index.css?inline";
import { ShadowRootProvider } from "./context";
import type { DrazWidgetEmbedConfig } from "./context/socket/socket.config";

// Get the current script tag to read data attributes
function getCurrentScript(): HTMLScriptElement | null {
  // Try document.currentScript first (works during initial execution)
  if (document.currentScript) {
    return document.currentScript as HTMLScriptElement;
  }

  // Fallback: find our script by src
  const scripts = document.querySelectorAll(
    'script[src*="draz-widget"]',
  ) as NodeListOf<HTMLScriptElement>;
  return scripts[scripts.length - 1] || null;
}

// Read configuration from script data attributes
function getWidgetConfig(): DrazWidgetEmbedConfig & { target?: string } {
  const script = getCurrentScript();

  if (!script) {
    console.error("[DrazWidget] Could not find widget script tag");
    return {};
  }

  const config: DrazWidgetEmbedConfig & { target?: string } = {
    workspaceId: script.dataset.chatbotId || script.dataset.workspaceId || "",
    deploymentId: script.dataset.deploymentId || "",
    deploymentToken: script.dataset.deploymentToken || "",
    apiUrl: script.dataset.apiUrl || "",
    mode: script.dataset.mode === "inline" ? "inline" : "floating",
    target: script.dataset.target || "",
  };

  if (!config.workspaceId && !config.deploymentId) {
    console.warn(
      "[DrazWidget] No identifier provided. Add data-deployment-id (or legacy data-chatbot-id) to the script tag.",
    );
  }

  return config;
}

// Create isolated Shadow DOM container for the widget
function createWidgetContainer(inlineTarget?: Element | null): {
  container: HTMLDivElement;
  shadowRoot: ShadowRoot;
} {
  const hostId = "draz-widget-host";

  // Check if host already exists (prevent duplicate initialization)
  let host = document.getElementById(hostId) as HTMLDivElement;
  if (host && host.shadowRoot) {
    const container = host.shadowRoot.getElementById(
      "draz-widget-root",
    ) as HTMLDivElement;
    return { container, shadowRoot: host.shadowRoot };
  }

  // Create new host element
  if (!host) {
    host = document.createElement("div");
    host.id = hostId;
    if (inlineTarget) {
      // Inline mode: fill the caller-provided container.
      host.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
      `;
      inlineTarget.appendChild(host);
    } else {
      // Floating mode: fixed overlay above everything.
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
    ${inlineTarget ? "width: 100%; height: 100%;" : ""}
  `;

  shadowRoot.appendChild(container);

  return { container, shadowRoot };
}

// Initialize the widget
function initWidget(): void {
  // Already mounted (e.g. the embedding page re-injected the script during a
  // dev re-render) — never render a second copy into the page.
  const existingHost = document.getElementById("draz-widget-host");
  if (existingHost?.shadowRoot) {
    return;
  }

  const { target, ...config } = getWidgetConfig();

  // Inline mode needs its container; fall back to floating when missing.
  let inlineTarget: Element | null = null;
  if (config.mode === "inline") {
    inlineTarget = target ? document.querySelector(target) : null;
    if (!inlineTarget) {
      console.warn(
        `[DrazWidget] Inline target "${target}" not found — falling back to floating mode.`,
      );
      config.mode = "floating";
    }
  }

  // Store config globally for providers to access
  window.__DRAZ_WIDGET_CONFIG__ = config;

  const { container, shadowRoot } = createWidgetContainer(inlineTarget);

  createRoot(container).render(
    <StrictMode>
      <ShadowRootProvider shadowRoot={shadowRoot}>
        <App />
      </ShadowRootProvider>
    </StrictMode>,
  );
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWidget);
} else {
  initWidget();
}
