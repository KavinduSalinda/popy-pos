import { useMemo, useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import Print from '@mui/icons-material/Print';
import { toast } from 'react-toastify';
import { Modal } from '@/components/dialogs';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useGetCustomersQuery } from '@/features/customers/customersApi';
import { useGetPosCheckoutNotificationOptionsQuery } from '@/features/settings/settingsApi';
import { formatCurrency, getErrorMessage } from '@/utils';
import { useOnlineStatus } from '@/offline/hooks/useOnlineStatus';
import { canWorkOffline } from '@/offline/offlineAuth';
import { getCachedCustomers, getCheckoutSettings } from '@/offline/catalogCache';
import { queueOfflineSale } from '@/offline/queue';
import { useCreateSaleMutation } from '../salesApi';
import { clearCart, selectCartTotals, setPaymentMethod } from '../cartSlice';
import { printSaleReceipt } from '../utils/receipt';
import type { CreateSalePayload, PaymentMethod, Sale } from '../types';
import { ReceiptPreview } from './ReceiptPreview';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'MOBILE', label: 'Mobile' },
  { value: 'CREDIT', label: 'Credit' },
];

export const PaymentDialog = ({ open, onClose }: PaymentDialogProps) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((s) => s.cart);
  const user = useAppSelector((s) => s.auth.user);
  const shopId = useAppSelector((s) => s.auth.currentShopId);
  const totals = useAppSelector(selectCartTotals);
  const { isOffline } = useOnlineStatus();
  const [createSale, { isLoading }] = useCreateSaleMutation();
  const { data: checkoutOptions } = useGetPosCheckoutNotificationOptionsQuery(
    undefined,
    { skip: !open || isOffline },
  );
  const { data: customers } = useGetCustomersQuery(
    { page: 1, pageSize: 100 },
    { skip: !open || isOffline },
  );
  const [offlineCustomers, setOfflineCustomers] = useState<
    Array<{ id: string | number; name: string; email?: string; phone?: string }>
  >([]);
  const [offlineCheckout, setOfflineCheckout] = useState({
    canSendEmail: false,
    canSendSms: false,
  });
  const [amountPaid, setAmountPaid] = useState('');
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSms, setSendSms] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const selectedCustomer = useMemo(() => {
    const source = isOffline ? offlineCustomers : (customers?.data ?? []);
    return source.find((c) => c.id === cart.customerId) ?? null;
  }, [cart.customerId, customers?.data, isOffline, offlineCustomers]);

  const showEmailOption = isOffline
    ? offlineCheckout.canSendEmail && Boolean(selectedCustomer?.email)
    : checkoutOptions?.canSendEmail && Boolean(selectedCustomer?.email);
  const showSmsOption = isOffline
    ? offlineCheckout.canSendSms && Boolean(selectedCustomer?.phone)
    : checkoutOptions?.canSendSms && Boolean(selectedCustomer?.phone);

  const resetDialog = () => {
    setAmountPaid('');
    setSendEmail(false);
    setSendSms(false);
    setCompletedSale(null);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  const displayAmountPaid =
    amountPaid !== '' ? amountPaid : open ? totals.total.toFixed(2) : '';

  const change =
    cart.paymentMethod === 'CASH'
      ? Math.max(0, (Number(displayAmountPaid) || 0) - totals.total)
      : 0;

  useEffect(() => {
    if (!open || !isOffline || !shopId) return;
    void getCachedCustomers(shopId).then(setOfflineCustomers);
    void getCheckoutSettings(shopId).then((settings) => {
      if (settings) {
        setOfflineCheckout({
          canSendEmail: settings.canSendEmail,
          canSendSms: settings.canSendSms,
        });
      }
    });
  }, [open, isOffline, shopId]);

  const handleConfirm = async () => {
    const payload: CreateSalePayload = {
      customerId: cart.customerId,
      items: cart.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      discount: totals.discount,
      tax: totals.tax,
      paymentMethod: cart.paymentMethod,
      amountPaid: Number(displayAmountPaid) || totals.total,
      sendEmail: showEmailOption ? sendEmail : false,
      sendSms: showSmsOption ? sendSms : false,
    };

    if (isOffline) {
      if (!shopId || !user) {
        toast.error('Shop context is required for offline sales.');
        return;
      }
      const ready = await canWorkOffline();
      if (!ready) {
        toast.error('Download the catalog while online before checkout.');
        return;
      }
      try {
        const record = await queueOfflineSale({
          shopId,
          payload,
          cashierName: user.name,
        });
        const currentShop = user.shops?.find(
          (shop) => String(shop.id) === String(shopId),
        );
        const localSale = {
          ...record.localSale,
          shopName: currentShop?.name,
          shopPhone: currentShop?.phone,
          items: record.localSale.items.map((item, index) => ({
            ...item,
            productName: cart.items[index]?.name ?? item.productName,
            sku: cart.items[index]?.sku ?? item.sku,
          })),
        };
        setCompletedSale(localSale);
        dispatch(clearCart());
        toast.success('Sale saved offline — will sync when online.');
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
      return;
    }

    try {
      const sale = await createSale(payload).unwrap();
      const currentShop = user?.shops?.find(
        (shop) => String(shop.id) === String(shopId),
      );
      setCompletedSale({
        ...sale,
        shopName: sale.shopName ?? currentShop?.name,
        shopPhone: sale.shopPhone ?? currentShop?.phone,
        items: sale.items.map((item, index) => ({
          ...item,
          sku: item.sku ?? cart.items[index]?.sku,
        })),
      });
      dispatch(clearCart());
      toast.success('Sale completed');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={completedSale ? 'Sale complete' : 'Payment'}
      actions={
        completedSale ? (
          <>
            <Button
              startIcon={<Print />}
              onClick={() =>
                completedSale &&
                printSaleReceipt(
                  completedSale,
                  completedSale.shopName,
                  completedSale.shopPhone,
                )
              }
            >
              Print
            </Button>
            <Button variant="contained" onClick={handleClose}>
              New sale
            </Button>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={isLoading || totals.itemCount === 0}
            >
              Confirm payment
            </Button>
          </>
        )
      }
    >
      {completedSale ? (
        <ReceiptPreview sale={completedSale} />
      ) : (
        <Stack spacing={2}>
          <Box
            sx={{
              textAlign: 'center',
              p: 2,
              borderRadius: 2,
              bgcolor: 'action.hover',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Amount due
            </Typography>
            <Typography variant="h4" color="primary">
              {formatCurrency(totals.total)}
            </Typography>
          </Box>

          <ToggleButtonGroup
            exclusive
            fullWidth
            value={cart.paymentMethod}
            onChange={(_e, value: PaymentMethod | null) =>
              value && dispatch(setPaymentMethod(value))
            }
          >
            {PAYMENT_METHODS.map((m) => (
              <ToggleButton key={m.value} value={m.value}>
                {m.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {cart.paymentMethod === 'CASH' && (
            <>
              <TextField
                select
                size="small"
                label="Quick amount"
                value=""
                onChange={(e) => setAmountPaid(e.target.value)}
              >
                {[totals.total, 50, 100, 200, 500].map((amt, idx) => (
                  <MenuItem key={idx} value={amt.toFixed(2)}>
                    {formatCurrency(amt)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                type="number"
                label="Amount paid"
                value={displayAmountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Change</Typography>
                <Typography variant="h6">{formatCurrency(change)}</Typography>
              </Stack>
            </>
          )}

          {(showEmailOption || showSmsOption) && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Customer notification
              </Typography>
              <Stack spacing={0.5}>
                {showEmailOption && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sendEmail}
                        onChange={(event) => setSendEmail(event.target.checked)}
                      />
                    }
                    label={`Send receipt email to ${selectedCustomer?.email}`}
                  />
                )}
                {showSmsOption && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sendSms}
                        onChange={(event) => setSendSms(event.target.checked)}
                      />
                    }
                    label={`Send receipt SMS to ${selectedCustomer?.phone}`}
                  />
                )}
              </Stack>
            </Box>
          )}

          {checkoutOptions?.canSendEmail && !selectedCustomer && (
            <Typography variant="caption" color="text.secondary">
              Select a customer to send receipt email or SMS.
            </Typography>
          )}
        </Stack>
      )}
    </Modal>
  );
};
