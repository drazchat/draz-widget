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
  <div className="dz:flex-1 dz:bg-white dz:flex dz:items-center dz:justify-center">
    <div className="dz:flex dz:flex-col dz:items-center dz:gap-3">
      <div className="dz:w-8 dz:h-8 dz:border-4 dz:border-indigo-200 dz:border-t-indigo-600 dz:rounded-full dz:animate-spin" />
      <p className="dz:text-sm dz:text-gray-500">Loading messages...</p>
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
      className="dz:flex-1 dz:bg-white dz:px-4 dz:pb-4 dz:overflow-y-auto dz:scroll-auto dz:flex dz:flex-col"
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
              <div className="dz:self-center dz:text-gray-400 dz:text-xs dz:italic dz:mb-3">
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
              <div className="dz:self-end dz:max-w-[80%] dz:mb-1">
                <div
                  className={`dz:px-4 dz:py-3 dz:rounded-xl dz:rounded-br-none ${getFontSizeClass(
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
            <div className="dz:self-start dz:max-w-[80%] dz:mb-1">
              <div className="dz:flex dz:items-start dz:gap-2">
                <div
                  className={`dz:bg-gray-100 dz:text-gray-700 dz:py-3 dz:px-4 dz:rounded-lg ${getFontSizeClass(
                    config.fontSize
                  )}`}
                >
                  {isFirstInGroup ? (
                    <BotAvatar
                      src={config.botAvatar || ""}
                      className="dz:-mt-6 dz:-ml-6"
                    />
                  ) : (
                    <div className="dz:w-6 dz:shrink-0" />
                  )}
                  {msg.text}
                </div>
              </div>

              {/* Cards */}
              {msg.cards && msg.cards.length > 0 && (
                <div className="dz:self-start">
                  <Cards cards={msg.cards} />
                </div>
              )}

              {/* Timestamp */}
              {isLastInGroup && (
                <div className="dz:ml-0 dz:mt-1 dz:text-[10px] dz:text-gray-400">
                  {formatTime(msg.timestamp)}
                </div>
              )}
            </div>

            {/* Quick replies - only for last message */}
            {msg.quickReplies &&
              msg.quickReplies.length > 0 &&
              index === messages.length - 1 && (
                <div className="dz:self-end dz:w-4/5">
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
