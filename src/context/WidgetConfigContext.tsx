import { useEffect, useState, useMemo } from "react";
import type { ReactNode } from "react";
import type { WidgetConfig } from "./widget-config.types";
import { defaultWidgetConfig } from "./widget-config.types";
import { API_URL, WORKSPACE_ID } from "./socket.config";
import { WidgetConfigContext } from "./WidgetConfigContext.context";

// Provider component
export const WidgetConfigProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<WidgetConfig>(defaultWidgetConfig);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [isConfigError, setIsConfigError] = useState(false);

  // Fetch config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(
          `${API_URL}/widget/config/${WORKSPACE_ID}`
        );

        if (!response.ok) {
          console.error(
            "[WidgetConfig] Failed to fetch config:",
            response.status
          );
          setIsConfigError(true);
          // Use defaults on error
          setIsConfigLoaded(true);
          return;
        }

        const data = await response.json();

        // Merge API config with defaults (in case some fields are missing)
        setConfig({
          ...defaultWidgetConfig,
          ...data,
        });
        setIsConfigLoaded(true);
      } catch (error) {
        console.error("[WidgetConfig] Error fetching config:", error);
        setIsConfigError(true);
        // Use defaults on error
        setIsConfigLoaded(true);
      }
    };

    fetchConfig();
  }, []);

  const contextValue = useMemo(
    () => ({
      config,
      isConfigLoaded,
      isConfigError,
    }),
    [config, isConfigLoaded, isConfigError]
  );

  return (
    <WidgetConfigContext.Provider value={contextValue}>
      {children}
    </WidgetConfigContext.Provider>
  );
};
