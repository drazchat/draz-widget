import { memo } from "react";
import type { BarLauncherProps } from "./launcher.types";
import { BAR_LAUNCHER_WIDTH } from "./launcher.constants";

/**
 * Bar-style launcher component with avatar and text content.
 * Memoized to prevent unnecessary re-renders.
 */
const BarLauncher = memo(function BarLauncher({
  config,
  buttonColors,
  onClick,
}: BarLauncherProps) {
  return (
    <div
      onClick={onClick}
      className="dz:flex dz:items-center dz:gap-3 dz:p-3 dz:border dz:rounded-xl dz:shadow-lg dz:cursor-pointer hover:dz:scale-[1.02] dz:transition-transform"
      style={{
        backgroundColor: config.widgetLauncherColor,
        minWidth: BAR_LAUNCHER_WIDTH,
        maxWidth: BAR_LAUNCHER_WIDTH,
      }}
    >
      {/* Avatar */}
      <div>
        <img
          src={config.botAvatar || ""}
          alt="Bot Avatar"
          className="dz:w-12 dz:h-12 dz:rounded-full dz:object-cover"
        />
      </div>

      {/* Text content */}
      <div className="dz:flex dz:flex-col dz:min-w-0 dz:flex-1">
        <p
          className={`dz:font-semibold dz:text-sm dz:truncate ${buttonColors.text}`}
        >
          {config.botName}
        </p>
        <p className={`dz:text-xs dz:truncate ${buttonColors.subtitle}`}>
          Hello, how can I help you today?
        </p>
      </div>
    </div>
  );
});

export default BarLauncher;
