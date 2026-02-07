import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ChartConfig,
  QueryResult,
  XAxisFormat,
  Dashboard,
  DateRange,
  CHART_TYPES,
  CHART_VERSION,
} from "../../../../../shared/types/types";
import {
  Play,
  Eye,
  Code2,
  Check,
  LayoutPanelTop,
  Settings,
  LayoutDashboard,
  Sparkles,
  Database,
  BarChart,
  Table,
  MousePointer2,
  Calendar,
  Clock,
  Type,
  Hash,
  ScatterChart,
  AreaChart,
  Circle,
  AlertCircle,
} from "lucide-react";
import { executeQuery } from "../../../../providers/queryRequestProvider";
import { useTranslation } from "react-i18next";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { formatSqlQuery } from "../../../../core/utils/sqlUtils";
import { useConnectionsStore } from "../../../../core/stores/connectionsStore";
import { ChartPreviewContent } from "./ChartPreview";
import { useDateRange } from "../../../../core/hooks/dashboard/useDateRange";
import { useChart } from "../../../../core/hooks/dashboard/useChart";
import { getQueryVariablesValues } from "../../../../core/utils/variableUtils";
import VariablesPicker from "../widgets/VariablesPicker";
import DatePicker from "../widgets/DatePicker";
import Toggle from "../../../components/widget/Toggle";
import Modal from "../../../components/modal/Modal";
import logger from "../../../../../shared/utils/logger";
import { useVariables } from "../../../../core/hooks/dashboard/useVariables";
import {
  DEFAULT_CHART,
  DEFAULT_CHART_QUERY,
} from "../../../../../shared/constants";
import { TableChartView } from "../charts/views/TableChartView";
import { Button } from "../../../components/Button";

const getFormatOptions = (t: any) =>
  [
    {
      value: "string",
      label: t("editor.formats.string"),
      icon: <Type size={12} />,
    },
    {
      value: "date",
      label: t("editor.formats.date"),
      icon: <Calendar size={12} />,
    },
    {
      value: "datetime",
      label: t("editor.formats.datetime"),
      icon: (
        <>
          <Calendar size={12} /> <Clock size={12} className="ml-1" />
        </>
      ),
    },
    {
      value: "time",
      label: t("editor.formats.time"),
      icon: <Clock size={12} />,
    },
    {
      value: "int",
      label: t("editor.formats.int"),
      icon: <Hash size={12} />,
    },
  ] as const;

interface ColumnSelectorProps {
  columns: string[];
  selectedColumns: string[];
  onToggleColumn: (col: string) => void;
  canChangeFormat?: boolean;
  columnFormats?: Record<string, XAxisFormat>;
  onColumnFormatChange: (col: string, format: XAxisFormat) => void;
  label: string;
  formatOptions: ReturnType<typeof getFormatOptions>;
  height?: number;
}

const ColumnSelector: React.FC<ColumnSelectorProps> = ({
  columns,
  selectedColumns,
  onToggleColumn,
  canChangeFormat = true,
  columnFormats = {},
  onColumnFormatChange,
  label,
  formatOptions,
  height = 400,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-1.5">
      <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest ml-1">
        {label}
      </label>
      <div
        className={`space-y-2 max-h-[${height}px] resize-y overflow-y-auto p-2 bg-[#181b1f] border border-[#2c3235] rounded-xl scrollbar-thin`}
      >
        {columns.map((col) => {
          const isSelected = selectedColumns.includes(col);
          const currentFormat = columnFormats[col] || "string";

          return (
            <div
              key={col}
              className={`rounded-lg transition-all border ${
                isSelected
                  ? "bg-blue-600/5 border-blue-500/30"
                  : "border-transparent"
              }`}
            >
              <button
                onClick={() => onToggleColumn(col)}
                className={`w-full text-left px-3 py-2 flex items-center justify-between text-[10px] transition-all ${
                  isSelected
                    ? "text-blue-400 font-black"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <span className="truncate flex items-center gap-2">
                  {isSelected ? <Check size={10} /> : <div className="w-2.5" />}
                  {col}
                </span>
              </button>

              {canChangeFormat && isSelected && (
                <div className="px-3 pb-2 pt-0.5 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="text-[8px] font-black text-gray-600 uppercase tracking-tighter shrink-0">
                    {t("editor.formatLabel")}
                  </div>
                  <div className="flex-1 grid grid-cols-5 gap-1">
                    {formatOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          onColumnFormatChange(col, opt.value as XAxisFormat)
                        }
                        title={opt.label}
                        className={`p-1 rounded flex items-center justify-center transition-all ${
                          currentFormat === opt.value
                            ? "bg-blue-500 text-white"
                            : "bg-black/20 text-gray-600 hover:text-gray-400"
                        }`}
                      >
                        {opt.icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ChartEditorProps {
  chartConfig: ChartConfig;
  dashboard: Dashboard;
  onSave: (chart: ChartConfig) => void;
  onClose: () => void;
}

const ChartEditor: React.FC<ChartEditorProps> = ({
  chartConfig: initialChartConfig,
  dashboard,
  onSave,
  onClose,
}) => {
  const { connectionsMap } = useConnectionsStore();
  const { t } = useTranslation();
  const { dateRange, setDateRange, isAllTime, setAllTime } = useDateRange();

  const [chartData, setChartData] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"config" | "query" | "preview">(
    "query"
  );

  const { variableValues, variables, ...variableUtils } = useVariables(
    dashboard.variables
  );

  // Utiliser le hook useChart pour gérer le chart
  const { chartConfig, setChartConfig, queryVariables, usesDate } =
    useChart(initialChartConfig);

  const getConnection = useCallback(() => {
    let connectionId = chartConfig.connectionId;
    if (connectionId === "") {
      const connections = Object.values(connectionsMap);
      if (connections.length === 0) return null;

      connectionId = connections[0]?.id;
      setChartConfig((prev: ChartConfig) => ({
        ...prev,
        connectionId: connectionId || "",
      }));
    }
    return connectionsMap[connectionId];
  }, [chartConfig.connectionId, connectionsMap, setChartConfig]);

  const fetchChartData = useCallback(
    async (dateRange: DateRange) => {
      const connection = getConnection();
      if (!connection) return;
      setIsLoading(true);

      const queryVariablesValues = getQueryVariablesValues(
        variableValues,
        chartConfig.query,
        dateRange
      );

      const data = await executeQuery(
        connection,
        chartConfig.query,
        queryVariablesValues
      );

      setChartData(data);
      setIsLoading(false);
    },
    [
      connectionsMap,
      chartConfig.connectionId,
      chartConfig.query,
      variableValues,
      dateRange,
      setIsLoading,
    ]
  );

  useEffect(() => {
    const isDefaultQuery = chartConfig.query === DEFAULT_CHART_QUERY;
    if (isDefaultQuery) return;

    fetchChartData(dateRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variableValues, dateRange]);

  const isPie = chartConfig.type === CHART_TYPES.PIE;
  const isTable = chartConfig.type === CHART_TYPES.TABLE;
  const isStat = chartConfig.type === CHART_TYPES.STAT;
  const isLineOrBar =
    chartConfig.type === CHART_TYPES.LINE ||
    chartConfig.type === CHART_TYPES.BAR ||
    chartConfig.type === CHART_TYPES.AREA ||
    chartConfig.type === CHART_TYPES.SCATTER;

  const handleFormatSql = useCallback(() => {
    setChartConfig((prev: ChartConfig) => ({
      ...prev,
      query: formatSqlQuery(prev.query),
    }));
  }, [setChartConfig]);

  const handleQueryChange = useCallback(
    (val: string) => {
      setChartConfig((prev: ChartConfig) => ({ ...prev, query: val }));
    },
    [setChartConfig]
  );

  const handleCopyVariable = useCallback(async (variableName: string) => {
    const textToCopy = `{{${variableName}}}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (error: unknown) {
      logger.error("handleCopyVariable", error);

      // Fallback pour les navigateurs qui ne supportent pas l'API Clipboard
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  }, []);

  const handleToggleColumn = useCallback(
    (col: string) => {
      const keys = chartConfig.yAxisKeys || [];
      const isSelected = keys.includes(col);
      let newKeys: string[];

      newKeys = isSelected ? keys.filter((k) => k !== col) : [...keys, col];
      setChartConfig((prev: ChartConfig) => ({ ...prev, yAxisKeys: newKeys }));
    },
    [isPie, chartConfig.yAxisKeys, setChartConfig]
  );

  const handleToggleXAxisColumn = useCallback(
    (col: string) => {
      setChartConfig((prev: ChartConfig) => ({
        ...prev,
        xAxisKey: prev.xAxisKey === col ? "" : col,
      }));
    },
    [setChartConfig]
  );

  const handleXAxisFormatChange = useCallback(
    (col: string, format: XAxisFormat) => {
      setChartConfig((prev: ChartConfig) => ({
        ...prev,
        xAxisFormat: format,
      }));
    },
    [setChartConfig]
  );

  const handleColumnFormatChange = useCallback(
    (col: string, format: XAxisFormat) => {
      setChartConfig((prev: ChartConfig) => ({
        ...prev,
        yAxisFormats: {
          ...(prev.yAxisFormats || {}),
          [col]: format,
        },
      }));
    },
    [setChartConfig]
  );

  const types = useMemo(
    () => [
      {
        value: CHART_TYPES.LINE,
        label: t("editor.types.line"),
        icon: <BarChart size={14} />,
      },
      {
        value: CHART_TYPES.BAR,
        label: t("editor.types.bar"),
        icon: <BarChart size={14} />,
        version: [CHART_VERSION.BAR_CLASSIC, CHART_VERSION.BAR_STACKED],
      },
      {
        value: CHART_TYPES.AREA,
        label: t("editor.types.area"),
        icon: <AreaChart size={14} />,
      },
      {
        value: CHART_TYPES.SCATTER,
        label: t("editor.types.scatter"),
        icon: <ScatterChart size={14} />,
      },
      {
        value: CHART_TYPES.PIE,
        label: t("editor.types.pie"),
        icon: <LayoutPanelTop size={14} />,
      },
      {
        value: CHART_TYPES.TABLE,
        label: t("editor.types.table"),
        icon: <Table size={14} />,
      },
      {
        value: CHART_TYPES.STAT,
        label: t("editor.types.stat"),
        icon: <MousePointer2 size={14} />,
      },
      {
        value: CHART_TYPES.RADIAL,
        label: t("editor.types.radial"),
        icon: <Circle size={14} />,
      },
    ],
    [t]
  );

  const selectedType = useMemo(
    () => types.find((t) => t.value === chartConfig.type),
    [chartConfig.type, types]
  );

  return (
    <Modal
      isOpen={true}
      title={t("editor.subtitle")}
      icon={<Code2 size={20} />}
      onClose={onClose}
      actions={
        <>
          <Button
            onClick={() => fetchChartData(dateRange)}
            className="group"
            isLoading={isLoading}
            icon={
              <Play
                size={16}
                className="text-blue-500 group-hover:text-white"
              />
            }
          >
            {t("editor.execute")}
          </Button>
          <Button
            onClick={() => onSave(chartConfig as ChartConfig)}
            variant="primary"
          >
            {t("common.save")}
          </Button>
        </>
      }
    >
      <div className="flex border-b border-[#1f2127] bg-[#111217] px-6 shrink-0 overflow-x-auto scrollbar-none gap-2">
        {[
          {
            id: "query",
            label: t("editor.queryTab"),
            icon: <Code2 size={16} />,
          },
          {
            id: "config",
            className: " lg:hidden",
            label: t("editor.configTab"),
            icon: <Settings size={16} />,
          },
          {
            id: "preview",
            label: t("editor.previewTab"),
            icon: <Eye size={16} />,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2.5 border-b-2 transition-all ${
              tab.className
            } ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto scrollbar-thin bg-[#0e1014]">
        <div
          className={`${
            activeTab === "config" ? "flex" : "hidden"
          } lg:flex w-full lg:w-[320px] lg:border-r border-[#1f2127] bg-[#111217] p-8 pb-[100px] shrink-0 flex-col gap-8 overflow-y-auto`}
        >
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <Settings size={14} className="text-blue-500" />{" "}
              {t("editor.general")}
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest ml-1">
                  {t("editor.chartTitle")}
                </label>
                <input
                  type="text"
                  className="w-full bg-[#181b1f] border border-[#2c3235] rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  value={chartConfig.title}
                  onChange={(e) =>
                    setChartConfig((prev: ChartConfig) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest ml-1">
                  {t("editor.dataSource")}
                </label>
                <div className="relative">
                  <Database
                    size={12}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  />
                  <select
                    className="w-full bg-[#181b1f] border border-[#2c3235] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500 appearance-none"
                    value={chartConfig.connectionId}
                    onChange={(e) =>
                      setChartConfig((prev: ChartConfig) => ({
                        ...prev,
                        connectionId: e.target.value,
                      }))
                    }
                  >
                    {Object.values(connectionsMap).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest ml-1">
                  {t("editor.chartType")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {types.map((t) => (
                    <button
                      key={t.value}
                      onClick={() =>
                        setChartConfig((prev) => ({ ...prev, type: t.value }))
                      }
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all border ${
                        chartConfig.type === t.value
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "bg-[#181b1f] border-[#2c3235] text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {selectedType?.version && (
              <div className="space-y-1.5">
                <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest ml-1">
                  {t("editor.version")}
                </label>
                <div className="flex gap-2">
                  {selectedType.version.map((version, index) => (
                    <button
                      key={version}
                      onClick={() =>
                        setChartConfig((prev) => ({
                          ...prev,
                          type: selectedType.value,
                          version: version,
                        }))
                      }
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all border ${
                        chartConfig.version === version ||
                        (index === 0 && !chartConfig.version)
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "bg-[#181b1f] border-[#2c3235] text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {t(`editor.versions.${version}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <LayoutDashboard size={14} className="text-blue-500" />{" "}
              {t("editor.mapping")}
            </h3>
            {chartData ? (
              <div className="space-y-3">
                {isLineOrBar && (
                  <div className="space-y-1.5">
                    <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest ml-1">
                      {t("editor.xAxisTitle")}
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#181b1f] border border-[#2c3235] rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder={t("editor.xAxisTitle")}
                      value={chartConfig.xAxisTitle}
                      onChange={(e) =>
                        setChartConfig((prev) => ({
                          ...prev,
                          xAxisTitle: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
                {!isStat && !isTable && (
                  <>
                    {isLineOrBar && (
                      <Toggle
                        enabled={chartConfig.rotateXLabels || false}
                        onChange={() =>
                          setChartConfig((prev) => ({
                            ...prev,
                            rotateXLabels: !prev.rotateXLabels,
                          }))
                        }
                        label={t("editor.rotateX")}
                        className="text-[9px] text-gray-500 font-bold uppercase tracking-widest ml-1 pt-3 pb-1"
                      />
                    )}
                    <ColumnSelector
                      columns={chartData.columns}
                      selectedColumns={
                        chartConfig.xAxisKey ? [chartConfig.xAxisKey] : []
                      }
                      onToggleColumn={handleToggleXAxisColumn}
                      columnFormats={
                        chartConfig.xAxisKey && chartConfig.xAxisFormat
                          ? { [chartConfig.xAxisKey]: chartConfig.xAxisFormat }
                          : {}
                      }
                      onColumnFormatChange={handleXAxisFormatChange}
                      label={
                        isPie ? t("editor.pieLabels") : t("editor.xAxisLabel")
                      }
                      formatOptions={getFormatOptions(t)}
                      height={300}
                    />
                  </>
                )}

                {isLineOrBar && (
                  <div className="space-y-1.5">
                    <label className="block text-[9px] text-gray-500 font-bold uppercase tracking-widest ml-1">
                      {t("editor.yAxisTitle")}
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#181b1f] border border-[#2c3235] rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                      placeholder={t("editor.yAxisTitle")}
                      value={chartConfig.yAxisTitle}
                      onChange={(e) =>
                        setChartConfig((prev) => ({
                          ...prev,
                          yAxisTitle: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}

                <ColumnSelector
                  columns={chartData.columns}
                  selectedColumns={chartConfig.yAxisKeys || []}
                  onToggleColumn={handleToggleColumn}
                  columnFormats={chartConfig.yAxisFormats}
                  onColumnFormatChange={handleColumnFormatChange}
                  label={
                    isTable
                      ? t("editor.columns")
                      : isPie
                      ? t("editor.pieValue")
                      : t("editor.series")
                  }
                  formatOptions={getFormatOptions(t)}
                  height={300}
                />
              </div>
            ) : (
              <div className="p-6 bg-blue-600/5 border border-dashed border-blue-500/20 rounded-2xl text-center">
                <p className="text-[10px] text-blue-400 font-bold italic opacity-70">
                  {t("editor.testTip")}
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto relative space-y-2">
          {activeTab === "query" && (
            <>
              <div className="relative group h-full overflow-y-hidden">
                <CodeMirror
                  value={chartConfig.query}
                  height="100%"
                  theme={vscodeDark}
                  extensions={[sql()]}
                  onChange={handleQueryChange}
                  className="h-full text-xs font-mono"
                />
                <button
                  onClick={handleFormatSql}
                  className="absolute bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl shadow-2xl opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all z-20 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"
                >
                  <Sparkles size={16} /> {t("editor.formatSql")}
                </button>
              </div>
              {chartData?.error ? (
                <p className="text-[12px] font-mono leading-tight truncate w-full text-red-400 bg-red-500/5 p-2">
                  {chartData.error}
                </p>
              ) : (
                chartData && (
                  <div className="px-2 max-h-[300px]">
                    <TableChartView
                      rows={chartData.rows.slice(0, 50)}
                      columns={chartData.columns}
                      yAxisKeys={[]}
                      yAxisFormats={{
                        ...chartConfig.yAxisFormats,
                        [chartConfig.xAxisKey || ""]:
                          chartConfig.xAxisFormat || "string",
                      }}
                    />
                  </div>
                )
              )}
              <div className="overflow-x-auto overflow-y-hidden scrollbar-none h-[60px]">
                <div className="flex gap-2 px-2">
                  {[
                    { name: "from" },
                    { name: "to" },
                    ...(dashboard.variables ?? []),
                  ].map((variable) => (
                    <button
                      key={variable.name}
                      onClick={() => handleCopyVariable(variable.name)}
                      className="border border-blue-500/50 text-blue-500 text-[12px] px-1 py-0.5 rounded-lg hover:bg-blue-500/10 cursor-pointer transition-colors"
                      title={t("editor.copyVariable", { name: variable.name })}
                    >
                      {"{{" + variable.name + "}}"}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "preview" && (
            <>
              <div className="px-6 py-3 bg-[#111217] border-b border-[#1f2127] flex items-center gap-4 flex-wrap animate-in slide-in-from-top-2 duration-300 z-1">
                {usesDate && (
                  <div className="scale-90 origin-left">
                    <DatePicker
                      dateRange={dateRange}
                      setDateRange={setDateRange}
                      isAllTime={isAllTime}
                      setAllTime={setAllTime}
                    />
                  </div>
                )}
                {queryVariables.length > 0 && (
                  <div
                    className={`scale-90 origin-left ${
                      usesDate ? "border-l border-[#1f2127] pl-4" : ""
                    }`}
                  >
                    <VariablesPicker
                      queryVariables={queryVariables}
                      variableValues={variableValues}
                      variables={variables}
                      {...variableUtils}
                    />
                  </div>
                )}
              </div>
              <ChartPreviewContent
                chartConfig={chartConfig}
                data={chartData}
                isLoading={isLoading}
                annotations={chartConfig.annotations}
              />
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ChartEditor;
