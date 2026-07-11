export interface DashboardSummary {
  todaySales: number;
  monthlySales: number;
  totalRevenue: number;
  grossProfit: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalCustomers: number;
  totalSuppliers: number;
}

export interface SalesTrendPoint {
  label: string;
  total: number;
}

export interface SalesTrend {
  daily: SalesTrendPoint[];
  monthly: SalesTrendPoint[];
}

export interface TopProduct {
  productId: string | number;
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface CategorySales {
  category: string;
  total: number;
}
