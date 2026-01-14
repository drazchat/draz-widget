import { useSocket, useWidgetConfig } from "@/context";
import type { QuickReply } from "@/context";
import { getFontSizeClass } from "@/lib/font-utils";

interface QuickRepliesProps {
  quickReplies: QuickReply[];
}

const QuickReplies = ({ quickReplies }: QuickRepliesProps) => {
  const { sendMessage } = useSocket();
  const { config } = useWidgetConfig();

  if (!quickReplies || quickReplies.length === 0) return null;

  const handleClick = (reply: QuickReply) => {
    // Show label in chat UI, but send value (or label if no value) to socket
    sendMessage(reply.label, reply.value || reply.label);
  };

  return (
    <div className="dz:w-full dz:flex dz:flex-wrap dz:gap-2 dz:mt-2 dz:justify-end">
      {quickReplies.map((reply, index) => (
        <button
          key={index}
          onClick={() => handleClick(reply)}
          className={`dz:px-3 dz:py-2 dz:bg-white dz:border dz:border-[#e5e7eb] dz:text-[#4b5563] dz:rounded-full hover:dz:bg-gray-100 hover:dz:border-gray-300 dz:transition-colors dz:cursor-pointer ${getFontSizeClass(
            config.fontSize
          )}`}
        >
          {reply.label}
        </button>
      ))}
    </div>
  );
};

export default QuickReplies;
