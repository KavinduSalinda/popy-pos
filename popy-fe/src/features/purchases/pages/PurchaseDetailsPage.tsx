import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import LocalShipping from '@mui/icons-material/LocalShipping';
import Cancel from '@mui/icons-material/Cancel';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import Edit from '@mui/icons-material/Edit';
import AssignmentReturn from '@mui/icons-material/AssignmentReturn';
import { toast } from 'react-toastify';
import {
  Loader,
  PageHeader,
  PermissionGuard,
  StatusChip,
} from '@/components/common';
import { ConfirmDialog } from '@/components/dialogs';
import { PERMISSIONS, ROUTES } from '@/constants';
import { formatCurrency, formatDateTime, getErrorMessage } from '@/utils';
import {
  useCancelPurchaseMutation,
  useDeletePurchaseMutation,
  useGetPurchaseQuery,
  useReceivePurchaseMutation,
} from '../purchasesApi';
import { PurchaseFormDialog } from '../components/PurchaseFormDialog';
import { PurchaseReturnDialog } from '../components/PurchaseReturnDialog';
import {
  EDITABLE_PURCHASE_STATUSES,
  RECEIVABLE_PURCHASE_STATUSES,
  RETURNABLE_PURCHASE_STATUSES,
} from '../types';

export const PurchaseDetailsPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: purchase, isLoading } = useGetPurchaseQuery(id, { skip: !id });

  const [receivePurchase, { isLoading: receiving }] =
    useReceivePurchaseMutation();
  const [cancelPurchase, { isLoading: cancelling }] =
    useCancelPurchaseMutation();
  const [deletePurchase, { isLoading: deleting }] = useDeletePurchaseMutation();

  const [editOpen, setEditOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canEdit = useMemo(
    () => purchase && EDITABLE_PURCHASE_STATUSES.includes(purchase.status),
    [purchase],
  );
  const canReceive = useMemo(
    () => purchase && RECEIVABLE_PURCHASE_STATUSES.includes(purchase.status),
    [purchase],
  );
  const canCancel = purchase?.status === 'ORDERED';
  const canReturn = useMemo(
    () => purchase && RETURNABLE_PURCHASE_STATUSES.includes(purchase.status),
    [purchase],
  );
  const canDelete = useMemo(
    () =>
      purchase &&
      (purchase.status === 'DRAFT' ||
        purchase.status === 'CANCELLED' ||
        purchase.status === 'ORDERED'),
    [purchase],
  );

  const handleReceive = async () => {
    if (!purchase) return;
    try {
      await receivePurchase(purchase.id).unwrap();
      toast.success('Goods received — stock updated');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleCancel = async () => {
    if (!purchase) return;
    try {
      await cancelPurchase(purchase.id).unwrap();
      toast.success('Purchase order cancelled');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!purchase) return;
    try {
      await deletePurchase(purchase.id).unwrap();
      toast.success('Purchase deleted');
      navigate(ROUTES.PURCHASES);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setConfirmDelete(false);
    }
  };

  if (isLoading) return <Loader fullHeight message="Loading purchase…" />;
  if (!purchase) return <PageHeader title="Purchase not found" />;

  return (
    <>
      <PageHeader
        title={purchase.reference}
        subtitle={`${purchase.supplierName ?? 'Supplier'} · ${formatDateTime(purchase.createdAt)}`}
        breadcrumbs={[
          { label: 'Purchases', to: ROUTES.PURCHASES },
          { label: purchase.reference },
        ]}
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <PermissionGuard permission={PERMISSIONS.PURCHASE_MANAGE}>
              {canReceive && (
                <Button
                  variant="contained"
                  startIcon={<LocalShipping />}
                  disabled={receiving}
                  onClick={handleReceive}
                >
                  Receive goods
                </Button>
              )}
              {canEdit && (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setEditOpen(true)}
                >
                  Edit
                </Button>
              )}
              {canReturn && (
                <Button
                  variant="outlined"
                  startIcon={<AssignmentReturn />}
                  onClick={() => setReturnOpen(true)}
                >
                  Return
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<Cancel />}
                  disabled={cancelling}
                  onClick={handleCancel}
                >
                  Cancel order
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutline />}
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </Button>
              )}
            </PermissionGuard>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Line items</Typography>
                <StatusChip label={purchase.status} />
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {purchase.items.map((item) => (
                <Grid
                  container
                  key={String(item.id ?? item.productId)}
                  sx={{ py: 1 }}
                  alignItems="center"
                >
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {item.productName ?? `Product #${item.productId}`}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4, sm: 2 }}>
                    <Typography variant="body2">×{item.quantity}</Typography>
                  </Grid>
                  <Grid size={{ xs: 4, sm: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(item.costPrice)}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 4, sm: 3 }}>
                    <Typography variant="body2" textAlign="right">
                      {formatCurrency(
                        item.lineTotal ??
                          item.total ??
                          item.costPrice * item.quantity,
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Summary
              </Typography>
              <Stack spacing={1} mt={2}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Supplier</Typography>
                  <Typography variant="body2">
                    {purchase.supplierName ?? '—'}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Total</Typography>
                  <Typography variant="h6">
                    {formatCurrency(purchase.total)}
                  </Typography>
                </Stack>
                {purchase.note && (
                  <>
                    <Divider />
                    <Typography variant="caption" color="text.secondary">
                      Note
                    </Typography>
                    <Typography variant="body2">{purchase.note}</Typography>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <PurchaseFormDialog
        open={editOpen}
        purchase={purchase}
        onClose={() => setEditOpen(false)}
      />

      <PurchaseReturnDialog
        open={returnOpen}
        purchase={purchase}
        onClose={() => setReturnOpen(false)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete purchase"
        message={`Delete "${purchase.reference}"? This cannot be undone.`}
        destructive
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
};

export default PurchaseDetailsPage;
