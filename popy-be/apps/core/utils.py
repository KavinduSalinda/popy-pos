import re
from typing import Any


def to_camel_case(snake_str: str) -> str:
    components = snake_str.split("_")
    return components[0] + "".join(word.capitalize() for word in components[1:])


def to_snake_case(camel_str: str) -> str:
    return re.sub(r"(?<!^)(?=[A-Z])", "_", camel_str).lower()


def dict_to_camel_case(data: dict[str, Any]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in data.items():
        camel_key = to_camel_case(key)
        if isinstance(value, dict):
            result[camel_key] = dict_to_camel_case(value)
        elif isinstance(value, list):
            result[camel_key] = [
                dict_to_camel_case(item) if isinstance(item, dict) else item
                for item in value
            ]
        else:
            result[camel_key] = value
    return result


def dict_keys_to_snake(data: dict[str, Any]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in data.items():
        snake_key = to_snake_case(key)
        if isinstance(value, dict):
            result[snake_key] = dict_keys_to_snake(value)
        elif isinstance(value, list):
            result[snake_key] = [
                dict_keys_to_snake(item) if isinstance(item, dict) else item
                for item in value
            ]
        else:
            result[snake_key] = value
    return result


def generate_reference(prefix: str, model_class, field_name: str = "reference", shop=None) -> str:
    from django.utils import timezone

    year = timezone.now().year
    pattern = f"{prefix}-{year}-"
    qs = model_class.objects.filter(**{f"{field_name}__startswith": pattern})
    if shop is not None:
        qs = qs.filter(shop=shop)
    last = qs.order_by("-id").first()
    if last:
        last_ref = getattr(last, field_name)
        try:
            seq = int(last_ref.split("-")[-1]) + 1
        except (ValueError, IndexError):
            seq = 1
    else:
        seq = 1
    return f"{pattern}{seq:04d}"
