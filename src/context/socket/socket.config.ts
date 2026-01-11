// Socket configuration constants
// Uses Vite environment variables with development fallbacks

/** Socket.io server URL */
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost";

/** REST API base URL */
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost";

/** Workspace identifier */
export const WORKSPACE_ID =
  import.meta.env.VITE_WORKSPACE_ID || "01KCHM31DQSRE3QAH3QT5STQF3";
