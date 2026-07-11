from decimal import Decimal

from django.db import transaction

from apps.catalog.models import Category, Product
from apps.core.choices import StockTransactionType
from apps.core.services import adjust_stock
from apps.core.utils import generate_reference
from apps.parties.models import Customer
from apps.sales.models import Sale, SaleItem
from apps.sales.serializers import SaleCreateSerializer, SaleSerializer


class SaleSyncError(Exception):
    def __init__(self, message: str, status_code: int = 400, errors=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.errors = errors


def create_sale_from_payload(*, shop, user, payload: dict) -> tuple[Sale, str]:
    """
    Create or return an existing sale using optional client_id idempotency.
    Returns (sale, status) where status is synced|duplicate.
    """
    serializer = SaleCreateSerializer(data=payload)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    client_id = data.get("client_id") or None
    if client_id == "":
        client_id = None

    if client_id:
        existing = Sale.objects.filter(shop=shop, client_id=client_id).first()
        if existing:
            return existing, "duplicate"

    customer = None
    customer_id = data.get("customer_id")
    if customer_id:
        try:
            customer = Customer.objects.get(pk=customer_id, shop=shop)
        except Customer.DoesNotExist:
            raise SaleSyncError("Customer not found", status_code=404)

    reference = generate_reference("SL", Sale, shop=shop)
    subtotal = Decimal("0")
    line_items = []

    for item_data in data["items"]:
        try:
            product = Product.objects.select_for_update().get(
                pk=item_data["product_id"], shop=shop
            )
        except Product.DoesNotExist:
            raise SaleSyncError("Product not found", status_code=404)

        if product.stock_quantity < item_data["quantity"]:
            raise SaleSyncError(
                f"Insufficient stock for {product.name}",
                status_code=409,
                errors={"productId": [str(product.id)]},
            )

        line_total = Decimal(item_data["quantity"]) * item_data["unit_price"]
        subtotal += line_total
        line_items.append((product, item_data, line_total))

    discount = data.get("discount", Decimal("0"))
    tax = data.get("tax", Decimal("0"))
    total = subtotal - discount + tax

    sale = Sale.objects.create(
        shop=shop,
        client_id=client_id,
        reference=reference,
        customer=customer,
        subtotal=subtotal,
        discount=discount,
        tax=tax,
        total=total,
        payment_method=data["payment_method"],
        amount_paid=data.get("amount_paid"),
        cashier=user,
    )

    for product, item_data, line_total in line_items:
        SaleItem.objects.create(
            sale=sale,
            product=product,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            total=line_total,
        )
        try:
            adjust_stock(
                product,
                -item_data["quantity"],
                StockTransactionType.SALE,
                note=f"Sale {reference}",
                reference_type="Sale",
                reference_id=sale.id,
            )
        except ValueError:
            transaction.set_rollback(True)
            raise SaleSyncError(
                f"Insufficient stock for {product.name}",
                status_code=409,
                errors={"productId": [str(product.id)]},
            )

    sale = (
        Sale.objects.select_related("customer", "cashier")
        .prefetch_related("items__product")
        .get(pk=sale.pk)
    )

    from apps.core.notifications import notify_pos_checkout

    try:
        notify_pos_checkout(
            sale,
            send_email=data.get("send_email", False),
            send_sms=data.get("send_sms", False),
            user=user,
        )
    except Exception:
        pass

    return sale, "synced"


def serialize_sale_result(sale: Sale, *, client_id: str | None, status: str) -> dict:
    return {
        "clientId": client_id,
        "status": status,
        "sale": SaleSerializer(sale).data,
    }
