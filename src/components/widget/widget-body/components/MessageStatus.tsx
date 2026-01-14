import { memo } from "react";
import { Check, CheckCheck } from "lucide-react";
import { formatTime } from "@/lib/date-utils";

interface MessageStatusProps {
  timestamp: Date;
  status?: "sending" | "sent";
}

const MessageStatus = memo(function MessageStatus({
  timestamp,
  status,
}: MessageStatusProps) {
  return (
    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-gray-400">
      <span>{formatTime(timestamp)}</span>
      {status === "sending" ? (
        <Check className="w-3 h-3 opacity-70" />
      ) : (
        <CheckCheck className="w-3 h-3 opacity-70" />
      )}
    </div>
  );
});

export default MessageStatus;
