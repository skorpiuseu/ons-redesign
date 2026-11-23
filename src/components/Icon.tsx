import type { ReactNode } from 'react';
import type { IconName, IconProps } from '../types/app';

const ICON_PATHS: Record<IconName, ReactNode> = {
  alertTriangle: (
    <>
      <path d="M12 3.7 21 20H3L12 3.7Z" />
      <path d="M12 9v5" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </>
  ),
  home: (
    <>
      <path
        d="m2.5 10 9.5-8 9.5 8h-3v11h-5.2v-7h-2.6v7H5.5V10z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M10.5 21v-6.5h3V21z" fill="var(--page-bg)" stroke="none" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.6 2.6 0 1 1 4.5 1.8c-1.1 1-2 1.2-2 3M12 17h.01" />
    </>
  ),
  moon: <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18M8 14h2m4 0h2m-8 3h2m4 0h2" />
    </>
  ),
  receipt: (
    <>
      <path d="M7 3h11v18H6V5h1zM7 7h-2v12h2" />
      <path d="M10 8h5m-5 3h5m-5 3h5m-5 3h3" />
    </>
  ),
  store: (
    <>
      <path d="M3 10h18M5 10v10h14V10M4 10l2-6h12l2 6" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="20" r="1" />
      <circle cx="19" cy="20" r="1" />
      <path d="M2 3h2l2.5 12h12l3-9H5" />
    </>
  ),
  bank: <path d="m3 9 9-6 9 6H3zM5 10v8m5-8v8m4-8v8m5-8v8M3 21h18M2 18h20" />,
  cash: (
    <>
      <rect x="2" y="6" width="20" height="13" rx="2" />
      <circle cx="12" cy="12.5" r="3" />
      <path d="M6 10h.01M18 15h.01" />
    </>
  ),
  book: <path d="M5 4h14v17H5zM8 8h8m-8 4h8m-8 4h5M3 7v14" />,
  box: <path d="M4 5h16v15H4zM4 10h16M10 14h4" />,
  check: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="m7 8 1 1 2-2m3 1h4m-10 5 1 1 2-2m3 1h4m-10 4 1 1 2-2m3 1h4" />
    </>
  ),
  checkmark: <path d="m5 12 4 4L19 6" />,
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 5 5" />
    </>
  ),
  tag: (
    <>
      <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
      <circle cx="7.5" cy="7.5" r="1" />
    </>
  ),
  print: (
    <>
      <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <path d="M7 14h10v7H7zM17 11h.01" />
    </>
  ),
  download: <path d="M12 3v12m-5-5 5 5 5-5M4 20h16" />,
  sliders: (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="9" cy="6" r="2" fill="var(--surface)" />
      <circle cx="15" cy="12" r="2" fill="var(--surface)" />
      <circle cx="11" cy="18" r="2" fill="var(--surface)" />
    </>
  ),
  chevron: <path d="m7 10 5 5 5-5" />,
  filterOff: (
    <>
      <path d="M4 6h16l-6.5 7.5V19l-3-1v-4.5L4 6z" />
      <path d="m4 4 16 16" strokeWidth={2.2} />
    </>
  ),
  grip: (
    <g fill="currentColor" stroke="none">
      <circle cx="9" cy="6" r="1.35" />
      <circle cx="15" cy="6" r="1.35" />
      <circle cx="9" cy="12" r="1.35" />
      <circle cx="15" cy="12" r="1.35" />
      <circle cx="9" cy="18" r="1.35" />
      <circle cx="15" cy="18" r="1.35" />
    </g>
  ),
  file: <path d="M6 2h9l5 5v15H6zM14 2v6h6M9 13h8m-8 4h8" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  refresh: (
    <>
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
};

export function Icon({ name, size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}
