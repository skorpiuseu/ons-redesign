import { useEffect, useRef } from 'react';

interface DismissibleLayerOptions {
  open: boolean;
  containerRef: { current: HTMLElement | null };
  onDismiss: () => void;
  onEscape?: () => void;
}

export function useDismissibleLayer({
  open,
  containerRef,
  onDismiss,
  onEscape,
}: DismissibleLayerOptions): void {
  const handlersRef = useRef({ onDismiss, onEscape });
  handlersRef.current = { onDismiss, onEscape };

  useEffect(() => {
    if (!open) return;

    const isOutside = (target: EventTarget | null) =>
      target instanceof Node && !containerRef.current?.contains(target);
    const dismissOnOutsidePointer = (event: PointerEvent) => {
      if (isOutside(event.target)) handlersRef.current.onDismiss();
    };
    const dismissOnOutsideFocus = (event: FocusEvent) => {
      if (isOutside(event.target)) handlersRef.current.onDismiss();
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      (handlersRef.current.onEscape ?? handlersRef.current.onDismiss)();
    };

    window.addEventListener('pointerdown', dismissOnOutsidePointer);
    window.addEventListener('focusin', dismissOnOutsideFocus);
    window.addEventListener('keydown', dismissOnEscape);
    return () => {
      window.removeEventListener('pointerdown', dismissOnOutsidePointer);
      window.removeEventListener('focusin', dismissOnOutsideFocus);
      window.removeEventListener('keydown', dismissOnEscape);
    };
  }, [open, containerRef]);
}
