import { createContext } from "react";
import type { WidgetConfigContextType } from "./widget-config.types";
import { defaultWidgetConfig } from "./widget-config.types";

// Create context with default values
export const WidgetConfigContext = createContext<WidgetConfigContextType>({
  config: defaultWidgetConfig,
  isConfigLoaded: false,
  isConfigError: false,
});
