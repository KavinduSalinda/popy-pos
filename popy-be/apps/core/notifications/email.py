import json
import logging
import urllib.error
import urllib.request

from django.conf import settings

logger = logging.getLogger(__name__)


def send_email(
    *,
    to_email: str,
    subject: str,
    html_content: str,
    text_content: str = "",
    to_name: str = "",
) -> bool:
    """Send a transactional email via Brevo. Returns True on success."""
    api_key = getattr(settings, "BREVO_API_KEY", "")
    sender_email = getattr(settings, "BREVO_SENDER_EMAIL", "")
    sender_name = getattr(settings, "BREVO_SENDER_NAME", "Popy POS")

    if not api_key or not sender_email:
        logger.warning("Brevo is not configured; skipping email to %s", to_email)
        return False

    if not to_email:
        logger.warning("No recipient email provided; skipping send")
        return False

    payload = {
        "sender": {"name": sender_name, "email": sender_email},
        "to": [{"email": to_email, "name": to_name or to_email}],
        "subject": subject,
        "htmlContent": html_content,
    }
    if text_content:
        payload["textContent"] = text_content

    request = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "api-key": api_key,
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
        logger.error("Brevo email failed (%s): %s", exc.code, body)
    except urllib.error.URLError as exc:
        logger.error("Brevo email request failed: %s", exc.reason)
    except Exception:
        logger.exception("Unexpected error sending email to %s", to_email)

    return False
