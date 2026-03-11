import type { XAxisFormat } from "../../../../../../shared/types";
import logger from "../../../../../../shared/utils/logger";
import { format, parseISO } from 'date-fns';

export const getNumericColumn = (
    rows: any[],
    columns: string[]
): string | undefined => {
    if (!rows.length) return;

    return columns.find((c) => {
        const v = rows[0][c];
        return typeof v === "number" || (!isNaN(v) && isFinite(v));
    });
};

export const formatValue = (
    tick: unknown,
    formatType: XAxisFormat = "string"
): string => {
    if (!tick) return formatType === "int" ? "0" : "";

    if (formatType === "string") {
        return String(tick);
    }

    try {
        switch (formatType) {
            case "date":
                return format(parseDate(tick), "dd/MM/yy");

            case "datetime":
                return format(parseDate(tick), "dd/MM/yy HH:mm");

            case "time":
                return format(parseDate(tick), "HH:mm:ss");

            case "int":
                return String(Math.round(Number(tick)));

            default:
                return String(tick);
        }
    } catch (error: unknown) {
        logger.error("formatValue", error);

        return String(tick);
    }
};

const parseDate = (value: unknown): Date => {
    if (value instanceof Date) return value;
    if (typeof value === "string") return parseISO(value);

    const date = new Date(value as number);
    if (isNaN(date.getTime())) {
        throw new Error("Valeur de date invalide");
    }

    return date;
};

export const customTooltipStyle = {
    backgroundColor: "#111217",
    border: "1px solid #2c3235",
    borderRadius: "12px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
    padding: "8px 12px",
};

export const getHeightForRotatedXAxis = (labels?: string[]): number | null => {
    if (!labels?.length) return null;

    const moyenne = labels.reduce((acc, label) => acc + label.length, 0) / labels.length;
    return Math.round(moyenne * 4.5);
};

/** Part du range pour le seuil : on décale quand min > range * THRESHOLD_RATIO */
const Y_AXIS_THRESHOLD_RATIO = 0.06;
/** Part du range pour l'offset (marge sous la valeur min) */
const Y_AXIS_OFFSET_RATIO = 0.04;

/**
 * Crée une fonction de domaine Y pour Recharts.
 * Calcule dynamiquement threshold et offset à partir des données :
 * - threshold = 5% du range : on décale quand min est "significatif"
 * - offset = 2% du range : marge visuelle sous la valeur min
 */
export const createYAxisDomainFunction = () => {
    return ([dataMin, dataMax]: [number, number]): [number, number] => {
        const range = dataMax - dataMin;
        if (range <= 0) return [dataMin, dataMax];

        const threshold = range * Y_AXIS_THRESHOLD_RATIO;
        const offset = Math.max(1, range * Y_AXIS_OFFSET_RATIO);

        if (dataMin > 0 && dataMin > threshold) {
            return [dataMin - offset, dataMax];
        }
        return [dataMin, dataMax];
    };
};

/**
 * Indique si allowDataOverflow doit être activé (quand on applique le décalage).
 */
export const getYAxisAllowDataOverflow = (
    rows: any[],
    yAxisKeys: string[]
): boolean => {
    const values = rows.flatMap((row) =>
        yAxisKeys.map((key) => {
            const v = row[key];
            return typeof v === "number" ? v : Number(v);
        })
    ).filter((v) => !isNaN(v) && isFinite(v));
    const min = values.length ? Math.min(...values) : 0;
    const max = values.length ? Math.max(...values) : 0;
    const range = max - min;
    if (range <= 0) return false;

    const threshold = range * Y_AXIS_THRESHOLD_RATIO;
    return min > 0 && min > threshold;
};