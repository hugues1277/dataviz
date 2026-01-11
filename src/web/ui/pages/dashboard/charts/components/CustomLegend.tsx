import React from "react";
import { CHART_COLORS } from "../../../../../../shared/constants";

interface CustomLegendProps {
  payload?: any[];
  hiddenKeys: Record<string, boolean>;
  onToggle: (key: string) => void;
}

const CustomLegend: React.FC<CustomLegendProps> = ({
  payload = [],
  hiddenKeys,
  onToggle,
}) => {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {payload.map((entry, index) => {
        const key = entry.dataKey;
        const hidden = hiddenKeys[key];

        return (
          <button
            key={key}
            type="button"
            onClick={() => onToggle(key)}
            className={`flex items-center gap-1.5 text-[10px] font-bold capitalize tracking-wider transition-all
              ${hidden ? "opacity-40 line-through" : "opacity-100"}
            `}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  entry.color || CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
            <span className="truncate max-w-[120px]">{key}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CustomLegend;
