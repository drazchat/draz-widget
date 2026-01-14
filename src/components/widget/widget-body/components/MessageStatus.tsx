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
    <div className="dz:flex dz:items-center dz:justify-end dz:gap-1 dz:mt-1 dz:text-[10px] dz:text-gray-400">
      <span>{formatTime(timestamp)}</span>
      {status === "sending" ? (
        <Check className="dz:w-3 dz:h-3 dz:opacity-70" />
      ) : (
        <CheckCheck className="dz:w-3 dz:h-3 dz:opacity-70" />
      )}
    </div>
  );
});

export default MessageStatus;
