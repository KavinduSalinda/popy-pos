from django.db import models


class NotificationScenario(models.TextChoices):
    POS_CHECKOUT = "POS_CHECKOUT", "POS Checkout"
    LOW_INVENTORY = "LOW_INVENTORY", "Low Inventory"
    NEW_CUSTOMER = "NEW_CUSTOMER", "New Customer"
    NEW_USER = "NEW_USER", "New User Account"
