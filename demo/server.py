"""Local Finfolio demo server: static UI plus fresh Yahoo Finance prices via yfinance."""

from __future__ import annotations

import json
import math
import re
from datetime import date, datetime, timedelta, timezone
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import yfinance as yf
if __package__:
    from .symbol_search import search_stocks
else:
    from symbol_search import search_stocks


ROOT = Path(__file__).resolve().parents[1]
COMMODITY_PROXIES = {"GLD", "SLV", "USO", "CPER", "DBA"}
BENCHMARK_PRESETS = {"E1VFVN30.VN", "FUEVFVND.VN", "GLD", "SLV"}
VN_STOCK_RE = re.compile(r"^[A-Z0-9]{2,10}\.VN$")
YAHOO_FX = "VND=X"


def normalize_vn_symbol(raw: str) -> str:
    symbol = raw.strip().upper()
    if re.fullmatch(r"[A-Z0-9]{2,10}", symbol):
        symbol += ".VN"
    if not VN_STOCK_RE.fullmatch(symbol):
        raise ValueError("Mã cổ phiếu Việt Nam phải có dạng FPT hoặc FPT.VN.")
    return symbol


def normalize_holding(raw: str) -> str:
    symbol = raw.strip().upper()
    return symbol if symbol in COMMODITY_PROXIES else normalize_vn_symbol(symbol)


def normalize_benchmark(raw: str) -> str:
    symbol = raw.strip().upper()
    return symbol if symbol in BENCHMARK_PRESETS else normalize_vn_symbol(symbol)


def fetch_market_data(start_text: str, end_text: str, selected: list[str], benchmark: str = "GLD") -> dict:
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
    if len(selected) < 2 or len(selected) > 3:
        raise ValueError("Chọn từ 2 đến 3 tài sản hợp lệ.")
    holdings = [normalize_holding(symbol) for symbol in selected]
    if len(set(holdings)) != len(holdings):
        raise ValueError("Mã tài sản không được trùng lặp.")
    benchmark_symbol = normalize_benchmark(benchmark)

    symbols = sorted(set(holdings) | {benchmark_symbol} | ({YAHOO_FX} if any(symbol in COMMODITY_PROXIES for symbol in [*holdings, benchmark_symbol]) else set()))
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
    missing = [symbol for symbol in symbols if symbol not in close or close[symbol].dropna().empty]
    if missing:
        raise RuntimeError(f"Yahoo Finance không có dữ liệu cho: {', '.join(missing)}. Hãy kiểm tra mã hoặc chọn benchmark khác.")
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
        "benchmark": benchmark_symbol,
    }


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/api/search-symbols":
            try:
                self.send_json(200, search_stocks(parse_qs(url.query).get("q", [""])[0]))
            except ValueError as exc:
                self.send_json(400, {"error": str(exc)})
            except RuntimeError as exc:
                self.send_json(502, {"error": str(exc)})
            return
        if url.path != "/api/market-data":
            return super().do_GET()
        query = parse_qs(url.query)
        try:
            result = fetch_market_data(
                query.get("start", [""])[0],
                query.get("end", [""])[0],
                query.get("symbol", []),
                query.get("benchmark", ["GLD"])[0],
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
