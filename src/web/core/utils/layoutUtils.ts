import { ChartConfig } from "../../../shared/types/types";

export const calculateSmallScreenLayout = (charts: ChartConfig[]) => {
  // Trier les charts par y puis par x
  const sortedCharts = [...charts].sort((a, b) => {
    const ay = a.layout?.y ?? 0;
    const by = b.layout?.y ?? 0;
    if (ay !== by) {
      return ay - by; // Tri par y uniquement
    }
    const ax = a.layout?.x ?? 0;
    const bx = b.layout?.x ?? 0;
    return ax - bx; // Utilise x uniquement pour départager ceux qui ont le même y
  });

  let currentY = 0;
  return sortedCharts.map((chart) => {
    const height = chart.layout?.h || 4;
    const item = {
      i: chart.id,
      x: 0,
      y: currentY,
      w: 1,
      h: height,
      static: true,
    };
    currentY += height;
    return item;
  });
};

export const calculateDesktopLayout = (charts: ChartConfig[]) => {
  return charts.map((chart, index) => ({
    i: chart.id,
    x: chart.layout?.x ?? (index % 3) * 4,
    y: chart.layout?.y ?? Math.floor(index / 3) * 4,
    w: chart.layout?.w ?? 4,
    h: chart.layout?.h ?? 3,
    minW: 2,
    minH: 1,
  }));
};

export const getContainerWidth = (): number => {
  const sidebarWidth = window.innerWidth >= 1024 ? 224 : 0;
  return window.innerWidth - (sidebarWidth + (window.innerWidth < 768 ? 8 : 24));
};
