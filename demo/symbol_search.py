"""Search Vietnamese equities by ticker or common company name."""

from __future__ import annotations

import re
import unicodedata

import yfinance as yf
if __package__:
    from .global_data import CATALOG, SYMBOL_RE
    from .vn_data import UNIVERSE
else:
    from global_data import CATALOG, SYMBOL_RE
    from vn_data import UNIVERSE


VN_EQUITY_RE = re.compile(r"^[A-Z0-9]{2,10}\.VN$")

# Search aliases fill gaps in Yahoo's English-name search. This is not a listing
# registry and a search match does not imply historical prices are available.
POPULAR_STOCKS = (
    ("FPT.VN", "FPT Corporation", "FPT công nghệ"),
    ("FRT.VN", "FPT Retail", "Bán lẻ kỹ thuật số FPT"),
    ("PVI.VN", "PVI Holdings", "Bảo hiểm PVI"),
    ("HPG.VN", "Hòa Phát", "Hoa Phat Group"),
    ("VCB.VN", "Vietcombank", "Ngân hàng Ngoại thương Việt Nam"),
    ("VNM.VN", "Vinamilk", "Sữa Việt Nam"),
    ("MWG.VN", "Thế Giới Di Động", "The Gioi Di Dong"),
    ("VIC.VN", "Vingroup", "Tập đoàn Vingroup"),
    ("VHM.VN", "Vinhomes", "Công ty Vinhomes"),
    ("VRE.VN", "Vincom Retail", "Vincom"),
    ("MSN.VN", "Masan Group", "Masan"),
    ("MBB.VN", "MB Bank", "Ngân hàng Quân đội"),
    ("TCB.VN", "Techcombank", "Ngân hàng Kỹ thương"),
    ("BID.VN", "BIDV", "Ngân hàng Đầu tư và Phát triển"),
    ("CTG.VN", "VietinBank", "Ngân hàng Công thương"),
    ("VPB.VN", "VPBank", "Ngân hàng Việt Nam Thịnh Vượng"),
    ("ACB.VN", "ACB", "Ngân hàng Á Châu"),
    ("SSI.VN", "SSI Securities", "Chứng khoán SSI"),
    ("GAS.VN", "PV GAS", "Tổng công ty Khí Việt Nam"),
    ("PLX.VN", "Petrolimex", "Xăng dầu Việt Nam"),
)


def fold(text: str) -> str:
    text = text.casefold().replace("đ", "d")
    return "".join(char for char in unicodedata.normalize("NFD", text) if unicodedata.category(char) != "Mn")


def search_stocks(raw_query: str) -> dict:
    query = raw_query.strip()
    if len(query) < 2 or len(query) > 60:
        raise ValueError("Nhập từ 2 đến 60 ký tự để tìm cổ phiếu.")
    if any(ord(char) < 32 for char in query):
        raise ValueError("Từ khóa tìm kiếm không hợp lệ.")
    needle = fold(query)
    matches = {}
    for symbol, name, alias in POPULAR_STOCKS:
        if any(needle in fold(value) for value in (symbol, symbol[:-3], name, alias)):
            matches[symbol] = {"symbol": symbol, "name": name, "exchange": "VN", "alias": alias}

    try:
        quotes = yf.Search(fold(query), max_results=30, news_count=0, timeout=8).quotes
    except Exception as exc:
        if not matches:
            raise RuntimeError("Yahoo Finance chưa trả kết quả tìm kiếm. Hãy thử lại sau.") from exc
        quotes = []

    for quote in quotes:
        symbol = str(quote.get("symbol", "")).upper()
        if not VN_EQUITY_RE.fullmatch(symbol) or quote.get("quoteType") != "EQUITY":
            continue
        name = str(quote.get("longname") or quote.get("shortname") or symbol).strip()
        if symbol not in matches:
            matches[symbol] = {"symbol": symbol, "name": name, "exchange": "VN"}

    def rank(item):
        symbol, entry = item
        ticker = fold(symbol[:-3])
        names = [fold(entry["name"]), fold(entry.get("alias", ""))]
        return (0 if needle == ticker else 1 if ticker.startswith(needle) else 2 if any(name == needle for name in names) else 3 if "alias" in entry and any(name.startswith(needle) for name in names) else 4 if any(name.startswith(needle) for name in names) else 5, symbol)

    return {"query": query, "results": [entry for _, entry in sorted(matches.items(), key=rank)[:12]]}


def search_instruments(raw_query, scope="all"):
    query = raw_query.strip()
    if not 2 <= len(query) <= 60 or any(ord(char) < 32 for char in query):
        raise ValueError("Nhập từ 2 đến 60 ký tự để tìm instrument.")
    if scope not in {"all", "vn", "global", "commodity", "crypto", "bond"}:
        raise ValueError("Nhóm instrument không hợp lệ.")
    needle, matches = fold(query), {}
    def allowed(item):
        is_vn = item["symbol"].endswith(".VN")
        return scope == "all" or (scope == "vn" and is_vn) or (scope == "global" and not is_vn) or (scope == "commodity" and item.get("className") == "Commodity proxy") or (scope == "crypto" and item.get("className") == "Crypto") or (scope == "bond" and item.get("className") == "Bond ETF")
    seeds = [(symbol, name, alias) for symbol, name, alias in POPULAR_STOCKS]
    seeds += [(symbol, info["name"], "") for symbol, info in UNIVERSE.items() if symbol not in {"VN30.VN", "VNINDEX.VN"}]
    seeds += [(symbol, info["name"], info["group"]) for symbol, info in CATALOG.items()]
    for symbol, name, alias in seeds:
        item = {"symbol": symbol, "name": name, "exchange": UNIVERSE.get(symbol, {}).get("exchange", "USD" if not symbol.endswith(".VN") else "VN"), **CATALOG.get(symbol, {})}
        if symbol.endswith(".VN"):
            item.update(currency="VND", className="ETF" if symbol.startswith(("FUE", "E1")) else "Equity")
        if allowed(item) and any(needle in fold(value) for value in (symbol, name, alias)):
            matches[symbol] = item
    try:
        quotes = yf.Search(fold(query), max_results=50, news_count=0, timeout=8).quotes
    except Exception as exc:
        can_lookup_vn = scope == 'vn' and query == query.upper() and re.fullmatch(r'[A-Z0-9]{2,10}(?:\.VN)?',query)
        if not matches and not can_lookup_vn:
            raise RuntimeError("Nguồn tìm kiếm chưa phản hồi. Hãy thử lại.") from exc
        quotes = []
    for quote in quotes:
        symbol, kind = str(quote.get("symbol", "")).upper(), quote.get("quoteType")
        if not SYMBOL_RE.fullmatch(symbol) or kind not in {"EQUITY", "ETF", "MUTUALFUND", "CRYPTOCURRENCY"}:
            continue
        name = str(quote.get("longname") or quote.get("shortname") or symbol)
        if re.search(r"\b([2-5]x|leveraged|inverse|ultra\w*)\b|proshares.*\bshort\b", name, re.I):
            continue
        is_vn = symbol.endswith(".VN")
        item = {"symbol": symbol, "name": name, "exchange": quote.get("exchDisp") or quote.get("exchange") or "Yahoo", "className": {"EQUITY":"Equity", "ETF":"ETF", "MUTUALFUND":"Mutual fund", "CRYPTOCURRENCY":"Crypto"}[kind], "currency": "VND" if is_vn else quote.get("currency"), **CATALOG.get(symbol, {})}
        if allowed(item) and symbol not in matches:
            matches[symbol] = item
    if scope == 'vn' and (query == query.upper() or query.upper().endswith('.VN')) and re.fullmatch(r'[A-Za-z0-9]{2,10}(?:\.VN)?', query, re.I):
        candidate=query.upper() if query.upper().endswith('.VN') else query.upper()+'.VN'
        if candidate not in matches and candidate not in {'VN30.VN','VNINDEX.VN'}:
            matches[candidate]={'symbol':candidate,'name':'Tra cứu ticker trên TradingView (chưa xác minh mã/sàn/giá)','exchange':'HOSE/HNX/UPCOM','currency':'VND','unverified':True}
    return {"query": query, "results": sorted(matches.values(), key=lambda item: (0 if needle == fold(item["symbol"]) or needle == fold(item["symbol"].removesuffix(".VN")) else 1, item["symbol"]))[:30], "notice": "Kết quả tìm kiếm chưa xác nhận lịch sử giá hoặc currency. VN dùng tvdatafeed; instrument quốc tế phải xác minh USD khi phân tích."}
