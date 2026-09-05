import {
  Autocomplete,
  Box,
  Button,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import DeleteOutline from '@mui/icons-material/DeleteOutlined';
import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { EmptyState } from '@/components/common';
import { formatCurrency } from '@/utils';
import {
  allowsFractionalQuantity,
  clampQuantity,
  quantityStepForUnit,
  resolveSellUnit,
} from '@/features/products/schema';
import { useGetCustomersQuery } from '@/features/customers/customersApi';
import { getCachedCustomers } from '@/offline/catalogCache';
import { useOnlineStatus } from '@/offline/hooks/useOnlineStatus';
import {
  clearCart,
  removeItem,
  selectCartTotals,
  setCustomer,
  setDiscount,
  setItemQuantity,
} from '../cartSlice';

interface CartPanelProps {
  onCheckout: () => void;
}

export const CartPanel = ({ onCheckout }: CartPanelProps) => {
  const dispatch = useAppDispatch();
  const shopId = useAppSelector((s) => s.auth.currentShopId);
  const { items, customerId, discount } = useAppSelector((s) => s.cart);
  const totals = useAppSelector(selectCartTotals);
  const { isOffline } = useOnlineStatus();
  const { data: customers } = useGetCustomersQuery(
    { page: 1, pageSize: 100 },
    { skip: isOffline },
  );
  const [offlineCustomers, setOfflineCustomers] = useState<
    Array<{ id: string | number; name: string; phone: string }>
  >([]);

  useEffect(() => {
    if (!isOffline || !shopId) return;
    void getCachedCustomers(shopId).then(setOfflineCustomers);
  }, [isOffline, shopId]);

  const customerOptions = useMemo(
    () => (isOffline ? offlineCustomers : (customers?.data ?? [])),
    [customers?.data, isOffline, offlineCustomers],
  );

  const selectedCustomer =
    customerOptions.find((c) => c.id === customerId) ?? null;

  return (
    <Stack sx={{ height: '100%' }} spacing={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Cart</Typography>
        {items.length > 0 && (
          <Button
            size="small"
            color="inherit"
            onClick={() => dispatch(clearCart())}
          >
            Clear
          </Button>
        )}
      </Stack>

      <Autocomplete
        size="small"
        options={customerOptions}
        getOptionLabel={(c) => `${c.name} — ${c.phone}`}
        value={selectedCustomer}
        onChange={(_e, value) => dispatch(setCustomer(value?.id ?? null))}
        isOptionEqualToValue={(o, v) => o.id === v.id}
        renderInput={(params) => (
          <TextField {...params} label="Walk-in customer" />
        )}
      />

      <Divider />

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {items.length === 0 ? (
          <EmptyState
            title="Cart is empty"
            description="Add products to begin."
          />
        ) : (
          <Stack spacing={1}>
            {items.map((item) => {
              const sellUnit = resolveSellUnit({
                unit: item.unit,
                name: item.name,
              });
              const step = quantityStepForUnit(sellUnit);
              return (
              <Box
                key={String(item.productId)}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap title={item.name}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatCurrency(item.unitPrice)} each
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    aria-label="remove item"
                    onClick={() => dispatch(removeItem(item.productId))}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Stack>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={0.5}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <IconButton
                      size="small"
                      aria-label="decrease quantity"
                      onClick={() =>
                        dispatch(
                          setItemQuantity({
                            productId: item.productId,
                            quantity: item.quantity - step,
                          }),
                        )
                      }
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <CartQuantityInput
                      productId={item.productId}
                      quantity={item.quantity}
                      max={item.stockQuantity}
                      unit={sellUnit}
                      onCommit={(quantity) =>
                        dispatch(
                          setItemQuantity({
                            productId: item.productId,
                            quantity,
                          }),
                        )
                      }
                    />
                    <IconButton
                      size="small"
                      aria-label="increase quantity"
                      disabled={item.quantity >= item.stockQuantity}
                      onClick={() =>
                        dispatch(
                          setItemQuantity({
                            productId: item.productId,
                            quantity: item.quantity + step,
                          }),
                        )
                      }
                    >
                      <Add fontSize="small" />
                    </IconButton>
                    {sellUnit ? (
                      <Typography variant="caption" color="text.secondary">
                        {sellUnit}
                      </Typography>
                    ) : null}
                  </Stack>
                  <Typography variant="subtitle2">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </Typography>
                </Stack>
              </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      <Divider />

      <Stack spacing={1}>
        <TextField
          size="small"
          type="number"
          label="Discount"
          value={discount}
          onChange={(e) => dispatch(setDiscount(Number(e.target.value) || 0))}
        />
        <Row label="Subtotal" value={formatCurrency(totals.subtotal)} />
        <Row label="Discount" value={`- ${formatCurrency(totals.discount)}`} />
        <Row label="Tax" value={formatCurrency(totals.tax)} />
        <Divider />
        <Row label="Total" value={formatCurrency(totals.total)} bold />
        <Button
          variant="contained"
          size="large"
          disabled={items.length === 0}
          onClick={onCheckout}
        >
          Checkout · {formatCurrency(totals.total)}
        </Button>
      </Stack>
    </Stack>
  );
};

const CartQuantityInput = ({
  productId,
  quantity,
  max,
  unit,
  onCommit,
}: {
  productId: string | number;
  quantity: number;
  max: number;
  unit?: string;
  onCommit: (quantity: number) => void;
}) => {
  const fractional = allowsFractionalQuantity(unit);
  const [draft, setDraft] = useState(String(quantity));

  useEffect(() => {
    setDraft(String(quantity));
  }, [quantity, productId]);

  const commit = () => {
    const normalized = draft.trim().replace(',', '.');
    const parsed = Number.parseFloat(normalized);
    if (!Number.isFinite(parsed)) {
      setDraft(String(quantity));
      return;
    }
    const next = clampQuantity(parsed, max, unit);
    setDraft(String(next));
    if (next !== quantity) onCommit(next);
  };

  return (
    <TextField
      size="small"
      // text + decimal keypad: type=number blocks "." on many mobile browsers
      type="text"
      value={draft}
      onChange={(e) => {
        const raw = e.target.value;
        if (fractional) {
          if (raw === '' || /^\d*[.,]?\d{0,3}$/.test(raw)) {
            setDraft(raw);
          }
          return;
        }
        if (raw === '' || /^\d*$/.test(raw)) {
          setDraft(raw);
        }
      }}
      onBlur={commit}
      onFocus={(e) => e.target.select()}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
      }}
      slotProps={{
        htmlInput: {
          inputMode: fractional ? 'decimal' : 'numeric',
          pattern: fractional ? '[0-9]*[.,]?[0-9]*' : '[0-9]*',
          'aria-label': 'quantity',
          style: { textAlign: 'center', padding: '4px 2px' },
        },
      }}
      sx={{
        width: fractional ? 72 : 52,
        '& .MuiOutlinedInput-root': {
          borderRadius: 1.5,
        },
      }}
    />
  );
};

const Row = ({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) => (
  <Stack direction="row" justifyContent="space-between">
    <Typography variant={bold ? 'subtitle1' : 'body2'} color="text.secondary">
      {label}
    </Typography>
    <Typography variant={bold ? 'h6' : 'body2'}>{value}</Typography>
  </Stack>
);
