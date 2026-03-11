import React from "react";
import { CartesianGrid, Tooltip } from "recharts";
import { ChartXAxis } from "./ChartXAxis";
import { ChartYAxis } from "./ChartYAxis";
import { ChartAnnotations } from "./ChartAnnotations";
import { formatValue, customTooltipStyle } from "../utils/chartUtils";
import { ChartLegend } from "./ChartLegend";
import {
  ChartVersionType,
  XAxisFormat,
} from "../../../../../../shared/types";
import type { AnnotationConfig } from "../../../../../../shared/types";

export interface BaseChartViewProps {
  rows: any[];
  xAxisKey: string;
  yAxisKeys: string[];
  xAxisFormat: XAxisFormat;
  yAxisFormats: Record<string, XAxisFormat>;
  rotateXLabels?: boolean;
  xAxisTitle: string;
  yAxisTitle: string;
  showLegend: boolean;
  version?: ChartVersionType;
  annotations?: AnnotationConfig[];
  hiddenKeys?: Record<string, boolean>;
  onLegendToggle?: (key: string) => void;
  onXAxisClick?: (value: string) => void;
  onYAxisClick?: (value: string) => void;
}

type ChartBaseElementsProps = {
  xAxisKey: string;
  xAxisFormat: XAxisFormat;
  yAxisFormat: XAxisFormat;
  rotateXLabels?: boolean;
  firstFiveXLabels?: string[];
  xAxisTitle: string;
  yAxisTitle: string;
  showLegend?: boolean;
  annotations?: AnnotationConfig[];
  hiddenKeys?: Record<string, boolean>;
  onLegendToggle?: (key: string) => void;
  onXAxisClick?: (value: string) => void;
  onYAxisClick?: (value: string) => void;
  /** Domaine de l'axe Y: [min, max] ou fonction ([dataMin, dataMax]) => [min, max] */
  yAxisDomain?: [string | number, string | number] | ((domain: [number, number]) => [number, number]);
  /** Force le domaine Y personnalisé (allowDataOverflow) */
  yAxisAllowDataOverflow?: boolean;
};

export const ChartBaseElements: React.FC<ChartBaseElementsProps> = ({
  xAxisKey,
  xAxisFormat,
  rotateXLabels,
  firstFiveXLabels,
  xAxisTitle,
  yAxisFormat,
  yAxisTitle,
  annotations = [],
  onXAxisClick,
  onYAxisClick,
  showLegend,
  hiddenKeys = {},
  onLegendToggle = () => {},
  yAxisDomain,
  yAxisAllowDataOverflow,
}) => {
  return (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#1f2127" vertical={false} />

      <ChartXAxis
        dataKey={xAxisKey}
        xAxisFormat={xAxisFormat}
        rotateXLabels={rotateXLabels}
        firstFiveXLabels={firstFiveXLabels}
        xAxisTitle={xAxisTitle}
        fontSize={10}
        onAxisClick={onXAxisClick}
      />

      <ChartYAxis
        yAxisFormat={yAxisFormat}
        yAxisTitle={yAxisTitle}
        fontSize={10}
        onAxisClick={onYAxisClick}
        domain={yAxisDomain}
        allowDataOverflow={yAxisAllowDataOverflow}
      />

      <Tooltip
        contentStyle={customTooltipStyle}
        itemStyle={{ fontSize: "10px", fontWeight: "bold" }}
        labelFormatter={(val) => formatValue(val, xAxisFormat)}
      />

      {showLegend && (
        <ChartLegend hiddenKeys={hiddenKeys} onToggle={onLegendToggle} />
      )}

      <ChartAnnotations annotations={annotations} fontSize={10} />
    </>
  );
};
