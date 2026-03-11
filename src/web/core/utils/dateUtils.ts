import { format } from "date-fns";
import { parseISO } from "date-fns/parseISO";
import logger from '../../../shared/utils/logger';
import type { DateRange } from "../../../shared/types";

export const formatDateDisplay = (dateStr: string, isAllTime: boolean, t: (key: string) => string): string => {
  if (isAllTime) return t("common.allTime");
  try {
    return format(parseISO(dateStr), "dd/MM/yy");
  } catch (error: unknown) {
    logger.error('formatDateDisplay', error);
    return dateStr;
  }
};

export const isSameRange = (range1: DateRange, range2: DateRange): boolean => {
  return range1.from === range2.from && range1.to === range2.to;
};

export const setStartAndEndOfDay = (range: DateRange): DateRange => {
  range.from.setHours(0, 0, 0, 0);
  range.to.setHours(23, 59, 59, 999);

  return range;
};