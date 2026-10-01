"""Local Finfolio demo server: static UI plus fresh Yahoo Finance prices via yfinance."""

from __future__ import annotations

import json
import math
import re
from datetime import date, datetime, timedelta, timezone
from functools import partial
from concurrent.futures import ThreadPoolExecutor
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import pandas as pd
import yfinance as yf
if __package__:
    from .symbol_search import search_stocks
    from .vn_data import get_vn_series
else:
    from symbol_search import search_stocks
    from vn_data import get_vn_series


ROOT = Path(__file__).resolve().parents[1]
COMMODITY_PROXIES = {"GLD", "SLV", "USO", "CPER", "DBA"}
BENCHMARK_PRESETS = {"FUESSV30.VN", "FUEVN100.VN", "E1VFVN30.VN", "FUEVFVND.VN", "GLD", "SLV"}
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


def fetch_yahoo_market_data(start_text: str, end_text: str, selected: list[str], benchmark: str = "GLD") -> dict:
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
    essential = set(holdings) | ({YAHOO_FX} if any(symbol in COMMODITY_PROXIES for symbol in holdings) else set())
    missing = [symbol for symbol in essential if symbol not in close or close[symbol].dropna().empty]
    if missing:
        raise RuntimeError(f"Yahoo Finance không có dữ liệu cho: {', '.join(missing)}. Hãy kiểm tra mã hoặc chọn benchmark khác.")
    benchmark_notice = None
    requested_benchmark = benchmark_symbol
    if benchmark_symbol == "E1VFVN30.VN":
        benchmark_prices = close[benchmark_symbol].dropna() if benchmark_symbol in close else None
        has_gap = benchmark_prices is None or len(benchmark_prices) < 2 or benchmark_prices.index.to_series().diff().dt.days.max() > 20
        if has_gap:
            try:
                alternate = yf.download("FUESSV30.VN", start=start.isoformat(), end=(end + timedelta(days=1)).isoformat(), interval="1d", auto_adjust=False, progress=False, threads=False, timeout=12)
                alt_close = alternate["Close"]
                alt_series = alt_close["FUESSV30.VN"] if hasattr(alt_close, "columns") else alt_close
                if len(alt_series.dropna()) >= 2 and alt_series.dropna().index.to_series().diff().dt.days.max() <= 20:
                    close = close.copy()
                    close["FUESSV30.VN"] = alt_series
                    symbols = sorted(set(symbols) | {"FUESSV30.VN"})
                    benchmark_symbol = "FUESSV30.VN"
                    benchmark_notice = "E1VFVN30 thiếu lịch sử dài; dùng SSIAM VN30 ETF (FUESSV30) cùng chỉ số VN30. Khoảng so sánh giới hạn theo dữ liệu thực có."
            except Exception:
                # Keep the original sparse benchmark. The frontend renders gaps
                # explicitly; provider failure never removes portfolio prices.
                pass
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
        "benchmark_requested": requested_benchmark,
        "benchmark_notice": benchmark_notice,
    }


def fetch_market_data(start_text: str, end_text: str, selected: list[str], benchmark: str = "VN30.VN") -> dict:
    try:
        start, end = date.fromisoformat(start_text), date.fromisoformat(end_text)
    except ValueError as exc:
        raise ValueError("Ngày phải có định dạng YYYY-MM-DD.") from exc
    if start >= end or end > date.today() + timedelta(days=1) or (end - start).days > 366 * 5:
        raise ValueError("Chọn khoảng ngày hợp lệ, tối đa 5 năm và không trong tương lai.")
    if not 2 <= len(selected) <= 3:
        raise ValueError("Chọn từ 2 đến 3 tài sản hợp lệ.")
    holdings = [normalize_holding(symbol) for symbol in selected]
    if len(set(holdings)) != len(holdings):
        raise ValueError("Mã tài sản không được trùng lặp.")
    if any(symbol in {"VN30.VN", "VNINDEX.VN"} for symbol in holdings):
        raise ValueError("Chỉ số chỉ dùng làm benchmark, không phải vị thế đầu tư.")
    requested = normalize_benchmark(benchmark)
    vn_symbols = sorted({symbol for symbol in holdings if symbol.endswith(".VN")} | ({requested} if requested.endswith(".VN") else set()))
    rows, metadata, failed = [], {}, {}
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = {symbol: pool.submit(get_vn_series, symbol) for symbol in vn_symbols}
        for symbol, future in futures.items():
            try:
                entry, mode = future.result()
                for day, close in entry["prices"]:
                    if start_text <= day <= end_text:
                        rows.append({"session_date": day, "symbol": symbol, "close": float(close)})
                metadata[symbol] = {"source": entry["source"], "mode": mode, "exchange": entry["exchange"], "fetched_at_utc": entry["fetched_at_utc"], "last_session": entry["prices"][-1][0]}
            except RuntimeError as exc:
                if symbol in holdings:
                    raise
                failed[symbol] = str(exc)
    actual_benchmark, benchmark_notice = requested, None
    if requested in failed and requested in {"VN30.VN", "E1VFVN30.VN"}:
        for alternate in ["FUESSV30.VN", "FUEVN100.VN"]:
            try:
                entry, mode = get_vn_series(alternate)
                alternate_rows = [{"session_date": day, "symbol": alternate, "close": float(close)} for day, close in entry["prices"] if start_text <= day <= end_text]
                if len(alternate_rows) < 2:
                    continue
                rows.extend(alternate_rows)
                metadata[alternate] = {"source": entry["source"], "mode": mode, "exchange": entry["exchange"], "fetched_at_utc": entry["fetched_at_utc"], "last_session": entry["prices"][-1][0]}
                actual_benchmark = alternate
                benchmark_notice = f"{requested} chưa lấy được; dùng {alternate} làm ETF proxy và ghi rõ kỳ so sánh thực có."
                break
            except RuntimeError:
                continue
    foreign = sorted({symbol for symbol in [*holdings, requested] if symbol in COMMODITY_PROXIES})
    if foreign:
        yahoo_symbols = foreign + [YAHOO_FX]
        try:
            frame = yf.download(yahoo_symbols, start=start_text, end=(end + timedelta(days=1)).isoformat(), interval="1d", auto_adjust=False, progress=False, threads=False, timeout=12)
        except Exception as exc:
            if any(symbol in COMMODITY_PROXIES for symbol in holdings):
                raise RuntimeError("Không tải được giá commodity/tỷ giá từ Yahoo Finance. Hãy thử lại sau.") from exc
            frame = pd.DataFrame()
            benchmark_notice = "Không tải được benchmark commodity; giữ nguyên kết quả danh mục VN."
        if not frame.empty and "Close" in frame:
            for stamp, record in frame["Close"].iterrows():
                for symbol in yahoo_symbols:
                    value = record.get(symbol)
                    if value is not None and math.isfinite(float(value)) and float(value) > 0:
                        rows.append({"session_date": stamp.date().isoformat(), "symbol": "USDVND" if symbol == YAHOO_FX else symbol, "close": float(value)})
        available = {row["symbol"] for row in rows}
        essential = {symbol for symbol in holdings if symbol in COMMODITY_PROXIES} | ({"USDVND"} if any(symbol in COMMODITY_PROXIES for symbol in holdings) else set())
        if not essential.issubset(available):
            raise RuntimeError("Yahoo Finance chưa trả đủ giá commodity/tỷ giá. Hãy thử lại sau.")
    if any(not any(row["symbol"] == symbol for row in rows) for symbol in holdings):
        raise RuntimeError("Tài sản chưa có giá trong khoảng ngày đã chọn.")
    return {"rows": rows, "source": "TradingView via tvdatafeed (VN); Yahoo Finance via yfinance (commodity/FX)", "fetched_at_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"), "vn_sources": metadata, "requested_symbols": sorted({row["symbol"] for row in rows}), "benchmark": actual_benchmark, "benchmark_requested": requested, "benchmark_notice": benchmark_notice}


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
                query.get("benchmark", ["VN30.VN"])[0],
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
