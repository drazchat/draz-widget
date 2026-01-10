import { useSocket } from "../../../context/useSocket";
import type { QuickReply } from "../../../context/socket.types";

interface QuickRepliesProps {
  quickReplies: QuickReply[];
}

const QuickReplies = ({ quickReplies }: QuickRepliesProps) => {
  const { sendMessage } = useSocket();

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
          className="px-3 py-2 text-sm bg-white border border-[#e5e7eb] text-[#4b5563] rounded-full hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
        >
          {reply.label}
        </button>
      ))}
    </div>
  );
};

export default QuickReplies;
