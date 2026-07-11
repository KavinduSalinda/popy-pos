from datetime import datetime
from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from apps.catalog.models import Product
from apps.core.permissions import HasPOSPermission
from apps.core.shop_context import ShopScopedMixin
from apps.parties.models import Customer
from apps.purchasing.models import Purchase
from apps.sales.models import Sale, SaleItem


def parse_date_range(request):
    from_date = request.query_params.get("fromDate") or request.query_params.get("from_date")
    to_date = request.query_params.get("toDate") or request.query_params.get("to_date")
    start = None
    end = timezone.now()
    if from_date:
        start = timezone.make_aware(datetime.fromisoformat(from_date.replace("Z", "")))
    if to_date:
        end = timezone.make_aware(datetime.fromisoformat(to_date.replace("Z", "")))
    return start, end


class ReportViewSet(ShopScopedMixin, ViewSet):
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission = "REPORT_VIEW"

    def sales(self, request):
        start, end = parse_date_range(request)
        qs = Sale.objects.filter(shop=self.shop)
        if start:
            qs = qs.filter(created_at__gte=start)
        qs = qs.filter(created_at__lte=end)

        rows_qs = qs.annotate(date=TruncDate("created_at")).values("date").annotate(total=Sum("total")).order_by("date")
        rows = [
            {"date": entry["date"].isoformat() if entry["date"] else "", "total": float(entry["total"] or 0)}
            for entry in rows_qs
        ]
        grand_total = float(qs.aggregate(t=Sum("total"))["t"] or 0)

        return Response(
            {
                "columns": [
                    {"field": "date", "header": "Date", "type": "date"},
                    {"field": "total", "header": "Total", "type": "currency"},
                ],
                "rows": rows,
                "summary": {"grandTotal": grand_total},
            }
        )

    def inventory(self, request):
        products = Product.objects.select_related("category").filter(shop=self.shop)
        rows = [
            {
                "product": p.name,
                "sku": p.sku,
                "stock": p.stock_quantity,
                "value": float(p.stock_quantity * p.cost_price),
            }
            for p in products
        ]
        grand_total = sum(r["value"] for r in rows)
        return Response(
            {
                "columns": [
                    {"field": "product", "header": "Product", "type": "text"},
                    {"field": "sku", "header": "SKU", "type": "text"},
                    {"field": "stock", "header": "Stock", "type": "number"},
                    {"field": "value", "header": "Value", "type": "currency"},
                ],
                "rows": rows,
                "summary": {"grandTotal": grand_total},
            }
        )

    def purchases(self, request):
        start, end = parse_date_range(request)
        qs = Purchase.objects.filter(shop=self.shop)
        if start:
            qs = qs.filter(created_at__gte=start)
        qs = qs.filter(created_at__lte=end)

        rows = [
            {
                "reference": p.reference,
                "supplier": p.supplier.name,
                "total": float(p.total),
                "date": p.created_at.date().isoformat(),
            }
            for p in qs
        ]
        grand_total = float(qs.aggregate(t=Sum("total"))["t"] or 0)
        return Response(
            {
                "columns": [
                    {"field": "reference", "header": "Reference", "type": "text"},
                    {"field": "supplier", "header": "Supplier", "type": "text"},
                    {"field": "total", "header": "Total", "type": "currency"},
                    {"field": "date", "header": "Date", "type": "date"},
                ],
                "rows": rows,
                "summary": {"grandTotal": grand_total},
            }
        )

    def customers(self, request):
        customers = Customer.objects.filter(shop=self.shop).annotate(sales_total=Sum("sales__total"))
        rows = [
            {
                "name": c.name,
                "phone": c.phone,
                "loyaltyPoints": c.loyalty_points,
                "salesTotal": float(c.sales_total or 0),
            }
            for c in customers
        ]
        return Response(
            {
                "columns": [
                    {"field": "name", "header": "Name", "type": "text"},
                    {"field": "phone", "header": "Phone", "type": "text"},
                    {"field": "loyaltyPoints", "header": "Loyalty Points", "type": "number"},
                    {"field": "salesTotal", "header": "Sales Total", "type": "currency"},
                ],
                "rows": rows,
                "summary": {"grandTotal": sum(r["salesTotal"] for r in rows)},
            }
        )

    def profit(self, request):
        start, end = parse_date_range(request)
        items = SaleItem.objects.select_related("product").filter(sale__shop=self.shop)
        if start:
            items = items.filter(sale__created_at__gte=start)
        items = items.filter(sale__created_at__lte=end)

        profit_by_date = {}
        for item in items:
            date_key = item.sale.created_at.date().isoformat()
            profit = (item.unit_price - item.product.cost_price) * item.quantity
            profit_by_date[date_key] = profit_by_date.get(date_key, Decimal("0")) + profit

        rows = [{"date": k, "profit": float(v)} for k, v in sorted(profit_by_date.items())]
        grand_total = sum(r["profit"] for r in rows)

        return Response(
            {
                "columns": [
                    {"field": "date", "header": "Date", "type": "date"},
                    {"field": "profit", "header": "Profit", "type": "currency"},
                ],
                "rows": rows,
                "summary": {"grandTotal": grand_total},
            }
        )
