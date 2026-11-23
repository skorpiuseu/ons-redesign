import type { VatEntry } from '../data/types';

export type IconName =
  | 'sun'
  | 'home'
  | 'help'
  | 'alertTriangle'
  | 'clock'
  | 'moon'
  | 'bell'
  | 'user'
  | 'calendar'
  | 'receipt'
  | 'store'
  | 'cart'
  | 'bank'
  | 'cash'
  | 'book'
  | 'box'
  | 'check'
  | 'checkmark'
  | 'search'
  | 'tag'
  | 'print'
  | 'download'
  | 'sliders'
  | 'chevron'
  | 'filterOff'
  | 'grip'
  | 'file'
  | 'arrow'
  | 'refresh'
  | 'close';

export type FilterColumn = 'contractor' | 'date' | 'document' | 'ksef' | 'identifier';
export type VatTableColumn = FilterColumn | 'net' | 'vat' | 'gross';
export type VatTab = 'sales' | 'purchases';
export type FilterPeriodMode = 'month' | 'quarter' | 'year' | 'custom';
export type AccountingCategoryId = 'vat' | 'books' | 'assets' | 'audits';

export type ColumnFilters = Record<FilterColumn, string>;

export interface AreaDefinition {
  id: string;
  title: string;
  icon: IconName;
  status?: AreaStatus;
  subareas?: AreaSubarea[];
}

export interface AreaStatus {
  label: string;
  tone: 'ready' | 'action' | 'info' | 'neutral' | 'error';
}

export interface AreaSubarea extends AreaStatus {
  id: string;
  title: string;
}

export interface CategoryDefinition {
  id: AccountingCategoryId;
  label: string;
  icon: IconName;
}

export interface FilterEntriesOptions {
  entries: VatEntry[];
  tab: VatTab;
  query: string;
  periodStart: string;
  periodEnd: string;
  operation: string[];
  jpk: string[];
  series: string;
  columnFilters: ColumnFilters;
}

export interface IconProps {
  name: IconName;
  size?: number;
}

export interface ToastProps {
  message: string;
  onClose: () => void;
}
