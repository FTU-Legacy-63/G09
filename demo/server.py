"""Local Finfolio demo server: static UI plus fresh Yahoo Finance prices via yfinance."""

from __future__ import annotations

import json
import math
from datetime import date, datetime, timedelta, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import yfinance as yf


ROOT = Path(__file__).resolve().parents[1]
ALLOWED_SYMBOLS = {"FPT.VN", "HPG.VN", "GLD"}
YAHOO_FX = "VND=X"


def fetch_market_data(start_text: str, end_text: str, selected: list[str]) -> dict:
    """Fetch unadjusted daily closes; no persistent or fixture fallback."""
    try:
        start = date.fromisoformat(start_text)
        end = date.fromisoformat(end_text)
    except ValueError as exc:
        raise ValueError("Ngày phải có định dạng YYYY-MM-DD.") from exc
    if start >= end or end > date.today() + timedelta(days=1):
        raise ValueError("Khoảng ngày không hợp lệ hoặc nằm trong tương lai.")
    if (end - start).days > 366 * 5:
        raise ValueError("Demo chỉ hỗ trợ tối đa 5 năm dữ liệu mỗi lần tải.")
    if len(selected) < 2 or len(selected) > 3 or len(set(selected)) != len(selected) or not set(selected) <= ALLOWED_SYMBOLS:
        raise ValueError("Chọn 2–3 mã hợp lệ, không trùng lặp.")

    symbols = sorted(set(selected) | {"GLD", YAHOO_FX})
    try:
        frame = yf.download(
            symbols,
            start=start.isoformat(),
            end=(end + timedelta(days=1)).isoformat(),
            interval="1d",
            auto_adjust=False,
            progress=False,
            threads=False,
            timeout=12,
        )
    except Exception as exc:
        raise RuntimeError(f"Yahoo Finance chưa trả dữ liệu: {exc}") from exc
    if frame.empty or "Close" not in frame:
        raise RuntimeError("Yahoo Finance không trả giá close cho khoảng ngày này. Hãy thử lại sau hoặc đổi khoảng ngày.")

    rows = []
    close = frame["Close"]
    for timestamp, record in close.iterrows():
        session_date = timestamp.date().isoformat()
        for symbol in symbols:
            value = record.get(symbol)
            if value is not None and math.isfinite(float(value)) and float(value) > 0:
                rows.append({"session_date": session_date, "symbol": "USDVND" if symbol == YAHOO_FX else symbol, "close": float(value)})
    if not rows:
        raise RuntimeError("Yahoo Finance không trả đủ giá hợp lệ. Không dùng dữ liệu cũ thay thế.")
    return {
        "rows": rows,
        "source": "Yahoo Finance via yfinance",
        "fetched_at_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "requested_symbols": symbols,
    }


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        url = urlparse(self.path)
        if url.path != "/api/market-data":
            return super().do_GET()
        query = parse_qs(url.query)
        try:
            result = fetch_market_data(
                query.get("start", [""])[0],
                query.get("end", [""])[0],
                query.get("symbol", []),
            )
            self.send_json(200, result)
        except ValueError as exc:
            self.send_json(400, {"error": str(exc)})
        except RuntimeError as exc:
            self.send_json(502, {"error": str(exc)})

    def send_json(self, status: int, payload: dict):
        body = json.dumps(payload, ensure_ascii=False, allow_nan=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Serve Finfolio Week 6 demo with live yfinance fetches")
    parser.add_argument("--port", type=int, default=8123)
    args = parser.parse_args()
    handler = partial(Handler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    print(f"Finfolio demo: http://127.0.0.1:{args.port}/demo/", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
