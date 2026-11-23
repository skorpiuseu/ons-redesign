import type { VatEntry } from '../data/types';
import type { FilterEntriesOptions } from '../types/app';
import { ALL_SERIES_OPTION } from '../constants/app';

function matchesText(value: string, query: string): boolean {
  return value.toLocaleLowerCase('pl-PL').includes(query.toLocaleLowerCase('pl-PL'));
}

export function filterEntries({
  entries,
  tab,
  query,
  periodStart,
  periodEnd,
  operation,
  jpk,
  series,
  columnFilters,
}: FilterEntriesOptions): VatEntry[] {
  const searchQuery = query.trim();

  return entries
    .filter((entry) => {
      const belongsToTab = entry.identifier.startsWith(tab === 'sales' ? 'DEMO-S-' : 'DEMO-Z-');
      const matchesSearch =
        !searchQuery ||
        [
          entry.contractor,
          entry.document,
          entry.ksefNumber ?? '',
          entry.identifier,
          entry.jpk,
        ].some((value) => matchesText(value, searchQuery));
      const matchesColumns =
        (!columnFilters.contractor || matchesText(entry.contractor, columnFilters.contractor)) &&
        (!columnFilters.date || entry.issueDate === columnFilters.date) &&
        (!columnFilters.document || matchesText(entry.document, columnFilters.document)) &&
        (!columnFilters.ksef ||
          matchesText(entry.ksefNumber ?? '', columnFilters.ksef) ||
          matchesText(entry['ks ef'], columnFilters.ksef)) &&
        (!columnFilters.identifier || matchesText(entry.identifier, columnFilters.identifier));

      return (
        belongsToTab &&
        matchesPeriod(entry.issueDate, periodStart, periodEnd) &&
        matchesSearch &&
        matchesColumns &&
        (operation.length === 0 || operation.includes(entry.operation)) &&
        (jpk.length === 0 || jpk.includes(entry.jpk)) &&
        (series === ALL_SERIES_OPTION || entry.series === series)
      );
    })
    .sort(
      (left, right) =>
        Number(right['ks ef'] === 'Odrzucono') - Number(left['ks ef'] === 'Odrzucono'),
    );
}

function matchesPeriod(date: string, periodStart: string, periodEnd: string): boolean {
  return (!periodStart || date >= periodStart) && (!periodEnd || date <= periodEnd);
}
