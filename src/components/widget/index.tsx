import { useState, useMemo, useEffect, useRef } from "react";
import {
  EllipsisVertical,
  X,
  Paperclip,
  SendHorizonal,
  RefreshCw,
  Wifi,
} from "lucide-react";
import { isColorDark } from "../../lib/color-utils";
import WidgetBody from "./widget-body";
import { useSocket } from "../../context/useSocket";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { WidgetConfig } from "../../context/widget-config.types";

interface WidgetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  config?: WidgetConfig; // Full config from API
}

const Widget = ({ isOpen, setIsOpen, config }: WidgetProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  return (
    <WidgetContent
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      config={config}
      isClosing={isClosing}
      setIsClosing={setIsClosing}
      inputValue={inputValue}
      setInputValue={setInputValue}
    />
  );
};

// Inner component that can use the socket context
const WidgetContent = ({
  isOpen,
  setIsOpen,
  config,
  isClosing,
  setIsClosing,
  inputValue,
  setInputValue,
}: WidgetProps & {
  isClosing: boolean;
  setIsClosing: (v: boolean) => void;
  inputValue: string;
  setInputValue: (v: string) => void;
}) => {
  const {
    sendMessage,
    isConnected,
    socket,
    restartConversation,
    fetchHistory,
  } = useSocket();
  const [showConnectedBanner, setShowConnectedBanner] = useState(false);
  const wasConnectedRef = useRef(false);
  const hadDisconnectionRef = useRef(false); // Track if we ever had a disconnection
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch history when widget opens
  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, fetchHistory]);

  // Show connected banner for 4 seconds when REconnecting after a disconnection
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Only show banner when reconnecting AFTER having been disconnected (not first connection)
    if (
      isConnected &&
      !wasConnectedRef.current &&
      hadDisconnectionRef.current
    ) {
      wasConnectedRef.current = true;
      queueMicrotask(() => {
        setShowConnectedBanner(true);
      });
      timerRef.current = setTimeout(() => {
        setShowConnectedBanner(false);
      }, 4000);
    } else if (isConnected && !wasConnectedRef.current) {
      // First connection - just mark as connected, don't show banner
      wasConnectedRef.current = true;
    } else if (!isConnected && wasConnectedRef.current) {
      // Disconnection event - mark that we had a disconnection
      hadDisconnectionRef.current = true;
      wasConnectedRef.current = false;
      queueMicrotask(() => {
        setShowConnectedBanner(false);
      });
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isConnected]);

  // Retry connection handler
  const handleRetryConnection = () => {
    if (socket) {
      socket.connect();
    }
  };

  // Compute header background based on color props
  const headerBackground = useMemo(() => {
    // Default indigo gradient if no colors provided
    const defaultGradient = "linear-gradient(to right, #312e81, #4f46e5)";

    if (!config?.primaryColor) return defaultGradient;
    if (!config?.secondaryColor) return config?.primaryColor; // Solid color
    return `linear-gradient(to right, ${config?.primaryColor}, ${config?.secondaryColor})`;
  }, [config?.primaryColor, config?.secondaryColor]);

  // Determine button colors based on the effective background color
  const buttonColors = useMemo(() => {
    // Use secondaryColor for luminance check (right side of gradient), fallback to primary, then default
    const effectiveColor =
      config?.secondaryColor || config?.primaryColor || "#4f46e5";
    const isDark = isColorDark(effectiveColor);
    return {
      text: isDark ? "text-white" : "text-gray-900",
      subtitle: isDark ? "text-white/70" : "text-gray-500",
      hover: isDark ? "hover:bg-white/15" : "hover:bg-black/10",
    };
  }, [config?.primaryColor, config?.secondaryColor]);

  // Show widget if open OR if currently animating close
  const isVisible = isOpen || isClosing;

  const handleAnimationEnd = () => {
    if (isClosing) {
      setIsClosing(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div>
      {isVisible && (
        <div
          className={`flex h-[800px] max-h-[calc(100vh-6rem)] w-[400px] flex-col overflow-hidden rounded-2xl shadow-2xl ${
            isClosing ? "animate-widget-close" : "animate-widget-open"
          }`}
          onAnimationEnd={handleAnimationEnd}
        >
          <div
            className="flex h-18 items-center justify-between px-4 rounded-t-2xl overflow-hidden border-b border-gray-200"
            style={{ background: headerBackground }}
          >
            <div className={`${buttonColors.text} flex items-center gap-3`}>
              <div className={`rounded-full p-1 mt-1`}>
                <img
                  src="https://animateicons.vercel.app/winter-logo.svg"
                  alt="Logo"
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
                    <DropdownMenuItem onClick={restartConversation}>
                      Restart Conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem>Billing</DropdownMenuItem>
                    <DropdownMenuItem>Team</DropdownMenuItem>
                    <DropdownMenuItem>Subscription</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <button
                onClick={handleClose}
                className={`${buttonColors.subtitle} ${buttonColors.hover} cursor-pointer transition-colors rounded-full p-1.5`}
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
          </div>
          {/* Connection status banner */}
          {!isConnected && (
            <div className="flex items-center justify-between px-4 py-2 bg-red-200 text-red-700 text-xs border  animate-fade-in">
              <div className="flex items-center gap-2">
                <span>
                  Looks like you're offline. Check your internet connection and
                  refresh the page to try again.
                </span>
                <button
                  onClick={handleRetryConnection}
                  className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-300/55 hover:text-red-700 cursor-pointer rounded-full text-xs font-medium transition-colors"
                >
                  <RefreshCw size={12} />
                  Retry
                </button>
              </div>
            </div>
          )}
          {isConnected && showConnectedBanner && (
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-200 text-green-700 text-xs border animate-fade-in">
              <Wifi size={16} />
              <span>You are connected.</span>
            </div>
          )}
          <WidgetBody />
          <div className="flex flex-col pb-4 items-center justify-between px-4 pt-4 border-t border-gray-100 w-full bg-white">
            <div className="relative w-full flex gap-2 items-center">
              {config?.showHomeButton !== false && (
                <div className="cursor-pointer" onClick={restartConversation}>
                  <svg
                    className="w-8 h-8 fill-gray-400 hover:fill-gray-600 transition-colors"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question"
                className="w-full rounded-full border border-gray-300 px-4 py-3 pr-12 text-sm placeholder:text-[#bababa] focus:outline-none"
              />
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                type="button"
                onClick={handleSend}
              >
                {inputValue.trim() ? (
                  <SendHorizonal size={18} strokeWidth={2} />
                ) : (
                  <Paperclip size={18} strokeWidth={2} />
                )}
              </button>
            </div>
            {config?.showBranding !== false && (
              <div className="flex items-center gap-2 text-[10px] text-[#aeaeae] pt-2 -mb-2">
                <p>Powered by</p>
                <a
                  href="https://draz.chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1 hover:opacity-80 transition-opacity"
                >
                  <img
                    src="../../../public/draz-favicon-light.svg"
                    alt=""
                    width={15}
                    height={15}
                    className="grayscale-100 group-hover:grayscale-0"
                  />
                  <p className="group-hover:text-blue-600">Draz.chat</p>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Widget;
