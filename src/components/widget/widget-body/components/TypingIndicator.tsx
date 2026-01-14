import { memo } from "react";
import BotAvatar from "./BotAvatar";

interface TypingIndicatorProps {
  botAvatar?: string | null;
}

const TypingIndicator = memo(function TypingIndicator({
  botAvatar,
}: TypingIndicatorProps) {
  return (
    <div className="dz:self-start dz:max-w-[80%] dz:my-2">
      <div className="dz:flex dz:items-start dz:gap-2">
        <div className="dz:bg-gray-100 dz:text-gray-900 dz:py-4 dz:px-4 dz:rounded-lg dz:text-sm">
          <BotAvatar src={botAvatar || ""} className="dz:-mt-6 dz:-ml-6" />
          <div className="dz:flex dz:items-center dz:gap-1 dz:px-1">
            <span className="dz:w-1 dz:h-1 dz:bg-gray-400 dz:rounded-full dz:animate-typing-dot" />
            <span
              className="dz:w-1 dz:h-1 dz:bg-gray-400 dz:rounded-full dz:animate-typing-dot"
              style={{ animationDelay: "0.2s" }}
            />
            <span
              className="dz:w-1 dz:h-1 dz:bg-gray-400 dz:rounded-full dz:animate-typing-dot"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default TypingIndicator;
