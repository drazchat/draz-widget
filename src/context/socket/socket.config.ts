// Socket configuration constants
// Uses Vite environment variables with development fallbacks
// In embed mode, reads from window.__DRAZ_WIDGET_CONFIG__ set by widget.entry.tsx

// Global type declaration for embed mode config
declare global {
  interface Window {
    __DRAZ_WIDGET_CONFIG__?: {
      workspaceId: string;
    };
  }
}

/** Socket.io server URL */
export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "https://api.draz.chat";

/** REST API base URL */
export const API_URL = import.meta.env.VITE_API_URL || "https://api.draz.chat";

/**
 * Get workspace identifier
 * Checks global config first (embed mode), then env var (dev mode)
 */
export function getWorkspaceId(): string {
  // Check for embed mode config first
  if (
    typeof window !== "undefined" &&
    window.__DRAZ_WIDGET_CONFIG__?.workspaceId
  ) {
    return window.__DRAZ_WIDGET_CONFIG__.workspaceId;
  }

  // Fall back to env var for development
  return import.meta.env.VITE_WORKSPACE_ID || "";
}

/** Workspace identifier (legacy export for backward compatibility) */
export const WORKSPACE_ID = getWorkspaceId();
