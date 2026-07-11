import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import { toast } from 'react-toastify';
import { PageHeader } from '@/components/common';
import { FormTextField } from '@/components/forms';
import { getErrorMessage } from '@/utils';
import {
  useCreatePurchaseReturnMutation,
  useCreateSalesReturnMutation,
} from '../returnsApi';
import {
  purchaseReturnSchema,
  salesReturnSchema,
  type PurchaseReturnFormValues,
  type SalesReturnFormValues,
} from '../schema';

type TabKey = 'sales' | 'purchase';

const SalesReturnForm = () => {
  const [createSalesReturn, { isLoading }] = useCreateSalesReturnMutation();
  const { control, handleSubmit, reset } = useForm<SalesReturnFormValues>({
    resolver: zodResolver(salesReturnSchema),
    defaultValues: { saleId: '', reason: '', refundAmount: 0 },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createSalesReturn({
        saleId: values.saleId,
        reason: values.reason,
        refundAmount: values.refundAmount,
        items: [],
      }).unwrap();
      toast.success('Sales return recorded');
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <Stack component="form" spacing={2} onSubmit={onSubmit} maxWidth={480}>
      <FormTextField
        name="saleId"
        control={control}
        label="Sale reference / ID"
      />
      <FormTextField
        name="reason"
        control={control}
        label="Reason"
        multiline
        minRows={2}
      />
      <FormTextField
        name="refundAmount"
        control={control}
        label="Refund amount"
        type="number"
      />
      <Button
        type="submit"
        variant="contained"
        disabled={isLoading}
        sx={{ alignSelf: 'flex-start' }}
      >
        Process sales return
      </Button>
    </Stack>
  );
};

const PurchaseReturnForm = () => {
  const [createPurchaseReturn, { isLoading }] =
    useCreatePurchaseReturnMutation();
  const { control, handleSubmit, reset } = useForm<PurchaseReturnFormValues>({
    resolver: zodResolver(purchaseReturnSchema),
    defaultValues: { purchaseId: '', reason: '', amount: 0 },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createPurchaseReturn({
        purchaseId: values.purchaseId,
        reason: values.reason,
        amount: values.amount,
        items: [],
      }).unwrap();
      toast.success('Purchase return recorded');
      reset();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <Stack component="form" spacing={2} onSubmit={onSubmit} maxWidth={480}>
      <FormTextField
        name="purchaseId"
        control={control}
        label="Purchase reference / ID"
      />
      <FormTextField
        name="reason"
        control={control}
        label="Reason"
        multiline
        minRows={2}
      />
      <FormTextField
        name="amount"
        control={control}
        label="Return amount"
        type="number"
      />
      <Button
        type="submit"
        variant="contained"
        disabled={isLoading}
        sx={{ alignSelf: 'flex-start' }}
      >
        Process purchase return
      </Button>
    </Stack>
  );
};

export const ReturnsPage = () => {
  const [tab, setTab] = useState<TabKey>('sales');

  return (
    <>
      <PageHeader
        title="Returns"
        subtitle="Process sales and purchase returns"
      />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tab} onChange={(_e, value: TabKey) => setTab(value)}>
          <Tab value="sales" label="Sales Return" />
          <Tab value="purchase" label="Purchase Return" />
        </Tabs>
      </Box>
      <Card>
        <CardContent>
          {tab === 'sales' ? <SalesReturnForm /> : <PurchaseReturnForm />}
        </CardContent>
      </Card>
    </>
  );
};

export default ReturnsPage;
