import { memo } from "react";
import { formatDateLabel } from "@/lib/date-utils";

interface DateSeparatorProps {
  date: Date;
}

const DateSeparator = memo(function DateSeparator({
  date,
}: DateSeparatorProps) {
  return (
    <div className="flex items-center justify-center my-4 self-center">
      <div className="bg-gray-100 text-gray-500 border text-xs px-3 py-1 rounded-full">
        {formatDateLabel(date)}
      </div>
    </div>
  );
});

export default DateSeparator;
