from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.accounts.views import UserViewSet
from apps.attendance.views import AttendanceListView, MarkAttendanceView, MyAttendanceTodayView
from apps.catalog.views import CategoryViewSet, PosProductListView, PosProductLookupView, ProductViewSet
from apps.dashboard.views import DashboardViewSet
from apps.inventory.views import InventoryViewSet, StockAdjustmentCreateView, StockTransactionListView
from apps.parties.views import CustomerViewSet, SupplierViewSet
from apps.purchasing.views import PurchaseViewSet
from apps.reports.views import ReportViewSet
from apps.returns.views import PurchaseReturnCreateView, ReturnViewSet, SalesReturnCreateView
from apps.sales.views import SaleViewSet
from apps.settings.views import NotificationSettingsView, PosCheckoutNotificationOptionsView
from apps.shops.views import AccessibleShopsView, ShopViewSet
from apps.sync.views import BootstrapSyncView, CatalogSyncView, SalesSyncView, SyncStatusView

router = DefaultRouter(trailing_slash=False)
router.register(r"shops", ShopViewSet, basename="shop")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"categories", CategoryViewSet, basename="category")
router.register(r"suppliers", SupplierViewSet, basename="supplier")
router.register(r"customers", CustomerViewSet, basename="customer")
router.register(r"purchases", PurchaseViewSet, basename="purchase")
router.register(r"sales", SaleViewSet, basename="sale")
router.register(r"users", UserViewSet, basename="user")
router.register(r"inventory", InventoryViewSet, basename="inventory")
router.register(r"returns", ReturnViewSet, basename="return")
router.register(r"dashboard", DashboardViewSet, basename="dashboard")
router.register(r"reports", ReportViewSet, basename="report")

dashboard = DashboardViewSet.as_view(
    {
        "get": "summary",
    }
)
dashboard_sales_trend = DashboardViewSet.as_view({"get": "sales_trend"})
dashboard_top_products = DashboardViewSet.as_view({"get": "top_products"})
dashboard_sales_by_category = DashboardViewSet.as_view({"get": "sales_by_category"})

reports_sales = ReportViewSet.as_view({"get": "sales"})
reports_inventory = ReportViewSet.as_view({"get": "inventory"})
reports_purchases = ReportViewSet.as_view({"get": "purchases"})
reports_customers = ReportViewSet.as_view({"get": "customers"})
reports_profit = ReportViewSet.as_view({"get": "profit"})

urlpatterns = [
    path("shops/accessible", AccessibleShopsView.as_view(), name="shops-accessible"),
    path("attendance", MarkAttendanceView.as_view(), name="attendance-mark"),
    path("attendance/today", MyAttendanceTodayView.as_view(), name="attendance-today"),
    path("attendance/list", AttendanceListView.as_view(), name="attendance-list"),
    path("settings/notifications", NotificationSettingsView.as_view(), name="settings-notifications"),
    path(
        "settings/pos-checkout-notifications",
        PosCheckoutNotificationOptionsView.as_view(),
        name="settings-pos-checkout-notifications",
    ),
    path("sync/bootstrap", BootstrapSyncView.as_view(), name="sync-bootstrap"),
    path("sync/catalog", CatalogSyncView.as_view(), name="sync-catalog"),
    path("sync/sales", SalesSyncView.as_view(), name="sync-sales"),
    path("sync/status", SyncStatusView.as_view(), name="sync-status"),
    path("pos/products", PosProductListView.as_view(), name="pos-products"),
    path("pos/products/lookup", PosProductLookupView.as_view(), name="pos-products-lookup"),
    path("inventory/transactions", StockTransactionListView.as_view(), name="inventory-transactions"),
    path("inventory/adjustments", StockAdjustmentCreateView.as_view(), name="inventory-adjustments"),
    path("returns/sales", SalesReturnCreateView.as_view(), name="returns-sales"),
    path("returns/purchase", PurchaseReturnCreateView.as_view(), name="returns-purchase"),
    path("dashboard/summary", dashboard, name="dashboard-summary"),
    path("dashboard/sales-trend", dashboard_sales_trend, name="dashboard-sales-trend"),
    path("dashboard/top-products", dashboard_top_products, name="dashboard-top-products"),
    path("dashboard/sales-by-category", dashboard_sales_by_category, name="dashboard-sales-by-category"),
    path("reports/sales", reports_sales, name="reports-sales"),
    path("reports/inventory", reports_inventory, name="reports-inventory"),
    path("reports/purchases", reports_purchases, name="reports-purchases"),
    path("reports/customers", reports_customers, name="reports-customers"),
    path("reports/profit", reports_profit, name="reports-profit"),
] + router.urls
