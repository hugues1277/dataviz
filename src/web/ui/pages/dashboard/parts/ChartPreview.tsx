import React, { useCallback, useState } from "react";
import { Play, RefreshCw, AlertCircle, Pin, Maximize2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  ChartConfig,
  DateRange,
  AnnotationConfig,
  QueryResult,
  DashboardVariable,
  CHART_TYPES,
} from "../../../../../shared/types/types";
import Chart from "../charts/Chart";
import DatePicker from "../widgets/DatePicker";
import VariablesPicker from "../widgets/VariablesPicker";
import { useChartQuery } from "../../../../core/hooks/dashboard/useChartQuery";
import { useDateRange } from "../../../../core/hooks/dashboard/useDateRange";
import { useChart } from "../../../../core/hooks/dashboard/useChart";
import Modal from "../../../components/modal/Modal";
import AnnotationPanel from "./AnnotationPanel";
import { useVariables } from "../../../../core/hooks/dashboard/useVariables";
import Toggle from "../../../components/widget/Toggle";

interface ChartPreviewProps {
  chartConfig: ChartConfig;
  variables: DashboardVariable[];
  variableValues: Record<string, string>;
  initialDateRange?: DateRange;
  onClose: () => void;
  inModal?: boolean;
}

interface ChartPreviewContentProps {
  chartConfig: ChartConfig;
  data?: QueryResult | null;
  isLoading: boolean;
  annotations?: AnnotationConfig[];
  onXYAxisClick?: (isX: boolean, value: string) => void;
  forceTableView?: boolean;
}

export const ChartPreviewContent: React.FC<ChartPreviewContentProps> = ({
  chartConfig,
  data,
  isLoading: loading,
  annotations,
  onXYAxisClick,
  forceTableView = false,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex-1 p-2 lg:p-4 flex flex-col overflow-hidden">
      <div className="flex-1 w-full bg-[#111217] rounded-xl border border-[#1f2127] p-1 lg:p-2 lg:py-3 shadow-2xl flex flex-col overflow-hidden">
        {loading && !data && (
          <div className="absolute inset-0 z-20 bg-[#111217]/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-8 h-8 border-[3px] border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">
                {t("common.loading")}
              </p>
            </div>
          </div>
        )}

        {data?.error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400 p-6 text-center">
            <AlertCircle size={36} className="mb-3 opacity-50" />
            <p className="text-xs font-mono bg-red-500/5 p-3 rounded-lg border border-red-500/10">
              {data.error}
            </p>
          </div>
        ) : data ? (
          <div className="flex-1 min-h-0 min-w-0">
            <Chart
              type={forceTableView ? CHART_TYPES.TABLE : chartConfig.type}
              version={chartConfig.version}
              rows={data.rows}
              columns={data.columns}
              xAxisKey={chartConfig.xAxisKey}
              yAxisKeys={chartConfig.yAxisKeys}
              xAxisFormat={chartConfig.xAxisFormat}
              rotateXLabels={chartConfig.rotateXLabels}
              xAxisTitle={chartConfig.xAxisTitle}
              yAxisTitle={chartConfig.yAxisTitle}
              yAxisFormats={chartConfig.yAxisFormats}
              annotations={annotations}
              showLegend={true}
              onXYAxisClick={onXYAxisClick || (() => {})}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500/30">
            <Play size={48} className="mb-3 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest">
              {t("chart.waitingForData")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ChartPreview: React.FC<ChartPreviewProps> = ({
  variables: initialVariables,
  variableValues: initialVariableValues,
  chartConfig: initialChartConfig,
  initialDateRange,
  onClose,
  inModal = true,
}) => {
  const { t } = useTranslation();
  const { dateRange, isAllTime, setDateRange, setAllTime } =
    useDateRange(initialDateRange);

  // Utiliser le hook useChart pour gérer le chart
  const {
    chartConfig,
    queryVariables,
    usesDate,
    annotations,
    addAnnotation,
    removeAnnotation,
    handleXYAxisClick,
    newAnnotation,
    setNewAnnotation,
  } = useChart(initialChartConfig);

  // Gérer l'état du panel d'annotations
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [forceTableView, setForceTableView] = useState(false);

  const toggleAnnotationPanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, []);

  const { variableValues, ...variableUtils } = useVariables(
    initialVariables,
    initialVariableValues
  );

  // Exécuter la requête
  const {
    data,
    isLoading: loading,
    refetch,
  } = useChartQuery(
    chartConfig.connectionId,
    chartConfig.id,
    chartConfig.query,
    dateRange,
    variableValues
  );

  const isGraph = chartConfig.type === "line" || chartConfig.type === "bar";

  const content = (
    <div className="flex h-full bg-[#0b0e14] overflow-hidden relative">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 py-2 bg-[#111217] border-b border-[#1f2127] flex items-center gap-2.5 flex-wrap animate-in slide-in-from-top-2 duration-300 z-1">
          {usesDate && (
            <DatePicker
              dateRange={dateRange}
              setDateRange={setDateRange}
              isAllTime={isAllTime}
              setAllTime={setAllTime}
            />
          )}

          {queryVariables.length > 0 && (
            <div
              className={`scale-90 origin-left ${
                usesDate ? "border-l border-[#1f2127] pl-3" : ""
              }`}
            >
              <VariablesPicker
                queryVariables={queryVariables}
                variableValues={variableValues}
                {...variableUtils}
              />
            </div>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <Toggle
              label={t("chart.displayAsTable")}
              enabled={forceTableView}
              onChange={setForceTableView}
              className="text-[10px] text-gray-400 shrink-0 mx-2 gap-[2px]"
            />
            {isGraph && (
              <button
                onClick={toggleAnnotationPanel}
                className={`p-1.5 rounded-lg border transition-all hidden sm:flex items-center gap-1.5 ${
                  isPanelOpen
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-[#181b1f] border-[#2c3235] text-gray-400 hover:text-white"
                }`}
                title={t("annotations.title")}
              >
                <Pin size={12} />
                <span className="text-[8px] font-black uppercase tracking-widest">
                  {t("annotations.title")}
                </span>
                {annotations.length > 0 && (
                  <span className="bg-white/20 text-white text-[7px] font-bold px-1 rounded-full">
                    {annotations.length}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => refetch()}
              className="p-1.5 bg-[#181b1f] border border-[#2c3235] rounded-lg text-gray-500 hover:text-white transition-all"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <ChartPreviewContent
          chartConfig={chartConfig}
          data={data}
          isLoading={loading}
          annotations={annotations}
          onXYAxisClick={handleXYAxisClick}
          forceTableView={forceTableView}
        />
      </div>

      {/* Annotation Sidebar */}
      <AnnotationPanel
        isOpen={isPanelOpen}
        annotations={annotations}
        newAnnotation={newAnnotation}
        setNewAnnotation={setNewAnnotation}
        addAnnotation={addAnnotation}
        removeAnnotation={removeAnnotation}
      />
    </div>
  );

  if (inModal) {
    return (
      <Modal
        isOpen={true}
        title={chartConfig.title}
        icon={<Maximize2 size={16} />}
        onClose={onClose}
      >
        {content}
      </Modal>
    );
  }

  return content;
};

export default ChartPreview;
