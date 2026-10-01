"""TradingView daily VN bars and a scheduled, provider-backed snapshot."""

from __future__ import annotations

import json
import math
import os
from datetime import date, datetime, time, timezone
from functools import lru_cache
from pathlib import Path
from zoneinfo import ZoneInfo

import certifi
import requests
from tvDatafeed import Interval, TvDatafeed


UNIVERSE = json.loads(Path(__file__).with_name("vn_universe.json").read_text(encoding="utf-8"))
SNAPSHOT_URL = "https://raw.githubusercontent.com/FTU-Legacy-63/G09/market-data/market-cache/vn-prices.json"
os.environ.setdefault("SSL_CERT_FILE", certifi.where())


def fetch_vn_series(symbol: str) -> dict:
    configured = UNIVERSE.get(symbol)
    ticker = configured["ticker"] if configured else symbol.removesuffix(".VN")
    exchanges = [configured["exchange"]] if configured else ["HOSE", "HNX", "UPCOM"]
    now_vn = datetime.now(ZoneInfo("Asia/Ho_Chi_Minh"))
    for exchange in exchanges:
        client = TvDatafeed(os.getenv("TRADINGVIEW_USERNAME"), os.getenv("TRADINGVIEW_PASSWORD"))
        try:
            frame = client.get_hist(ticker, exchange, Interval.in_daily, n_bars=1600)
            if frame is None or frame.empty:
                continue
            prices = {}
            for stamp, row in frame.iterrows():
                day = stamp.date()
                if day > now_vn.date() or (day == now_vn.date() and now_vn.time() < time(15, 15)):
                    continue
                close = float(row["close"])
                if not math.isfinite(close) or close <= 0:
                    raise ValueError("Invalid close")
                prices[day.isoformat()] = close
            if len(prices) < 5:
                continue
            return {"exchange": exchange, "ticker": ticker, "prices": sorted(prices.items()), "fetched_at_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"), "source": "TradingView via tvdatafeed", "adjustment": "splits"}
        except Exception:
            continue
        finally:
            if client.ws is not None:
                client.ws.close()
    raise RuntimeError(f"TradingView chưa trả giá ngày hợp lệ cho {symbol}. Hãy kiểm tra mã/sàn hoặc thử lại.")


@lru_cache(maxsize=1)
def _snapshot(bucket: int) -> dict:
    try:
        response = requests.get(SNAPSHOT_URL, timeout=8)
        response.raise_for_status()
        payload = response.json()
        return payload if payload.get("schema_version") == 1 else {}
    except (requests.RequestException, ValueError):
        return {}


def get_vn_series(symbol: str) -> tuple[dict, str]:
    now = datetime.now(timezone.utc)
    cached = _snapshot(int(now.timestamp() // 300)).get("series", {}).get(symbol)
    if cached:
        try:
            age = (now - datetime.fromisoformat(cached["fetched_at_utc"])).total_seconds()
            limit = 90 * 3600 if datetime.now(ZoneInfo("Asia/Ho_Chi_Minh")).weekday() in (5, 6, 0) else 36 * 3600
            prices = cached["prices"]
            dates = [date.fromisoformat(pair[0]) for pair in prices]
            valid_metadata = cached.get("source") == "TradingView via tvdatafeed" and cached.get("exchange") in ("HOSE", "HNX", "UPCOM") and cached.get("adjustment") == "splits"
            if valid_metadata and dates == sorted(set(dates)) and 0 <= age <= limit and len(prices) >= 5 and all(isinstance(pair, list) and len(pair) == 2 and math.isfinite(float(pair[1])) and float(pair[1]) > 0 for pair in prices):
                return cached, "daily_snapshot"
        except (ValueError, TypeError, KeyError, IndexError):
            pass
    return fetch_vn_series(symbol), "on_demand"
