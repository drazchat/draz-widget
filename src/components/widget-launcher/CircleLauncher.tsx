import { memo } from "react";
import type { LauncherButtonProps } from "./launcher.types";
import { ANIMATION_CLASSES } from "./launcher.constants";

/**
 * Circle/Square launcher button component.
 * Memoized to prevent unnecessary re-renders.
 */
const CircleLauncher = memo(function CircleLauncher({
  config,
  onClick,
}: LauncherButtonProps) {
  const animationClass = config.launcherAnimation
    ? ANIMATION_CLASSES[config.launcherAnimation]
    : "";

  const borderRadius = config.widgetLauncherShape === "circle" ? "50%" : "4px";

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer flex items-center justify-center widget-size-${config.widgetSize}`}
    >
      <div
        className={`flex items-center justify-center text-white transition-transform hover:scale-105 ${animationClass} ${
          config.widgetLauncherColor !== "" ? "shadow-lg" : "shadow-none"
        }`}
        style={{
          backgroundColor: config.widgetLauncherColor,
          borderRadius,
          height: "100%",
          width: "100%",
        }}
      >
        {config.widgetIcon ? (
          <img src={config.widgetIcon} alt="Widget Icon" />
        ) : (
          <img src={config.botAvatar || ""} alt="Widget Icon" />
        )}
      </div>
    </div>
  );
});

export default CircleLauncher;
