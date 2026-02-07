import { XAxisFormat } from "../../../../../../shared/types/types";
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
        throw new Error("Invalid date value");
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