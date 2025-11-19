import { useState } from 'react';

export function usePagination(totalPages: number) {
  const [page, setPage] = useState(1);

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const nextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const resetPage = () => {
    setPage(1);
  };

  return {
    page,
    setPage: goToPage,
    nextPage,
    prevPage,
    resetPage,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
