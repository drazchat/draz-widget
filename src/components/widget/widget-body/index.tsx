import { useRef, useEffect, useLayoutEffect, useMemo, Fragment } from "react";
import { useSocket, useWidgetConfig } from "@/context";
import { isColorDark } from "@/lib/color-utils";
import { isSameDay, formatTime } from "@/lib/date-utils";
import { getFontSizeClass } from "@/lib/font-utils";
import QuickReplies from "./QuickReplies";
import Cards from "./Cards";
import DateSeparator from "./components/DateSeparator";
import BotAvatar from "./components/BotAvatar";
import TypingIndicator from "./components/TypingIndicator";
import MessageStatus from "./components/MessageStatus";

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex-1 bg-white flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-500">Loading messages...</p>
    </div>
  </div>
);

const WidgetBody = () => {
  const { messages, isTyping, isLoadingHistory } = useSocket();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isInitialRenderRef = useRef(true);
  const { config } = useWidgetConfig();

  // Initial scroll - use useLayoutEffect to scroll BEFORE browser paints
  useLayoutEffect(() => {
    if (isInitialRenderRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "auto" });
      isInitialRenderRef.current = false;
    }
  }, []);

  // Smooth scroll for new messages after initial render
  useEffect(() => {
    if (!isInitialRenderRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, isTyping]);

  // Determine button colors based on the effective background color
  const buttonColors = useMemo(() => {
    const effectiveColor = config.userMessageColor || config.primaryColor;
    const isDark = isColorDark(effectiveColor);
    return {
      text: isDark ? "#ffffff" : "#000000",
    };
  }, [config.primaryColor, config.userMessageColor]);

  // Determine first/last message in consecutive groups and date changes
  const messageMetadata = useMemo(() => {
    return messages.map((msg, index) => {
      const prevMsg = messages[index - 1];
      const nextMsg = messages[index + 1];

      const isFirstInGroup = !prevMsg || prevMsg.type !== msg.type;
      const isLastInGroup = !nextMsg || nextMsg.type !== msg.type;
      const isNewDay = !prevMsg || !isSameDay(prevMsg.timestamp, msg.timestamp);

      return { isFirstInGroup, isLastInGroup, isNewDay };
    });
  }, [messages]);

  // Loading spinner while fetching history or waiting for first message
  if (isLoadingHistory || messages.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div
      className="flex-1 bg-white px-4 pb-4 overflow-y-auto scroll-auto flex flex-col"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Messages */}
      {messages.map((msg, index) => {
        const { isFirstInGroup, isLastInGroup, isNewDay } =
          messageMetadata[index];
        const isUserMessage = msg.type === "user";
        const isSystemMessage = msg.type === "system";

        // System message
        if (isSystemMessage) {
          return (
            <Fragment key={msg.id}>
              {isNewDay && <DateSeparator date={msg.timestamp} />}
              <div className="self-center text-gray-400 text-xs italic mb-3">
                {msg.text}
              </div>
            </Fragment>
          );
        }

        // User message
        if (isUserMessage) {
          return (
            <Fragment key={msg.id}>
              {isNewDay && <DateSeparator date={msg.timestamp} />}
              <div className="self-end max-w-[80%] mb-1">
                <div
                  className={`px-4 py-3 rounded-xl rounded-br-none ${getFontSizeClass(
                    config.fontSize
                  )}`}
                  style={{
                    backgroundColor:
                      config?.userMessageColor || config.primaryColor,
                    color: config?.userMessageTextColor || buttonColors.text,
                  }}
                >
                  {msg.text}
                </div>
                {isLastInGroup && (
                  <MessageStatus
                    timestamp={msg.timestamp}
                    status={msg.status}
                  />
                )}
              </div>
            </Fragment>
          );
        }

        // Bot/Agent message
        return (
          <Fragment key={msg.id}>
            {isNewDay && <DateSeparator date={msg.timestamp} />}
            <div className="self-start max-w-[80%] mb-1">
              <div className="flex items-start gap-2">
                <div
                  className={`bg-gray-100 text-gray-700 py-3 px-4 rounded-lg ${getFontSizeClass(
                    config.fontSize
                  )}`}
                >
                  {isFirstInGroup ? (
                    <BotAvatar
                      src={config.botAvatar || ""}
                      className="-mt-6 -ml-6"
                    />
                  ) : (
                    <div className="w-6 shrink-0" />
                  )}
                  {msg.text}
                </div>
              </div>

              {/* Cards */}
              {msg.cards && msg.cards.length > 0 && (
                <div className="self-start">
                  <Cards cards={msg.cards} />
                </div>
              )}

              {/* Timestamp */}
              {isLastInGroup && (
                <div className="ml-0 mt-1 text-[10px] text-gray-400">
                  {formatTime(msg.timestamp)}
                </div>
              )}
            </div>

            {/* Quick replies - only for last message */}
            {msg.quickReplies &&
              msg.quickReplies.length > 0 &&
              index === messages.length - 1 && (
                <div className="self-end w-4/5">
                  <QuickReplies quickReplies={msg.quickReplies} />
                </div>
              )}
          </Fragment>
        );
      })}

      {/* Typing indicator */}
      {isTyping && <TypingIndicator botAvatar={config.botAvatar} />}

      {/* Scroll anchor */}
      <div ref={chatEndRef} />
    </div>
  );
};

export default WidgetBody;
