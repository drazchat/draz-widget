import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LauncherTooltipProps } from "./launcher.types";
import { TOOLTIP_MAX_LENGTH } from "./launcher.constants";

/**
 * Tooltip wrapper for the launcher button.
 * Displays last bot message with truncation.
 */
const LauncherTooltip = ({
  config,
  message,
  showTooltip,
  onOpenChange,
  children,
}: LauncherTooltipProps) => {
  console.log("LauncherTooltip render", { showTooltip, message });
  const truncatedMessage =
    message && message.length > TOOLTIP_MAX_LENGTH
      ? `${message.slice(0, TOOLTIP_MAX_LENGTH)}...`
      : message;

  return (
    <Tooltip
      open={showTooltip}
      onOpenChange={(open) => !open && onOpenChange(false)}
    >
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      {message && (
        <TooltipContent
          side="top"
          align={config.widgetPosition === "left" ? "start" : "end"}
          sideOffset={8}
        >
          <p className="text-xs">{truncatedMessage}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};

export default LauncherTooltip;
