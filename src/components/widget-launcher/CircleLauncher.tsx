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
      className={`dz:cursor-pointer dz:flex dz:items-center dz:justify-center widget-size-${config.widgetSize}`}
    >
      <div
        className={`dz:flex dz:items-center dz:justify-center dz:text-white dz:shadow-lg dz:transition-transform hover:dz:scale-105 ${animationClass}`}
        style={{
          backgroundColor: config.widgetLauncherColor || config.primaryColor,
          border: `2px solid ${config.widgetLauncherColor}`,
          boxShadow: `0 0 0 2px ${config.widgetLauncherColor}`,
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
