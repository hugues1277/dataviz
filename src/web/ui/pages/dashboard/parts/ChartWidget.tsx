import React, { useCallback } from "react";
import { ChartConfig, DateRange } from "../../../../../shared/types/types";
import {
  MoreVertical,
  RefreshCw,
  AlertCircle,
  Edit2,
  Trash2,
  GripHorizontal,
  Eye,
} from "lucide-react";
import Chart from "../charts/Chart";
import { useDialog } from "../../../components/modal/DialogContext";
import { useTranslation } from "react-i18next";
import { useChartQuery } from "../../../../core/hooks/dashboard/useChartQuery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChartWidgetProps {
  chart: ChartConfig;
  isEditable: boolean;
  dateRange: DateRange;
  variableValues: Record<string, string>;
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({
  chart,
  isEditable,
  variableValues,
  dateRange,
  onEdit,
  onDelete,
  onView,
}) => {
  const { t } = useTranslation();
  const { confirm } = useDialog();

  const {
    data,
    isLoading: loading,
    refetch,
  } = useChartQuery(
    chart.connectionId,
    chart.id,
    chart.query,
    dateRange,
    variableValues
  );

  const handleDeleteRequest = useCallback(() => {
    confirm({
      title: t("chart.deleteTitle"),
      description: t("chart.deleteDesc", { title: chart.title }),
      type: "danger",
      confirmLabel: t("common.delete"),
      onConfirm: onDelete,
    });
  }, [confirm, t, chart.title, onDelete]);

  return (
    <div
      onDoubleClick={onView}
      className={`bg-[#111217] border ${
        isEditable ? "border-blue-500/20" : "border-[#1f2127]"
      } rounded-xl flex flex-col h-full group transition-all overflow-hidden relative shadow-lg`}
    >
      <div
        className={`px-3 py-1.5 flex items-center justify-between border-b border-[#1f2127]/50 ${
          isEditable ? "chart-drag-handle cursor-move bg-[#181b1f]" : ""
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {isEditable && (
            <GripHorizontal size={12} className="text-gray-600 shrink-0" />
          )}
          <h3
            onClick={onView}
            className="font-bold text-[10px] text-gray-400 truncate uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
          >
            {chart.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView?.();
            }}
            title={t("chart.expand")}
            className="p-1 hover:bg-[#1f2127] rounded text-gray-500 hover:text-blue-400 transition-colors"
          >
            <Eye size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              refetch();
            }}
            title={t("common.refresh")}
            className="p-1 hover:bg-[#1f2127] rounded text-gray-500 transition-colors"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="hidden md:block p-1 hover:bg-[#1f2127] rounded text-gray-500 transition-colors"
              >
                <MoreVertical size={12} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-32 border-[#2c3235] bg-[#181b1f] rounded-xl shadow-2xl"
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="focus:bg-white/10 rounded-lg"
              >
                <Edit2 className="mr-2" size={12} />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteRequest();
                }}
                className="text-red-500 focus:bg-white/10 rounded-lg"
              >
                <Trash2 className="mr-2" size={12} />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 p-2 overflow-hidden min-h-0 min-w-0 cursor-default">
        {data?.error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400 bg-red-500/5 rounded py-2 px-8 text-center">
            <AlertCircle size={14} className="mb-1" />
            <p className="text-[8px] font-mono leading-tight w-full">
              {data.error}
            </p>
          </div>
        ) : loading && !data ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-4 h-4 border-2 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : data ? (
          <div className="w-full h-full min-w-0 min-h-0">
            <Chart
              chartId={chart.id}
              type={chart.type}
              version={chart.version}
              rows={data.rows}
              columns={data.columns}
              xAxisKey={chart.xAxisKey}
              yAxisKeys={chart.yAxisKeys}
              xAxisFormat={chart.xAxisFormat}
              rotateXLabels={chart.rotateXLabels}
              xAxisTitle={chart.xAxisTitle}
              yAxisTitle={chart.yAxisTitle}
              yAxisFormats={chart.yAxisFormats}
              annotations={chart.annotations}
              showLegend={true}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ChartWidget;
