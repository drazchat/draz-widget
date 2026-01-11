import { useState, useEffect, useRef, useMemo } from "react";
import { useSocket } from "@/context";

interface TooltipVisibilityResult {
  showTooltip: boolean;
  setShowTooltip: (value: boolean) => void;
  tooltipMessage: string | undefined;
}

/**
 * Custom hook to manage tooltip visibility based on widget state and messages.
 *
 * Shows tooltip when:
 * 1. Widget closes and there's a message to show
 * 2. New message arrives while widget is already closed
 *
 * @param isOpen - Whether the widget is currently open
 * @param initialShowTooltip - Initial visibility state from config
 */
export function useTooltipVisibility(
  isOpen: boolean,
  initialShowTooltip: boolean
): TooltipVisibilityResult {
  const [showTooltip, setShowTooltip] = useState(initialShowTooltip);

  const { messages } = useSocket();
  const wasOpenRef = useRef(isOpen);
  const lastSeenMessageIdRef = useRef<string | null>(null);

  // Get last bot message
  const lastBotMessage = useMemo(() => {
    return [...messages].reverse().find((m) => m.type === "bot");
  }, [messages]);

  const tooltipMessage = lastBotMessage?.text;

  useEffect(() => {
    const widgetJustClosed = wasOpenRef.current && !isOpen;
    const hasNewMessage =
      lastBotMessage && lastBotMessage.id !== lastSeenMessageIdRef.current;

    // Case 1: Widget just closed - show tooltip
    if (widgetJustClosed && lastBotMessage) {
      queueMicrotask(() => setShowTooltip(true));
      lastSeenMessageIdRef.current = lastBotMessage.id;
    }
    // Case 2: New message arrives while widget is closed - show tooltip
    else if (hasNewMessage && !isOpen) {
      queueMicrotask(() => setShowTooltip(true));
      lastSeenMessageIdRef.current = lastBotMessage.id;
    }
    // When widget opens, mark current message as seen
    else if (isOpen && lastBotMessage) {
      lastSeenMessageIdRef.current = lastBotMessage.id;
    }

    wasOpenRef.current = isOpen;
  }, [lastBotMessage, isOpen]);

  return { showTooltip, setShowTooltip, tooltipMessage };
}
