import { format } from 'date-fns';
import logger from '@/src/shared/utils/logger';
import { toast } from 'react-toastify';
import i18n from '../../../../i18n/i18n';

function escapeCsvCell(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (/[,"\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowsToCsv(rows: any[], columns: string[]): string {
  const header = columns.map(escapeCsvCell).join(',');
  const body = rows
    .map((row) =>
      columns.map((col) => escapeCsvCell(row[col])).join(',')
    )
    .join('\n');
  return `${header}\n${body}`;
}

export interface ExportChartDatasToCsvInput {
  rows: any[];
  columns: string[];
  filename?: string;
}

/**
 * Exporte les données du tableau en fichier CSV et déclenche le téléchargement.
 */
export const exportChartDatasToCsvUseCase = {
  execute: async ({ rows, columns, filename }: ExportChartDatasToCsvInput): Promise<void> => {
    try {
      if (!rows.length || !columns.length) {
        toast.error(i18n.t('chart.exportCsvNoData'));
        return;
      }
      const csv = rowsToCsv(rows, columns);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename ?? `export-${format(new Date(), 'yyMMdd-HHmm')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(i18n.t('chart.exportCsvSuccess'));
    } catch (error: unknown) {
      logger.error('exportTableToCsv', error);
      toast.error(i18n.t('common.errorOccurred'));
    }
  },
};
