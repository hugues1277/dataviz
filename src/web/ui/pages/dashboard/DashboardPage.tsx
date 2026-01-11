import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChartConfig } from "../../../../shared/types/types";
import ChartEditor from "./parts/ChartEditor";
import VariablesPicker from "./widgets/VariablesPicker";
import ChartGrid from "./parts/ChartGrid";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDateRangeStore } from "../../../core/stores/useDateRangeStore";
import ChartPreview from "./parts/ChartPreview";
import { useDashboardsStore } from "../../../core/stores/dashboardsStore";
import { useParams } from "react-router";
import DashboardHeader from "./parts/DashboardHeader";
import { saveChart } from "@/src/web/core/useCases/charts/saveChart";
import { deleteChart } from "@/src/web/core/useCases/charts/deleteChart";
import { DEFAULT_CHART } from "@/src/shared/constants";
import { useVariables } from "@/src/web/core/hooks/dashboard/useVariables";

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [isLocked, setIsLocked] = useState(true);
  const [editingChart, setEditingChart] = useState<ChartConfig | null>(null);
  const [viewingChart, setViewingChart] = useState<ChartConfig | null>(null);
  const { dateRange } = useDateRangeStore();
  const { dashboardId } = useParams<{ dashboardId: string }>();
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
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold uppercase tracking-widest animate-pulse">
          {t("dashboard.loading")}
        </p>
      </div>
    );
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
          <div className="flex flex-col gap-5 items-center justify-center h-[60vh] text-center p-8">
            <div className="w-16 h-16 bg-[#181b1f] rounded-full flex items-center justify-center border border-[#2c3235]">
              <Plus size={24} className="text-gray-600" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              {t("dashboard.noCharts")}
            </h2>
            <button
              onClick={handleAddChart}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg"
            >
              {t("dashboard.addchart")}
            </button>
          </div>
        ) : (
          <ChartGrid
            charts={charts}
            isLocked={isLocked}
            dateRange={dateRange}
            variableValues={variableValues}
            saveChart={(chart: ChartConfig[]) => saveChart(chart)}
            onEdit={(chart: ChartConfig) => setEditingChart(chart)}
            onDelete={(chart: ChartConfig) => deleteChart(chart.id)}
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
              saveChart(chart);
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
