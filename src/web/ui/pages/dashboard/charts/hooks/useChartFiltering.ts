import { useState, useMemo } from "react";
import type { XAxisFormat } from "../../../../../../shared/types";
import { formatValue } from "../utils/chartUtils";

export const useChartFiltering = (
    rows: any[],
    yAxisFormats: Record<string, XAxisFormat>
) => {
    const [filterText, setFilterText] = useState("");

    const filteredRows = useMemo(() => {
        if (!filterText) return rows;

        const lowerFilter = filterText.toLowerCase();
        return rows.filter((row) => {
            return Object.entries(row).some(([key, val]) => {
                const formatted = formatValue(val, yAxisFormats[key]);
                return String(formatted).toLowerCase().includes(lowerFilter);
            });
        });
    }, [rows, filterText, yAxisFormats]);

    return { filterText, setFilterText, filteredRows };
};