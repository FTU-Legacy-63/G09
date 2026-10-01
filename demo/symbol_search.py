"""Search Vietnamese equities by ticker or common company name."""

from __future__ import annotations

import re
import unicodedata

import yfinance as yf


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
