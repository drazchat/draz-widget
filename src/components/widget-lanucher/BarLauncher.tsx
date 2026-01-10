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
      className="flex items-center gap-3 p-3 border rounded-xl shadow-lg cursor-pointer hover:scale-[1.02] transition-transform"
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
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>

      {/* Text content */}
      <div className="flex flex-col min-w-0 flex-1">
        <p className={`font-semibold text-sm truncate ${buttonColors.text}`}>
          {config.botName}
        </p>
        <p className={`text-xs truncate ${buttonColors.subtitle}`}>
          Hello, how can I help you today?
        </p>
      </div>
    </div>
  );
});

export default BarLauncher;
