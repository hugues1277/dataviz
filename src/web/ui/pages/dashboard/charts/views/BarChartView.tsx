import React from "react";
import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "../../../../../../shared/constants";
import {
  BaseChartViewProps,
  ChartBaseElements,
} from "../components/ChartBaseElements";

export const BarChartView: React.FC<BaseChartViewProps> = ({
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
        <BarChart
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

          {yAxisKeys.map((key: string, i: number) => (
            <Bar
              key={key}
              dataKey={key}
              fill={CHART_COLORS[i % CHART_COLORS.length]}
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              hide={hiddenKeys[key]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
