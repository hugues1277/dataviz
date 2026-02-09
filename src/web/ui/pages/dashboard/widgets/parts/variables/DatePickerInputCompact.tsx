import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { parseISO, format } from "date-fns";
import { fr } from "date-fns/locale";

export interface DatePickerInputCompactProps {
  date: string;
  onDateChange: (date: Date | undefined) => void;
}
const DatePickerInputCompact: React.FC<DatePickerInputCompactProps> = ({
  date,
  onDateChange,
}) => {
  const [open, setOpen] = useState(false);
  const selectedDate = date ? parseISO(date) : undefined;
  const { t } = useTranslation();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="bg-transparent border-none text-[10px] text-blue-400 font-black tracking-wider px-1 py-0.5 outline-none cursor-pointer focus:text-blue-300 transition-colors hover:text-blue-300 flex items-center gap-1">
          <CalendarIcon size={10} />
          {selectedDate
            ? format(selectedDate, "dd/MM/yy")
            : t("datePicker.select")}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-[#2c3235] bg-[#181b1f] z-200"
        align="start"
      >
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            onDateChange(date);
            setOpen(false);
          }}
          locale={fr}
          initialFocus
          className="bg-[#181b1f] text-white [--cell-size:2.5rem] sm:[--cell-size:2rem]"
          classNames={{
            day: "text-white hover:bg-[#2c3235]",
            day_selected: "bg-blue-600 text-white hover:bg-blue-600",
            day_today: "bg-[#2c3235] text-white",
            caption_label: "text-white text-sm sm:text-base",
            dropdown: "bg-[#111217] border-[#2c3235] text-white",
            button_previous: "text-white hover:bg-[#2c3235]",
            button_next: "text-white hover:bg-[#2c3235]",
            weekday:
              "text-gray-400 text-xs sm:text-sm font-medium min-w-[2.5rem] sm:min-w-[2rem] px-1",
            weekdays: "mb-2",
            week: "gap-1 sm:gap-0",
            day_button:
              "min-w-[2.5rem] sm:min-w-[2rem] min-h-[2.5rem] sm:min-h-[2rem] text-sm",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePickerInputCompact;
