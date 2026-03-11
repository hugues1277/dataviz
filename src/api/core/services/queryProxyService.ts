import pkg from "node-sql-parser";
import { CONNECTION_TYPES } from "@/src/shared/types";
import logger from "@/src/shared/utils/logger";

const { Parser } = pkg;

/** Structure minimale d'un nœud AST SQL (node-sql-parser) */
interface SqlAstNode extends Record<string, unknown> {
  type?: string;
  from?: { expr?: SqlAstNode }[];
  where?: SqlAstNode;
  columns?: { expr?: SqlAstNode }[];
  _next?: SqlAstNode;
}

export const queryProxyService = {
    /**
     * Vérifie que la requête SQL est composée UNIQUEMENT de SELECT
     * (y compris UNION, sous-requêtes, window functions, ORDER BY, etc.)
     */
    isAllowedQuery: (query: string, type: 'postgres' | 'mysql'): boolean => {
        try {
            // Vérifications préliminaires
            if (!query || typeof query !== 'string') {
                return false;
            }

            const trimmedQuery = query.trim();

            // Vérifier que la requête n'est pas vide
            if (trimmedQuery.length === 0) {
                return false;
            }

            // Bloquer les commentaires SQL suspects (possibles injections)
            if (
              trimmedQuery.includes("--") ||
              trimmedQuery.includes("/*") ||
              trimmedQuery.includes("*/") ||
              trimmedQuery.includes("#")
            ) {
                return false;
            }

            // Bloquer les points-virgules multiples (chaînage de requêtes)
            const semicolonCount = (trimmedQuery.match(/;/g) ?? []).length;
            if (semicolonCount > 1) {
                return false;
            }

            // Parser la requête
            const parser = new Parser();
            let ast;

            try {
                ast = parser.astify(query, {
                  database:
                    type === CONNECTION_TYPES.POSTGRES ? "postgresql" : type,
                });
            } catch (parseError: unknown) {
                logger.error('queryProxyService', parseError);
                // Si le parsing échoue, la requête n'est pas valide
                return false;
            }

            // Normaliser l'AST en tableau
            const statements = Array.isArray(ast) ? ast : [ast];

            // Vérifier chaque statement
            for (const statement of statements) {
                if (!queryProxyService.isValidSelectStatement(statement)) {
                    return false;
                }
            }

            return true;

        } catch (parseError: unknown) {
            logger.error('queryProxyService', parseError);
            // En cas d'erreur, rejeter la requête par sécurité
            return false;
        }
    },

    /**
     * Vérifie récursivement qu'un statement est uniquement composé de SELECT
     */
    isValidSelectStatement: (statement: unknown): boolean => {
        if (!statement || typeof statement !== "object") {
            return false;
        }

        const node = statement as SqlAstNode;

        if (node.type !== "select") {
            return false;
        }

        // Vérifier les mots-clés dangereux dans la structure
        const dangerousKeywords = [
          "insert",
          "update",
          "delete",
          "drop",
          "create",
          "alter",
          "truncate",
          "exec",
          "execute",
          "grant",
          "revoke",
          "merge",
          "call",
          "replace",
        ];

        const statementStr = JSON.stringify(node).toLowerCase();
        for (const keyword of dangerousKeywords) {
            if (statementStr.includes(`"type":"${keyword}"`)) {
                return false;
            }
        }

        if (node.from) {
            for (const fromItem of node.from) {
                if (fromItem.expr?.type === "select") {
                    if (!queryProxyService.isValidSelectStatement(fromItem.expr)) {
                        return false;
                    }
                }
            }
        }

        if (node.where) {
            if (!queryProxyService.isValidWhereClause(node.where)) {
                return false;
            }
        }

        if (node.columns) {
            for (const column of node.columns) {
                if (column.expr?.type === "select") {
                    if (!queryProxyService.isValidSelectStatement(column.expr)) {
                        return false;
                    }
                }
            }
        }

        if (node._next) {
            if (!queryProxyService.isValidSelectStatement(node._next)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Vérifie récursivement les clauses WHERE pour détecter des sous-requêtes
     */
    isValidWhereClause: (whereClause: unknown): boolean => {
        if (!whereClause || typeof whereClause !== "object") {
            return true;
        }

        const node = whereClause as SqlAstNode;
        if (node.type === "select") {
            return queryProxyService.isValidSelectStatement(node);
        }

        for (const key in node) {
            const value = node[key];

            if (Array.isArray(value)) {
                for (const item of value) {
                    if (!queryProxyService.isValidWhereClause(item)) {
                        return false;
                    }
                }
            } else if (value && typeof value === 'object') {
                if (!queryProxyService.isValidWhereClause(value)) {
                    return false;
                }
            }
        }

        return true;
    }
}