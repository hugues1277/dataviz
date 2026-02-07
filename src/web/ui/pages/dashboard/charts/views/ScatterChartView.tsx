import React from "react";
import { ResponsiveContainer, ScatterChart, Scatter, Tooltip } from "recharts";
import { CHART_COLORS } from "../../../../../../shared/constants";
import {
  BaseChartViewProps,
  ChartBaseElements,
} from "../components/ChartBaseElements";
import { customTooltipStyle, formatValue } from "../utils/chartUtils";

export const ScatterChartView: React.FC<BaseChartViewProps> = ({
  rows,
  xAxisKey,
  yAxisKeys,
  xAxisFormat,
  yAxisFormats,
  rotateXLabels,
  xAxisTitle,
  yAxisTitle,
  showLegend,
  annotations = [],
  hiddenKeys = {},
  onLegendToggle,
  onXAxisClick,
  onYAxisClick,
}) => {
  return (
    <div className="w-full h-full min-w-0 min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          data={rows}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 20,
          }}
        >
          <ChartBaseElements
            xAxisKey={xAxisKey}
            xAxisFormat={xAxisFormat}
            rotateXLabels={rotateXLabels}
            firstFiveXLabels={rows.slice(0, 5).map((row) => row[xAxisKey])}
            xAxisTitle={xAxisTitle}
            yAxisFormat={yAxisFormats[yAxisKeys[0]]}
            yAxisTitle={yAxisTitle}
            annotations={annotations}
            onXAxisClick={onXAxisClick}
            onYAxisClick={onYAxisClick}
            showLegend={showLegend}
            hiddenKeys={hiddenKeys}
            onLegendToggle={onLegendToggle}
          />

          <Tooltip
            contentStyle={customTooltipStyle}
            itemStyle={{ fontSize: "10px", fontWeight: "bold", color: "#fff" }}
            labelFormatter={(val) => formatValue(val, xAxisFormat)}
          />

          {yAxisKeys.map((key, i) => (
            <Scatter
              key={key}
              dataKey={key}
              activeShape={{
                stroke: "lightgray",
                strokeWidth: 1,
              }}
              fill={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              hide={hiddenKeys[key]}
              animationDuration={1000}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
