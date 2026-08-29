import { useParams } from 'react-router-dom';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import { Loader, PageHeader } from '@/components/common';
import { ROUTES } from '@/constants';
import { formatCurrency, formatDateTime } from '@/utils';
import { useGetSaleQuery } from '../salesApi';
import { ReceiptPreview } from '../components/ReceiptPreview';

export const SaleDetailsPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { data: sale, isLoading } = useGetSaleQuery(id, { skip: !id });

  if (isLoading) return <Loader fullHeight message="Loading sale…" />;
  if (!sale) return <PageHeader title="Sale not found" />;

  return (
    <>
      <PageHeader
        title={`Sale ${sale.reference}`}
        subtitle={formatDateTime(sale.createdAt)}
        breadcrumbs={[
          { label: 'Sales', to: ROUTES.SALES },
          { label: sale.reference },
        ]}
      />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Customer
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {sale.customerName ?? 'Walk-in customer'}
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>
                Items
              </Typography>
              {sale.items.map((item) => (
                <Grid container key={String(item.id)} sx={{ py: 0.5 }}>
                  <Grid size={6}>
                    <Typography variant="body2">{item.productName}</Typography>
                    {item.sku ? (
                      <Typography variant="caption" color="text.secondary">
                        {item.sku}
                      </Typography>
                    ) : null}
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="body2">×{item.quantity}</Typography>
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="body2" textAlign="right">
                      {formatCurrency(item.total)}
                    </Typography>
                  </Grid>
                </Grid>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <ReceiptPreview sale={sale} />
        </Grid>
      </Grid>
    </>
  );
};

export default SaleDetailsPage;
