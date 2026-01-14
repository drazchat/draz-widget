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
import "./index.css";

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

// Create isolated container for the widget
function createWidgetContainer(): HTMLDivElement {
  const containerId = "draz-widget-root";

  // Check if container already exists (prevent duplicate initialization)
  let container = document.getElementById(containerId) as HTMLDivElement;
  if (container) {
    return container;
  }

  // Create new container
  container = document.createElement("div");
  container.id = containerId;

  // Reset any inherited styles
  container.style.cssText = `
    position: fixed;
    z-index: 2147483647;
    font-family: system-ui, -apple-system, sans-serif;
  `;

  document.body.appendChild(container);
  return container;
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

  const container = createWidgetContainer();

  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWidget);
} else {
  initWidget();
}
