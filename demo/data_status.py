"""Public provider freshness metadata; no prices, credentials or private holdings."""
from datetime import datetime, timezone
if __package__:
    from .vn_data import _snapshot, expected_daily_session
else:
    from vn_data import _snapshot, expected_daily_session


def data_status():
    now = datetime.now(timezone.utc)
    snapshot = _snapshot(int(now.timestamp() // 300))
    series = snapshot.get("series", {})
    entries = {symbol: {"last_session": value["prices"][-1][0], "fetched_at_utc": value.get("fetched_at_utc"), "source": value.get("source")} for symbol, value in series.items() if value.get("prices")}
    expected = expected_daily_session()
    return {
        "available": bool(entries), "checked_at_utc": now.isoformat(timespec="seconds"),
        "snapshot_updated_at_utc": snapshot.get("updated_at_utc"), "series": entries,
        "expected_weekday_session": expected,
        "lagging_symbols": [symbol for symbol, entry in entries.items() if entry["last_session"] < expected],
        "notice": "Mốc kỳ vọng theo ngày thường, chưa có lịch nghỉ lễ sàn. VN có thể mới hơn phiên chung với Mỹ/FX. GitHub cron có thể chạy trễ; phân tích sẽ thử tải trực tiếp khi snapshot thiếu phiên.",
    }
