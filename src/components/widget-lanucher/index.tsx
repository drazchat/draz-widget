import { useMemo, useCallback } from "react";
import type { WidgetLauncherProps } from "./launcher.types";
import { DEFAULT_LAUNCHER_COLOR } from "./launcher.constants";
import { useTooltipVisibility } from "./useTooltipVisibility";
import { isColorDark } from "../../lib/color-utils";
import BarLauncher from "./BarLauncher";
import CircleLauncher from "./CircleLauncher";
import LauncherTooltip from "./LauncherTooltip";

/**
 * Widget Launcher Component
 *
 * Displays a launcher button (bar or circle/square style) that opens the chat widget.
 * Features:
 * - Configurable shape (bar, circle, square)
 * - Configurable animations
 * - Tooltip showing last bot message or when new message is received when widget is closed
 * - Adaptive text colors based on background luminance
 */
const WidgetLauncher = ({ isOpen, setIsOpen, config }: WidgetLauncherProps) => {
  // Tooltip visibility management
  const { showTooltip, setShowTooltip, tooltipMessage } = useTooltipVisibility(
    isOpen,
    config.showChatBubble
  );

  // Memoized click handler for stable reference
  const handleOpen = useCallback(() => setIsOpen(true), [setIsOpen]);

  // Memoized button colors based on background luminance
  const buttonColors = useMemo(() => {
    const effectiveColor = config.widgetLauncherColor || DEFAULT_LAUNCHER_COLOR;
    const isDark = isColorDark(effectiveColor);
    return {
      text: isDark ? "text-white" : "text-gray-900",
      subtitle: isDark ? "text-white/70" : "text-gray-500",
      hover: isDark ? "hover:bg-white/15" : "hover:bg-black/10",
    };
  }, [config.widgetLauncherColor]);

  // Don't render when widget is open
  if (isOpen) return null;

  // Bar-style launcher
  if (config.widgetLauncherShape === "bar") {
    return (
      <BarLauncher
        config={config}
        buttonColors={buttonColors}
        onClick={handleOpen}
      />
    );
  }

  // Circle/Square launcher with tooltip
  return (
    <LauncherTooltip
      config={config}
      message={tooltipMessage}
      showTooltip={showTooltip}
      onOpenChange={setShowTooltip}
    >
      <CircleLauncher config={config} onClick={handleOpen} />
    </LauncherTooltip>
  );
};

export default WidgetLauncher;
