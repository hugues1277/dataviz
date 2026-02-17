import React from "react";
import { ChartConfig, DateRange } from "../../../../../shared/types/types";
import ChartWidget from "./ChartWidget";
import { useChartGridPositions } from "../../../../core/hooks/dashboard/useChartGridPositions";
import ReactGridLayout from "react-grid-layout";

interface ChartGridProps {
  charts: ChartConfig[];
  isLocked: boolean;
  dateRange: DateRange;
  variableValues: Record<string, string>;
  saveChart: (charts: ChartConfig[]) => void;
  onEdit: (chart: ChartConfig) => void;
  onClone: (chart: ChartConfig) => void;
  onDelete: (chart: ChartConfig) => void;
  onView: (chart: ChartConfig) => void;
}

const ChartGrid: React.FC<ChartGridProps> = ({
  charts,
  isLocked,
  dateRange,
  variableValues,
  saveChart,
  onEdit,
  onClone,
  onDelete,
  onView,
}) => {
  const Grid = ReactGridLayout;

  const {
    localCharts,
    layout,
    containerWidth,
    isSmallScreen,
    handleLayoutChange,
  } = useChartGridPositions({
    charts,
    isLocked,
    saveChart: saveChart,
  });

  return (
    <div className="pb-16">
      <Grid
        className={`layout ${
          isLocked || isSmallScreen ? "layout-locked" : "layout-unlocked"
        }`}
        layout={layout}
        cols={isSmallScreen ? 1 : 12}
        rowHeight={80}
        width={containerWidth}
        margin={[8, 8]}
        isDraggable={!isLocked && !isSmallScreen}
        isResizable={!isLocked && !isSmallScreen}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".chart-drag-handle"
        useCSSTransforms={true}
      >
        {localCharts.map((chart) => {
          return (
            <div
              key={chart.id}
              className={`${
                isLocked || isSmallScreen
                  ? ""
                  : "ring-1 ring-blue-500/20 rounded-xl bg-[#0b0e14]"
              }`}
            >
              <ChartWidget
                chart={chart}
                dateRange={dateRange}
                variableValues={variableValues}
                isEditable={!isLocked && !isSmallScreen}
                onEdit={() => onEdit(chart)}
                onClone={() => onClone(chart)}
                onDelete={() => onDelete(chart)}
                onView={() => onView(chart)}
              />
            </div>
          );
        })}
      </Grid>
    </div>
  );
};

export default ChartGrid;
