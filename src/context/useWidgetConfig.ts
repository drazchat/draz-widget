import { useContext } from "react";
import { WidgetConfigContext } from "./WidgetConfigContext.context";
import type { WidgetConfigContextType } from "./widget-config.types";

// Hook to use widget config
export const useWidgetConfig = (): WidgetConfigContextType => {
  const context = useContext(WidgetConfigContext);
  if (!context) {
    throw new Error("useWidgetConfig must be used within WidgetConfigProvider");
  }
  return context;
};
