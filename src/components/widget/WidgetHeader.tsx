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

  // Determine button colors based on the effective background color
  const buttonColors = useMemo(() => {
    const effectiveColor =
      config?.secondaryColor || config?.primaryColor || "#4f46e5";
    const isDark = isColorDark(effectiveColor);
    return {
      text: isDark ? "text-white" : "text-gray-900",
      subtitle: isDark ? "text-white/70" : "text-gray-500",
      hover: isDark ? "hover:bg-white/15" : "hover:bg-black/10",
    };
  }, [config?.primaryColor, config?.secondaryColor]);

  return (
    <div
      className="flex h-18 items-center justify-between px-4 rounded-t-2xl overflow-hidden border-b border-gray-200"
      style={{ background: headerBackground }}
    >
      <div className={`${buttonColors.text} flex items-center gap-3`}>
        <div className="rounded-full p-1 mt-1">
          <img
            src={config?.botAvatar || ""}
            alt="Bot Avatar"
            width={40}
            height={40}
          />
        </div>
        <div>
          <p className={`font-medium ${buttonColors.text} text-sm`}>
            {config?.botName}
          </p>
          <p className={`text-xs ${buttonColors.subtitle}`}>
            {config?.botSubtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {config?.showOptionsMenu !== false && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`${buttonColors.subtitle} ${buttonColors.hover} outline-none cursor-pointer transition-colors rounded-full p-1.5`}
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
          className={`${buttonColors.subtitle} ${buttonColors.hover} cursor-pointer transition-colors rounded-full p-1.5`}
        >
          <X size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default WidgetHeader;
