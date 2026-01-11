import { create } from 'zustand';
import { Dashboard, ChartConfig } from '../../../shared/types/types';
import { useVariables } from '../hooks/dashboard/useVariables';
import { useDateRangeStore } from './useDateRangeStore';

interface DashboardsStore {
  dashboards: Dashboard[];
  allCharts: ChartConfig[];
  activeDashboard: Dashboard | null;
  isLoading: boolean;

  // Setters simples pour l'état
  setDashboards: (dashboards: Dashboard[]) => void;
  setAllCharts: (charts: ChartConfig[]) => void;
  setActiveDashboard: (dashboardId: string) => Promise<Dashboard | null>;
}

export const useDashboardsStore = create<DashboardsStore>((set, get) => ({
  dashboards: [],
  allCharts: [],
  activeDashboard: null,
  isLoading: false,

  setDashboards: (dashboards) => {
    set({ dashboards })
    get().setActiveDashboard(get().activeDashboard?.id || dashboards[0].id);
  },
  setAllCharts: (allCharts) => {
    set({ allCharts })
    get().setActiveDashboard(get().activeDashboard?.id || allCharts[0].dashboardId);
  },

  setActiveDashboard: async (dashboardId: string): Promise<Dashboard | null> => {
    const { dashboards } = get();

    const dashboard = dashboards.find(d => d.id === dashboardId) ?? dashboards[0];
    if (!dashboard) return null;


    if (get().activeDashboard?.id !== dashboardId) {
      set({ isLoading: true });
    }

    // Load date range for the active dashboard
    await useDateRangeStore.getState().loadForDashboard(dashboardId);

    set({
      isLoading: false,
      activeDashboard: dashboard,
    });

    return dashboard;
  },
}));