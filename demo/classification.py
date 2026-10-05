"""Current TradingView company classification, not historical or fund look-through."""
from datetime import datetime, timezone
from functools import lru_cache
import time

import requests


@lru_cache(maxsize=64)
def _scan(market, tickers, day):
    response = requests.post(
        f"https://scanner.tradingview.com/{market}/scan",
        json={"symbols": {"tickers": list(tickers)},
              "columns": ["name", "description", "type", "sector", "industry"],
              "range": [0, len(tickers)]},
        timeout=5,
    )
    response.raise_for_status()
    result = {}
    for row in response.json().get("data", []):
        ticker, fields = row.get("s"), row.get("d", [])
        if ticker not in tickers or len(fields) != 5:
            continue
        result[ticker] = dict(zip(["ticker", "name", "type", "sector", "industry"], fields))
    return result, datetime.now(timezone.utc).isoformat(timespec="seconds")


def company_classifications(vn_exchanges, global_equities):
    """Batch exact VN listings and US USD equities; never guess sector labels."""
    jobs = []
    if vn_exchanges:
        jobs.append(("vietnam", {f"{exchange}:{symbol.removesuffix('.VN')}": symbol
                                 for symbol, exchange in vn_exchanges.items()}))
    if global_equities:
        jobs.append(("america", {f"{exchange}:{symbol}": symbol
                                for symbol in global_equities
                                for exchange in ("NASDAQ", "NYSE", "AMEX", "OTC")}))
    result = {}
    for market, mapping in jobs:
        try:
            rows, fetched = _scan(market, tuple(sorted(mapping)), int(time.time() // 86400))
        except (requests.RequestException, ValueError, TypeError, AttributeError):
            # Classifications are optional: a provider outage must not destroy PnL.
            continue
        for ticker, row in rows.items():
            if row['type'] == 'fund' and market == 'vietnam':
                result[mapping[ticker]] = {'className':'Equity ETF'}
                continue
            if row["type"] != "stock":
                continue
            labels = {key: row[key].strip()[:200] for key in ("sector", "industry")
                      if isinstance(row[key], str) and row[key].strip()}
            if not labels:
                continue
            symbol = mapping[ticker]
            item = {**labels, "classification_source": "TradingView Screener",
                    "classification_as_of": fetched, "classification_listing": ticker}
            if symbol in result and any(result[symbol].get(k) != item.get(k) for k in ("sector", "industry")):
                result[symbol] = {"classification_ambiguous": True}
            elif not result.get(symbol, {}).get("classification_ambiguous"):
                result[symbol] = item
    return result
