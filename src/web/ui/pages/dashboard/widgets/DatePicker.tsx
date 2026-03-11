import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Infinity as InfinityIcon,
  ChevronDown,
} from "lucide-react";
import type { DateRange } from "../../../../../shared/types";
import { differenceInDays, parseISO } from "date-fns";
import { subDays } from "date-fns/subDays";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "../../../../core/utils/cn";

interface DatePickerProps {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  isAllTime: boolean;
  setAllTime: () => void;
}

interface PresetOption {
  label: string;
  days: number;
}

interface DatePickerInputProps {
  date: string;
  onDateChange: (date: Date | undefined) => void;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  date,
  onDateChange,
}) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const selectedDate = date ? parseISO(date) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-9 text-xs bg-[#111217] border-[#2c3235] text-white hover:bg-[#1a1d24] hover:text-white",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-3 w-3" />
          {selectedDate ? (
            format(selectedDate, "dd/MM/yy")
          ) : (
            <span className="text-gray-500">{t("datePicker.selectDate")}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-[#2c3235] bg-[#181b1f] z-250"
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

const DatePicker: React.FC<DatePickerProps> = ({
  dateRange,
  setDateRange,
  isAllTime,
  setAllTime,
}) => {
  const { t } = useTranslation();

  // Raccourcis sur le côté
  const shortcuts: PresetOption[] = useMemo(
    () => [
      { label: t("datePicker.shortcuts.days7"), days: 7 },
      { label: t("datePicker.shortcuts.days30"), days: 30 },
      { label: t("datePicker.shortcuts.months3"), days: 90 },
      { label: t("datePicker.shortcuts.months6"), days: 180 },
      { label: t("datePicker.shortcuts.year1"), days: 365 },
      { label: t("datePicker.shortcuts.years2"), days: 730 },
      { label: t("datePicker.shortcuts.years5"), days: 1825 },
    ],
    [t]
  );

  const smallShortcuts: PresetOption[] = useMemo(
    () => [
      { label: t("datePicker.smallShortcuts.day1"), days: 1 },
      { label: t("datePicker.smallShortcuts.days7"), days: 7 },
      { label: t("datePicker.smallShortcuts.days30"), days: 30 },
      { label: t("datePicker.smallShortcuts.months3"), days: 90 },
    ],
    [t]
  );

  // Retourner le raccourci actif pour la différence de plage de dates
  const activeShortcut = useMemo(() => {
    return (
      shortcuts.find(
        (preset) =>
          preset.days ===
          differenceInDays(new Date(dateRange.to), new Date(dateRange.from))
      ) || null
    );
  }, [dateRange, shortcuts]);

  const formatDateDisplay = (date: Date) => {
    return format(date, "dd/MM/yy");
  };

  const applyPreset = (preset: PresetOption) => {
    setDateRange({
      ...dateRange,
      from: subDays(new Date(), preset.days),
      to: new Date(),
    });
  };

  return (
    <div className="flex flex-row items-center shrink-0">
      <div className="hidden lg:flex mr-2 p-1 items-center bg-[#181b1f]/50 border-[#2c3235] text-gray-200 hover:border-[#3b82f6]/50 rounded-lg overflow-x-auto scrollbar-none max-w-[320px] lg:max-w-none">
        {smallShortcuts.map((preset) => (
          <button
            key={preset.label}
            onClick={() =>
              setDateRange({
                ...dateRange,
                from: subDays(new Date(), preset.days),
                to: new Date(),
              })
            }
            className={`px-3 py-1 text-[10px] lg:text-[11px] font-medium rounded-md transition-all shrink-0 ${
              !isAllTime &&
              format(subDays(new Date(), preset.days), "yyyy-MM-dd") ===
                format(dateRange.from, "yyyy-MM-dd")
                ? "bg-[#1a1c26] text-blue-400 shadow-sm font-bold"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      {/* Sélecteur de dates personnalisé */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className={`flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all min-w-[190px] ${
              isAllTime
                ? "bg-blue-600/10 border-blue-500/40 text-blue-400"
                : "bg-[#181b1f]/50 border-[#2c3235] text-gray-200 hover:border-[#3b82f6]/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <CalendarIcon
                size={16}
                className={`shrink-0 ${
                  isAllTime ? "text-blue-400" : "text-gray-500"
                }`}
              />
              <span className="text-[10px] lg:text-[11px] mt-1px font-medium tracking-wide truncate">
                {isAllTime
                  ? t("common.infinitePeriod")
                  : `${formatDateDisplay(dateRange.from)} - ${formatDateDisplay(
                      dateRange.to
                    )}`}
              </span>
            </div>
            <ChevronDown
              size={14}
              className="shrink-0 transition-transform duration-200 data-[state=open]:rotate-180"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="p-3 sm:p-3 w-[calc(100vw-2rem)] sm:w-auto border-[#2c3235] bg-[#181b1f] rounded-xl shadow-2xl z-250"
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-3">
            {/* Raccourcis - Mobile: 4+4 en wrap, Desktop: vertical compact */}
            <div className="shrink-0">
              {/* Mobile: Grid 4 colonnes avec wrap */}
              <div className="grid grid-cols-4 gap-0 sm:hidden bg-[#111217]/80 rounded-lg p-1.5 border border-[#2c3235]/30">
                {shortcuts.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className={`py-1.5 text-[10px] font-medium rounded transition-all ${
                      activeShortcut?.label === preset.label
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-200 hover:bg-[#1a1d24]/50"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setAllTime();
                  }}
                  className={`py-1.5 text-[10px] font-medium rounded transition-all flex items-center justify-center ${
                    isAllTime
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200 hover:bg-[#1a1d24]/50"
                  }`}
                  title={t("common.allTime")}
                >
                  <InfinityIcon size={12} />
                </button>
              </div>

              {/* Desktop: Vertical compact volet */}
              <div className="hidden sm:flex flex-col gap-0.5">
                {shortcuts.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className={`px-4 py-1.5 text-[10px] font-medium text-left rounded transition-all whitespace-nowrap ${
                      activeShortcut?.label === preset.label
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-200 hover:bg-[#1a1d24]/50"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setAllTime();
                  }}
                  className={`px-4 py-1.5 text-[10px] font-medium rounded transition-all flex items-center ${
                    isAllTime
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200 hover:bg-[#1a1d24]/50"
                  }`}
                  title={t("common.allTime")}
                >
                  <InfinityIcon size={12} />
                </button>
              </div>
            </div>

            {/* Séparateur vertical sur desktop */}
            <div className="hidden sm:block w-px bg-[#2c3235] self-stretch" />

            {/* Champs de dates */}
            <div className="flex-1 space-y-3 w-[200px]">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {t("header.from")}
                </label>
                <DatePickerInput
                  date={format(dateRange.from, "yyyy-MM-dd")}
                  onDateChange={(date) =>
                    setDateRange({
                      ...dateRange,
                      from: date ? date : dateRange.from,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {t("header.to")}
                </label>
                <DatePickerInput
                  date={format(dateRange.to, "yyyy-MM-dd")}
                  onDateChange={(date) =>
                    setDateRange({
                      ...dateRange,
                      to: date ? date : dateRange.to,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
