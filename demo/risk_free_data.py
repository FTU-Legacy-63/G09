"""HNX Vietnam government-bond yield quote with a quiet 3% default fallback."""

import math
from datetime import date, datetime, timedelta
from html.parser import HTMLParser
from zoneinfo import ZoneInfo

RISK_FREE_FALLBACK_PERCENT = 3.0
HNX_YIELD_CURVE_URL = "https://hnx.vn/ModuleReportBonds/Bond_YieldCurve/GetYieldCurveData"


class _HnxYieldCurveParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.rows = []
        self.settlement_date = None
        self._row = None
        self._cell = None

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "input" and attributes.get("id") == "txtDateYC":
            self.settlement_date = attributes.get("value")
        elif tag == "tr":
            self._row = []
        elif tag in {"th", "td"} and self._row is not None:
            self._cell = []

    def handle_data(self, data):
        if self._cell is not None:
            self._cell.append(data)

    def handle_endtag(self, tag):
        if tag in {"th", "td"} and self._cell is not None:
            self._row.append(" ".join("".join(self._cell).split()))
            self._cell = None
        elif tag == "tr" and self._row is not None:
            self.rows.append(self._row)
            self._row = None


def parse_hnx_risk_free(html, today=None):
    parser = _HnxYieldCurveParser()
    parser.feed(html)
    headers = next((row for row in parser.rows if any("par yield" in cell.casefold() for cell in row)), None)
    if not headers or not parser.settlement_date:
        raise ValueError("HNX response is missing the par-yield table or settlement date.")
    yield_index = next(index for index, cell in enumerate(headers) if "par yield" in cell.casefold())
    quote_row = next((row for row in parser.rows if row and row[0].strip().casefold() in {"10 năm", "10 years"}), None)
    if not quote_row or len(quote_row) <= yield_index:
        raise ValueError("HNX response is missing the 10-year par yield.")
    try:
        settlement = datetime.strptime(parser.settlement_date, "%d/%m/%Y").date()
        percent = float(quote_row[yield_index].replace(",", "."))
    except (TypeError, ValueError) as exc:
        raise ValueError("HNX 10-year yield or settlement date is invalid.") from exc
    local_today = today or datetime.now(ZoneInfo("Asia/Ho_Chi_Minh")).date()
    if not math.isfinite(percent) or not -10 <= percent <= 50:
        raise ValueError("HNX 10-year par yield is outside the accepted range.")
    if settlement < local_today - timedelta(days=7) or settlement > local_today + timedelta(days=1):
        raise ValueError("HNX settlement date is stale or in the future.")
    return {
        "annual": percent / 100,
        "percent": percent,
        "source": f"HNX · lợi suất par trái phiếu Chính phủ Việt Nam 10 năm · {settlement.isoformat()}",
        "observedAt": settlement.isoformat(),
        "mode": "default",
    }


def fetch_risk_free_rate():
    default = {
        "annual": RISK_FREE_FALLBACK_PERCENT / 100,
        "percent": RISK_FREE_FALLBACK_PERCENT,
        "source": "Finfolio default rate (3%/year)",
        "observedAt": None,
        "mode": "default",
    }
    try:
        import requests

        response = requests.post(
            HNX_YIELD_CURVE_URL,
            data={},
            headers={"User-Agent": "Finfolio/2.0", "Referer": "https://hnx.vn/en-gb/trai-phieu/duong-cong-loi-suat.html?site=in"},
            timeout=12,
        )
        response.raise_for_status()
        return parse_hnx_risk_free(response.text)
    except Exception:
        return default