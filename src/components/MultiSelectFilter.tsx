import { useId, useRef, useState } from 'react';
import { ALL_OPTION } from '../constants/app';
import { useDismissibleLayer } from '../hooks/useDismissibleLayer';
import { Icon } from './Icon';

interface MultiSelectFilterProps {
  label: string;
  options: readonly string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  emptyLabel?: string;
}

export function MultiSelectFilter({
  label,
  options,
  selectedValues,
  onChange,
  emptyLabel = ALL_OPTION,
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectableOptions = options.filter((option) => option !== ALL_OPTION);
  const selectedLabel =
    selectedValues.length === 0
      ? emptyLabel
      : selectedValues.length === 1
        ? selectedValues[0]
        : `${selectedValues.length} wybrane`;

  useDismissibleLayer({
    open: isOpen,
    containerRef,
    onDismiss: () => setIsOpen(false),
    onEscape: () => {
      setIsOpen(false);
      triggerRef.current?.focus();
    },
  });

  const toggleOption = (option: string) => {
    onChange(
      selectedValues.includes(option)
        ? selectedValues.filter((value) => value !== option)
        : [...selectedValues, option],
    );
  };

  return (
    <div className="multi-select-filter" ref={containerRef}>
      <button
        ref={triggerRef}
        className="multi-select-trigger"
        type="button"
        aria-label={`${label}: ${selectedLabel}`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? `${id}-options` : undefined}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span>{selectedLabel}</span>
        <Icon name="chevron" size={15} />
      </button>
      {isOpen && (
        <div className="multi-select-options" id={`${id}-options`} role="group" aria-label={label}>
          <button
            className={`multi-select-all ${selectedValues.length === 0 ? 'is-selected' : ''}`}
            type="button"
            aria-pressed={selectedValues.length === 0}
            onClick={() => onChange([])}
          >
            {ALL_OPTION}
          </button>
          {selectableOptions.map((option) => (
            <label className="multi-select-option" key={option}>
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => toggleOption(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
      {selectedValues.length > 0 && (
        <div className="selected-filter-tags" role="group" aria-label={`Wybrane: ${label}`}>
          {selectedValues.map((value) => (
            <button
              className="filter-tag"
              type="button"
              key={value}
              aria-label={`Usuń filtr ${value}`}
              onClick={() => toggleOption(value)}
            >
              <span>{value}</span>
              <Icon name="close" size={12} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
