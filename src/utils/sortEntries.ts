import type { VatEntry } from '../data/types';
import type { VatTableColumn } from '../types/app';

export type SortDirection = 'ascending' | 'descending';

export interface TableSort {
  column: VatTableColumn;
  direction: SortDirection;
}

export function sortEntries(entries: VatEntry[], sort: TableSort | null): VatEntry[] {
  if (!sort) return entries;

  const direction = sort.direction === 'ascending' ? 1 : -1;
  return [...entries].sort((left, right) => {
    const leftValue =
      sort.column === 'gross'
        ? left.net + left.vat
        : sort.column === 'ksef'
          ? left.ksefNumber ?? left['ks ef']
          : sort.column === 'date'
            ? left.issueDate
            : left[sort.column];
    const rightValue =
      sort.column === 'gross'
        ? right.net + right.vat
        : sort.column === 'ksef'
          ? right.ksefNumber ?? right['ks ef']
          : sort.column === 'date'
            ? right.issueDate
            : right[sort.column];

    const comparison =
      typeof leftValue === 'number' && typeof rightValue === 'number'
        ? leftValue - rightValue
        : String(leftValue).localeCompare(String(rightValue), 'pl-PL', {
            numeric: true,
            sensitivity: 'base',
          });

    return comparison * direction;
  });
}
