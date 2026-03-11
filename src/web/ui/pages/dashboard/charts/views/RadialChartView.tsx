import React from "react";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { XAxisFormat } from "../../../../../../shared/types";
import { CHART_COLORS } from "../../../../../../shared/constants";
import { formatValue, customTooltipStyle } from "../utils/chartUtils";

export interface RadialBarChartViewProps {
  rows: any[];
  columns: string[];
  xAxisKey: string;
  yAxisKeys: string[];
  xAxisFormat: XAxisFormat;
}

const legendStyle = {
  top: "50%",
  right: 0,
  transform: "translate(0, -50%)",
  lineHeight: "20px",
};

export const RadialBarChartView: React.FC<RadialBarChartViewProps> = ({
  rows,
  columns,
  xAxisKey,
  yAxisKeys,
  xAxisFormat,
}) => {
  const dataKey =
    yAxisKeys?.[0] ||
    columns.find((c) => {
      const val = rows[0]?.[c];
      return typeof val === "number";
    }) ||
    columns[1];

  const data = rows.map((row, index) => ({
    ...row,
    name: formatValue(row[xAxisKey], xAxisFormat),
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <div className="w-full h-full min-w-0 min-h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          data={data}
          cx="35%"
          cy="50%"
          innerRadius="20%"
          outerRadius="80%"
          barSize={14}
        >
          <RadialBar
            dataKey={dataKey}
            cornerRadius={10}
            background={{
              fill: "#1f2933",
            }}
            label={{
              position: "insideStart",
              fill: "#fff",
              fontSize: 10,
              fontWeight: 600,
            }}
          />

          <Tooltip
            contentStyle={customTooltipStyle}
            itemStyle={{
              fontSize: "10px",
              fontWeight: "bold",
              color: "#fff",
            }}
          />

          <Legend
            iconSize={10}
            layout="vertical"
            iconType="circle"
            verticalAlign="middle"
            wrapperStyle={legendStyle}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};
