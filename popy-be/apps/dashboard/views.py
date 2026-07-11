from datetime import timedelta
from decimal import Decimal

from django.db.models import F, Sum
from django.db.models.functions import TruncDay, TruncMonth
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from apps.catalog.models import Product
from apps.core.permissions import HasPOSPermission
from apps.core.shop_context import ShopScopedMixin
from apps.core.utils import dict_to_camel_case
from apps.parties.models import Customer, Supplier
from apps.sales.models import Sale, SaleItem


class DashboardViewSet(ShopScopedMixin, ViewSet):
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "DASHBOARD_VIEW"

    def _summary_data(self):
        shop = self.shop
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        sales_qs = Sale.objects.filter(shop=shop)
        today_sales = sales_qs.filter(created_at__gte=today_start).aggregate(total=Sum("total"))["total"] or Decimal("0")
        monthly_sales = sales_qs.filter(created_at__gte=month_start).aggregate(total=Sum("total"))["total"] or Decimal("0")
        total_revenue = sales_qs.aggregate(total=Sum("total"))["total"] or Decimal("0")

        sale_items = SaleItem.objects.select_related("product").filter(sale__shop=shop)
        gross_profit = Decimal("0")
        for item in sale_items:
            gross_profit += (item.unit_price - item.product.cost_price) * item.quantity

        products = Product.objects.filter(status=True, shop=shop)
        low_stock_count = products.filter(stock_quantity__gt=0, stock_quantity__lte=F("reorder_level")).count()
        out_of_stock_count = products.filter(stock_quantity__lte=0).count()

        return {
            "today_sales": float(today_sales),
            "monthly_sales": float(monthly_sales),
            "total_revenue": float(total_revenue),
            "gross_profit": float(gross_profit),
            "low_stock_count": low_stock_count,
            "out_of_stock_count": out_of_stock_count,
            "total_customers": Customer.objects.filter(shop=shop).count(),
            "total_suppliers": Supplier.objects.filter(shop=shop).count(),
        }

    def list(self, request):
        return Response(dict_to_camel_case(self._summary_data()))

    def summary(self, request):
        return Response(dict_to_camel_case(self._summary_data()))

    def sales_trend(self, request):
        shop = self.shop
        now = timezone.now()
        week_start = now - timedelta(days=6)

        daily_qs = (
            Sale.objects.filter(shop=shop, created_at__date__gte=week_start.date())
            .annotate(day=TruncDay("created_at"))
            .values("day")
            .annotate(total=Sum("total"))
            .order_by("day")
        )
        daily = [
            {
                "label": entry["day"].strftime("%a") if entry["day"] else "",
                "total": float(entry["total"] or 0),
            }
            for entry in daily_qs
        ]

        monthly_qs = (
            Sale.objects.filter(shop=shop, created_at__year=now.year)
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(total=Sum("total"))
            .order_by("month")
        )
        monthly = [
            {
                "label": entry["month"].strftime("%b") if entry["month"] else "",
                "total": float(entry["total"] or 0),
            }
            for entry in monthly_qs
        ]

        return Response({"daily": daily, "monthly": monthly})

    def top_products(self, request):
        qs = (
            SaleItem.objects.filter(sale__shop=self.shop)
            .values("product_id", "product__name")
            .annotate(quantity_sold=Sum("quantity"), revenue=Sum("total"))
            .order_by("-quantity_sold")[:10]
        )
        data = [
            {
                "product_id": row["product_id"],
                "name": row["product__name"],
                "quantity_sold": row["quantity_sold"],
                "revenue": float(row["revenue"] or 0),
            }
            for row in qs
        ]
        return Response([dict_to_camel_case(item) for item in data])

    def sales_by_category(self, request):
        qs = (
            SaleItem.objects.filter(sale__shop=self.shop)
            .values("product__category__name")
            .annotate(total=Sum("total"))
            .order_by("-total")
        )
        data = [
            {"category": row["product__category__name"] or "Uncategorized", "total": float(row["total"] or 0)}
            for row in qs
        ]
        return Response(data)
