import { useState, useMemo, useCallback } from "react";
import { DateRange } from "../../../../shared/types/types";
import { ALL_TIME_FROM, ALL_TIME_TO } from "../../../../shared/constants";

const calculateIsAllTime = (dateRange: DateRange): boolean => {
    return dateRange.from === ALL_TIME_FROM && dateRange.to === ALL_TIME_TO;
};

const getInitialDateRange = (): DateRange => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
        from: new Date(sevenDaysAgo.setHours(0, 0, 0, 0)),
        to: new Date(now.setHours(23, 59, 59, 999)),
    };
};

export const useDateRange = (initialDateRange?: DateRange) => {
    const [dateRange, setDateRangeState] = useState<DateRange>(initialDateRange || getInitialDateRange());

    const isAllTime = useMemo(
        () => calculateIsAllTime(dateRange),
        [dateRange]
    );

    const setDateRange = useCallback((range: DateRange) => {
        // Éviter les mises à jour inutiles si la valeur est identique
        setDateRangeState((prev) => {
            if (prev.from === range.from && prev.to === range.to) {
                return prev;
            }
            return range;
        });
    }, []);

    const setAllTime = useCallback(() => {
        // Éviter les mises à jour inutiles si déjà en mode "all time"
        setDateRangeState((prev) => {
            if (calculateIsAllTime(prev)) {
                return prev;
            }
            return { from: ALL_TIME_FROM, to: ALL_TIME_TO };
        });
    }, []);

    return {
        dateRange,
        isAllTime,
        setDateRange,
        setAllTime,
    };
};
