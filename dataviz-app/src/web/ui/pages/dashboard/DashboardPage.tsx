import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChartConfig } from "../../../../shared/types/types";
import ChartEditor from "./parts/ChartEditor";
import VariablesPicker from "./widgets/VariablesPicker";
import ChartGrid from "./parts/ChartGrid";
import { useTranslation } from "react-i18next";
import { useDateRangeStore } from "../../../core/stores/useDateRangeStore";
import ChartPreview from "./parts/ChartPreview";
import { useDashboardsStore } from "../../../core/stores/dashboardsStore";
"use client";

import { useParams } from "next/navigation";
import DashboardHeader from "./parts/DashboardHeader";
import { saveChartUseCase } from "@/src/web/core/useCases/charts/saveChartUseCase";
import { deleteChartUseCase } from "@/src/web/core/useCases/charts/deleteChartUseCase";
import { DEFAULT_CHART } from "@/src/shared/constants";
import { useVariables } from "@/src/web/core/hooks/dashboard/useVariables";
import PageLoading from "../../components/layout/PageLoading";
import EmptyDashboardState from "./parts/EmptyDashboardState";

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [isLocked, setIsLocked] = useState(true);
  const [editingChart, setEditingChart] = useState<ChartConfig | null>(null);
  const [viewingChart, setViewingChart] = useState<ChartConfig | null>(null);
  const { dateRange } = useDateRangeStore();
  const params = useParams();
  const dashboardId = params?.dashboardId as string | undefined;
  const [isLoading, setIsLoading] = useState(true);

  const { dashboards, allCharts, activeDashboard, setActiveDashboard } =
    useDashboardsStore();

  const { variables, variableValues, initializeVariables, ...variableUtils } =
    useVariables();

  useEffect(() => {
    if (!dashboardId || dashboardId === activeDashboard?.id) {
      if (isLoading) {
        if (dashboardId) {
          initializeVariables(activeDashboard?.variables ?? []);
        }
        setIsLoading(false);
      }
      return;
    }

    const loadDashboard = async () => {
      setIsLoading(true);

      const dashboard = await setActiveDashboard(dashboardId as string);
      if (!dashboard) return;
      initializeVariables(dashboard?.variables ?? []);

      setIsLoading(false);
    };

    loadDashboard();
  }, [dashboardId, activeDashboard?.id, setActiveDashboard, setIsLocked]);

  const handleAddChart = useCallback(() => {
    if (!activeDashboard?.id) return;

    setEditingChart({
      ...DEFAULT_CHART,
      id: crypto.randomUUID(),
      dashboardId: activeDashboard.id,
    });
  }, [activeDashboard?.id]);

  const charts = useMemo(() => {
    return allCharts.filter((c) => c.dashboardId === activeDashboard?.id);
  }, [activeDashboard?.id, allCharts]);

  if (!activeDashboard || isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DashboardHeader
        name={t("dashboard.title")}
        activeDashboard={activeDashboard}
        canDeleteDashboard={dashboards.length > 1}
        isLocked={isLocked}
        setIsLocked={setIsLocked}
        onAddChart={handleAddChart}
      />

      <div className="px-2 md:px-4 pt-2.5 pb-1">
        <VariablesPicker
          isLocked={isLocked}
          variables={variables}
          variableValues={variableValues}
          {...variableUtils}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-0 md:p-2 md:pt-0 scrollbar-thin relative bg-[#0b0e14]">
        {charts.length === 0 && !editingChart ? (
          <EmptyDashboardState onAddChart={handleAddChart} />
        ) : (
          <ChartGrid
            charts={charts}
            isLocked={isLocked}
            dateRange={dateRange}
            variableValues={variableValues}
            saveChart={(chart: ChartConfig[]) => saveChartUseCase.execute(chart)}
            onEdit={(chart: ChartConfig) => setEditingChart(chart)}
            onDelete={(chart: ChartConfig) => deleteChartUseCase.execute(chart.id)}
            onView={(chart: ChartConfig) => setViewingChart(chart)}
          />
        )}

        {/* Modal Plein Écran (Zoom) */}
        {viewingChart && (
          <ChartPreview
            variables={variables}
            variableValues={variableValues}
            chartConfig={viewingChart}
            initialDateRange={dateRange}
            onClose={() => setViewingChart(null)}
          />
        )}

        {editingChart && (
          <ChartEditor
            dashboard={activeDashboard}
            chartConfig={editingChart}
            onSave={(chart) => {
              saveChartUseCase.execute(chart);
              setEditingChart(null);
            }}
            onClose={() => setEditingChart(null)}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
