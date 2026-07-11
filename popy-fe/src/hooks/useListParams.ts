import { useMemo, useState } from 'react';
import type { GridPaginationModel } from '@mui/x-data-grid';
import { APP_CONFIG } from '@/constants';
import type { ListQueryParams } from '@/types';

interface UseListParamsResult {
  search: string;
  setSearch: (value: string) => void;
  paginationModel: GridPaginationModel;
  setPaginationModel: (model: GridPaginationModel) => void;
  /** 1-based query params ready for the API. */
  queryParams: ListQueryParams;
  extraFilters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
}

/**
 * Centralises list-page state: server pagination (0-based for the grid,
 * 1-based for the API), debounced search and arbitrary extra filters.
 */
export const useListParams = (
  initialPageSize = APP_CONFIG.defaultPageSize,
): UseListParamsResult => {
  const [search, setSearchValue] = useState('');
  const [extraFilters, setExtraFilters] = useState<Record<string, string>>({});
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: initialPageSize,
  });

  const setSearch = (value: string) => {
    setSearchValue(value);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const setFilter = (key: string, value: string) => {
    setExtraFilters((prev) => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const queryParams = useMemo<ListQueryParams>(
    () => ({
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      ...(search ? { search } : {}),
      ...extraFilters,
    }),
    [paginationModel, search, extraFilters],
  );

  return {
    search,
    setSearch,
    paginationModel,
    setPaginationModel,
    queryParams,
    extraFilters,
    setFilter,
  };
};
