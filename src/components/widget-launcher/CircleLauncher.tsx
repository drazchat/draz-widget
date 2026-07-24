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

  const isCircle = config.widgetLauncherShape === "circle";
  const borderRadius = isCircle ? "50%" : "0";
  const launcherImage = config.widgetIcon || config.botAvatar || "";
  const usesCustomIcon = Boolean(config.widgetIcon);

  return (
    <div
      onClick={onClick}
      className={`cursor-pointer flex items-center justify-center widget-size-${config.bubbleSize ?? config.widgetSize}`}
    >
      <div
        className={`flex items-center justify-center text-white transition-transform hover:scale-105 ${animationClass} ${
          config.widgetLauncherColor !== "" ? "shadow-lg" : "shadow-none"
        }`}
        style={{
          backgroundColor: config.widgetLauncherColor,
          borderRadius,
          height: "100%",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <img
          src={launcherImage}
          alt="Widget Icon"
          style={{
            borderRadius,
            display: "block",
            height: "100%",
            objectFit: usesCustomIcon ? "contain" : "cover",
            padding: usesCustomIcon ? "18%" : "0",
            width: "100%",
          }}
        />
      </div>
    </div>
  );
});

export default CircleLauncher;
