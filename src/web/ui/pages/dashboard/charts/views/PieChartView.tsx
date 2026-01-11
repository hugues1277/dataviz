import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { XAxisFormat } from "../../../../../../shared/types/types";
import { CHART_COLORS } from "../../../../../../shared/constants";
import { formatValue, customTooltipStyle } from "../utils/chartUtils";

interface PieChartViewProps {
  rows: any[];
  columns: string[];
  xAxisKey: string;
  yAxisKeys: string[];
  xAxisFormat: XAxisFormat;
}

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.15;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#94a3b8"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-[9px] font-bold uppercase tracking-wider"
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

export const PieChartView: React.FC<PieChartViewProps> = ({
  rows,
  columns,
  xAxisKey,
  yAxisKeys,
  xAxisFormat,
}) => {
  // Préparer les données pour chaque yAxisKey
  const pieData = yAxisKeys.map((yKey) =>
    rows.map((row) => ({
      name: formatValue(row[xAxisKey], xAxisFormat),
      value: Number(row[yKey]) || 0,
      category: yKey,
    }))
  );

  // Calculer les rayons dynamiquement en fonction du nombre de niveaux
  const numLevels = yAxisKeys.length;
  const getRadius = (index: number) => {
    if (numLevels === 1) {
      return { innerRadius: "55%", outerRadius: "75%" };
    }
    const step = 70 / (numLevels + 1);
    const innerRadius = step * (index + 1);
    const outerRadius = step * (index + 2);
    return { innerRadius: `${innerRadius}%`, outerRadius: `${outerRadius}%` };
  };

  return (
    <div className="w-full h-full min-w-0 min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {pieData.map((data, levelIndex) => {
            const { innerRadius, outerRadius } = getRadius(levelIndex);
            return (
              <Pie
                key={`pie-${levelIndex}`}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={levelIndex === 0 ? 2 : 1}
                dataKey="value"
                nameKey="name"
                label={
                  levelIndex === numLevels - 1 ? renderCustomizedLabel : false
                }
                labelLine={false}
                stroke="#111217"
                strokeWidth={2}
                cornerRadius={4}
                animationDuration={800}
                animationBegin={levelIndex * 100}
              >
                {data.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${levelIndex}-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    opacity={1 - levelIndex * 0.15}
                  />
                ))}
              </Pie>
            );
          })}
          <Tooltip
            contentStyle={customTooltipStyle}
            itemStyle={{
              fontSize: "10px",
              fontWeight: "bold",
              color: "#fff",
            }}
            formatter={(value: any, name: any, props: any) => [
              value,
              `${props.payload.category} - ${name}`,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
