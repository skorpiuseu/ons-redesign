import type { ReactNode } from 'react';
import type { VatEntry } from '../data/types';
import { formatDate, formatMoney } from '../utils/format';
import { Icon } from './Icon';
import type { IconName, VatTableColumn } from '../types/app';

interface TableRowProps {
  row: VatEntry;
  columnOrder: VatTableColumn[];
  expanded: boolean;
  onToggle: () => void;
}

interface TableCellProps {
  column: VatTableColumn;
  row: VatEntry;
  expanded: boolean;
  onToggle: () => void;
}

function TableCell({ column, row, expanded, onToggle }: TableCellProps) {
  switch (column) {
    case 'contractor':
      return (
        <td className="contractor-cell">
          <button
            className="row-disclosure-button"
            type="button"
            aria-label={`Szczegóły: ${row.contractor}`}
            aria-expanded={expanded}
            aria-controls={expanded ? `row-details-${row.id}` : undefined}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
          >
            {row.contractor}
          </button>
        </td>
      );
    case 'date':
      return <td>{formatDate(row.issueDate)}</td>;
    case 'document':
      return <td>{row.document}</td>;
    case 'ksef': {
      return (
        <td>
          {row.ksefNumber ? (
            <span className="ksef-number">{row.ksefNumber}</span>
          ) : (
            <KsefStatus status={row['ks ef']} />
          )}
        </td>
      );
    }
    case 'identifier':
      return <td>{row.identifier}</td>;
    case 'net':
      return <td className="number-cell">{formatMoney(row.net)}</td>;
    case 'vat':
      return <td className="number-cell">{formatMoney(row.vat)}</td>;
    case 'gross':
      return <td className="number-cell">{formatMoney(row.net + row.vat)}</td>;
  }
}

function KsefStatus({ status }: { status: string }) {
  const isException = /błąd|odrzucon|nieprawidł|wymaga|problem|error/i.test(status);
  const isPending = status === 'Brak potwierdzenia';
  const isConfirmed = /potwierdz/i.test(status);
  const icon: IconName | null = isException
    ? 'alertTriangle'
    : isPending
      ? 'clock'
      : isConfirmed
        ? 'checkmark'
        : null;
  const toneClass = isException ? 'is-exception' : isPending ? 'is-pending' : isConfirmed ? 'is-confirmed' : '';
  const label = status === 'Potwierdzono' ? 'Potwierdzony' : status;

  return (
    <span className={`ksef-status${toneClass ? ` ${toneClass}` : ''}`}>
      {icon && <Icon name={icon} size={14} />}
      {label}
    </span>
  );
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="detail-item">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function TableRow({ row, columnOrder, expanded, onToggle }: TableRowProps) {
  return (
    <>
      <tr className={`data-row${expanded ? ' row-expanded' : ''}`} onClick={onToggle}>
        {columnOrder.map((column) => (
          <TableCell
            key={column}
            column={column}
            row={row}
            expanded={expanded}
            onToggle={onToggle}
          />
        ))}
        <td className="row-expand-cell">
          <span className="row-expand-indicator" aria-hidden="true">
            <Icon name="chevron" size={15} />
          </span>
        </td>
      </tr>
      {expanded && (
        <tr className="detail-row">
          <td colSpan={9}>
            <div
              className="row-details"
              id={`row-details-${row.id}`}
              role="region"
              aria-label={`Szczegóły dokumentu ${row.document}`}
            >
              <section className="detail-section">
                <h3>Informacje o dokumencie</h3>
                <dl className="detail-list">
                  <DetailField label="Kontrahent">{row.contractor}</DetailField>
                  <DetailField label="NIP">{row.nip}</DetailField>
                  <DetailField label="Data wystawienia">{formatDate(row.issueDate)}</DetailField>
                  <DetailField label="Data sprzedaży">{formatDate(row.saleDate)}</DetailField>
                  <DetailField label="Numer dokumentu">{row.document}</DetailField>
                  <DetailField label="Rodzaj operacji">{row.operation}</DetailField>
                  <DetailField label="Kod JPK V7">{row.jpk || '—'}</DetailField>
                  <DetailField label="Seria dokumentu">{row.series}</DetailField>
                </dl>
              </section>

              <section className="detail-section">
                <h3>Informacje finansowe</h3>
                <dl className="detail-list financial-list">
                  <DetailField label="Netto">{formatMoney(row.net)}</DetailField>
                  <DetailField label="VAT">{formatMoney(row.vat)}</DetailField>
                  <DetailField label="Brutto">
                    <strong>{formatMoney(row.net + row.vat)}</strong>
                  </DetailField>
                </dl>
                <table className="detail-vat-table">
                  <caption className="visually-hidden">Kwoty według stawek VAT</caption>
                  <thead>
                    <tr>
                      <th scope="col">Stawka</th>
                      <th className="number-cell" scope="col">Netto</th>
                      <th className="number-cell" scope="col">VAT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {row.vatBreakdown.map((line) => (
                      <tr key={line.rate}>
                        <td>{line.rate}</td>
                        <td className="number-cell">{formatMoney(line.net)}</td>
                        <td className="number-cell">{formatMoney(line.vat)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="detail-section">
                <h3>Informacje dodatkowe</h3>
                <dl className="detail-list">
                  <DetailField label="Numer KSeF">{row.ksefNumber ?? '—'}</DetailField>
                  <DetailField label="Status KSeF">
                    <KsefStatus status={row['ks ef']} />
                  </DetailField>
                  <DetailField label="Identyfikator">{row.identifier}</DetailField>
                </dl>
              </section>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
