const MONEY_FORMATTER = new Intl.NumberFormat('pl-PL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(value: number): string {
  return `${MONEY_FORMATTER.format(value)} zł`;
}

export function formatDate(value: string): string {
  return value;
}

export function formatDocumentCount(count: number): string {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;
  const noun =
    count === 1
      ? 'dokument'
      : lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)
        ? 'dokumenty'
        : 'dokumentów';

  return `${count} ${noun}`;
}
