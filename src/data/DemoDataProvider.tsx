import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import demoDataUrl from './demo-data.json?url';
import { VAT_RATES, type DataState, type DemoDataPreviewMode, type VatEntry } from './types';

type DemoDataContextValue = DataState & {
  previewMode: DemoDataPreviewMode;
  reload: () => void;
  setPreviewMode: (mode: DemoDataPreviewMode) => void;
};
const DemoDataContext = createContext<DemoDataContextValue | null>(null);
const DEMO_DATA_URL = demoDataUrl;
const EMPTY_DATA: VatEntry[] = [];
const PREVIEW_ERROR = new Error('Przykładowy błąd pobierania danych demonstracyjnych.');

function isVatEntry(value: unknown): value is VatEntry {
  if (typeof value !== 'object' || value === null) return false;

  const record = value as Record<string, unknown>;
  const stringFields = [
    'id',
    'contractor',
    'nip',
    'issueDate',
    'saleDate',
    'document',
    'ks ef',
    'identifier',
    'operation',
    'jpk',
    'series',
  ];

  return (
    stringFields.every((field) => typeof record[field] === 'string') &&
    (record.ksefNumber === undefined || typeof record.ksefNumber === 'string') &&
    Array.isArray(record.vatBreakdown) &&
    record.vatBreakdown.length > 0 &&
    record.vatBreakdown.every((line) => {
      if (typeof line !== 'object' || line === null) return false;
      const breakdown = line as Record<string, unknown>;
      return (
        VAT_RATES.includes(breakdown.rate as (typeof VAT_RATES)[number]) &&
        typeof breakdown.net === 'number' &&
        Number.isFinite(breakdown.net) &&
        typeof breakdown.vat === 'number' &&
        Number.isFinite(breakdown.vat)
      );
    }) &&
    typeof record.net === 'number' &&
    Number.isFinite(record.net) &&
    typeof record.vat === 'number' &&
    Number.isFinite(record.vat)
  );
}

/** Small async data boundary; replace the timeout/JSON source with an API request when a backend is available. */
export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<DataState>({ status: 'loading', data: [] });
  const [previewMode, setPreviewMode] = useState<DemoDataPreviewMode>('filled');

  useEffect(() => {
    let active = true;
    setState({ status: 'loading', data: [] });

    const loadData = async () => {
      try {
        const response = await fetch(DEMO_DATA_URL);
        if (!response.ok) {
          throw new Error(`Nie udało się pobrać pliku z danymi (HTTP ${response.status}).`);
        }

        const jsonText = await response.text();
        if (!jsonText.trim()) {
          throw new Error('Plik z danymi jest pusty. Nie można odczytać danych.');
        }

        let parsedData: unknown;
        try {
          parsedData = JSON.parse(jsonText);
        } catch {
          throw new Error('Plik z danymi zawiera nieprawidłowy JSON.');
        }

        if (!Array.isArray(parsedData)) {
          throw new Error('Nieprawidłowy format danych. Oczekiwano tablicy rekordów JSON.');
        }

        if (parsedData.length === 0) {
          if (active) setState({ status: 'empty', data: [] });
          return;
        }

        const invalidRecordIndex = parsedData.findIndex((record) => !isVatEntry(record));
        if (invalidRecordIndex !== -1) {
          throw new Error(`Rekord ${invalidRecordIndex + 1} w pliku ma nieprawidłowy format.`);
        }

        if (active) setState({ status: 'success', data: parsedData });
      } catch (cause) {
        const error =
          cause instanceof TypeError
            ? new Error(
                'Nie udało się pobrać pliku z danymi. Sprawdź jego dostępność i spróbuj ponownie.',
              )
            : cause instanceof Error
              ? cause
              : new Error('Nie udało się odczytać danych.');

        if (active) setState({ status: 'error', data: [], error });
      }
    };

    const timer = window.setTimeout(() => {
      if (active) void loadData();
    }, 550);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setPreviewMode('filled');
    setState({ status: 'loading', data: EMPTY_DATA });
    setAttempt((value) => value + 1);
  }, []);
  const visibleState = useMemo<DataState>(() => {
    if (previewMode === 'loading') return { status: 'loading', data: EMPTY_DATA };
    if (previewMode === 'empty') return { status: 'empty', data: EMPTY_DATA };
    if (previewMode === 'error') {
      return { status: 'error', data: EMPTY_DATA, error: PREVIEW_ERROR };
    }
    return state;
  }, [previewMode, state]);
  const value = useMemo(
    () => ({ ...visibleState, previewMode, reload, setPreviewMode }),
    [visibleState, previewMode, reload],
  );
  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData() {
  const value = useContext(DemoDataContext);
  if (!value) throw new Error('useDemoData musi być użyty wewnątrz DemoDataProvider.');
  return value;
}
