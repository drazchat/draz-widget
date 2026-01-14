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
    <div className="dz:flex dz:flex-col dz:pb-4 dz:items-center dz:justify-between dz:px-4 dz:pt-4 dz:border-t dz:border-gray-100 dz:w-full dz:bg-white">
      <div className="dz:relative dz:w-full dz:flex dz:gap-2 dz:items-center">
        {config?.showHomeButton !== false && (
          <div className="dz:cursor-pointer" onClick={onRestartConversation}>
            <svg
              className="dz:w-8 dz:h-8 dz:fill-gray-400 hover:dz:fill-gray-600 dz:transition-colors"
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
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask a question"
          className="dz:w-full dz:rounded-full dz:border dz:border-gray-300 dz:px-4 dz:py-3 dz:pr-12 dz:text-sm dz:placeholder:text-[#bababa] focus:dz:outline-none"
        />

        <button
          className="dz:absolute dz:right-2 dz:top-1/2 dz:-translate-y-1/2 dz:p-2 dz:text-gray-400 hover:dz:text-gray-600 dz:transition-colors dz:cursor-pointer"
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

      {config?.showBranding !== false && (
        <div className="dz:flex dz:items-center dz:gap-2 dz:text-[10px] !dz:text-[#aeaeae] dz:pt-2 dz:-mb-2">
          <p>Powered by</p>
          <a
            href="https://draz.chat"
            target="_blank"
            rel="noopener noreferrer"
            className="dz:group dz:flex dz:items-center dz:gap-1 hover:dz:opacity-80 dz:transition-opacity"
          >
            <img
              src="https://widget.draz.chat/draz-favicon-light.svg"
              alt=""
              width={15}
              height={15}
              className="dz:grayscale-100 group-hover:dz:grayscale-0"
            />
            <p className="group-hover:dz:text-blue-600">Draz.chat</p>
          </a>
        </div>
      )}
    </div>
  );
};

export default WidgetFooter;
