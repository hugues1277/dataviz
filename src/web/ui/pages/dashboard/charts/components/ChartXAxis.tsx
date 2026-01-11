import React from "react";
import { XAxis } from "recharts";
import { XAxisFormat } from "../../../../../../shared/types/types";
import { formatValue } from "../utils/chartUtils";

interface ChartXAxisProps {
  dataKey: string;
  xAxisFormat?: XAxisFormat;
  rotateXLabels?: boolean;
  xAxisTitle?: string;
  fontSize?: number;
  onAxisClick?: (value: string) => void;
}

export const ChartXAxis: React.FC<ChartXAxisProps> = ({
  dataKey,
  xAxisFormat,
  rotateXLabels,
  xAxisTitle,
  fontSize = 8,
  onAxisClick,
}) => {
  return (
    <XAxis
      dataKey={dataKey}
      stroke="#4b5563"
      fontSize={fontSize}
      tickLine={false}
      axisLine={false}
      tickFormatter={(val: any) => formatValue(val, xAxisFormat)}
      {...(rotateXLabels
        ? { angle: -45, textAnchor: "end" as const, height: 45 }
        : {})}
      onClick={(x: any) => onAxisClick?.(x.value)}
      label={
        xAxisTitle
          ? {
              value: xAxisTitle,
              position: "bottom",
              style: { fontSize: "10px", fontWeight: "bold" },
            }
          : undefined
      }
    />
  );
};
