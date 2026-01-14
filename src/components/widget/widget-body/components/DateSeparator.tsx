import { memo } from "react";
import { formatDateLabel } from "@/lib/date-utils";

interface DateSeparatorProps {
  date: Date;
}

const DateSeparator = memo(function DateSeparator({
  date,
}: DateSeparatorProps) {
  return (
    <div className="dz:flex dz:items-center dz:justify-center dz:my-4 dz:self-center">
      <div className="dz:bg-gray-100 dz:text-gray-500 dz:border dz:text-xs dz:px-3 dz:py-1 dz:rounded-full">
        {formatDateLabel(date)}
      </div>
    </div>
  );
});

export default DateSeparator;
