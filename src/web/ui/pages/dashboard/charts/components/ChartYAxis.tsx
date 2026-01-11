import React from "react";
import { YAxis } from "recharts";
import { XAxisFormat } from "../../../../../../shared/types/types";
import { formatValue } from "../utils/chartUtils";

interface ChartYAxisProps {
  yAxisFormat?: XAxisFormat;
  yAxisTitle?: string;
  fontSize?: number;
  onAxisClick?: (value: string) => void;
}

export const ChartYAxis: React.FC<ChartYAxisProps> = ({
  yAxisFormat,
  yAxisTitle,
  fontSize = 8,
  onAxisClick,
}) => {
  return (
    <YAxis
      stroke="#4b5563"
      fontSize={fontSize}
      tickLine={false}
      axisLine={false}
      tickFormatter={(val: any) => formatValue(val, yAxisFormat)}
      onClick={(y: any) => onAxisClick?.(y.value)}
      label={
        yAxisTitle
          ? {
              value: yAxisTitle,
              position: "insideLeft",
              angle: -90,
              offset: 10,
              style: {
                fontSize: "10px",
                fontWeight: "bold",
              },
            }
          : undefined
      }
    />
  );
};
