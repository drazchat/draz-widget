// Socket configuration constants
// Uses Vite environment variables with development fallbacks
// In embed mode, reads from window.__DRAZ_WIDGET_CONFIG__ set by widget.entry.tsx

/** Embed-time configuration injected by widget.entry.tsx */
export interface DrazWidgetEmbedConfig {
  /** Legacy workspace mode (socket / super-agent pipeline) */
  workspaceId?: string;
  /** Deployment mode (HTTP delivery-gateway pipeline) */
  deploymentId?: string;
  deploymentToken?: string;
  /** Overrides the build-time API base (delivery gateway origin) */
  apiUrl?: string;
  /** "floating" (launcher, default) | "inline" (fills a host container) */
  mode?: "floating" | "inline";
}

// Global type declaration for embed mode config
declare global {
  interface Window {
    __DRAZ_WIDGET_CONFIG__?: DrazWidgetEmbedConfig;
  }
}

function embedConfig(): DrazWidgetEmbedConfig {
  if (typeof window !== "undefined" && window.__DRAZ_WIDGET_CONFIG__) {
    return window.__DRAZ_WIDGET_CONFIG__;
  }
  return {};
}

/** Socket.io server URL */
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "https://api.draz.chat";

/** REST API base URL (build-time default; embed can override via data-api-url) */
export const API_URL = import.meta.env.VITE_API_URL || "https://api.draz.chat";

/** Effective REST API base (embed override → env → prod default) */
export function getApiUrl(): string {
  return embedConfig().apiUrl || API_URL;
}

/**
 * Get workspace identifier
 * Checks global config first (embed mode), then env var (dev mode)
 */
export function getWorkspaceId(): string {
  return embedConfig().workspaceId || import.meta.env.VITE_WORKSPACE_ID || "";
}

/** Deployment identifier — presence switches the widget into deployment mode */
export function getDeploymentId(): string {
  return embedConfig().deploymentId || import.meta.env.VITE_DEPLOYMENT_ID || "";
}

/** Public deployment token presented to the delivery gateway */
export function getDeploymentToken(): string {
  return (
    embedConfig().deploymentToken || import.meta.env.VITE_DEPLOYMENT_TOKEN || ""
  );
}

/** True when the widget should talk to the delivery gateway (per-deployment) */
export function isDeploymentMode(): boolean {
  return !!getDeploymentId();
}

/** Layout mode: floating launcher (default) or inline fill-container */
export function getWidgetMode(): "floating" | "inline" {
  return embedConfig().mode === "inline" ? "inline" : "floating";
}

/** Workspace identifier (legacy export for backward compatibility) */
export const WORKSPACE_ID = getWorkspaceId();
