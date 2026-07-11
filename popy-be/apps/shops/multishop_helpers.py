def ensure_default_shop(apps):
    Shop = apps.get_model("shops", "Shop")
    shop, _ = Shop.objects.get_or_create(
        code="MAIN",
        defaults={"name": "Main Shop", "address": "", "phone": ""},
    )
    return shop.id


def backfill_model_shop(apps, app_label, model_name, shop_id):
    Model = apps.get_model(app_label, model_name)
    Model.objects.filter(shop__isnull=True).update(shop_id=shop_id)
