import React from "react";
import { useTranslation } from "react-i18next";
import { ToggleLeft, ToggleRight, ChevronDown, Check } from "lucide-react";
import {
  DashboardVariable,
  VARIABLE_TYPES,
} from "../../../../../../../shared/types";
import DatePickerInputCompact from "./DatePickerInputCompact";

interface VariableInputProps {
  variable: DashboardVariable;
  value: string;
  onValueChange: (name: string, value: string) => void;
  tempTextValues: Record<string, string>;
  setTempTextValues: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
}

const VariableInput: React.FC<VariableInputProps> = ({
  variable,
  value,
  onValueChange,
  tempTextValues,
  setTempTextValues,
}) => {
  const { t } = useTranslation();

  switch (variable.type) {
    case VARIABLE_TYPES.BOOLEAN: {
      const isTrue = value === "true";
      return (
        <button
          onClick={() =>
            onValueChange(variable.name, isTrue ? "false" : "true")
          }
          className={`transition-all rounded-md hover:bg-white/5 ${
            isTrue ? "text-blue-400" : "text-gray-600"
          }`}
        >
          {isTrue ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
        </button>
      );
    }
    case VARIABLE_TYPES.SELECT:
      return (
        <div className="relative flex items-center group/select">
          <select
            className="bg-transparent border-none text-[10px] text-blue-400 font-black tracking-wider pl-1 pr-4 py-0.5 outline-none cursor-pointer appearance-none hover:text-blue-300 transition-colors"
            value={value}
            onChange={(e) => onValueChange(variable.name, e.target.value)}
          >
            {variable.options?.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                className="bg-[#111217] text-white font-bold"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={10}
            className="absolute right-0 text-gray-600 group-hover/select:text-blue-400 pointer-events-none transition-colors"
          />
        </div>
      );
    case VARIABLE_TYPES.DATE:
      return (
        <DatePickerInputCompact
          date={value}
          onDateChange={(date) =>
            onValueChange(
              variable.name,
              date ? date.toISOString().split("T")[0] : ""
            )
          }
        />
      );
    case VARIABLE_TYPES.NUMBER:
      return (
        <input
          type="number"
          className="bg-transparent border-none text-[10px] text-blue-400 font-black tracking-wider px-1 py-0.5 outline-none w-16 hover:bg-white/5 rounded transition-all focus:bg-white/10"
          value={value}
          onChange={(e) => onValueChange(variable.name, e.target.value)}
        />
      );
    default: {
      const tempValue =
        tempTextValues[variable.name] !== undefined
          ? tempTextValues[variable.name]
          : value;
      const hasChanges = tempValue !== value;

      const handleValidate = () => {
        if (hasChanges) {
          onValueChange(variable.name, tempValue);
        }
        setTempTextValues((prev) => {
          const next = { ...prev };
          delete next[variable.name];
          return next;
        });
      };

      const handleCancel = () => {
        setTempTextValues((prev) => {
          const next = { ...prev };
          delete next[variable.name];
          return next;
        });
      };

      return (
        <div className="relative flex items-center group/input">
          <input
            type="text"
            className="bg-transparent border-none text-[10px] text-blue-400 font-black tracking-wider px-1 pr-4.5 py-0.5 outline-none w-24 rounded transition-all"
            value={tempValue}
            onChange={(e) => {
              setTempTextValues((prev) => ({
                ...prev,
                [variable.name]: e.target.value,
              }));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleValidate();
              } else if (e.key === "Escape") {
                e.preventDefault();
                handleCancel();
                e.currentTarget.blur();
              }
            }}
            onBlur={() => {
              handleValidate();
            }}
          />
          {hasChanges && (
            <button
              onClick={(e) => {
                e.preventDefault();
                handleValidate();
              }}
              className="absolute right-[-4px] p-0.5 text-blue-400 hover:text-blue-300 transition-all"
              title={t("common.save")}
            >
              <Check size={14} />
            </button>
          )}
        </div>
      );
    }
  }
};

export default VariableInput;
