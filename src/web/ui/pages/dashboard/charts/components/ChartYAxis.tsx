import React from "react";
import { YAxis } from "recharts";
import { XAxisFormat } from "../../../../../../shared/types/types";
import { formatValue } from "../utils/chartUtils";

interface ChartYAxisProps {
  yAxisFormat?: XAxisFormat;
  yAxisTitle?: string;
  fontSize?: number;
  onAxisClick?: (value: string) => void;
  /** Domaine de l'axe Y: [min, max] ou fonction ([dataMin, dataMax]) => [min, max] */
  domain?: [string | number, string | number] | ((domain: [number, number]) => [number, number]);
  /** Force le domaine personnalisé (évite l'expansion auto de Recharts) */
  allowDataOverflow?: boolean;
}

export const ChartYAxis: React.FC<ChartYAxisProps> = ({
  yAxisFormat,
  yAxisTitle,
  fontSize = 8,
  onAxisClick,
  domain,
  allowDataOverflow,
}) => {
  return (
    <YAxis
      domain={domain}
      allowDataOverflow={allowDataOverflow}
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
