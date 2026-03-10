import React, { useId, useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { CHART_COLORS } from "../../../../../../shared/constants";
import {
  BaseChartViewProps,
  ChartBaseElements,
} from "../components/ChartBaseElements";
import {
  createYAxisDomainFunction,
  getYAxisAllowDataOverflow,
} from "../utils/chartUtils";

/** Gradient vert (valeurs basses) → couleur légende (valeurs hautes), peu opaque */
const ValueGradient = ({ id, topColor }: { id: string; topColor: string }) => (
  <linearGradient
    id={id}
    x1="0"
    y1="1"
    x2="0"
    y2="0"
    gradientUnits="objectBoundingBox"
  >
    <stop offset="0" stopColor="#FFFFFF20" stopOpacity={0.15} />
    <stop offset="1" stopColor={topColor} stopOpacity={0.25} />
  </linearGradient>
);

export const AreaChartView: React.FC<BaseChartViewProps> = ({
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
  const baseId = useId().replace(/:/g, "-");

  const yAxisDomain = useMemo(() => createYAxisDomainFunction(), []);
  const yAxisAllowDataOverflow = useMemo(
    () => getYAxisAllowDataOverflow(rows, yAxisKeys),
    [rows, yAxisKeys]
  );

  return (
    <div className="w-full h-full min-w-0 min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
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

          <defs>
            {yAxisKeys.map((key, i) => (
              <ValueGradient
                key={key}
                id={`area-gradient-${baseId}-${i}`}
                topColor={CHART_COLORS[i % CHART_COLORS.length]}
              />
            ))}
          </defs>
          {yAxisKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              fill={`url(#area-gradient-${baseId}-${i})`}
              fillOpacity={1}
              strokeWidth={2}
              dot={false}
              hide={hiddenKeys[key]}
              animationDuration={1000}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
