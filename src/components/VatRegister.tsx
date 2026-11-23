import { useEffect, useMemo, useRef, useState } from 'react';
import { useDemoData } from '../data/DemoDataProvider';
import { useDismissibleLayer } from '../hooks/useDismissibleLayer';
import { TableRow } from './TableRow';
import { Icon } from './Icon';
import { InfoTooltip } from './InfoTooltip';
import {
  ALL_OPTION,
  DEFAULT_EXPANDED_ROW,
  DEFAULT_FILTERS_OPEN,
  DEFAULT_PERIOD_MODE,
  DEFAULT_MONTH,
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_YEAR,
  DEFAULT_QUERY,
  DEFAULT_SERIES,
  DEFAULT_TABLE_COLUMN_ORDER,
  DEFAULT_TAB,
  EMPTY_COLUMN_FILTERS,
  FILTER_LABELS,
  JPK_OPTIONS,
  OPERATION_OPTIONS,
  PAGE_JUMP_THRESHOLD,
  PAGE_SIZE_OPTIONS,
  SERIES_OPTIONS,
  TABLE_COLUMN_LABELS,
} from '../constants/app';
import { filterEntries } from '../utils/filterEntries';
import { downloadVatCsv } from '../utils/downloadCsv';
import { formatDocumentCount, formatMoney } from '../utils/format';
import { getPaginationItems } from '../utils/pagination';
import { sortEntries, type TableSort } from '../utils/sortEntries';
import { MultiSelectFilter } from './MultiSelectFilter';
import { SingleSelectFilter } from './SingleSelectFilter';
import { DateRangeFilter } from './DateRangeFilter';
import { PeriodControl } from './AccountingSections';
import type { FilterColumn, FilterPeriodMode, VatTab, VatTableColumn } from '../types/app';
import {
  formatPeriodDate,
  getPeriodLabel,
  getPeriodRange,
  getPeriodRangeLabel,
} from '../utils/period';

interface VatRegisterProps {
  onBackendAction: (action: string) => void;
  onConfigurePeriod: (action: string) => void;
  onSelectPeriod: () => void;
}

type PageSize = number | 'all';
interface ActiveFilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

const PERIOD_MODE_LABELS: Record<FilterPeriodMode, string> = {
  month: 'Miesiąc',
  quarter: 'Kwartał',
  year: 'Rok',
  custom: 'Własny',
};

function isFilterableColumn(column: VatTableColumn): column is FilterColumn {
  return column in FILTER_LABELS;
}

export function VatRegister({
  onBackendAction,
  onConfigurePeriod,
  onSelectPeriod,
}: VatRegisterProps) {
  const dataState = useDemoData();
  const { status, data, reload } = dataState;
  const errorMessage = dataState.status === 'error' ? dataState.error.message : '';
  const [tab, setTab] = useState<VatTab>(DEFAULT_TAB);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [periodMode, setPeriodMode] = useState<FilterPeriodMode>(DEFAULT_PERIOD_MODE);
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [month, setMonth] = useState(DEFAULT_MONTH);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [operation, setOperation] = useState<string[]>([]);
  const [jpk, setJpk] = useState<string[]>([]);
  const [series, setSeries] = useState(DEFAULT_SERIES);
  const [filtersOpen, setFiltersOpen] = useState(DEFAULT_FILTERS_OPEN);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(DEFAULT_EXPANDED_ROW);
  const [filterColumn, setFilterColumn] = useState<FilterColumn | null>(null);
  const [columnFilters, setColumnFilters] = useState({ ...EMPTY_COLUMN_FILTERS });
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState<PageSize>(DEFAULT_PAGE_SIZE);
  const [pageInput, setPageInput] = useState(String(DEFAULT_PAGE));
  const [columnOrder, setColumnOrder] = useState<VatTableColumn[]>([...DEFAULT_TABLE_COLUMN_ORDER]);
  const [tableSort, setTableSort] = useState<TableSort | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<VatTableColumn | null>(null);
  const [dropTargetColumn, setDropTargetColumn] = useState<VatTableColumn | null>(null);
  const [vatBreakdownOpen, setVatBreakdownOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const filtersPopoverRef = useRef<HTMLDivElement>(null);
  const filtersToggleRef = useRef<HTMLButtonElement>(null);
  const filtersPanelRef = useRef<HTMLDivElement>(null);
  const columnFilterEditorRef = useRef<HTMLDivElement>(null);
  const columnFilterTriggerRef = useRef<HTMLButtonElement>(null);
  const vatBreakdownRef = useRef<HTMLDivElement>(null);
  const vatBreakdownTriggerRef = useRef<HTMLButtonElement>(null);

  const periodRange = getPeriodRange(periodMode, year, month, dateFrom, dateTo);
  const periodStart = periodRange.start;
  const periodEnd = periodRange.end;

  const filteredRowsByTab = useMemo(
    () => ({
      sales: filterEntries({
        entries: data,
        tab: 'sales',
        query,
        periodStart,
        periodEnd,
        operation,
        jpk,
        series,
        columnFilters,
      }),
      purchases: filterEntries({
        entries: data,
        tab: 'purchases',
        query,
        periodStart,
        periodEnd,
        operation,
        jpk,
        series,
        columnFilters,
      }),
    }),
    [data, query, periodStart, periodEnd, operation, jpk, series, columnFilters],
  );
  const rows = useMemo(
    () => sortEntries(filteredRowsByTab[tab], tableSort),
    [filteredRowsByTab, tab, tableSort],
  );
  const effectivePageSize = pageSize === 'all' ? Math.max(rows.length, 1) : pageSize;
  const pageCount = Math.max(1, Math.ceil(rows.length / effectivePageSize));
  const invalidDateRange =
    periodMode === 'custom' && Boolean(dateFrom && dateTo && dateFrom > dateTo);
  const periodIsActive =
    periodMode === 'custom'
      ? Boolean(dateFrom || dateTo)
      : !(periodMode === 'year' && year === ALL_OPTION);
  const visibleRows = rows.slice((page - 1) * effectivePageSize, page * effectivePageSize);
  const totals = visibleRows.reduce(
    (sum, row) => ({ net: sum.net + row.net, vat: sum.vat + row.vat }),
    { net: 0, vat: 0 },
  );
  const vatRateTotals = visibleRows.reduce<Record<string, number>>((sum, row) => {
    row.vatBreakdown.forEach(({ rate, vat }) => {
      sum[rate] = (sum[rate] ?? 0) + vat;
    });
    return sum;
  }, {});
  const vatRateEntries = Object.entries(vatRateTotals);
  const highestVatRateTotal = Math.max(0, ...vatRateEntries.map(([, amount]) => amount));
  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

  useDismissibleLayer({
    open: exportMenuOpen,
    containerRef: exportMenuRef,
    onDismiss: () => setExportMenuOpen(false),
    onEscape: () => {
      setExportMenuOpen(false);
      exportMenuTriggerRef.current?.focus();
    },
  });
  useDismissibleLayer({
    open: filtersOpen,
    containerRef: filtersPopoverRef,
    onDismiss: () => setFiltersOpen(false),
    onEscape: () => {
      setFiltersOpen(false);
      filtersToggleRef.current?.focus();
    },
  });
  useDismissibleLayer({
    open: vatBreakdownOpen,
    containerRef: vatBreakdownRef,
    onDismiss: () => setVatBreakdownOpen(false),
    onEscape: () => {
      setVatBreakdownOpen(false);
      vatBreakdownTriggerRef.current?.focus();
    },
  });
  useDismissibleLayer({
    open: filterColumn !== null,
    containerRef: columnFilterEditorRef,
    onDismiss: () => setFilterColumn(null),
    onEscape: () => {
      setFilterColumn(null);
      columnFilterTriggerRef.current?.focus();
    },
  });

  const clearPeriod = () => {
    setPeriodMode('year');
    setYear(ALL_OPTION);
    setDateFrom('');
    setDateTo('');
    setPage(DEFAULT_PAGE);
  };

  const resetFilters = () => {
    setQuery(DEFAULT_QUERY);
    clearPeriod();
    setMonth(DEFAULT_MONTH);
    setDateFrom('');
    setDateTo('');
    setOperation([]);
    setJpk([]);
    setSeries(DEFAULT_SERIES);
    setColumnFilters({ ...EMPTY_COLUMN_FILTERS });
    setFilterColumn(null);
    setExportMenuOpen(false);
    setPage(DEFAULT_PAGE);
  };

  const changePeriodMode = (mode: FilterPeriodMode) => {
    if (mode !== 'custom' && year === ALL_OPTION) {
      setYear(DEFAULT_YEAR);
      setMonth(DEFAULT_MONTH);
    }
    setPeriodMode(mode);
    setPage(DEFAULT_PAGE);
  };

  const movePeriod = (direction: -1 | 1) => {
    const activeYear = year === ALL_OPTION ? Number(DEFAULT_YEAR) : Number(year);
    const activeMonth = Number(month === ALL_OPTION ? DEFAULT_MONTH : month);

    if (periodMode === 'month') {
      const nextDate = new Date(activeYear, activeMonth - 1 + direction, 1);
      setYear(String(nextDate.getFullYear()));
      setMonth(String(nextDate.getMonth() + 1).padStart(2, '0'));
    } else if (periodMode === 'quarter') {
      const firstMonthOfQuarter = Math.floor((activeMonth - 1) / 3) * 3;
      const nextDate = new Date(activeYear, firstMonthOfQuarter + direction * 3, 1);
      setYear(String(nextDate.getFullYear()));
      setMonth(String(nextDate.getMonth() + 1).padStart(2, '0'));
    } else if (year !== ALL_OPTION) {
      setYear(String(activeYear + direction));
    }
    setPage(DEFAULT_PAGE);
  };

  const activeFilterChips: ActiveFilterChip[] = [];
  if (periodIsActive) {
    const periodLabel =
      periodMode === 'custom'
        ? `${dateFrom ? formatPeriodDate(dateFrom) : '…'} – ${dateTo ? formatPeriodDate(dateTo) : '…'}`
        : getPeriodLabel(periodMode, year, month);
    activeFilterChips.push({
      id: 'period',
      label: `Okres: ${periodLabel}`,
      onRemove: clearPeriod,
    });
  }
  if (query.trim()) {
    activeFilterChips.push({
      id: 'search',
      label: `Szukaj: ${query.trim()}`,
      onRemove: () => {
        setQuery(DEFAULT_QUERY);
        setPage(DEFAULT_PAGE);
      },
    });
  }
  operation.forEach((value) =>
    activeFilterChips.push({
      id: `operation-${value}`,
      label: `Rodzaj: ${value}`,
      onRemove: () => {
        setOperation((current) => current.filter((item) => item !== value));
        setPage(DEFAULT_PAGE);
      },
    }),
  );
  jpk.forEach((value) =>
    activeFilterChips.push({
      id: `jpk-${value}`,
      label: `JPK: ${value}`,
      onRemove: () => {
        setJpk((current) => current.filter((item) => item !== value));
        setPage(DEFAULT_PAGE);
      },
    }),
  );
  if (series !== DEFAULT_SERIES) {
    activeFilterChips.push({
      id: 'series',
      label: `Seria: ${series}`,
      onRemove: () => {
        setSeries(DEFAULT_SERIES);
        setPage(DEFAULT_PAGE);
      },
    });
  }
  (Object.entries(columnFilters) as [FilterColumn, string][]).forEach(([key, value]) => {
    if (value) {
      activeFilterChips.push({
        id: `column-${key}`,
        label: `${FILTER_LABELS[key]}: ${value}`,
        onRemove: () => {
          setColumnFilters((current) => ({ ...current, [key]: '' }));
          setPage(DEFAULT_PAGE);
        },
      });
    }
  });
  const activeFilterCount = activeFilterChips.length;
  const switchTab = (value: VatTab) => {
    setTab(value);
    setPage(DEFAULT_PAGE);
    setExpandedRow(DEFAULT_EXPANDED_ROW);
  };
  const exportCsv = () => downloadVatCsv(rows, tab);
  const moveColumn = (source: VatTableColumn, target: VatTableColumn) => {
    if (source === target) return;
    setColumnOrder((current) => {
      const sourceIndex = current.indexOf(source);
      const targetIndex = current.indexOf(target);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const next = [...current];
      next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, source);
      return next;
    });
  };
  const toggleSort = (column: VatTableColumn) => {
    setTableSort((current) => ({
      column,
      direction:
        current?.column === column && current.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }));
    setPage(DEFAULT_PAGE);
    setExpandedRow(DEFAULT_EXPANDED_ROW);
  };

  return (
    <section className="register-card card">
      <div className="register-heading">
        <div>
          <div className="register-title-row">
            <h2>Rejestry i VAT</h2>
            <InfoTooltip
              label="Informacja o rejestrach VAT"
              content="Sprzedaż i zakupy w wybranym okresie — podgląd danych."
            />
          </div>
        </div>
      </div>
      <div className="register-tabs-row">
        <div className="vat-tabs" role="tablist" aria-label="Rodzaj rejestru">
          <button
            id="vat-tab-sales"
            type="button"
            className={tab === 'sales' ? 'active' : ''}
            role="tab"
            aria-selected={tab === 'sales'}
            aria-controls="vat-register-panel"
            tabIndex={tab === 'sales' ? 0 : -1}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                const nextTab = tab === 'sales' ? 'purchases' : 'sales';
                switchTab(nextTab);
                document.getElementById(`vat-tab-${nextTab}`)?.focus();
              }
            }}
            onClick={() => switchTab('sales')}
          >
            <Icon name="store" size={16} />
            Sprzedaż
            <span className="vat-tab-count">{filteredRowsByTab.sales.length}</span>
          </button>
          <button
            id="vat-tab-purchases"
            type="button"
            className={tab === 'purchases' ? 'active' : ''}
            role="tab"
            aria-selected={tab === 'purchases'}
            aria-controls="vat-register-panel"
            tabIndex={tab === 'purchases' ? 0 : -1}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                const nextTab = tab === 'sales' ? 'purchases' : 'sales';
                switchTab(nextTab);
                document.getElementById(`vat-tab-${nextTab}`)?.focus();
              }
            }}
            onClick={() => switchTab('purchases')}
          >
            <Icon name="cart" size={16} />
            Zakupy
            <span className="vat-tab-count">{filteredRowsByTab.purchases.length}</span>
          </button>
        </div>
        <PeriodControl onConfigureArea={onConfigurePeriod} onSelectPeriod={onSelectPeriod} />
      </div>
      <div
        id="vat-register-panel"
        className="vat-register-panel"
        role="tabpanel"
        aria-labelledby={`vat-tab-${tab}`}
        tabIndex={0}
      >
        <div className="table-workspace">
          <div className="toolbar">
            <label className="search-box">
              <Icon name="search" size={17} />
              <input
                aria-label="Szukaj kontrahenta, numeru lub identyfikatora"
                placeholder="Szukaj kontrahenta, numeru, identyfikatora"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(DEFAULT_PAGE);
                }}
              />
              {query && (
                <button
                  className="plain-button"
                  type="button"
                  aria-label="Wyczyść wyszukiwanie"
                  onClick={() => {
                    setQuery(DEFAULT_QUERY);
                    setPage(DEFAULT_PAGE);
                  }}
                >
                  <Icon name="close" size={15} />
                </button>
              )}
            </label>
            <div className="toolbar-actions">
              <button
                type="button"
                className="icon-button tag-action"
                aria-label="Oznaczenia"
                onClick={() => onBackendAction('Oznaczanie dokumentów')}
              >
                <Icon name="tag" />
              </button>
              <div className="filters-popover-anchor" ref={filtersPopoverRef}>
                <button
                  ref={filtersToggleRef}
                  type="button"
                  className={`filters-toggle-button ${filtersOpen ? 'is-open' : ''}`}
                  aria-label={`Filtry${activeFilterCount ? `, ${activeFilterCount} aktywne` : ''}`}
                  aria-expanded={filtersOpen}
                  aria-controls={filtersOpen ? 'vat-filter-panel' : undefined}
                  onClick={() => setFiltersOpen((open) => !open)}
                >
                  <Icon name="sliders" size={17} />
                  <span>Filtry</span>
                  {activeFilterCount > 0 && (
                    <span className="filter-count-badge">{activeFilterCount}</span>
                  )}
                </button>
                {filtersOpen && (
                  <div
                    ref={filtersPanelRef}
                    className="filters"
                    id="vat-filter-panel"
                    role="region"
                    aria-label="Filtry rejestru VAT"
                  >
                    <section className="period-filter-section" aria-label="Okres">
                      <span className="filters-section-label">Okres</span>
                      <div className="period-filter-controls">
                        <div className="period-mode-switch" role="group" aria-label="Typ okresu">
                          {(['month', 'quarter', 'year', 'custom'] as const).map((mode) => (
                            <button
                              className={periodMode === mode ? 'is-selected' : ''}
                              type="button"
                              key={mode}
                              aria-pressed={periodMode === mode}
                              onClick={() => changePeriodMode(mode)}
                            >
                              {PERIOD_MODE_LABELS[mode]}
                            </button>
                          ))}
                        </div>
                        {periodMode === 'custom' ? (
                          <DateRangeFilter
                            dateFrom={dateFrom}
                            dateTo={dateTo}
                            invalid={invalidDateRange}
                            onDateFromChange={(value) => {
                              setDateFrom(value);
                              setPage(DEFAULT_PAGE);
                            }}
                            onDateToChange={(value) => {
                              setDateTo(value);
                              setPage(DEFAULT_PAGE);
                            }}
                          />
                        ) : (
                          <div className="period-stepper" role="group" aria-label="Wybrany okres">
                            <button
                              type="button"
                              aria-label="Poprzedni okres"
                              disabled={periodMode === 'year' && year === ALL_OPTION}
                              onClick={() => movePeriod(-1)}
                            >
                              <span className="stepper-chevron is-left">
                                <Icon name="chevron" size={17} />
                              </span>
                            </button>
                            <strong>{getPeriodLabel(periodMode, year, month)}</strong>
                            <button
                              type="button"
                              aria-label="Następny okres"
                              disabled={periodMode === 'year' && year === ALL_OPTION}
                              onClick={() => movePeriod(1)}
                            >
                              <span className="stepper-chevron is-right">
                                <Icon name="chevron" size={17} />
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                      {periodMode !== 'custom' && (
                        <div className="period-range-display">
                          <Icon name="calendar" size={15} />
                          <span>{getPeriodRangeLabel(periodRange)}</span>
                        </div>
                      )}
                    </section>

                    <div className="filters-fields">
                      <div className="filter-field">
                        <span>Rodzaj operacji</span>
                        <MultiSelectFilter
                          label="Rodzaj operacji"
                          options={OPERATION_OPTIONS}
                          selectedValues={operation}
                          onChange={(values) => {
                            setOperation(values);
                            setPage(DEFAULT_PAGE);
                          }}
                        />
                      </div>
                      <div className="filter-field">
                        <span>Kod JPK V7</span>
                        <MultiSelectFilter
                          label="Kod JPK V7"
                          options={JPK_OPTIONS}
                          selectedValues={jpk}
                          onChange={(values) => {
                            setJpk(values);
                            setPage(DEFAULT_PAGE);
                          }}
                        />
                      </div>
                      <div className="filter-field">
                        <span>Serie dokumentów</span>
                        <SingleSelectFilter
                          label="Serie dokumentów"
                          options={SERIES_OPTIONS}
                          value={series}
                          onChange={(value) => {
                            setSeries(value);
                            setPage(DEFAULT_PAGE);
                          }}
                        />
                      </div>
                    </div>

                    <div className="filters-footer">
                      <span />
                      <div className="filters-footer-actions">
                        <span>
                          <span aria-live="polite" aria-atomic="true">
                            {rows.length} {rows.length === 1 ? 'wynik' : 'wyników'}
                          </span>
                        </span>
                        <button
                          className="primary-button"
                          type="button"
                          disabled={invalidDateRange}
                          onClick={() => {
                            setFiltersOpen(false);
                            filtersToggleRef.current?.focus();
                          }}
                        >
                          Pokaż wyniki
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="export-menu" ref={exportMenuRef}>
                <button
                  ref={exportMenuTriggerRef}
                  className="export-menu-trigger"
                  type="button"
                  aria-expanded={exportMenuOpen}
                  aria-controls={exportMenuOpen ? 'vat-export-options' : undefined}
                  onClick={() => setExportMenuOpen((open) => !open)}
                >
                  <Icon name="download" size={17} />
                  <span>Eksport</span>
                  <span className="export-chevron">
                    <Icon name="chevron" size={15} />
                  </span>
                </button>
                {exportMenuOpen && (
                  <div
                    className="export-menu-panel"
                    id="vat-export-options"
                    role="group"
                    aria-label="Eksport danych"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setExportMenuOpen(false);
                        exportMenuTriggerRef.current?.focus();
                        window.print();
                      }}
                    >
                      <Icon name="print" size={16} />
                      Drukuj
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setExportMenuOpen(false);
                        exportMenuTriggerRef.current?.focus();
                        exportCsv();
                      }}
                    >
                      <Icon name="download" size={16} />
                      Pobierz CSV
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {activeFilterChips.length > 0 && (
            <div className="active-filter-bar">
              <div className="active-filter-list" role="group" aria-label="Aktywne filtry">
                {activeFilterChips.map((chip) => (
                  <button
                    className="active-filter-chip"
                    type="button"
                    key={chip.id}
                    aria-label={`Usuń filtr: ${chip.label}`}
                    onClick={chip.onRemove}
                  >
                    <span>{chip.label}</span>
                    <Icon name="close" size={13} />
                  </button>
                ))}
              </div>
              {activeFilterCount > 0 && (
                <button
                  className="clear-filters-button chip-clear-filters"
                  type="button"
                  onClick={resetFilters}
                >
                  <Icon name="filterOff" size={16} />
                  <span>Wyczyść filtry</span>
                </button>
              )}
              <span className="filtered-document-count" aria-live="polite" aria-atomic="true">
                {formatDocumentCount(rows.length)}
              </span>
            </div>
          )}

          <div className="summary">
            <div className="summary-item">
              <span className="summary-label">Netto</span>
              <strong aria-label={status === 'success' ? undefined : 'Kwota niedostępna'}>
                {status === 'success' ? formatMoney(totals.net) : '—'}
              </strong>
            </div>
            <div
              className={`summary-item summary-vat${vatBreakdownOpen ? ' is-open' : ''}`}
              ref={vatBreakdownRef}
            >
              <div className="summary-vat-heading">
                <span className="summary-label">VAT</span>
                <button
                  ref={vatBreakdownTriggerRef}
                  className="vat-breakdown-link"
                  type="button"
                  aria-expanded={vatBreakdownOpen}
                  aria-controls="vat-breakdown-popover"
                  onClick={() => setVatBreakdownOpen((open) => !open)}
                >
                  Kwoty według stawek
                </button>
              </div>
              <strong aria-label={status === 'success' ? undefined : 'Kwota niedostępna'}>
                {status === 'success' ? formatMoney(totals.vat) : '—'}
              </strong>
              <div
                id="vat-breakdown-popover"
                className="vat-breakdown-popover"
                role="region"
                aria-label="Kwoty według stawek VAT"
                hidden={!vatBreakdownOpen}
              >
                <div className="vat-breakdown-heading">
                  <strong>Kwoty według stawek VAT</strong>
                  <button
                    className="icon-button vat-breakdown-close"
                    type="button"
                    aria-label="Zamknij rozbicie kwot VAT"
                    onClick={() => {
                      setVatBreakdownOpen(false);
                      vatBreakdownTriggerRef.current?.focus();
                    }}
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
                {vatRateEntries.map(([rate, amount]) => (
                  <div className="breakdown-line" key={rate}>
                    <span>{rate}</span>
                    <span className={`bar-track${amount === 0 ? ' muted' : ''}`}>
                      <span
                        style={{
                          width: highestVatRateTotal
                            ? `${(amount / highestVatRateTotal) * 100}%`
                            : '0%',
                        }}
                      />
                    </span>
                    <strong>{formatMoney(amount)}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="summary-item summary-gross">
              <span className="summary-label">Brutto</span>
              <strong aria-label={status === 'success' ? undefined : 'Kwota niedostępna'}>
                {status === 'success' ? formatMoney(totals.net + totals.vat) : '—'}
              </strong>
            </div>
          </div>

          {status === 'loading' && (
            <div className="state-panel" role="status">
              <span className="spinner" aria-hidden="true" />
              <div>
                <strong>Ładowanie danych</strong>
                <p>Pobieramy demonstracyjne rekordy rejestru VAT…</p>
              </div>
            </div>
          )}
          {status === 'error' && (
            <div className="state-panel state-error" role="alert">
              <span className="state-symbol" aria-hidden="true">
                !
              </span>
              <div>
                <strong>Nie udało się wczytać danych</strong>
                <p>{errorMessage}</p>
                <div className="state-actions">
                  <button type="button" className="secondary-button" onClick={reload}>
                    <Icon name="refresh" size={15} />
                    Spróbuj ponownie
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => onBackendAction('Kontakt z administratorem')}
                  >
                    Skontaktuj się z administratorem
                  </button>
                </div>
              </div>
            </div>
          )}
          {status === 'empty' && (
            <div className="state-panel empty-state" role="status">
              <span className="state-symbol">
                <Icon name="search" size={19} />
              </span>
              <div>
                <strong>Brak danych do wyświetlenia</strong>
                <p>Plik z danymi jest poprawny, ale nie zawiera żadnych rekordów.</p>
              </div>
            </div>
          )}
          {status === 'success' && (
            <>
              {rows.length === 0 ? (
                <div className="state-panel empty-state" role="status">
                  <span className="state-symbol">
                    <Icon name="search" size={19} />
                  </span>
                  <div>
                    <strong>Brak danych do wyświetlenia</strong>
                    <p>
                      Nie znaleziono rekordów dla wybranego okresu i filtrów. Zmień kryteria
                      wyszukiwania.
                    </p>
                    <button type="button" className="secondary-button" onClick={resetFilters}>
                      Wyczyść filtry
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="table-wrap"
                    role="region"
                    aria-label="Tabela rejestru VAT. Można przewijać poziomo, aby zobaczyć dalsze kolumny."
                    tabIndex={0}
                  >
                    <table>
                      <caption className="visually-hidden">Dokumenty w rejestrze VAT</caption>
                      <thead>
                        <tr>
                          {columnOrder.map((column) => {
                            const isFilterable = isFilterableColumn(column);
                            const isNumeric =
                              column === 'net' || column === 'vat' || column === 'gross';
                            const headerClasses = [
                              'table-column-header',
                              isNumeric ? 'number-cell' : '',
                              draggedColumn === column ? 'is-dragging' : '',
                              dropTargetColumn === column ? 'is-drop-target' : '',
                            ]
                              .filter(Boolean)
                              .join(' ');

                            return (
                              <th
                                className={headerClasses}
                                key={column}
                                scope="col"
                                aria-sort={
                                  tableSort?.column === column ? tableSort.direction : 'none'
                                }
                                data-column-key={column}
                                draggable
                                tabIndex={0}
                                title="Przeciągnij, aby zmienić kolejność kolumn"
                                aria-label={`${TABLE_COLUMN_LABELS[column]}. Sortowanie przyciskiem nagłówka. Przeciągnij, aby zmienić kolejność kolumn; użyj Alt i strzałek.`}
                                onDragStart={(event) => {
                                  if (
                                    event.target instanceof Element &&
                                    event.target.closest('button')
                                  ) {
                                    event.preventDefault();
                                    return;
                                  }
                                  setDraggedColumn(column);
                                  event.dataTransfer.effectAllowed = 'move';
                                  event.dataTransfer.setData('text/plain', column);
                                }}
                                onDragOver={(event) => {
                                  event.preventDefault();
                                  event.dataTransfer.dropEffect = 'move';
                                  setDropTargetColumn(column);
                                }}
                                onDrop={(event) => {
                                  event.preventDefault();
                                  const sourceColumn =
                                    draggedColumn ?? event.dataTransfer.getData('text/plain');
                                  if (
                                    DEFAULT_TABLE_COLUMN_ORDER.includes(
                                      sourceColumn as VatTableColumn,
                                    )
                                  ) {
                                    moveColumn(sourceColumn as VatTableColumn, column);
                                  }
                                  setDraggedColumn(null);
                                  setDropTargetColumn(null);
                                }}
                                onDragEnd={() => {
                                  setDraggedColumn(null);
                                  setDropTargetColumn(null);
                                }}
                                onKeyDown={(event) => {
                                  if (
                                    event.target !== event.currentTarget ||
                                    !event.altKey ||
                                    (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
                                  ) {
                                    return;
                                  }
                                  event.preventDefault();
                                  const columnIndex = columnOrder.indexOf(column);
                                  const targetIndex =
                                    columnIndex + (event.key === 'ArrowLeft' ? -1 : 1);
                                  const targetColumn = columnOrder[targetIndex];
                                  if (targetColumn) moveColumn(column, targetColumn);
                                }}
                              >
                                <div className="table-header-label">
                                  <button
                                    className="sort-button"
                                    type="button"
                                    aria-label={
                                      tableSort?.column === column &&
                                      tableSort.direction === 'ascending'
                                        ? `Sortuj malejąco według: ${TABLE_COLUMN_LABELS[column]}`
                                        : `Sortuj rosnąco według: ${TABLE_COLUMN_LABELS[column]}`
                                    }
                                    aria-pressed={tableSort?.column === column}
                                    onClick={() => toggleSort(column)}
                                  >
                                    <span>{TABLE_COLUMN_LABELS[column]}</span>
                                    <span
                                      className={`sort-indicator${tableSort?.column === column ? ' is-active' : ''}`}
                                      aria-hidden="true"
                                    >
                                      {tableSort?.column === column
                                        ? tableSort.direction === 'ascending'
                                          ? '↑'
                                          : '↓'
                                        : '↕'}
                                    </span>
                                  </button>
                                  {isFilterable && (
                                    <button
                                      className={`column-filter-button ${columnFilters[column] ? 'has-filter' : ''} ${filterColumn === column ? 'is-open' : ''}`}
                                      type="button"
                                      aria-label={`Filtruj: ${FILTER_LABELS[column]}`}
                                      aria-expanded={filterColumn === column}
                                      aria-controls={
                                        filterColumn === column ? 'column-filter-editor' : undefined
                                      }
                                      onClick={(event) => {
                                        columnFilterTriggerRef.current = event.currentTarget;
                                        setFilterColumn(filterColumn === column ? null : column);
                                      }}
                                    >
                                      <Icon name="grip" size={13} />
                                    </button>
                                  )}
                                </div>
                              </th>
                            );
                          })}
                          <th className="row-expand-cell" scope="col">
                            <span className="visually-hidden">Rozwiń szczegóły dokumentu</span>
                          </th>
                        </tr>
                        {filterColumn && (
                          <tr className="column-filter-row">
                            <th colSpan={9}>
                              <div
                                className="column-filter-editor"
                                id="column-filter-editor"
                                ref={columnFilterEditorRef}
                              >
                                <label htmlFor={`column-filter-${filterColumn}`}>
                                  Filtruj: {FILTER_LABELS[filterColumn]}
                                </label>
                                <input
                                  id={`column-filter-${filterColumn}`}
                                  type={filterColumn === 'date' ? 'date' : 'search'}
                                  placeholder={
                                    filterColumn === 'date'
                                      ? ''
                                      : `Wpisz ${FILTER_LABELS[filterColumn].toLocaleLowerCase('pl-PL')}…`
                                  }
                                  value={columnFilters[filterColumn]}
                                  onChange={(event) => {
                                    setColumnFilters((current) => ({
                                      ...current,
                                      [filterColumn]: event.target.value,
                                    }));
                                    setPage(DEFAULT_PAGE);
                                  }}
                                />
                                <button
                                  type="button"
                                  className="text-button"
                                  onClick={() => {
                                    setColumnFilters((current) => ({
                                      ...current,
                                      [filterColumn]: '',
                                    }));
                                    setFilterColumn(null);
                                    columnFilterTriggerRef.current?.focus();
                                    setPage(DEFAULT_PAGE);
                                  }}
                                >
                                  Wyczyść filtr
                                </button>
                                <button
                                  type="button"
                                  className="icon-button close-column-filter"
                                  aria-label="Zamknij filtr"
                                  onClick={() => {
                                    setFilterColumn(null);
                                    columnFilterTriggerRef.current?.focus();
                                  }}
                                >
                                  <Icon name="close" size={14} />
                                </button>
                              </div>
                            </th>
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {visibleRows.map((row) => (
                          <TableRow
                            key={row.id}
                            row={row}
                            columnOrder={columnOrder}
                            expanded={expandedRow === row.id}
                            onToggle={() => setExpandedRow(expandedRow === row.id ? null : row.id)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="pagination">
                    <span aria-live="polite" aria-atomic="true">
                      {(page - 1) * effectivePageSize + 1}–
                      {Math.min(page * effectivePageSize, rows.length)} z {rows.length} zapisów
                    </span>
                    <div className="page-controls">
                      <nav className="pager" aria-label="Paginacja tabeli">
                        <button
                          type="button"
                          aria-label="Poprzednia strona"
                          disabled={page <= 1}
                          onClick={() => setPage(page - 1)}
                        >
                          ‹
                        </button>
                        {getPaginationItems(page, pageCount).map((item) =>
                          item.type === 'ellipsis' ? (
                            <span className="page-ellipsis" key={item.key} aria-hidden="true">
                              …
                            </span>
                          ) : (
                            <button
                              className={page === item.value ? 'is-current' : ''}
                              type="button"
                              key={item.value}
                              aria-label={`Strona ${item.value}`}
                              aria-current={page === item.value ? 'page' : undefined}
                              onClick={() => setPage(item.value)}
                            >
                              {item.value}
                            </button>
                          ),
                        )}
                        <button
                          type="button"
                          aria-label="Następna strona"
                          disabled={page >= pageCount}
                          onClick={() => setPage(page + 1)}
                        >
                          ›
                        </button>
                      </nav>
                      {pageCount >= PAGE_JUMP_THRESHOLD && (
                        <form
                          className="page-jump"
                          onSubmit={(event) => {
                            event.preventDefault();
                            const requestedPage = Number(pageInput);
                            if (!Number.isFinite(requestedPage)) return;
                            setPage(Math.min(pageCount, Math.max(1, Math.floor(requestedPage))));
                          }}
                        >
                          <label htmlFor="page-jump-input">Przejdź do strony</label>
                          <input
                            id="page-jump-input"
                            type="number"
                            min={1}
                            max={pageCount}
                            value={pageInput}
                            onChange={(event) => setPageInput(event.target.value)}
                          />
                          <button type="submit">Przejdź</button>
                        </form>
                      )}
                      <select
                        aria-label="Liczba wierszy na stronie"
                        value={pageSize}
                        onChange={(event) => {
                          const value = event.target.value;
                          setPageSize(value === 'all' ? 'all' : Number(value));
                          setPage(DEFAULT_PAGE);
                        }}
                      >
                        {PAGE_SIZE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option === 'all' ? 'Wszystkie' : `${option} na stronie`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
