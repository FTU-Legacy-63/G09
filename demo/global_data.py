"""Verified Yahoo instrument metadata; USD universe, no derivative positions."""
import json
import re
import time
from functools import lru_cache
from pathlib import Path
import yfinance as yf

CATALOG = json.loads(Path(__file__).with_name("instrument_catalog.json").read_text(encoding="utf-8"))
SYMBOL_RE = re.compile(r"^[A-Z0-9^][A-Z0-9.\-^]{0,24}$")
CLASS_NAMES = {"EQUITY": "Equity", "ETF": "ETF", "MUTUALFUND": "Mutual fund", "CRYPTOCURRENCY": "Crypto", "INDEX": "Benchmark index"}

@lru_cache(maxsize=512)
def _resolve(symbol, bucket):
    if symbol in CATALOG:
        return dict(CATALOG[symbol])
    try:
        ticker = yf.Ticker(symbol)
        ticker.history(period="5d", auto_adjust=False, raise_errors=True)
        meta = ticker.get_history_metadata()
    except Exception as exc:
        raise RuntimeError(f"Chưa xác minh được instrument {symbol} trên Yahoo Finance.") from exc
    quote_type = meta.get("instrumentType")
    if quote_type not in CLASS_NAMES:
        raise ValueError(f"{symbol}: không hỗ trợ futures, options, FX hoặc instrument chưa xác định.")
    if meta.get("currency") != "USD":
        raise ValueError(f"{symbol}: hiện hỗ trợ tài sản quốc tế niêm yết USD; không tự giả định tỷ giá cho {meta.get('currency', 'unknown')}.")
    name = meta.get("longName") or meta.get("shortName") or symbol
    if re.search(r"\b([2-5]x|leveraged|inverse|ultra\w*)\b|proshares.*\bshort\b", name, re.I):
        raise ValueError(f"{symbol}: chưa hỗ trợ ETF đòn bẩy/inverse.")
    if quote_type == 'ETF':
        try:
            category=str(ticker.get_info().get('category') or '')
        except Exception as exc:
            raise RuntimeError(f"{symbol}: chưa xác minh được loại ETF; hãy thử lại sau.") from exc
        if not category:
            raise RuntimeError(f"{symbol}: provider chưa cung cấp category để kiểm tra ETF đòn bẩy/inverse.")
        if re.search(r"leveraged|inverse", category, re.I):
            raise ValueError(f"{symbol}: chưa hỗ trợ ETF đòn bẩy/inverse.")
    return {"name": name, "currency": "USD", "className": CLASS_NAMES[quote_type], "group": CLASS_NAMES[quote_type]}

def resolve_global(symbol, benchmark=False):
    if not SYMBOL_RE.fullmatch(symbol) or symbol.endswith(".VN"):
        raise ValueError("Mã quốc tế không hợp lệ.")
    result = _resolve(symbol, int(time.time() // 86400))
    if result["className"] == "Benchmark index" and not benchmark:
        raise ValueError("Chỉ số chỉ dùng làm benchmark, không phải vị thế đầu tư.")
    return result
