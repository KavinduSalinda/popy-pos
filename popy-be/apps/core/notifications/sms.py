import json
import logging
import re
import urllib.error
import urllib.request

from django.conf import settings

logger = logging.getLogger(__name__)


def normalize_phone(phone: str) -> str:
    """Strip non-digits for Text.lk recipient format (e.g. 94771234567)."""
    return re.sub(r"\D", "", phone or "")


def send_sms(*, to_phone: str, message: str) -> bool:
    """Send an SMS via Text.lk. Returns True on success."""
    api_token = getattr(settings, "TEXTLK_API_TOKEN", "")
    sender_id = getattr(settings, "TEXTLK_SENDER_ID", "")

    if not api_token or not sender_id:
        logger.warning("Text.lk is not configured; skipping SMS to %s", to_phone)
        return False

    recipient = normalize_phone(to_phone)
    if not recipient:
        logger.warning("No valid recipient phone provided; skipping SMS")
        return False

    payload = {
        "recipient": recipient,
        "sender_id": sender_id,
        "type": "plain",
        "message": message,
    }

    request = urllib.request.Request(
        "https://app.text.lk/api/v3/sms/send",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return 200 <= response.status < 300
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        logger.error("Text.lk SMS failed (%s): %s", exc.code, body)
    except urllib.error.URLError as exc:
        logger.error("Text.lk SMS request failed: %s", exc.reason)
    except Exception:
        logger.exception("Unexpected error sending SMS to %s", to_phone)

    return False
