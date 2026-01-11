import { format } from "sql-formatter";
import logger from '../../../shared/utils/logger';

/**
 * Formate une requête SQL en préservant les variables {{variable}}
 * Remplace temporairement les variables par des marqueurs pour le formatage,
 * puis les restaure après le formatage
 */
export const formatSqlQuery = (query: string): string => {
  try {
    const variables: string[] = [];
    const VARIABLE_PLACEHOLDER_PREFIX = ":_DV_VAR_";

    // Remplacer les variables par des marqueurs temporaires
    const queryWithMarkers = query.replace(
      /\{\{.*?\}\}/g,
      (match) => {
        variables.push(match);
        return `${VARIABLE_PLACEHOLDER_PREFIX}${variables.length - 1}_`;
      }
    );

    // Formater la requête SQL
    const formatted = format(queryWithMarkers, {
      language: "postgresql",
      tabWidth: 2,
      keywordCase: "upper",
    });

    // Restaurer les variables originales
    return formatted.replace(
      new RegExp(`${VARIABLE_PLACEHOLDER_PREFIX}(\\d+)_`, 'g'),
      (_, index) => variables[parseInt(index)]
    );
  } catch (error: unknown) {
    logger.error('formatSqlQuery', error);

    return query;
  }
};
