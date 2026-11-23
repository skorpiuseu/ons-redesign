# Obszary księgowe — demo

Samodzielny, klikalny prototyp widoku obszarów księgowych. Aplikacja używa Reacta, TypeScriptu i Vite. Wszystkie rekordy są demonstracyjne i znajdują się w `src/data/demo-data.json`.

## Uruchomienie

```bash
npm install
npm run dev
```

Kompilacja produkcyjna: `npm run build`. Podgląd skompilowanej wersji: `npm run preview`.

## Struktura

- `src/data/demo-data.json` — przykładowe rekordy rejestru VAT.
- `src/data/types.ts` — typy rekordów i stanu pobierania.
- `src/data/DemoDataProvider.tsx` — asynchroniczna warstwa danych; w tym miejscu można podłączyć API.
- `src/App.tsx` — kompozycja strony i stan główny interfejsu.
- `src/components/` — nagłówek, podsumowanie obszarów, ikony, komunikaty i wiersze tabeli.
- `src/constants/app.ts` — ustawienia początkowe, etykiety i opcje filtrów.
- `src/types/app.ts` — typy wspólne dla widoków i filtrów.
- `src/utils/` — formatowanie, filtrowanie i sortowanie rekordów, logika paginacji oraz eksport CSV.
- `src/styles/variables.css` — kolory, promienie i tokeny wyglądu.
- `src/styles/global.css` — punkt wejścia importujący style bazowe, układu, rejestru i breakpointów.
- `src/styles/base.css`, `layout.css`, `vat-register.css`, `responsive.css` — odpowiednio style wspólne i dostępności, układ strony, rejestr VAT oraz reguły responsywne.

Formatowanie kodu wykonuje polecenie `npm run format`; tylko CSS można sformatować poleceniem `npm run format:css`.

## Zachowanie prototypu

Wyszukiwanie, filtry, przełączanie rejestrów, rozwijanie szczegółów, paginacja, rozmiar strony, motyw, drukowanie i eksport CSV działają lokalnie. Akcje wymagające serwera pokazują tymczasowy komunikat o braku podłączonego backendu. Provider udostępnia jawne stany ładowania, błędu, pustego źródła i danych. Pusty lub nieprawidłowy plik JSON pokazuje błąd w widoku rejestru, poprawna pusta tablica pokazuje stan braku danych, a filtr bez wyników ma osobny komunikat. Tabela na wąskich ekranach zachowuje kolumny i przewija się poziomo.

