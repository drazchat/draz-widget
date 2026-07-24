import { useState, useEffect, useCallback } from "react";
import WidgetBody from "./widget-body";
import WidgetHeader from "./WidgetHeader";
import WidgetFooter from "./WidgetFooter";
import ConnectionBanner from "./ConnectionBanner";
import { useConnectionBanner } from "./hooks/useConnectionBanner";
import { useSocket } from "@/context";
import type { WidgetConfig } from "@/context";

interface WidgetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  config?: WidgetConfig;
  /** "floating" = launcher panel (default); "inline" = fills its container */
  variant?: "floating" | "inline";
}

const Widget = ({
  isOpen,
  setIsOpen,
  config,
  variant = "floating",
}: WidgetProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const {
    sendMessage,
    isConnected,
    socket,
    restartConversation,
    fetchHistory,
  } = useSocket();

  const { showConnectedBanner } = useConnectionBanner(isConnected);

  // Fetch history when widget opens
  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, fetchHistory]);

  // Handlers
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  }, [setIsOpen]);

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue("");
  }, [inputValue, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleRetryConnection = useCallback(() => {
    socket?.connect();
  }, [socket]);

  const handleAnimationEnd = useCallback(() => {
    if (isClosing) {
      setIsClosing(false);
    }
  }, [isClosing]);

  // Show widget if open OR if currently animating close
  const isVisible = isOpen || isClosing;

  if (!isVisible) return null;

  const isInline = variant === "inline";
  // The size setting changes only the chat window HEIGHT — width stays fixed and
  // the launcher bubble has its own `bubbleSize`. Height is capped to the
  // viewport. Inline embeds fill their container instead.
  const HEIGHT_BY_SIZE: Record<string, number> = {
    xs: 480,
    sm: 540,
    md: 600,
    lg: 660,
    xl: 720,
    "2xl": 780,
    "3xl": 840,
  };
  const panelHeight = HEIGHT_BY_SIZE[config?.widgetSize ?? "lg"] ?? 660;

  const frameClassName = isInline
    ? "flex h-full w-full flex-col overflow-hidden"
    : `flex w-[400px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-2xl ${
        isClosing ? "animate-widget-close" : "animate-widget-open"
      }`;

  return (
    <div
      className={frameClassName}
      style={
        isInline
          ? undefined
          : {
              height: panelHeight,
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            }
      }
      onAnimationEnd={handleAnimationEnd}
    >
      <WidgetHeader
        config={config}
        onClose={handleClose}
        onRestartConversation={restartConversation}
        hideClose={isInline}
      />

      <ConnectionBanner
        isConnected={isConnected}
        showConnectedBanner={showConnectedBanner}
        onRetry={handleRetryConnection}
      />

      <WidgetBody />

      <WidgetFooter
        config={config}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
        onRestartConversation={restartConversation}
      />
    </div>
  );
};

export default Widget;
