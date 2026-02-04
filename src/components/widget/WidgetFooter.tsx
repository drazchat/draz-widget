import { Paperclip, SendHorizonal } from "lucide-react";
import type { WidgetConfig } from "@/context";

interface WidgetFooterProps {
  config?: WidgetConfig;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onRestartConversation: () => void;
}

const WidgetFooter = ({
  config,
  inputValue,
  onInputChange,
  onSend,
  onKeyDown,
  onRestartConversation,
}: WidgetFooterProps) => {
  return (
    <div
      className="flex flex-col pb-4 items-center justify-between px-4 pt-4 border-t border-gray-100 w-full bg-white"
      style={{ boxShadow: "0 0 1px rgba(0, 0, 0, 0.1)" }}
    >
      <div className="w-full flex gap-2 items-center">
        {config?.showHomeButton !== false && (
          <div className="cursor-pointer" onClick={onRestartConversation}>
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

        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask a question"
            className="w-full rounded-full border border-gray-300 px-4 py-3 pr-12 text-sm text-gray-700 placeholder:text-[#bababa] focus:outline-none focus:ring-0 focus:shadow-none"
          />

          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            type="button"
            onClick={onSend}
          >
            {inputValue.trim() ? (
              <SendHorizonal size={18} strokeWidth={2} />
            ) : (
              <Paperclip size={18} strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {config?.showBranding !== false && (
        <div className="flex items-center gap-2 text-[10px] pt-2 -mb-2">
          <p className="text-[#aeaeae]">Powered by</p>
          <a
            href="https://draz.chat"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            <img
              src="https://widget.draz.chat/draz-favicon-light.svg"
              alt=""
              width={15}
              height={15}
              className="grayscale-100 group-hover:grayscale-0"
            />
            <p className="text-[#aeaeae] group-hover:text-blue-600">
              Draz.chat
            </p>
          </a>
        </div>
      )}
    </div>
  );
};

export default WidgetFooter;
