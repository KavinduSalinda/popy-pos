from django.db import transaction

from apps.catalog.models import Product
from apps.inventory.models import StockTransaction


@transaction.atomic
def adjust_stock(product: Product, quantity: int, transaction_type: str, note: str = "", reference_type: str = "", reference_id: int | None = None):
    previous_quantity = product.stock_quantity
    product.stock_quantity += quantity
    if product.stock_quantity < 0:
        raise ValueError("Insufficient stock")
    product.save(update_fields=["stock_quantity", "updated_at"])

    StockTransaction.objects.create(
        product=product,
        type=transaction_type,
        quantity=quantity,
        balance=product.stock_quantity,
        note=note or "",
        reference_type=reference_type,
        reference_id=reference_id,
    )

    if (
        previous_quantity > product.reorder_level
        and product.stock_quantity <= product.reorder_level
        and product.reorder_level > 0
    ):
        from apps.core.notifications import notify_low_inventory

        notify_low_inventory(product)

    return product
