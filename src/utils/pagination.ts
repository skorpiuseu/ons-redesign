import { MAX_PAGINATION_BUTTONS } from '../constants/app';

export type PaginationItem = { type: 'page'; value: number } | { type: 'ellipsis'; key: string };

export function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  const pageItem = (value: number): PaginationItem => ({ type: 'page', value });
  const ellipsis = (key: string): PaginationItem => ({ type: 'ellipsis', key });

  if (totalPages <= MAX_PAGINATION_BUTTONS) {
    return Array.from({ length: totalPages }, (_, index) => pageItem(index + 1));
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5].map(pageItem).concat(ellipsis('right'), pageItem(totalPages));
  }
  if (currentPage >= totalPages - 3) {
    return [
      pageItem(1),
      ellipsis('left'),
      ...Array.from({ length: 5 }, (_, index) => pageItem(totalPages - 4 + index)),
    ];
  }

  return [
    pageItem(1),
    ellipsis('left'),
    pageItem(currentPage - 1),
    pageItem(currentPage),
    pageItem(currentPage + 1),
    ellipsis('right'),
    pageItem(totalPages),
  ];
}
