import {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import type { ChartConfig } from "../../../../shared/types";
import {
  calculateSmallScreenLayout,
  calculateDesktopLayout,
  getContainerWidth,
} from "../../utils/layoutUtils";
import { useWindowResize } from "../useWindowResize";

interface UseChartGridOptions {
  charts: ChartConfig[];
  isLocked: boolean;
  saveChart: (chart: ChartConfig[]) => void;
}

export const useChartGridPositions = ({
  charts,
  isLocked,
  saveChart,
}: UseChartGridOptions) => {
  const windowWidth = useWindowResize();
  const containerWidth = useMemo(() => getContainerWidth(), [windowWidth]);
  const isSmallScreen = useMemo(() => windowWidth < 1024, [windowWidth]);

  // État local pour stocker les modifications de layout non sauvegardées
  const [localCharts, setLocalCharts] = useState<ChartConfig[]>(charts);
  const prevIsLockedRef = useRef(isLocked);

  // Synchroniser localCharts avec charts quand ils changent depuis l'extérieur
  useEffect(() => {
    setLocalCharts(charts);
  }, [charts]);

  // Fonction helper pour comparer deux charts et détecter si le layout a changé
  const hasLayoutChanged = useCallback(
    (chart1: ChartConfig, chart2: ChartConfig): boolean => {
      const layout1 = chart1.layout;
      const layout2 = chart2.layout;

      if (!layout1 && !layout2) return false;
      if (!layout1 || !layout2) return true;

      return (
        layout1.x !== layout2.x ||
        layout1.y !== layout2.y ||
        layout1.w !== layout2.w ||
        layout1.h !== layout2.h
      );
    },
    []
  );

  // Sauvegarder quand isLocked passe de false à true
  useEffect(() => {
    const wasUnlocked = prevIsLockedRef.current === false;
    const isNowLocked = isLocked === true;

    if (wasUnlocked && isNowLocked) {
      // Identifier seulement les charts qui ont été modifiés
      const modifiedCharts = localCharts.filter((localChart: ChartConfig) => {
        const originalChart = charts.find((c: ChartConfig) => c.id === localChart.id);
        if (!originalChart) return false;
        return hasLayoutChanged(localChart, originalChart);
      });

      // Sauvegarder seulement les charts modifiés
      if (modifiedCharts.length > 0) {
        saveChart(modifiedCharts);
      }
    }

    prevIsLockedRef.current = isLocked;
  }, [isLocked, localCharts, charts, saveChart, hasLayoutChanged]);

  const layout = useMemo(() => {
    if (isSmallScreen) {
      return calculateSmallScreenLayout(localCharts);
    }
    return calculateDesktopLayout(localCharts);
  }, [localCharts, isSmallScreen]);

  const handleLayoutChange = useCallback(
    (newLayout: any) => {
      if (isLocked || isSmallScreen) return;
      const updatedCharts = localCharts.map((chart) => {
        const layoutItem = Array.isArray(newLayout)
          ? newLayout.find((l: any) => l.i === chart.id)
          : null;
        if (layoutItem) {
          return {
            ...chart,
            layout: {
              x: layoutItem.x,
              y: layoutItem.y,
              w: layoutItem.w,
              h: layoutItem.h,
            },
          };
        }
        return chart;
      });
      // Mettre à jour seulement l'état local, pas sauvegarder
      if (JSON.stringify(updatedCharts) !== JSON.stringify(localCharts)) {
        setLocalCharts(updatedCharts);
      }
    },
    [isLocked, isSmallScreen, localCharts]
  );

  return {
    localCharts,
    layout,
    containerWidth,
    isSmallScreen,
    handleLayoutChange,
  };
};

