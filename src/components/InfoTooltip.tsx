import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import type { IconName } from '../types/app';
import { Icon } from './Icon';

interface InfoTooltipProps {
  label: string;
  content: string;
  iconName?: IconName;
  className?: string;
  triggerContent?: ReactNode;
}

export function InfoTooltip({
  label,
  content,
  iconName = 'help',
  className = '',
  triggerContent,
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const tooltipId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const isHoveredRef = useRef(false);
  const isFocusedRef = useRef(false);
  const closeTimeoutRef = useRef<number | null>(null);

  const cancelScheduledClose = () => {
    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelScheduledClose();
    closeTimeoutRef.current = window.setTimeout(() => {
      if (!isHoveredRef.current && !isFocusedRef.current) setIsOpen(false);
    }, 120);
  };

  const keepOpen = () => {
    cancelScheduledClose();
    isHoveredRef.current = true;
    setIsOpen(true);
  };

  useEffect(() => () => cancelScheduledClose(), []);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      const tooltip = tooltipRef.current?.getBoundingClientRect();
      if (!trigger || !tooltip) return;

      const viewport = window.visualViewport;
      const viewportPadding = 12;
      const viewportLeft = viewport?.offsetLeft ?? 0;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportRight = viewportLeft + (viewport?.width ?? window.innerWidth);
      const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
      const left = Math.min(
        Math.max(
          viewportLeft + viewportPadding,
          trigger.left + (trigger.width - tooltip.width) / 2,
        ),
        Math.max(viewportLeft + viewportPadding, viewportRight - tooltip.width - viewportPadding),
      );
      const below = trigger.bottom + 8;
      const above = trigger.top - tooltip.height - 8;
      const top =
        below + tooltip.height <= viewportBottom - viewportPadding
          ? below
          : above >= viewportTop + viewportPadding
            ? above
            : Math.max(
                viewportTop + viewportPadding,
                Math.min(below, viewportBottom - tooltip.height - viewportPadding),
              );

      setPosition((current) =>
        current.left === left && current.top === top ? current : { left, top },
      );
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    window.visualViewport?.addEventListener('resize', updatePosition);
    window.visualViewport?.addEventListener('scroll', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      window.visualViewport?.removeEventListener('resize', updatePosition);
      window.visualViewport?.removeEventListener('scroll', updatePosition);
    };
  }, [isOpen]);

  return (
    <div
      className={`page-info ${className} ${isOpen ? 'is-open' : ''}`}
      onMouseEnter={() => {
        if (window.matchMedia('(hover: hover)').matches) {
          keepOpen();
        }
      }}
      onMouseLeave={() => {
        if (window.matchMedia('(hover: hover)').matches) {
          isHoveredRef.current = false;
          if (!isFocusedRef.current) scheduleClose();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="page-info-trigger"
        aria-label={label}
        aria-expanded={isOpen}
        aria-describedby={tooltipId}
        aria-controls={isOpen ? tooltipId : undefined}
        onClick={() => {
          if (window.matchMedia('(hover: none)').matches) setIsOpen((open) => !open);
        }}
        onFocus={() => {
          isFocusedRef.current = true;
          if (window.matchMedia('(hover: hover)').matches) setIsOpen(true);
        }}
        onBlur={() => {
          isFocusedRef.current = false;
          if (!isHoveredRef.current) scheduleClose();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            cancelScheduledClose();
            isHoveredRef.current = false;
            setIsOpen(false);
          }
        }}
      >
        {triggerContent ?? <Icon name={iconName} size={iconName === 'help' ? 18 : 17} />}
      </button>
      {typeof document !== 'undefined' &&
        createPortal(
          <span
            ref={tooltipRef}
            className={`app-tooltip page-info-popover${isOpen ? ' is-open' : ''}`}
            id={tooltipId}
            role="tooltip"
            style={{ left: position.left, top: position.top }}
            onMouseEnter={() => {
              if (window.matchMedia('(hover: hover)').matches) keepOpen();
            }}
            onMouseLeave={() => {
              if (window.matchMedia('(hover: hover)').matches) {
                isHoveredRef.current = false;
                if (!isFocusedRef.current) scheduleClose();
              }
            }}
          >
            {content}
          </span>,
          document.body,
        )}
    </div>
  );
}
