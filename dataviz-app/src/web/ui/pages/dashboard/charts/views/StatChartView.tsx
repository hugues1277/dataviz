import React from "react";
import { XAxisFormat } from "../../../../../../shared/types/types";
import { CHART_COLORS } from "../../../../../../shared/constants";
import { formatValue } from "../utils/chartUtils";

interface StatChartViewProps {
  rows: any[];
  columns: string[];
  yAxisKeys: string[];
  yAxisFormats: Record<string, XAxisFormat>;
}

export const StatChartView: React.FC<StatChartViewProps> = ({
  rows,
  columns,
  yAxisKeys,
  yAxisFormats,
}) => {
  const lastRow = rows[rows.length - 1];
  const displayKeys = (
    yAxisKeys.length > 0 ? yAxisKeys : columns.length > 0 ? [columns[0]] : []
  ).filter((k) => columns.includes(k));

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 h-full overflow-y-auto scrollbar-none p-1">
      {displayKeys.map((key, idx) => {
        const rawVal = lastRow ? lastRow[key] : "-";
        const color = CHART_COLORS[idx % CHART_COLORS.length];
        const isMulti = displayKeys.length > 1;
        const formatType = yAxisFormats?.[key];
        return (
          <div
            key={key}
            className={`flex flex-col items-center justify-center p-2 min-w-[100px] flex-1`}
            style={{ minHeight: isMulti ? "70px" : "100%" }}
          >
            <div
              className={`font-black leading-none truncate w-full text-center transition-all ${
                isMulti ? "text-2xl" : "text-5xl"
              }`}
              style={{ color: color }}
            >
              {formatValue(rawVal, formatType)}
            </div>
            <div className="text-[9px] text-gray-500 font-bold uppercase mt-2 tracking-widest text-center truncate w-full px-2 opacity-60">
              {key}
            </div>
          </div>
        );
      })}
    </div>
  );
};
