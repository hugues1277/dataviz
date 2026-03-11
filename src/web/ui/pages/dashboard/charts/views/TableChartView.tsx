import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { XAxisFormat } from "../../../../../../shared/types";
import { formatValue } from "../utils/chartUtils";
import { useChartFiltering } from "../hooks/useChartFiltering";
import { useChartSorting } from "../hooks/useChartSorting";
import { exportChartDatasToCsvUseCase } from "../../../../../core/useCases/charts/exportChartDatasToCsvUseCase";

const PAGE_SIZES = [20, 50, 100] as const;

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
  const [pageSize, setPageSize] = useState<number>(50);
  const [currentPage, setCurrentPage] = useState(1);

  const { filterText, setFilterText, filteredRows } = useChartFiltering(
    rows,
    yAxisFormats
  );
  const { sortConfig, handleSort, sortedRows } = useChartSorting(filteredRows);

  const colsToDisplay =
    yAxisKeys && yAxisKeys.length > 0
      ? yAxisKeys.filter((k) => columns.includes(k))
      : columns;

  const totalRows = sortedRows.length;
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalRows / pageSize)),
    [totalRows, pageSize]
  );
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalRows);

  const handleDownloadCsv = useCallback(() => {
    exportChartDatasToCsvUseCase.execute({
      rows: sortedRows,
      columns: colsToDisplay,
    });
  }, [sortedRows, colsToDisplay]);

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
        <button
          type="button"
          onClick={handleDownloadCsv}
          title={t("chart.downloadCsv")}
          className="p-1.5 text-gray-500 hover:text-white transition-all shrink-0"
        >
          <Download size={12} />
        </button>
        <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest px-1 shrink-0 select-none">
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
            {paginatedRows.map((row, index: number) => (
              <tr
                key={`row-${(currentPage - 1) * pageSize + index}`}
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
      <div className="shrink-0 flex items-center justify-between gap-2 pt-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-gray-500 uppercase tracking-wider">
            {t("chart.rowsPerPage")}:
          </span>
          {PAGE_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                pageSize === size
                  ? "bg-blue-600 text-white"
                  : "bg-[#181b1f] text-gray-400 hover:text-white border border-[#2c3235]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-gray-500 uppercase tracking-wider select-none">
            {totalRows > 0 ? `${startRow}-${endRow}` : "0"} / {totalRows}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            title={t("chart.paginationPrev")}
            className="p-1 rounded text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            title={t("chart.paginationNext")}
            className="p-1 rounded text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
