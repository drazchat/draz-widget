import { memo } from "react";
import { Check, CheckCheck, AlertCircle } from "lucide-react";
import { formatTime } from "@/lib/date-utils";

interface MessageStatusProps {
  timestamp: Date;
  status?: "sending" | "sent" | "failed";
}

const MessageStatus = memo(function MessageStatus({
  timestamp,
  status,
}: MessageStatusProps) {
  if (status === "failed") {
    return (
      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-red-400">
        <span>Not sent</span>
        <AlertCircle className="w-3 h-3" />
      </div>
    );
  }

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
