import { ALL_OPTION, MONTH_OPTIONS } from '../constants/app';
import type { FilterPeriodMode } from '../types/app';

const QUARTER_LABELS = ['I', 'II', 'III', 'IV'] as const;

export interface PeriodRange {
  start: string;
  end: string;
}

export function getPeriodRange(
  mode: FilterPeriodMode,
  year: string,
  month: string,
  dateFrom: string,
  dateTo: string,
): PeriodRange {
  if (mode === 'custom') return { start: dateFrom, end: dateTo };
  if (year === ALL_OPTION) return { start: '', end: '' };

  const yearNumber = Number(year);
  const selectedMonth = Number(month);
  const firstMonth =
    mode === 'year'
      ? 1
      : mode === 'quarter'
        ? Math.floor((selectedMonth - 1) / 3) * 3 + 1
        : selectedMonth;
  const lastMonth = mode === 'year' ? 12 : mode === 'quarter' ? firstMonth + 2 : firstMonth;
  const lastDay = new Date(yearNumber, lastMonth, 0).getDate();

  return {
    start: `${year}-${String(firstMonth).padStart(2, '0')}-01`,
    end: `${year}-${String(lastMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  };
}

export function getPeriodLabel(mode: FilterPeriodMode, year: string, month: string): string {
  if (mode === 'custom') return 'Własny zakres';
  if (year === ALL_OPTION) return 'Wszystkie lata';
  if (mode === 'year') return year;
  if (mode === 'quarter') {
    const quarter = Math.floor((Number(month) - 1) / 3);
    return `${QUARTER_LABELS[quarter]} kwartał ${year}`;
  }

  const monthLabel = MONTH_OPTIONS.find((option) => option.value === month)?.label ?? month;
  return `${monthLabel} ${year}`;
}

export function formatPeriodDate(date: string): string {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${day}.${month}.${year}`;
}

export function getPeriodRangeLabel(range: PeriodRange): string {
  if (!range.start && !range.end) return 'Wszystkie daty';
  if (!range.start) return `Do ${formatPeriodDate(range.end)}`;
  if (!range.end) return `Od ${formatPeriodDate(range.start)}`;
  return `${formatPeriodDate(range.start)} – ${formatPeriodDate(range.end)}`;
}
