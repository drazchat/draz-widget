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
}

const Widget = ({ isOpen, setIsOpen, config }: WidgetProps) => {
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

  return (
    <div
      className={`flex h-[800px] max-h-[calc(100vh-6rem)] w-[400px] flex-col overflow-hidden rounded-2xl shadow-2xl ${
        isClosing ? "animate-widget-close" : "animate-widget-open"
      }`}
      onAnimationEnd={handleAnimationEnd}
    >
      <WidgetHeader
        config={config}
        onClose={handleClose}
        onRestartConversation={restartConversation}
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
