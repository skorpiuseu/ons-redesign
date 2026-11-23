import { useEffect, useId, useRef, useState } from 'react';
import { useDismissibleLayer } from '../hooks/useDismissibleLayer';
import { Icon } from './Icon';

interface SingleSelectFilterProps {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}

export function SingleSelectFilter({ label, options, value, onChange }: SingleSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const focusSelectedOptionOnOpen = useRef(false);

  useDismissibleLayer({
    open: isOpen,
    containerRef,
    onDismiss: () => setIsOpen(false),
    onEscape: () => {
      setIsOpen(false);
      triggerRef.current?.focus();
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    if (focusSelectedOptionOnOpen.current) {
      containerRef.current
        ?.querySelector<HTMLButtonElement>('[role="option"][aria-selected="true"]')
        ?.focus();
      focusSelectedOptionOnOpen.current = false;
    }
  }, [isOpen]);

  return (
    <div className="multi-select-filter single-select-filter" ref={containerRef}>
      <button
        ref={triggerRef}
        className="multi-select-trigger"
        type="button"
        aria-label={`${label}: ${value}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? `${id}-options` : undefined}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (isOpen) {
              containerRef.current
                ?.querySelector<HTMLButtonElement>('[role="option"][aria-selected="true"]')
                ?.focus();
            } else {
              focusSelectedOptionOnOpen.current = true;
              setIsOpen(true);
            }
          }
        }}
      >
        <span>{value}</span>
        <Icon name="chevron" size={15} />
      </button>
      {isOpen && (
        <div
          className="multi-select-options"
          id={`${id}-options`}
          role="listbox"
          aria-label={label}
        >
          {options.map((option) => (
            <button
              className={`single-select-option ${option === value ? 'is-selected' : ''}`}
              type="button"
              key={option}
              role="option"
              aria-selected={option === value}
              tabIndex={option === value ? 0 : -1}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault();
                  setIsOpen(false);
                  triggerRef.current?.focus();
                  return;
                }

                const direction = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
                const optionButtons = Array.from(
                  containerRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ??
                    [],
                );
                const currentIndex = optionButtons.indexOf(event.currentTarget);
                const targetIndex =
                  event.key === 'Home'
                    ? 0
                    : event.key === 'End'
                      ? optionButtons.length - 1
                      : direction
                        ? (currentIndex + direction + optionButtons.length) % optionButtons.length
                        : -1;

                if (targetIndex >= 0) {
                  event.preventDefault();
                  optionButtons[targetIndex]?.focus();
                }
              }}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
