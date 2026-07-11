from rest_framework.permissions import BasePermission

ROLE_PERMISSIONS: dict[str, set[str]] = {
    "SUPER_ADMIN": {"*"},
    "MANAGER": {
        "PRODUCT_VIEW",
        "PRODUCT_CREATE",
        "PRODUCT_UPDATE",
        "PRODUCT_DELETE",
        "CATEGORY_VIEW",
        "CATEGORY_MANAGE",
        "POS_ACCESS",
        "POS_CHECKOUT_SEND_EMAIL",
        "POS_CHECKOUT_SEND_SMS",
        "SALE_CREATE",
        "SALE_VIEW",
        "INVENTORY_VIEW",
        "INVENTORY_ADJUST",
        "SUPPLIER_VIEW",
        "SUPPLIER_MANAGE",
        "CUSTOMER_VIEW",
        "CUSTOMER_MANAGE",
        "PURCHASE_VIEW",
        "PURCHASE_MANAGE",
        "RETURN_CREATE",
        "RETURN_VIEW",
        "REPORT_VIEW",
        "DASHBOARD_VIEW",
        "USER_VIEW",
        "USER_MANAGE",
        "SETTINGS_MANAGE",
    },
    "CASHIER": {
        "PRODUCT_VIEW",
        "CATEGORY_VIEW",
        "POS_ACCESS",
        "POS_CHECKOUT_SEND_EMAIL",
        "POS_CHECKOUT_SEND_SMS",
        "SALE_CREATE",
        "SALE_VIEW",
        "CUSTOMER_VIEW",
        "CUSTOMER_MANAGE",
        "DASHBOARD_VIEW",
    },
    "INVENTORY_OFFICER": {
        "PRODUCT_VIEW",
        "PRODUCT_UPDATE",
        "CATEGORY_VIEW",
        "INVENTORY_VIEW",
        "INVENTORY_ADJUST",
        "SUPPLIER_VIEW",
        "PURCHASE_VIEW",
        "PURCHASE_MANAGE",
        "RETURN_CREATE",
        "RETURN_VIEW",
        "DASHBOARD_VIEW",
    },
}


def role_has_permission(role: str, permission: str) -> bool:
    perms = ROLE_PERMISSIONS.get(role, set())
    return "*" in perms or permission in perms


def get_permissions_for_role(role: str) -> list[str]:
    perms = ROLE_PERMISSIONS.get(role, set())
    if "*" in perms:
        all_perms: set[str] = set()
        for role_perms in ROLE_PERMISSIONS.values():
            all_perms.update(role_perms - {"*"})
        all_perms.update({"SETTINGS_MANAGE", "SHOP_MANAGE"})
        return sorted(all_perms)
    return sorted(perms)


class HasPOSPermission(BasePermission):
    def has_permission(self, request, view):
        required = getattr(view, "required_permission", None)
        permission_map = getattr(view, "required_permission_map", None)

        if permission_map and hasattr(view, "action"):
            required = permission_map.get(view.action, required)

        if required is None:
            return True

        user = request.user
        if not user or not user.is_authenticated:
            return False

        return role_has_permission(user.role, required)
