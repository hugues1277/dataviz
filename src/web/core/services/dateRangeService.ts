import { differenceInDays, subDays } from 'date-fns';
import { DateRange } from '../../../shared/types/types';
import logger from '../../../shared/utils/logger';
import { setStartAndEndOfDay } from '../utils/dateUtils';

/**
 * Service pour gérer la sauvegarde et le chargement du date range par dashboard
 */
export const dateRangeService = {
    /**
     * Sauvegarde le date range pour un dashboard spécifique
     */
    async saveDateRange(dashboardId: string, dateRange: DateRange): Promise<void> {
        try {
            // save the date number of day of dateRange
            const numberOfDays = differenceInDays(dateRange.to, dateRange.from);
            await localStorage.setItem(`date_range_${dashboardId}`, numberOfDays.toString());
        } catch (error: unknown) {
            logger.error('saveDateRange', error);
        }
    },

    /**
     * Charge le date range sauvegardé pour un dashboard spécifique
     */
    async loadDateRange(dashboardId: string): Promise<DateRange | null> {
        try {
            const numberOfDays = await localStorage.getItem(`date_range_${dashboardId}`);

            if (!numberOfDays) return null;

            const to = new Date();
            const from = subDays(to, parseInt(numberOfDays));

            return setStartAndEndOfDay({
                from: from,
                to: to,
            });
        } catch (error: unknown) {
            logger.error('loadDateRange', error);
            return null;
        }
    },
};

