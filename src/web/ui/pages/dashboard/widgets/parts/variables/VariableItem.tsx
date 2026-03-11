import React from "react";
import { Settings2 } from "lucide-react";
import type { DashboardVariable } from "../../../../../../../shared/types";
import VariableInput from "./VariableInput";

interface VariableItemProps {
  variable: DashboardVariable;
  value: string;
  isLocked: boolean;
  onValueChange: (name: string, value: string) => void;
  onEdit: (variable: DashboardVariable) => void;
  tempTextValues: Record<string, string>;
  setTempTextValues: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
}

const VariableItem: React.FC<VariableItemProps> = ({
  variable,
  value,
  isLocked,
  onValueChange,
  onEdit,
  tempTextValues,
  setTempTextValues,
}) => {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 hover:border-white/10 rounded-full group transition-all">
      <span className="text-[9px] font-bold text-gray-500 tracking-widest whitespace-nowrap">
        {variable.label}
      </span>
      <div className="w-px h-3 bg-white/10 mx-0.5" />
      <div className="flex items-center gap-1">
        <VariableInput
          variable={variable}
          value={value}
          onValueChange={onValueChange}
          tempTextValues={tempTextValues}
          setTempTextValues={setTempTextValues}
        />
        {!isLocked && (
          <button
            onClick={() => onEdit(variable)}
            className="ml-1 p-1 text-gray-700 hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100"
          >
            <Settings2 size={10} />
          </button>
        )}
      </div>
    </div>
  );
};

export default VariableItem;
