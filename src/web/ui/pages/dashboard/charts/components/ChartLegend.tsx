import React from "react";
import { Legend } from "recharts";
import CustomLegend from "./CustomLegend";

interface ChartLegendProps {
  hiddenKeys?: Record<string, boolean>;
  onToggle?: (key: string) => void;
}

export const ChartLegend: React.FC<ChartLegendProps> = ({
  hiddenKeys = {},
  onToggle = () => {},
}) => {
  return (
    <Legend
      iconType="circle"
      layout="vertical"
      verticalAlign="bottom"
      wrapperStyle={{ bottom: 0 }}
      content={<CustomLegend hiddenKeys={hiddenKeys} onToggle={onToggle} />}
    />
  );
};
