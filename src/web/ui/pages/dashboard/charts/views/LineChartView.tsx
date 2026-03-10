import React, { useMemo } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { CHART_COLORS } from "../../../../../../shared/constants";
import {
  BaseChartViewProps,
  ChartBaseElements,
} from "../components/ChartBaseElements";
import {
  createYAxisDomainFunction,
  getYAxisAllowDataOverflow,
} from "../utils/chartUtils";

export const LineChartView: React.FC<BaseChartViewProps> = ({
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
  const yAxisDomain = useMemo(() => createYAxisDomainFunction(), []);
  const yAxisAllowDataOverflow = useMemo(
    () => getYAxisAllowDataOverflow(rows, yAxisKeys),
    [rows, yAxisKeys]
  );

  return (
    <div className="w-full h-full min-w-0 min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
            yAxisDomain={yAxisDomain}
            yAxisAllowDataOverflow={yAxisAllowDataOverflow}
            annotations={annotations}
            onXAxisClick={onXAxisClick}
            onYAxisClick={onYAxisClick}
            showLegend={showLegend}
            hiddenKeys={hiddenKeys}
            onLegendToggle={onLegendToggle}
          />

          {yAxisKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={2}
              dot={false}
              hide={hiddenKeys[key]}
              animationDuration={1000}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
