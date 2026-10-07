"""Expose only publishable application configuration, never administration credentials."""
import os
import re
from pathlib import Path


def account_config():
    values = {}
    # Optional ignored file for development. Production uses Vercel environment variables.
    if not os.environ.get("VERCEL"):
        path = Path(__file__).resolve().parents[1] / ".env.account.local"
        if path.is_file():
            for line in path.read_text().splitlines():
                key, separator, value = line.partition("=")
                if separator and key in {"SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"}:
                    values[key] = value.strip()
    url = os.environ.get("SUPABASE_URL", values.get("SUPABASE_URL", ""))
    key = os.environ.get("SUPABASE_PUBLISHABLE_KEY", values.get("SUPABASE_PUBLISHABLE_KEY", ""))
    if not re.fullmatch(r"https://[a-z0-9]{20}\.supabase\.co", url) or not key.startswith("sb_publishable_"):
        return {"configured": False}
    return {"configured": True, "url": url, "publishableKey": key}
