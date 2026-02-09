import React from "react";
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { XAxisFormat } from "../../../../../../shared/types/types";
import { formatValue } from "../utils/chartUtils";
import { useChartFiltering } from "../hooks/useChartFiltering";
import { useChartSorting } from "../hooks/useChartSorting";

interface TableChartViewProps {
  rows: any[];
  columns: string[];
  yAxisKeys: string[];
  yAxisFormats: Record<string, XAxisFormat>;
}

export const TableChartView: React.FC<TableChartViewProps> = ({
  rows,
  columns,
  yAxisKeys,
  yAxisFormats,
}) => {
  const { t } = useTranslation();
  const { filterText, setFilterText, filteredRows } = useChartFiltering(
    rows,
    yAxisFormats
  );
  const { sortConfig, handleSort, sortedRows } = useChartSorting(filteredRows);

  const colsToDisplay =
    yAxisKeys && yAxisKeys.length > 0
      ? yAxisKeys.filter((k) => columns.includes(k))
      : columns;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 pb-2 flex items-center gap-2">
        <div className="relative flex-1 group">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors"
          />
          <input
            type="text"
            placeholder={t("chart.filter")}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full bg-[#181b1f] border border-[#1f2127] rounded-lg pl-8 pr-3 py-1 text-[10px] text-gray-300 outline-none focus:border-blue-500/50 focus:bg-[#1c1f24] transition-all"
          />
        </div>
        <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest px-1">
          {sortedRows.length} / {rows.length}
        </div>
      </div>
      <div className="flex-1 overflow-auto scrollbar-thin rounded-lg border border-[#1f2127]">
        <table className="w-full text-left text-[10px] sm:text-xs border-collapse">
          <thead className="sticky top-0 bg-[#111217] text-gray-500 font-bold uppercase z-10">
            <tr className="border-b border-[#1f2127]">
              {colsToDisplay.map((col) => {
                const isSorted = sortConfig.key === col;
                return (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="p-2 cursor-pointer hover:bg-[#181b1f] hover:text-gray-300 transition-all group"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="truncate">{col}</span>
                      <span
                        className={`shrink-0 transition-opacity ${
                          isSorted
                            ? "opacity-100 text-blue-500"
                            : "opacity-0 group-hover:opacity-40"
                        }`}
                      >
                        {isSorted ? (
                          sortConfig.direction === "asc" ? (
                            <ArrowUp size={10} />
                          ) : (
                            <ArrowDown size={10} />
                          )
                        ) : (
                          <ArrowUpDown size={10} />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2127]">
            {sortedRows.map((row, index: number) => (
              <tr
                key={`row-${index}`}
                className="hover:bg-[#181b1f]/50 transition-colors group"
              >
                {colsToDisplay.map((col) => {
                  const formatType = yAxisFormats?.[col];
                  return (
                    <td
                      key={`cell-${index}-${col}`}
                      className="p-2 text-gray-300 truncate max-w-[150px] group-hover:text-white transition-colors"
                    >
                      {formatValue(row[col], formatType)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
