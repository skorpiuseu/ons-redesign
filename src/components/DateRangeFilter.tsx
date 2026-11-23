import { useId, useRef, useState } from 'react';
import { useDismissibleLayer } from '../hooks/useDismissibleLayer';
import { Icon } from './Icon';
import { formatPeriodDate } from '../utils/period';

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  invalid: boolean;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
}

export function DateRangeFilter({
  dateFrom,
  dateTo,
  invalid,
  onDateFromChange,
  onDateToChange,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rangeLabel =
    dateFrom && dateTo
      ? `${formatPeriodDate(dateFrom)} – ${formatPeriodDate(dateTo)}`
      : dateFrom
        ? `Od ${formatPeriodDate(dateFrom)}`
        : dateTo
          ? `Do ${formatPeriodDate(dateTo)}`
          : 'Zakres dat';

  useDismissibleLayer({
    open: isOpen,
    containerRef,
    onDismiss: () => setIsOpen(false),
    onEscape: () => {
      setIsOpen(false);
      triggerRef.current?.focus();
    },
  });

  return (
    <div className="date-range-filter" ref={containerRef}>
      <button
        ref={triggerRef}
        className="date-range-trigger"
        type="button"
        aria-label={`Zakres dat: ${rangeLabel}`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? `${id}-popover` : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{rangeLabel}</span>
        <Icon name="calendar" size={16} />
      </button>
      {isOpen && (
        <div
          className="date-range-popover"
          id={`${id}-popover`}
          role="group"
          aria-label="Niestandardowy zakres dat"
        >
          <label className="filter-field">
            <span>Od</span>
            <input
              type="date"
              aria-label="Data początkowa okresu"
              aria-invalid={invalid}
              aria-describedby={invalid ? `${id}-error` : undefined}
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
            />
          </label>
          <label className="filter-field">
            <span>Do</span>
            <input
              type="date"
              aria-label="Data końcowa okresu"
              aria-invalid={invalid}
              aria-describedby={invalid ? `${id}-error` : undefined}
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
            />
          </label>
          {invalid && (
            <p className="filter-range-error" id={`${id}-error`} role="alert">
              Data „Od” nie może być późniejsza niż data „Do”.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
