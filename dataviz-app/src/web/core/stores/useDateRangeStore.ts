import { create } from 'zustand';
import { DateRange } from '../../../shared/types/types';
import { ALL_TIME_FROM, ALL_TIME_TO, DEFAULT_DATE_RANGE_DAYS } from '../../../shared/constants';
import { dateRangeService } from '../services/dateRangeService';
import { isSameRange, setStartAndEndOfDay } from '../utils/dateUtils';

const calculateIsAllTime = (dateRange: DateRange): boolean => {
    return dateRange.from === ALL_TIME_FROM && dateRange.to === ALL_TIME_TO;
};

const getInitialDateRange = (): DateRange => {
    const now = new Date();
    const daysAgo = new Date(now.getTime() - DEFAULT_DATE_RANGE_DAYS * 24 * 60 * 60 * 1000);

    return setStartAndEndOfDay({
        from: daysAgo,
        to: now,
    });
};

interface DateRangeStore {
    dateRange: DateRange;
    setDateRange: (range: DateRange, dashboardId?: string) => void;
    isAllTime: boolean;
    setAllTime: () => void;
    loadForDashboard: (dashboardId: string) => Promise<void>;
}

export const useDateRangeStore = create<DateRangeStore>((set, get) => {
    const setDateRange = async (range: DateRange, dashboardId?: string) => {
        // Éviter les mises à jour inutiles si la valeur est identique
        if (isSameRange(get().dateRange, range)) return;

        const formatedRange = setStartAndEndOfDay(range);

        set({ dateRange: formatedRange, isAllTime: calculateIsAllTime(formatedRange) });

        // Sauvegarder automatiquement si un dashboardId est fourni
        if (dashboardId) {
            await dateRangeService.saveDateRange(dashboardId, range);
        }
    };

    const setAllTime = async () => {
        const currentState = get();
        // Éviter les mises à jour inutiles si déjà en mode "all time"
        if (currentState.isAllTime) {
            return;
        }

        const allTimeRange = { from: ALL_TIME_FROM, to: ALL_TIME_TO };
        set({
            dateRange: allTimeRange,
            isAllTime: true,
        });
    };

    const loadForDashboard = async (dashboardId: string) => {
        // Réinitialiser l'état de chargement

        const savedDateRange = await dateRangeService.loadDateRange(dashboardId) ?? getInitialDateRange();

        if (savedDateRange && isSameRange(get().dateRange, savedDateRange)) {
            return;
        }

        set({
            dateRange: savedDateRange,
            isAllTime: calculateIsAllTime(savedDateRange),
        });
    };

    return {
        dateRange: getInitialDateRange(),
        isAllTime: false,
        setDateRange,
        setAllTime,
        loadForDashboard,
    };
});

