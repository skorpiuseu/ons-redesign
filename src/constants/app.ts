import type {
  AccountingCategoryId,
  AreaDefinition,
  CategoryDefinition,
  ColumnFilters,
  FilterColumn,
  VatTab,
  VatTableColumn,
} from '../types/app';

export const ALL_OPTION = 'Wszystkie';
export const ALL_SERIES_OPTION = 'Wszystkie serie';

export const DEFAULT_TAB: VatTab = 'sales';
export const DEFAULT_CATEGORY: AccountingCategoryId = 'vat';
export const DEFAULT_YEAR = '2026';
export const DEFAULT_MONTH = '10';
export const DEFAULT_PERIOD_MODE = 'month' as const;
export const DEFAULT_SERIES = ALL_SERIES_OPTION;
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_JUMP_THRESHOLD = 10;
export const MAX_PAGINATION_BUTTONS = 7;
export const DEFAULT_TABLE_COLUMN_ORDER: VatTableColumn[] = [
  'contractor',
  'date',
  'document',
  'ksef',
  'identifier',
  'net',
  'vat',
  'gross',
];
export const DEFAULT_DARK_MODE = false;
export const THEME_STORAGE_KEY = 'onsaldo-theme-preference';
export const DEFAULT_QUERY = '';
export const DEFAULT_FILTERS_OPEN = false;
export const DEFAULT_EXPANDED_ROW: string | null = null;
export const DEFAULT_TOAST = '';

export const MONTH_OPTIONS = [
  { value: '01', label: 'styczeń' },
  { value: '02', label: 'luty' },
  { value: '03', label: 'marzec' },
  { value: '04', label: 'kwiecień' },
  { value: '05', label: 'maj' },
  { value: '06', label: 'czerwiec' },
  { value: '07', label: 'lipiec' },
  { value: '08', label: 'sierpień' },
  { value: '09', label: 'wrzesień' },
  { value: '10', label: 'październik' },
  { value: '11', label: 'listopad' },
  { value: '12', label: 'grudzień' },
] as const;
export const OPERATION_OPTIONS = [
  ALL_OPTION,
  'Sprzedaż krajowa',
  'Zakup krajowy',
  'Korekta',
] as const;
export const JPK_OPTIONS = [ALL_OPTION, 'K_19', 'K_42'] as const;
export const SERIES_OPTIONS = [ALL_SERIES_OPTION, 'Seria A', 'Seria B'] as const;
export const PAGE_SIZE_OPTIONS = [10, 5, 20, 'all'] as const;

export const FILTER_LABELS: Record<FilterColumn, string> = {
  contractor: 'Kontrahent',
  date: 'Data',
  document: 'Numer dokumentu',
  ksef: 'Numer KSeF',
  identifier: 'Identyfikator',
};
export const TABLE_COLUMN_LABELS: Record<VatTableColumn, string> = {
  ...FILTER_LABELS,
  net: 'Netto',
  vat: 'VAT',
  gross: 'Brutto',
};

export const EMPTY_COLUMN_FILTERS: ColumnFilters = {
  contractor: '',
  date: '',
  document: '',
  ksef: '',
  identifier: '',
};

export const AREAS: AreaDefinition[] = [
  {
    id: 'vat',
    title: 'Rejestr VAT',
    icon: 'receipt',
    subareas: [
      {
        id: 'vat-sales',
        title: 'Rejestr VAT sprzedaży',
        label: 'Gotowy',
        tone: 'ready',
      },
      {
        id: 'vat-purchases',
        title: 'Rejestr VAT zakupów',
        label: 'Gotowy',
        tone: 'ready',
      },
      {
        id: 'vat-eu',
        title: 'Transakcje unijne',
        label: 'Wymaga dodatkowej konfiguracji',
        tone: 'action',
      },
      {
        id: 'vat-reporting',
        title: 'Deklaracje i raportowanie',
        label: 'Do konfiguracji',
        tone: 'action',
      },
    ],
  },
  {
    id: 'kpir',
    title: 'KPiR',
    icon: 'bank',
    subareas: [
      { id: 'kpir-income', title: 'Przychody', label: 'Do konfiguracji', tone: 'action' },
      {
        id: 'kpir-goods',
        title: 'Zakup towarów i materiałów',
        label: 'Do konfiguracji',
        tone: 'action',
      },
      {
        id: 'kpir-costs',
        title: 'Koszty działalności',
        label: 'Do konfiguracji',
        tone: 'action',
      },
      { id: 'kpir-payroll', title: 'Wynagrodzenia', label: 'Do konfiguracji', tone: 'action' },
      { id: 'kpir-inventory', title: 'Remanent', label: 'Do konfiguracji', tone: 'action' },
    ],
  },
  {
    id: 'income',
    title: 'Ewidencja przychodów',
    icon: 'cash',
    subareas: [
      {
        id: 'income-rates',
        title: 'Przychody według stawek ryczałtu',
        label: 'Do konfiguracji',
        tone: 'action',
      },
      {
        id: 'income-summary',
        title: 'Zestawienia miesięczne',
        label: 'Do konfiguracji',
        tone: 'action',
      },
    ],
  },
  {
    id: 'books',
    title: 'Pełne księgi',
    icon: 'file',
    subareas: [
      { id: 'books-journal', title: 'Dziennik', label: 'Wymaga potwierdzenia', tone: 'action' },
      {
        id: 'books-ledger',
        title: 'Księga główna',
        label: 'Wymaga potwierdzenia',
        tone: 'action',
      },
      {
        id: 'books-subsidiary',
        title: 'Księgi pomocnicze',
        label: 'Wymaga potwierdzenia',
        tone: 'action',
      },
      {
        id: 'books-trial-balance',
        title: 'Zestawienia obrotów i sald',
        label: 'Wymaga potwierdzenia',
        tone: 'action',
      },
      { id: 'books-inventory', title: 'Inwentarz', label: 'Wymaga potwierdzenia', tone: 'action' },
    ],
  },
  {
    id: 'assets',
    title: 'Majątek',
    icon: 'box',
    subareas: [
      {
        id: 'assets-fixed',
        title: 'Majątek trwały',
        label: 'Brak danych',
        tone: 'info',
      },
      {
        id: 'assets-current',
        title: 'Majątek obrotowy',
        label: 'Brak danych',
        tone: 'info',
      },
    ],
  },
  {
    id: 'audits',
    title: 'Kontrole',
    icon: 'check',
    subareas: [
      {
        id: 'audit-completeness',
        title: 'Kompletność dokumentów',
        label: 'Brak aktywnych kontroli',
        tone: 'neutral',
      },
      {
        id: 'audit-vat',
        title: 'Spójność ewidencji VAT',
        label: 'Brak aktywnych kontroli',
        tone: 'neutral',
      },
      {
        id: 'audit-duplicates',
        title: 'Duplikaty dokumentów',
        label: 'Brak aktywnych kontroli',
        tone: 'neutral',
      },
    ],
  },
];

export const CATEGORIES: CategoryDefinition[] = [
  { id: 'vat', label: 'Rejestry i VAT', icon: 'receipt' },
  { id: 'books', label: 'Księgowania', icon: 'bank' },
  { id: 'assets', label: 'Majątek', icon: 'box' },
  { id: 'audits', label: 'Kontrole', icon: 'check' },
];

export const CSV_HEADERS = [
  'Kontrahent',
  'Data',
  'Numer dokumentu',
  'Numer KSeF',
  'Identyfikator',
  'Netto',
  'VAT',
  'Brutto',
];
