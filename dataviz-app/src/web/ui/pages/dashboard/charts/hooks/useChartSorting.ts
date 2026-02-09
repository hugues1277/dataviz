import { useState, useMemo } from "react";

interface SortConfig {
    key: string | null;
    direction: "asc" | "desc";
}

export const useChartSorting = (rows: any[]) => {
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: null,
        direction: "asc",
    });

    const handleSort = (key: string) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedRows = useMemo(() => {
        if (!sortConfig.key) return rows;

        const items = [...rows];
        items.sort((a, b) => {
            const valA = a[sortConfig.key!];
            const valB = b[sortConfig.key!];

            if (valA === valB) return 0;
            if (valA === null || valA === undefined) return 1;
            if (valB === null || valB === undefined) return -1;

            const isNumeric = typeof valA === "number" && typeof valB === "number";
            if (isNumeric) {
                return sortConfig.direction === "asc" ? valA - valB : valB - valA;
            }

            const strA = String(valA).toLowerCase();
            const strB = String(valB).toLowerCase();
            return sortConfig.direction === "asc"
                ? strA.localeCompare(strB)
                : strB.localeCompare(strA);
        });

        return items;
    }, [rows, sortConfig]);

    return { sortConfig, handleSort, sortedRows };
};