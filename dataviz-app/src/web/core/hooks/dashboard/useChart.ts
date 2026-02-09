import { useMemo, useCallback, useState, SetStateAction, Dispatch } from "react";
import { ChartConfig, AnnotationConfig } from "../../../../shared/types/types";
import { getQueryVariablesNames, usesDateInQuery } from "../../utils/variableUtils";
import { saveChartUseCase } from "../../useCases/charts/saveChartUseCase";
import { DEFAULT_ANNOTATION } from "@/src/shared/constants";

interface UseChartResult {
  queryVariables: string[];
  usesDate: boolean;
  chartConfig: ChartConfig;
  setChartConfig: Dispatch<SetStateAction<ChartConfig>>;
  updateChartConfig: (config: ChartConfig) => Promise<void>;
  newAnnotation: AnnotationConfig;
  setNewAnnotation: (annotation: AnnotationConfig) => void;
  annotations: AnnotationConfig[];
  addAnnotation: (annotation: AnnotationConfig) => void;
  removeAnnotation: (annotationId: string) => void;
  handleXYAxisClick: (isX: boolean, value: string) => void;
}
/**
 * Hook pour gérer un chart : modification, variables utilisées, et CRUD des annotations
 */
export const useChart = (
  initialChartConfig: ChartConfig
): UseChartResult => {
  const [chartConfig, setChartConfig] = useState<ChartConfig>(initialChartConfig);
  const [newAnnotation, setNewAnnotation] =
    useState<AnnotationConfig>(initialChartConfig.annotations?.[0] || { ...DEFAULT_ANNOTATION, id: crypto.randomUUID() });

  const queryVariables = useMemo(
    () => getQueryVariablesNames(chartConfig.query),
    [chartConfig.query]
  );

  const usesDate = useMemo(
    () => usesDateInQuery(chartConfig.query),
    [chartConfig.query]
  );

  /**
   * Met à jour la configuration du chart
   */
  const updateChartConfig = useCallback(
    async (updates: Partial<ChartConfig>) => {
      const updated: ChartConfig = {
        ...chartConfig,
        ...updates,
      };

      setChartConfig(updated);
      await saveChartUseCase.execute(updated);
    },
    [chartConfig]
  );

  /**
   * Ajoute une annotation au chart
   */
  const addAnnotation = useCallback(
    (annotation: AnnotationConfig) => {
      const annotations = [...(chartConfig.annotations || []), annotation];
      updateChartConfig({ annotations });
      setNewAnnotation({ ...DEFAULT_ANNOTATION, id: crypto.randomUUID() });
    },
    [chartConfig, updateChartConfig, setNewAnnotation]
  );

  /**
   * Supprime une annotation du chart
   */
  const removeAnnotation = useCallback(
    (annotationId: string) => {
      const annotations = (chartConfig.annotations || []).filter(
        (a) => a.id !== annotationId
      );
      updateChartConfig({ annotations });
    },
    [chartConfig, updateChartConfig]
  );

  /**
   * Récupère toutes les annotations
   */
  const annotations = useMemo(
    () => chartConfig.annotations || [],
    [chartConfig.annotations]
  );

  /**
   * Met à jour la nouvelle annotation lors d'un clic sur l'axe X ou Y
   */
  const handleXYAxisClick = useCallback(
    (isX: boolean, value: string) => {
      setNewAnnotation((prev) => ({
        ...prev,
        type: isX ? "x" : "y",
        value: value
      }));
    },
    []
  );

  return {
    queryVariables,
    usesDate,
    // Chart config
    chartConfig,
    setChartConfig,
    updateChartConfig,
    // Annotations
    newAnnotation,
    setNewAnnotation,
    annotations,
    addAnnotation,
    removeAnnotation,
    handleXYAxisClick,
  };
};

