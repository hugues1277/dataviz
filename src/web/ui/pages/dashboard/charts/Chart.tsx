import React, { useMemo } from "react";
import {
  ChartType,
  XAxisFormat,
  AnnotationConfig,
  CHART_TYPES,
} from "../../../../../shared/types/types";
import { EmptyState } from "../../../components/widget/EmptyState";
import { useTranslation } from "react-i18next";
import { useChartSorting } from "./hooks/useChartSorting";
import { useChartFiltering } from "./hooks/useChartFiltering";
import { useHiddenKeys } from "./hooks/useHiddenKeys";
import { LineChartView } from "./views/LineChartView";
import { BarChartView } from "./views/BarChartView";
import { PieChartView } from "./views/PieChartView";
import { TableChartView } from "./views/TableChartView";
import { StatChartView } from "./views/StatChartView";
import { AreaChartView } from "./views/AreaChartView";
import { ScatterChartView } from "./views/ScatterChartView";
import {
  RadialBarChartView,
  RadialBarChartViewProps,
} from "./views/RadialChartView";
import { BaseChartViewProps } from "./components/ChartBaseElements";

interface ChartProps {
  chartId?: string;
  type: ChartType;
  rows: any[];
  columns: string[];
  xAxisKey?: string;
  yAxisKeys?: string[];
  xAxisFormat?: XAxisFormat;
  rotateXLabels?: boolean;
  xAxisTitle?: string;
  yAxisTitle?: string;
  yAxisFormats?: Record<string, XAxisFormat>;
  showLegend?: boolean;
  annotations?: AnnotationConfig[];
  onXYAxisClick?: (isX: boolean, value: string) => void;
}

const Chart: React.FC<ChartProps> = ({
  chartId,
  type,
  rows,
  columns,
  xAxisKey,
  yAxisKeys = [],
  xAxisFormat,
  rotateXLabels,
  xAxisTitle,
  yAxisTitle,
  yAxisFormats = {},
  showLegend = false,
  annotations = [],
  onXYAxisClick,
}) => {
  const { t } = useTranslation();

  const { hiddenKeys, handleLegendToggle } = useHiddenKeys(chartId);

  if (!rows || rows.length === 0) {
    return <EmptyState title={t("chart.noData")} />;
  }

  const effectiveXAxisKey = xAxisKey || columns[0];

  const handleXAxisClick = (value: string) => {
    onXYAxisClick?.(true, value);
  };

  const handleYAxisClick = (value: string) => {
    onXYAxisClick?.(false, value);
  };

  const commonProps = {
    rows: rows,
    columns,
    xAxisKey: effectiveXAxisKey,
    yAxisKeys,
    xAxisFormat,
    yAxisFormats,
    rotateXLabels,
    xAxisTitle,
    yAxisTitle,
    showLegend,
    annotations,
    hiddenKeys,
    onLegendToggle: handleLegendToggle,
    onXAxisClick: handleXAxisClick,
    onYAxisClick: handleYAxisClick,
  };

  switch (type) {
    case CHART_TYPES.LINE:
      return <LineChartView {...(commonProps as BaseChartViewProps)} />;

    case CHART_TYPES.BAR:
      return <BarChartView {...(commonProps as BaseChartViewProps)} />;

    case CHART_TYPES.AREA:
      return <AreaChartView {...(commonProps as BaseChartViewProps)} />;

    case CHART_TYPES.SCATTER:
      return <ScatterChartView {...(commonProps as BaseChartViewProps)} />;

    case CHART_TYPES.PIE:
      return (
        <PieChartView
          rows={rows}
          columns={columns}
          xAxisKey={effectiveXAxisKey}
          yAxisKeys={yAxisKeys}
          xAxisFormat={xAxisFormat as XAxisFormat}
        />
      );

    case CHART_TYPES.RADIAL:
      return (
        <RadialBarChartView {...(commonProps as RadialBarChartViewProps)} />
      );

    case CHART_TYPES.TABLE:
      return (
        <TableChartView
          rows={rows}
          columns={columns}
          yAxisKeys={yAxisKeys}
          yAxisFormats={yAxisFormats}
        />
      );

    case CHART_TYPES.STAT:
      return (
        <StatChartView
          rows={rows}
          columns={columns}
          yAxisKeys={yAxisKeys}
          yAxisFormats={yAxisFormats}
        />
      );

    default:
      return <EmptyState title={t("chart.badChartType")} />;
  }
};

export default Chart;
