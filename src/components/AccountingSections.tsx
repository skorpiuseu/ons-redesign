import { useRef, useState } from 'react';
import { AREAS, CATEGORIES } from '../constants/app';
import { useDismissibleLayer } from '../hooks/useDismissibleLayer';
import type { AccountingCategoryId, AreaDefinition, AreaStatus } from '../types/app';
import { Icon } from './Icon';
import { InfoTooltip } from './InfoTooltip';

interface PageHeaderProps {
  onToggleTheme: () => void;
  isDark: boolean;
  onAction: (action: string) => void;
}

interface AccountingOverviewProps {
  onOpenArea: (areaTitle: string) => void;
  onUnavailableView: (view: string) => void;
}

interface PeriodControlProps {
  onConfigureArea: (areaTitle: string) => void;
  onSelectPeriod: () => void;
}

interface AreaNavigationProps {
  activeCategory: AccountingCategoryId;
  onSelectCategory: (categoryId: AccountingCategoryId) => void;
}

interface CategoryPlaceholderProps {
  categoryId: AccountingCategoryId;
  onConfigure: () => void;
}

const ALL_SUBAREA_STATUSES = AREAS.flatMap((area) => area.subareas ?? []);
const READY_SUBAREA_COUNT = ALL_SUBAREA_STATUSES.filter(({ tone }) => tone === 'ready').length;
const AREA_AVAILABILITY_SUMMARY = `${READY_SUBAREA_COUNT} z ${ALL_SUBAREA_STATUSES.length} gotowe`;
const ACCOUNTING_YEARS = [2026, 2025, 2024];

export function PageHeader({ onToggleTheme, isDark, onAction }: PageHeaderProps) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);

  useDismissibleLayer({
    open: accountMenuOpen,
    containerRef: accountMenuRef,
    onDismiss: () => setAccountMenuOpen(false),
    onEscape: () => {
      setAccountMenuOpen(false);
      accountButtonRef.current?.focus();
    },
  });

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="header-navigation-context">
          <div className="organization-heading header-organization">
            <span className="organization-logo" aria-hidden="true">
              <Icon name="calendar" size={19} />
            </span>
            <span className="organization">Onsaldo Preview Sp. z o.o.</span>
          </div>
        </div>
        <div className="top-actions">
          <div className="profile" ref={accountMenuRef}>
            <span className="profile-copy">
              <span className="profile-greeting">Witaj,</span>
              <strong>Preview Reviewer</strong>
            </span>
            <button
              ref={accountButtonRef}
              type="button"
              className="avatar account-avatar"
              aria-label="Menu konta, 4 nieprzeczytane powiadomienia"
              aria-haspopup="dialog"
              aria-expanded={accountMenuOpen}
              aria-controls={accountMenuOpen ? 'account-menu-panel' : undefined}
              onClick={() => setAccountMenuOpen((isOpen) => !isOpen)}
            >
              <Icon name="user" size={23} />
              <span className="notification-dot avatar-notification-dot" aria-hidden="true">
                4
              </span>
            </button>
            <button
              type="button"
              className="plain-button account-menu-button"
              aria-label="Otwórz menu konta"
              aria-haspopup="dialog"
              aria-expanded={accountMenuOpen}
              aria-controls={accountMenuOpen ? 'account-menu-panel' : undefined}
              onClick={() => setAccountMenuOpen((isOpen) => !isOpen)}
            >
              <Icon name="chevron" size={15} />
            </button>
            {accountMenuOpen && (
              <div
                className="account-menu-panel"
                id="account-menu-panel"
                role="dialog"
                aria-label="Menu konta"
              >
                <button
                  type="button"
                  className="account-menu-item"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    onAction('Powiadomienia');
                  }}
                >
                  <Icon name="bell" size={18} />
                  <span>Powiadomienia</span>
                  <span className="menu-notification-count">4</span>
                </button>
                <div className="account-menu-settings">
                  <span className="account-menu-section-label">Wygląd</span>
                  <button
                    type="button"
                    className="theme-switch-row"
                    role="switch"
                    aria-checked={isDark}
                    aria-label={isDark ? 'Ciemny motyw włączony' : 'Ciemny motyw wyłączony'}
                    onClick={onToggleTheme}
                  >
                    <Icon name={isDark ? 'moon' : 'sun'} size={18} />
                    <span className="theme-switch-copy">
                      <strong>Motyw ciemny</strong>
                      <small>{isDark ? 'Włączony' : 'Wyłączony'}</small>
                    </span>
                    <span className={`theme-switch ${isDark ? 'is-on' : ''}`} aria-hidden="true">
                      <span />
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function AreaStatusControl({ onOpenArea }: { onOpenArea: (areaTitle: string) => void }) {
  const [statusOpen, setStatusOpen] = useState(false);
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(() => new Set(['vat']));
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const statusControlRef = useRef<HTMLDivElement>(null);

  useDismissibleLayer({
    open: statusOpen,
    containerRef: statusControlRef,
    onDismiss: () => setStatusOpen(false),
    onEscape: () => {
      setStatusOpen(false);
      statusButtonRef.current?.focus();
    },
  });

  const openAreaView = (areaTitle: string) => {
    setStatusOpen(false);
    onOpenArea(areaTitle);
  };

  return (
    <>
      <div className="status-control header-control" ref={statusControlRef}>
        <button
          ref={statusButtonRef}
          type="button"
          className="header-control-button status-trigger"
          aria-label={`Pokaż dostępność obszarów, ${AREA_AVAILABILITY_SUMMARY}`}
          aria-expanded={statusOpen}
          aria-controls={statusOpen ? 'accounting-status-panel' : undefined}
          onClick={() => setStatusOpen((isOpen) => !isOpen)}
        >
          <span className="status-trigger-label">Dostępność obszarów:</span>
          <span className="status-trigger-summary">{AREA_AVAILABILITY_SUMMARY}</span>
          <Icon name="chevron" size={16} />
        </button>
        {statusOpen && (
          <section
            className="status-panel header-control-panel"
            id="accounting-status-panel"
            aria-labelledby="accounting-status-title"
          >
            <div className="status-panel-heading">
              <h2 id="accounting-status-title">Dostępność obszarów</h2>
              <InfoTooltip
                label="Wyjaśnienie dostępności obszarów"
                content="Status pokazuje gotowość warunków, ale nie uruchamia księgowania ani operacji zewnętrznych."
              />
              <button
                type="button"
                className="plain-button status-close"
                aria-label="Zamknij dostępność obszarów"
                onClick={() => {
                  setStatusOpen(false);
                  statusButtonRef.current?.focus();
                }}
              >
                <Icon name="close" size={17} />
              </button>
            </div>
            <ul className="status-list">
              {AREAS.map((area) => {
                const isExpanded = expandedAreas.has(area.id);
                const hasSubareas = Boolean(area.subareas?.length);
                const areaId = `accounting-subareas-${area.id}`;

                return (
                  <li className="status-area-item" key={area.id}>
                    {hasSubareas ? (
                      <button
                        className="status-parent-trigger"
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={isExpanded ? areaId : undefined}
                        onClick={() => {
                          setExpandedAreas((current) => {
                            const next = new Set(current);
                            if (next.has(area.id)) next.delete(area.id);
                            else next.add(area.id);
                            return next;
                          });
                        }}
                      >
                        <span className="status-area-icon" aria-hidden="true">
                          <Icon name={area.icon} size={17} />
                        </span>
                        <strong className="status-area-title">{area.title}</strong>
                        <span className="status-area-summary">{getAreaSummaryLabel(area)}</span>
                        <span
                          className={`status-parent-chevron ${isExpanded ? 'is-expanded' : ''}`}
                          aria-hidden="true"
                        >
                          <Icon name="chevron" size={16} />
                        </span>
                      </button>
                    ) : (
                      <AreaStatusRow
                        title={area.title}
                        icon={area.icon}
                        status={area.status}
                        onOpen={() => openAreaView(area.title)}
                      />
                    )}
                    {hasSubareas && isExpanded && (
                      <ul className="status-subarea-list" id={areaId}>
                        {area.subareas?.map((subarea) => (
                          <li className="status-subarea-row" key={subarea.id}>
                            <AreaStatusRow
                              title={subarea.title}
                              status={subarea}
                              onOpen={() => openAreaView(`${area.title} — ${subarea.title}`)}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}

export function PeriodControl({ onConfigureArea, onSelectPeriod }: PeriodControlProps) {
  const [periodOpen, setPeriodOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2026);
  const periodControlRef = useRef<HTMLDivElement>(null);
  const periodButtonRef = useRef<HTMLButtonElement>(null);

  useDismissibleLayer({
    open: periodOpen,
    containerRef: periodControlRef,
    onDismiss: () => setPeriodOpen(false),
    onEscape: () => {
      setPeriodOpen(false);
      periodButtonRef.current?.focus();
    },
  });

  return (
    <div className="period-control header-control period-control-inline" ref={periodControlRef}>
      <button
        ref={periodButtonRef}
        type="button"
        className="header-control-button period-control-button period-control-button-inline"
        aria-label={`Okres księgowy ${selectedYear}, wymaga konfiguracji`}
        aria-expanded={periodOpen}
        aria-controls={periodOpen ? 'accounting-period-panel' : undefined}
        onClick={() => setPeriodOpen((isOpen) => !isOpen)}
      >
        <span className="period-control-copy">
          <span className="period-control-label">Okres:</span>
          <strong>{selectedYear}</strong>
        </span>
        <Icon name="chevron" size={16} />
      </button>
      {periodOpen && (
        <section
          className="period-control-panel header-control-panel"
          id="accounting-period-panel"
          aria-label="Wybór okresu księgowego"
        >
          <div className="period-year-options" role="group" aria-label="Rok rozliczeniowy">
            {ACCOUNTING_YEARS.map((year) => (
              <button
                className={`period-year-option${year === selectedYear ? ' is-selected' : ''}`}
                key={year}
                type="button"
                aria-pressed={year === selectedYear}
                onClick={() => {
                  setSelectedYear(year);
                  onSelectPeriod();
                }}
              >
                <span>{year}</span>
                {year === selectedYear && <Icon name="check" size={16} />}
              </button>
            ))}
          </div>
          <div className="period-configuration-notice">
            <strong>
              <Icon name="alertTriangle" size={17} />
              Wymaga konfiguracji
            </strong>
            <p>
              Orientacyjny rok rozliczeniowy aktywnej organizacji. Wymaga potwierdzenia przed
              uruchomieniem operacji księgowych.
            </p>
          </div>
          <button
            className="period-configure-action"
            type="button"
            onClick={() => onConfigureArea(`Okres księgowy ${selectedYear}`)}
          >
            Konfiguruj okres
          </button>
        </section>
      )}
    </div>
  );
}

function AreaStatusRow({
  title,
  icon,
  status,
  onOpen,
}: {
  title: string;
  icon?: (typeof AREAS)[number]['icon'];
  status?: AreaStatus;
  onOpen: () => void;
}) {
  return (
    <div className="status-area-row">
      {icon ? (
        <span className="status-area-icon" aria-hidden="true">
          <Icon name={icon} size={17} />
        </span>
      ) : (
        <span
          className={`status-subarea-marker status-subarea-marker--${status?.tone ?? 'neutral'}`}
          aria-hidden="true"
        />
      )}
      <strong className="status-area-title">{title}</strong>
      {status && <span className="status-area-status">{status.label}</span>}
      <button
        className="status-area-action"
        type="button"
        aria-label={`Przejdź do obszaru ${title}`}
        data-tooltip={`Przejdź do obszaru ${title}`}
        onClick={onOpen}
      >
        <Icon name="arrow" size={15} />
      </button>
    </div>
  );
}

function getAreaSummaryLabel(area: AreaDefinition): string {
  const statuses = area.subareas ?? [];
  if (!statuses.length) return area.status?.label ?? 'Brak danych';
  if (statuses.every(({ tone }) => tone === 'info')) return 'Brak danych';
  if (statuses.every(({ tone }) => tone === 'neutral')) return 'Brak aktywnych kontroli';

  const readyCount = statuses.filter(({ tone }) => tone === 'ready').length;
  return `${readyCount} z ${statuses.length} gotowe`;
}

export function AccountingOverview({ onOpenArea, onUnavailableView }: AccountingOverviewProps) {
  return (
    <>
      <section className="intro">
        <nav className="breadcrumb page-breadcrumb" aria-label="Okruszki nawigacyjne">
          <button
            type="button"
            className="breadcrumb-home"
            aria-label="Strona główna"
            onClick={() => onUnavailableView('Strona główna')}
          >
            <Icon name="home" size={17} />
          </button>
          <span className="breadcrumb-separator" aria-hidden="true">
            /
          </span>
          <button
            type="button"
            className="breadcrumb-link"
            onClick={() => onUnavailableView('Ewidencje')}
          >
            Ewidencje
          </button>
          <span className="breadcrumb-separator" aria-hidden="true">
            /
          </span>
          <span className="breadcrumb-current" aria-current="page">
            Obszary księgowe
          </span>
        </nav>
        <div className="intro-heading">
          <div className="intro-title-group">
            <h1>Obszary księgowe</h1>
            <InfoTooltip
              label="Informacja o obszarach księgowych"
              content="Mapa dostępnych obszarów księgowych dla aktywnej organizacji."
            />
          </div>
          <div className="header-controls">
            <AreaStatusControl onOpenArea={onOpenArea} />
          </div>
        </div>
        <div className="area-followup-alert" role="note">
          <Icon name="alertTriangle" size={16} />
          <span>Wymaga potwierdzenia lub konfiguracji:</span>
          <a
            href="#potwierdzenie-firmy"
            onClick={(event) => {
              event.preventDefault();
              onUnavailableView('Potwierdzenie firmy');
            }}
          >
            Firma
          </a>
          <span className="area-followup-separator" aria-hidden="true">
            ·
          </span>
          <a
            href="#konfiguracja-okresu-ksiegowego"
            onClick={(event) => {
              event.preventDefault();
              onUnavailableView('Konfiguracja okresu księgowego');
            }}
          >
            Okres księgowy
          </a>
          <span className="area-followup-separator" aria-hidden="true">
            ·
          </span>
          <a
            href="#konfiguracja-rejestru-sprzedazy"
            onClick={(event) => {
              event.preventDefault();
              onUnavailableView('Konfiguracja rejestru sprzedaży VAT');
            }}
          >
            Rejestr sprzedaży
          </a>
        </div>
      </section>
    </>
  );
}

export function AreaNavigation({ activeCategory, onSelectCategory }: AreaNavigationProps) {
  return (
    <nav className="category-nav" aria-label="Obszary księgowe">
      <div className="category-tabs" role="tablist" aria-label="Obszary księgowe">
        {CATEGORIES.map((category) => (
          <button
            type="button"
            className={`category-tab ${activeCategory === category.id ? 'selected' : ''}`}
            key={category.id}
            id={`area-tab-${category.id}`}
            role="tab"
            aria-selected={activeCategory === category.id}
            aria-controls="area-content-panel"
            tabIndex={activeCategory === category.id ? 0 : -1}
            onClick={() => onSelectCategory(category.id)}
            onKeyDown={(event) => {
              if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
              event.preventDefault();
              const currentIndex = CATEGORIES.findIndex(({ id }) => id === activeCategory);
              const offset = event.key === 'ArrowRight' ? 1 : -1;
              const nextCategory =
                CATEGORIES[(currentIndex + offset + CATEGORIES.length) % CATEGORIES.length];
              onSelectCategory(nextCategory.id);
              document.getElementById(`area-tab-${nextCategory.id}`)?.focus();
            }}
          >
            <Icon name={category.icon} size={16} />
            {category.label}
          </button>
        ))}
      </div>
      <label className="category-select-wrap">
        <span className="visually-hidden">Wybierz obszar</span>
        <select
          aria-label="Wybierz obszar"
          value={activeCategory}
          onChange={(event) => onSelectCategory(event.target.value as AccountingCategoryId)}
        >
          {CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </label>
    </nav>
  );
}

export function CategoryPlaceholder({ categoryId, onConfigure }: CategoryPlaceholderProps) {
  const category = CATEGORIES.find((item) => item.id === categoryId) ?? CATEGORIES[0];

  return (
    <section className="register-card card placeholder-card">
      <div className="placeholder-icon">
        <Icon name={category.icon} size={24} />
      </div>
      <span className="organization">Onsaldo Preview Sp. z o.o.</span>
      <h2>{category.label}</h2>
      <p>
        Ten obszar jest widoczny w podglądzie, a jego dane i operacje wymagają podłączenia backendu.
      </p>
      <button type="button" className="primary-button" onClick={onConfigure}>
        <Icon name="arrow" size={16} />
        Rozpocznij konfigurację
      </button>
    </section>
  );
}
