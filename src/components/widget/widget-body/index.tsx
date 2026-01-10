import {
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  Fragment,
  useState,
} from "react";
import { Check, CheckCheck, MessageCircle } from "lucide-react";
import { useSocket } from "../../../context/useSocket";
import QuickReplies from "./QuickReplies";
import Cards from "./Cards";
import { useWidgetConfig } from "../../../context/useWidgetConfig";
import { isColorDark } from "@/lib/color-utils";

// Helper to format date as "Today", "Yesterday", or "Month Day, Year"
const formatDateLabel = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// Check if two dates are on the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

// Date separator component
const DateSeparator = ({ date }: { date: Date }) => (
  <div className="flex items-center justify-center my-4 self-center">
    <div className="bg-gray-100 text-gray-500 border text-xs px-3 py-1 rounded-full">
      {formatDateLabel(date)}
    </div>
  </div>
);

// Bot avatar with image fallback
const BotAvatar = ({ src, className }: { src: string; className?: string }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`relative ${className || ""}`}>
      {/* Fallback icon - always rendered, hidden when image loads */}
      {(!imageLoaded || imageError) && (
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
          <MessageCircle size={14} className="text-gray-500" />
        </div>
      )}
      {/* Actual image - hidden until loaded */}
      {!imageError && (
        <img
          src={src}
          className={`w-6 h-6 rounded-full shrink-0 ${
            imageLoaded ? "" : "hidden"
          }`}
          alt="Bot"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};

// Typing indicator with animated dots
const TypingIndicator = () => (
  <div className="self-start max-w-[80%] my-2">
    <div className="flex items-start gap-2">
      <div className="bg-gray-100 text-gray-900 py-4 px-4 rounded-lg text-sm">
        <BotAvatar
          src="https://animateicons.vercel.app/winter-logo.svg"
          className="-mt-6 -ml-6"
        />
        <div className="flex items-center gap-1 px-1">
          <span className="w-1 h-1 bg-gray-400 rounded-full animate-typing-dot"></span>
          <span
            className="w-1 h-1 bg-gray-400 rounded-full animate-typing-dot"
            style={{ animationDelay: "0.2s" }}
          ></span>
          <span
            className="w-1 h-1 bg-gray-400 rounded-full animate-typing-dot"
            style={{ animationDelay: "0.4s" }}
          ></span>
        </div>
      </div>
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

  // Loading spinner while fetching history
  if (isLoadingHistory) {
    return (
      <div className="flex-1 bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 bg-white px-4 pb-4 overflow-y-auto scroll-auto flex flex-col"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Connection status */}
      {/* <div className="text-center text-xs text-gray-400 py-2">
        {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
      </div> */}

      {/* Messages */}
      {messages.map((msg, index) => {
        const { isFirstInGroup, isLastInGroup, isNewDay } =
          messageMetadata[index];
        const isUserMessage = msg.type === "user";
        const isSystemMessage = msg.type === "system";

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

        if (isUserMessage) {
          return (
            <Fragment key={msg.id}>
              {isNewDay && <DateSeparator date={msg.timestamp} />}
              <div className="self-end max-w-[80%] mb-1">
                <div
                  className={`px-4 py-3 rounded-xl rounded-br-none font-${config.fontSize}`}
                  style={{
                    backgroundColor:
                      config?.userMessageColor || config.primaryColor,
                    color: config?.userMessageTextColor || buttonColors.text,
                  }}
                >
                  {msg.text}
                </div>
                {isLastInGroup && (
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-400">
                    <span>
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {msg.status === "sending" ? (
                      <Check className="w-3 h-3 opacity-70" />
                    ) : (
                      <CheckCheck className="w-3 h-3 opacity-70" />
                    )}
                  </div>
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
                {/* Bot icon - only show on first message in group */}

                <div
                  className={`bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-${config.fontSize}`}
                >
                  {isFirstInGroup ? (
                    <BotAvatar
                      src="https://animateicons.vercel.app/winter-logo.svg"
                      className="-mt-6 -ml-6"
                    />
                  ) : (
                    <div className="w-6 shrink-0" />
                  )}
                  {msg.text}
                </div>
              </div>
              {/* Cards - rendered outside message container for full width */}
              {msg.cards && msg.cards.length > 0 && (
                <div className="self-start">
                  <Cards cards={msg.cards} />
                </div>
              )}

              {/* Timestamp - only show on last message in group */}
              {isLastInGroup && (
                <div className="ml-0 mt-1 text-[10px] text-gray-400">
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
            {/* Quick replies - rendered outside message container for full width, aligned right */}
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
      {isTyping && <TypingIndicator />}

      {/* Scroll anchor */}
      <div ref={chatEndRef} />
    </div>
  );
};

export default WidgetBody;
