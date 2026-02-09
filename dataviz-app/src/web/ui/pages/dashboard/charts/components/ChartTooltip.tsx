import { XAxisFormat } from "../../../../../../shared/types/types";
import { Tooltip } from "recharts";
import { formatValue } from "../utils/chartUtils";

interface Props {
  xAxisFormat: XAxisFormat;
}

export const ChartTooltip = ({ xAxisFormat }: Props) => (
  <Tooltip
    contentStyle={{
      backgroundColor: "#111217",
      border: "1px solid #2c3235",
      borderRadius: 12,
    }}
    itemStyle={{ fontSize: 10, fontWeight: "bold" }}
    labelFormatter={(v) => formatValue(v, xAxisFormat)}
  />
);
