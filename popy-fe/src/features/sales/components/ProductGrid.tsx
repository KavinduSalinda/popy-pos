import { useEffect, useMemo, useState } from 'react';
import { Box, IconButton, Stack, Tooltip, useMediaQuery } from '@mui/material';
import AddShoppingCart from '@mui/icons-material/AddShoppingCart';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/app/hooks';
import {
  EmptyState,
  Loader,
  SearchInput,
  StatusChip,
} from '@/components/common';
import { DataTable } from '@/components/tables';
import { formatCurrency } from '@/utils';
import { useDebounce } from '@/hooks';
import { useOnlineStatus } from '@/offline/hooks/useOnlineStatus';
import { useOfflineCatalog } from '@/offline/hooks/useOfflineCatalog';
import { useSearchPosProductsQuery } from '../salesApi';
import { addItem } from '../cartSlice';
import { BarcodeScanField } from './BarcodeScanField';
import type { PosProduct } from '../types';

const MOBILE_MAX_WIDTH_PX = 560;
const MOBILE_PAGE_SIZE = 20;
const DESKTOP_PAGE_SIZE = 20;

interface ProductGridProps {
  onBarcodeScan: (code: string) => void | Promise<boolean>;
  scanDisabled?: boolean;
}

export const ProductGrid = ({
  onBarcodeScan,
  scanDisabled = false,
}: ProductGridProps) => {
  const dispatch = useAppDispatch();
  const isMobile = useMediaQuery(`(max-width:${MOBILE_MAX_WIDTH_PX - 0.05}px)`, {
    defaultMatches:
      typeof window !== 'undefined' && window.innerWidth < MOBILE_MAX_WIDTH_PX,
    noSsr: true,
  });
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: isMobile ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE,
  });
  const debouncedSearch = useDebounce(search, 350);
  const { isOffline } = useOnlineStatus();
  const { offlineProducts, offlineLoading } = useOfflineCatalog(debouncedSearch);
  const { data: onlineData = [], isFetching: onlineFetching } =
    useSearchPosProductsQuery({ search: debouncedSearch }, { skip: isOffline });

  const data = isOffline ? offlineProducts : onlineData;
  const isFetching = isOffline ? offlineLoading : onlineFetching;

  useEffect(() => {
    setPaginationModel((prev) => ({
      page: 0,
      pageSize: isMobile ? MOBILE_PAGE_SIZE : prev.pageSize || DESKTOP_PAGE_SIZE,
    }));
  }, [isMobile, debouncedSearch]);

  const addToCart = (product: PosProduct) => {
    if (product.stockQuantity <= 0) {
      toast.error(`${product.name} is out of stock`);
    } else {
      dispatch(addItem(product));
      toast.success(`${product.name} added to cart`);
    }
    // Keep the on-screen keyboard closed after tapping a product on phones.
    if (window.innerWidth < MOBILE_MAX_WIDTH_PX) {
      const active = document.activeElement;
      if (
        active instanceof HTMLElement &&
        active.dataset.barcodeScan === 'true'
      ) {
        active.blur();
      }
    }
  };

  const columns = useMemo<GridColDef<PosProduct>[]>(
    () => [
      { field: 'name', headerName: 'Product', flex: 1.5, minWidth: 160 },
      { field: 'sku', headerName: 'SKU', width: 120 },
      {
        field: 'barcode',
        headerName: 'Barcode',
        width: 130,
        valueGetter: (_v, row) => row.barcode ?? '—',
      },
      {
        field: 'categoryName',
        headerName: 'Category',
        width: 130,
        valueGetter: (_v, row) => row.categoryName ?? '—',
      },
      {
        field: 'sellingPrice',
        headerName: 'Price',
        width: 110,
        valueFormatter: (value: number) => formatCurrency(value),
      },
      {
        field: 'stockQuantity',
        headerName: 'Stock',
        width: 100,
        type: 'number',
      },
      {
        field: 'stockStatus',
        headerName: 'Status',
        width: 120,
        sortable: false,
        filterable: false,
        valueGetter: (_v, row) => (row.stockQuantity <= 0 ? 'out' : 'in'),
        renderCell: (params) => {
          const out = params.row.stockQuantity <= 0;
          return (
            <StatusChip
              label={out ? 'Out of stock' : 'In stock'}
              color={out ? 'error' : 'success'}
            />
          );
        },
      },
      {
        field: 'actions',
        headerName: '',
        width: 72,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params) => {
          const out = params.row.stockQuantity <= 0;
          return (
            <Tooltip title={out ? 'Out of stock' : 'Add to cart'}>
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  disabled={out}
                  aria-label={`Add ${params.row.name} to cart`}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(params.row);
                  }}
                >
                  <AddShoppingCart fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const showTable = !isFetching && data.length > 0;

  return (
    <Stack spacing={2} sx={{ height: '100%' }}>
      <BarcodeScanField
        onScan={onBarcodeScan}
        pauseAutoFocus={searchFocused}
        disabled={scanDisabled}
      />

      <SearchInput
        value={search}
        onSearch={setSearch}
        placeholder="Search products"
        fullWidth
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
      />

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {isFetching ? (
          <Loader message="Loading products…" />
        ) : data.length === 0 ? (
          <EmptyState
            title="No products"
            description="Try a different search term or scan a barcode."
          />
        ) : showTable ? (
          <DataTable
            rows={data}
            columns={columns}
            loading={isFetching}
            paginationMode="client"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            autoHeight={false}
            height="100%"
            getRowClassName={(params) =>
              params.row.stockQuantity <= 0 ? 'pos-row-out-of-stock' : ''
            }
            sx={{
              height: '100%',
              minHeight: 320,
              '& .pos-row-out-of-stock': {
                bgcolor: 'rgba(211, 47, 47, 0.08)',
                color: 'text.secondary',
                '&:hover, &.Mui-hovered': {
                  bgcolor: 'rgba(211, 47, 47, 0.14)',
                },
              },
            }}
            pageSizeOptions={isMobile ? [MOBILE_PAGE_SIZE] : [10, 20, 50]}
            onRowClick={(params) => addToCart(params.row)}
          />
        ) : null}
      </Box>
    </Stack>
  );
};
