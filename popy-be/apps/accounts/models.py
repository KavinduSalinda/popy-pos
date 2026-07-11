from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from apps.accounts.managers import UserManager
from apps.core.choices import Role
from apps.core.models import TimeStampedModel


class User(AbstractBaseUser, PermissionsMixin, TimeStampedModel):
    email = models.EmailField(max_length=255, unique=True)
    name = models.CharField(max_length=120)
    role = models.CharField(max_length=32, choices=Role.choices, default=Role.CASHIER)
    shop = models.ForeignKey(
        "shops.Shop",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="users",
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    avatar_url = models.URLField(max_length=500, blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        db_table = "accounts_user"

    def __str__(self):
        return self.email
