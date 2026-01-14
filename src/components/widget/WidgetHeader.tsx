import { useMemo } from "react";
import { EllipsisVertical, X } from "lucide-react";
import { isColorDark } from "@/lib/color-utils";
import type { WidgetConfig } from "@/context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WidgetHeaderProps {
  config?: WidgetConfig;
  onClose: () => void;
  onRestartConversation: () => void;
}

const WidgetHeader = ({
  config,
  onClose,
  onRestartConversation,
}: WidgetHeaderProps) => {
  // Compute header background based on color props
  const headerBackground = useMemo(() => {
    const defaultGradient = "linear-gradient(to right, #312e81, #4f46e5)";
    if (!config?.primaryColor) return defaultGradient;
    if (!config?.secondaryColor) return config?.primaryColor;
    return `linear-gradient(to right, ${config?.primaryColor}, ${config?.secondaryColor})`;
  }, [config?.primaryColor, config?.secondaryColor]);

  // Determine text and button colors
  const headerColors = useMemo(() => {
    const primary = config?.primaryColor || "";
    const secondary = config?.secondaryColor;

    // Check if primary is dark
    const isPrimaryDark = isColorDark(primary);

    // Check if secondary is dark (if it exists)
    const isSecondaryDark = secondary ? isColorDark(secondary) : false;

    // Title/Subtitle logic:
    // If primary color is light => title/subtitle should be dark
    // If primary color is dark => title/subtitle should be light
    const isTitleLight = isPrimaryDark;

    // Action Buttons logic:
    // If secondary exists:
    //   Use contrast of secondary color (Right side of gradient)
    //   (Ignore primary color for buttons to avoid white-on-white in Dark->Light gradients)
    // If secondary missing:
    //   Use primary => if primary dark => light buttons
    const isActionLight = secondary ? isSecondaryDark : isPrimaryDark;

    return {
      title: {
        text: isTitleLight ? "text-white" : "text-gray-900",
        subtitle: isTitleLight ? "text-white/70" : "text-black/70",
      },
      action: {
        icon: isActionLight ? "text-white/50" : "text-black/50",
        hover: isActionLight ? "hover:bg-white/15 hover:text-white" : "hover:bg-black/10 hover:text-black",
      },
    };
  }, [config?.primaryColor, config?.secondaryColor]);

  return (
    <div
      className="flex h-18 items-center justify-between px-4 rounded-t-2xl overflow-hidden border-b border-gray-200"
      style={{ background: headerBackground }}
    >
      <div className={`${headerColors.title.text} flex items-center gap-3`}>
        <div className="rounded-full p-1 mt-1">
          <img
            src={config?.botAvatar || ""}
            alt="Bot Avatar"
            width={40}
            height={40}
          />
        </div>
        <div>
          <p className={`font-medium ${headerColors.title.text} text-sm`}>
            {config?.botName}
          </p>
          <p className={`text-xs ${headerColors.title.subtitle}`}>
            {config?.botSubtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {config?.showOptionsMenu !== false && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`${headerColors.action.icon} ${headerColors.action.hover} outline-none cursor-pointer transition-colors rounded-full p-1.5`}
            >
              <EllipsisVertical size={18} strokeWidth={2} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[280px]"
              sideOffset={5}
              align="end"
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onRestartConversation}>
                Restart Conversation
              </DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem>Subscription</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <button
          onClick={onClose}
          className={`${headerColors.action.icon} ${headerColors.action.hover} cursor-pointer transition-colors rounded-full p-1.5`}
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default WidgetHeader;
