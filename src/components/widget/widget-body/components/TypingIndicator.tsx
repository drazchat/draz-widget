import { memo } from "react";
import BotAvatar from "./BotAvatar";

interface TypingIndicatorProps {
  botAvatar?: string | null;
}

const TypingIndicator = memo(function TypingIndicator({
  botAvatar,
}: TypingIndicatorProps) {
  return (
    <div className="self-start max-w-[80%] my-2">
      <div className="flex items-start gap-2">
        <div className="bg-gray-100 text-gray-900 py-4 px-4 rounded-lg text-sm">
          <BotAvatar src={botAvatar || ""} className="-mt-6 -ml-6" />
          <div className="flex items-center gap-1 px-1">
            <span className="w-1 h-1 bg-gray-400 rounded-full animate-typing-dot" />
            <span
              className="w-1 h-1 bg-gray-400 rounded-full animate-typing-dot"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="w-1 h-1 bg-gray-400 rounded-full animate-typing-dot"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default TypingIndicator;
