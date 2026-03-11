import { format } from "date-fns";
import { subDays } from "date-fns/subDays";
import {
  type DashboardVariable,
  type DateRange,
  VARIABLE_TYPES,
} from "../../../shared/types";

export const resolveVariableValue = (variable: DashboardVariable): string => {
  const { type, defaultValue } = variable;

  if (type === VARIABLE_TYPES.DATE) {
    if (defaultValue.toLowerCase().startsWith("today")) {
      const now = new Date();
      if (defaultValue.toLowerCase() === "today") {
        return format(now, "yyyy-MM-dd");
      }
      const match = defaultValue.match(/today-(\d+)/i);
      if (match) {
        const days = parseInt(match[1]);
        return format(subDays(now, days), "yyyy-MM-dd");
      }
    } else {
      // Créer une date valide : utiliser la valeur si elle existe et est valide, sinon utiliser aujourd'hui
      let dateValue: Date;
      if (defaultValue && defaultValue.trim() !== "") {
        const parsedDate = new Date(defaultValue);
        dateValue = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      } else {
        dateValue = new Date();
      }

      // Formater la date pour l'input (format yyyy-MM-dd requis)
      const formattedDate = format(dateValue, "yyyy-MM-dd");
      return formattedDate;
    }
  }
  return defaultValue;
};

/**
 * Extrait les noms de variables depuis une requête SQL
 */
const extractVariableNamesFromQuery = (query: string): string[] => {
  if (!query) return [];
  const matches = query.match(/{{(\w+)}}/g);
  if (!matches) return [];
  return [...new Set(matches.map((v) => v.replace(/[{}]/g, '')))];
};

/**
 * Retourne les variables du dashboard qui sont utilisées dans la requête
 */
export const getChartVariables = (dashboardVariables: DashboardVariable[], query: string): DashboardVariable[] => {
  const queryVariableNames = extractVariableNamesFromQuery(query);
  return dashboardVariables.filter((v) => queryVariableNames.includes(v.name));
};

export const getDefaultVariableValues = (variables: DashboardVariable[]): Record<string, string> => {
  const defaults: Record<string, string> = {};
  variables.forEach((v) => {
    defaults[v.name] = resolveVariableValue(v);
  });

  return defaults;
};

export const getQueryVariables = (
  variables: DashboardVariable[],
  query: string
): DashboardVariable[] => {
  return query ? getChartVariables(variables, query) : variables;
};

export const getQueryVariablesValues = (
  values: Record<string, string>,
  query: string,
  dateRange?: DateRange
): Record<string, string> => {
  const usesDate = query && (query.includes("{{from}}") || query.includes("{{to}}"));
  if (!usesDate || !dateRange) return values;

  return {
    ...values,
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
  };
};


/**
 * Extrait les noms de variables depuis une requête SQL
 */
export const getQueryVariablesNames = (query: string): string[] => {
  return extractVariableNamesFromQuery(query);
};

export const usesDateInQuery = (query?: string): boolean => {
  return query?.includes("{{from}}") || query?.includes("{{to}}") || false;
};
