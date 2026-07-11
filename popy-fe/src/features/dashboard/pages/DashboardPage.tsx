import { Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';
import AttachMoney from '@mui/icons-material/AttachMoney';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Savings from '@mui/icons-material/Savings';
import Warning from '@mui/icons-material/Warning';
import RemoveShoppingCart from '@mui/icons-material/RemoveShoppingCart';
import People from '@mui/icons-material/People';
import LocalShipping from '@mui/icons-material/LocalShipping';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EmptyState, Loader, PageHeader } from '@/components/common';
import { formatCurrency, formatNumber } from '@/utils';
import { KpiCard } from '../components/KpiCard';
import {
  useGetDashboardSummaryQuery,
  useGetSalesByCategoryQuery,
  useGetSalesTrendQuery,
  useGetTopProductsQuery,
} from '../dashboardApi';

const PIE_COLORS = [
  '#2563eb',
  '#7c3aed',
  '#16a34a',
  '#d97706',
  '#dc2626',
  '#0891b2',
];

const toNumeric = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  if (Array.isArray(value) && value.length > 0) return toNumeric(value[0]);
  return 0;
};

const tooltipCurrency = (value: unknown) => formatCurrency(toNumeric(value));
const tooltipNumber = (value: unknown) => formatNumber(toNumeric(value));

export const DashboardPage = () => {
  const { data: summary, isLoading: summaryLoading } =
    useGetDashboardSummaryQuery();
  const { data: trend, isLoading: trendLoading } = useGetSalesTrendQuery();
  const { data: topProducts = [] } = useGetTopProductsQuery();
  const { data: categorySales = [] } = useGetSalesByCategoryQuery();

  const kpis = [
    {
      title: "Today's Sales",
      value: formatCurrency(summary?.todaySales ?? 0),
      icon: <AttachMoney />,
      color: 'primary.main',
    },
    {
      title: 'Monthly Sales',
      value: formatCurrency(summary?.monthlySales ?? 0),
      icon: <CalendarMonth />,
      color: 'secondary.main',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(summary?.totalRevenue ?? 0),
      icon: <TrendingUp />,
      color: 'success.main',
    },
    {
      title: 'Gross Profit',
      value: formatCurrency(summary?.grossProfit ?? 0),
      icon: <Savings />,
      color: 'info.main',
    },
    {
      title: 'Low Stock',
      value: formatNumber(summary?.lowStockCount ?? 0),
      icon: <Warning />,
      color: 'warning.main',
    },
    {
      title: 'Out of Stock',
      value: formatNumber(summary?.outOfStockCount ?? 0),
      icon: <RemoveShoppingCart />,
      color: 'error.main',
    },
    {
      title: 'Customers',
      value: formatNumber(summary?.totalCustomers ?? 0),
      icon: <People />,
      color: 'primary.main',
    },
    {
      title: 'Suppliers',
      value: formatNumber(summary?.totalSuppliers ?? 0),
      icon: <LocalShipping />,
      color: 'secondary.main',
    },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Business overview at a glance" />

      <Grid container spacing={2} sx={{ mb: 1 }}>
        {kpis.map((kpi) => (
          <Grid key={kpi.title} size={{ xs: 12, sm: 6, md: 3 }}>
            <KpiCard {...kpi} loading={summaryLoading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardHeader
              title="Daily Sales Trend"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent sx={{ height: 320 }}>
              {trendLoading ? (
                <Loader />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend?.daily ?? []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <ReTooltip formatter={tooltipCurrency} />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Sales by Category"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent sx={{ height: 320 }}>
              {categorySales.length === 0 ? (
                <EmptyState title="No data" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categorySales}
                      dataKey="total"
                      nameKey="category"
                      outerRadius={90}
                      label
                    >
                      {categorySales.map((_entry, index) => (
                        <Cell
                          key={index}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend />
                    <ReTooltip formatter={tooltipCurrency} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardHeader
              title="Monthly Sales Trend"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend?.monthly ?? []}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <ReTooltip formatter={tooltipCurrency} />
                  <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardHeader
              title="Top Selling Products"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <CardContent sx={{ height: 300 }}>
              {topProducts.length === 0 ? (
                <EmptyState title="No data" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={120} />
                    <ReTooltip formatter={tooltipNumber} />
                    <Bar
                      dataKey="quantitySold"
                      fill="#16a34a"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: 'block' }}
      >
        Figures update in real time as sales are processed.
      </Typography>
    </>
  );
};

export default DashboardPage;
