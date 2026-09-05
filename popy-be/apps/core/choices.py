from django.db import models


class Role(models.TextChoices):
    SUPER_ADMIN = "SUPER_ADMIN", "Super Admin"
    MANAGER = "MANAGER", "Manager"
    CASHIER = "CASHIER", "Cashier"
    INVENTORY_OFFICER = "INVENTORY_OFFICER", "Inventory Officer"


class PaymentMethod(models.TextChoices):
    CASH = "CASH", "Cash"
    CARD = "CARD", "Card"
    MOBILE = "MOBILE", "Mobile"
    CREDIT = "CREDIT", "Credit"


class PurchaseStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    ORDERED = "ORDERED", "Ordered"
    RECEIVED = "RECEIVED", "Received"
    PARTIAL = "PARTIAL", "Partial"
    CANCELLED = "CANCELLED", "Cancelled"


class StockTransactionType(models.TextChoices):
    PURCHASE = "PURCHASE", "Purchase"
    SALE = "SALE", "Sale"
    ADJUSTMENT = "ADJUSTMENT", "Adjustment"
    RETURN = "RETURN", "Return"
    TRANSFER = "TRANSFER", "Transfer"


class AdjustmentType(models.TextChoices):
    DAMAGE = "DAMAGE", "Damage"
    LOSS = "LOSS", "Loss"
    CORRECTION = "CORRECTION", "Correction"
    FOUND = "FOUND", "Found"


class ShopPlan(models.TextChoices):
    FREE = "FREE", "Free"
    PRO = "PRO", "Pro"
