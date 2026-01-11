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
    <div className="w-full flex flex-wrap gap-2 mt-2 justify-end">
      {quickReplies.map((reply, index) => (
        <button
          key={index}
          onClick={() => handleClick(reply)}
          className={`px-3 py-2 bg-white border border-[#e5e7eb] text-[#4b5563] rounded-full hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer ${getFontSizeClass(
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
