import { useEffect, useState, useMemo } from "react";
import type { ReactNode } from "react";
import type { WidgetConfig } from "./widget-config.types";
import { defaultWidgetConfig } from "./widget-config.types";
import { API_URL, getWorkspaceId } from "../socket/socket.config";
import { WidgetConfigContext } from "./widget-config.context";

// Consolidated state type for single atomic updates
interface ConfigState {
  config: WidgetConfig;
  isConfigLoaded: boolean;
  isConfigError: boolean;
}

// Provider component
export const WidgetConfigProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ConfigState>({
    config: defaultWidgetConfig,
    isConfigLoaded: false,
    isConfigError: false,
  });

  useEffect(() => {
    // AbortController for cleanup on unmount (prevents memory leaks)
    const controller = new AbortController();

    const fetchConfig = async () => {
      // Get workspace ID at runtime (after widget.entry.tsx sets global config)
      const workspaceId = getWorkspaceId();

      if (!workspaceId) {
        console.error("[WidgetConfig] No workspace ID available");
        setState((prev) => ({
          ...prev,
          isConfigLoaded: true,
          isConfigError: true,
        }));
        return;
      }

      const endpoint = `${API_URL}/widget/config/${workspaceId}`;

      try {
        const response = await fetch(endpoint, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          console.error("[WidgetConfig] Failed to fetch:", response.status);
          setState((prev) => ({
            ...prev,
            isConfigLoaded: true,
            isConfigError: true,
          }));
          return;
        }

        const data: Partial<WidgetConfig> = await response.json();

        // Merge with defaults (handles missing fields)
        setState({
          config: { ...defaultWidgetConfig, ...data },
          isConfigLoaded: true,
          isConfigError: false,
        });
      } catch (error) {
        // Ignore abort errors (expected on unmount)
        if (error instanceof Error && error.name === "AbortError") return;

        console.error("[WidgetConfig] Fetch error:", error);
        setState((prev) => ({
          ...prev,
          isConfigLoaded: true,
          isConfigError: true,
        }));
      }
    };

    fetchConfig();

    // Cleanup: abort in-flight request on unmount
    return () => controller.abort();
  }, []);

  // Memoized context value prevents unnecessary consumer re-renders
  const contextValue = useMemo(
    () => ({
      config: state.config,
      isConfigLoaded: state.isConfigLoaded,
      isConfigError: state.isConfigError,
    }),
    [state.config, state.isConfigLoaded, state.isConfigError]
  );

  return (
    <WidgetConfigContext.Provider value={contextValue}>
      {children}
    </WidgetConfigContext.Provider>
  );
};
