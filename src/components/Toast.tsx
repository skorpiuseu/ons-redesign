import type { ToastProps } from '../types/app';
import type { DemoDataPreviewMode } from '../data/types';
import { Icon } from './Icon';

export function Toast({ message, onClose }: ToastProps) {
  return (
    <div className="toast" role="status" aria-live="polite" aria-atomic="true">
      <span className="toast-mark" aria-hidden="true">
        i
      </span>
      <p>{message}</p>
      <button
        className="icon-button toast-close"
        type="button"
        aria-label="Zamknij komunikat"
        onClick={onClose}
      >
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}

interface DemoBannerProps {
  dataPreviewMode: DemoDataPreviewMode;
  onDataPreviewModeChange: (mode: DemoDataPreviewMode) => void;
  onClose: () => void;
}

export function DemoBanner({ dataPreviewMode, onDataPreviewModeChange, onClose }: DemoBannerProps) {
  return (
    <aside className="demo-banner" aria-label="Panel trybu demonstracyjnego">
      <span className="toast-mark" aria-hidden="true">
        i
      </span>
      <div className="demo-banner-copy">
        <strong>Prototyp demonstracyjny</strong>
        <p>
          To jest mapa zakresu, a nie uruchomienie księgowania. Używane są wyłącznie dane
          demonstracyjne, nie ewidencja organizacji.
        </p>
      </div>
      <label className="demo-state-switcher">
        <span>Podgląd stanu danych</span>
        <select
          aria-label="Podgląd stanu danych"
          value={dataPreviewMode}
          onChange={(event) => onDataPreviewModeChange(event.target.value as DemoDataPreviewMode)}
        >
          <option value="filled">Wypełnione</option>
          <option value="loading">Ładowanie</option>
          <option value="empty">Brak danych</option>
          <option value="error">Błąd danych</option>
        </select>
      </label>
      <button
        className="icon-button toast-close"
        type="button"
        aria-label="Zamknij informację o trybie demonstracyjnym"
        onClick={onClose}
      >
        <Icon name="close" size={16} />
      </button>
    </aside>
  );
}
