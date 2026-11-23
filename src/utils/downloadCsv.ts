import type { VatEntry } from '../data/types';
import { CSV_HEADERS } from '../constants/app';
import type { VatTab } from '../types/app';

export function downloadVatCsv(entries: VatEntry[], tab: VatTab): void {
  const rows = entries.map((entry) => [
    entry.contractor,
    entry.issueDate,
    entry.document,
    entry.ksefNumber ?? entry['ks ef'],
    entry.identifier,
    entry.net,
    entry.vat,
    entry.net + entry.vat,
  ]);
  const csv = [CSV_HEADERS, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';'))
    .join('\n');
  const fileUrl = URL.createObjectURL(
    new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }),
  );
  const link = document.createElement('a');

  link.href = fileUrl;
  link.download = `rejestr-vat-${tab}.csv`;
  link.click();
  URL.revokeObjectURL(fileUrl);
}
