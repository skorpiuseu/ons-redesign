export const VAT_RATES = ['23%', '8%', '5%', '0%', 'np'] as const;
export type VatRate = (typeof VAT_RATES)[number];

export type VatRateBreakdown = {
  rate: VatRate;
  net: number;
  vat: number;
};

export type VatEntry = {
  id: string;
  contractor: string;
  nip: string;
  issueDate: string;
  saleDate: string;
  document: string;
  ksefNumber?: string;
  'ks ef': string;
  identifier: string;
  vatBreakdown: VatRateBreakdown[];
  net: number;
  vat: number;
  operation: string;
  jpk: string;
  series: string;
};

export type DataState =
  | { status: 'loading'; data: VatEntry[] }
  | { status: 'empty'; data: VatEntry[] }
  | { status: 'error'; data: VatEntry[]; error: Error }
  | { status: 'success'; data: VatEntry[] };

export type DemoDataPreviewMode = 'filled' | 'loading' | 'empty' | 'error';
