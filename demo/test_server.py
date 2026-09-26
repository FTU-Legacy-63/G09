"""Provider boundary checks for the Week 6 live-data API."""

import unittest
from unittest.mock import patch

import pandas as pd

from server import fetch_market_data


class MarketDataTests(unittest.TestCase):
    def test_live_download_maps_fx_and_reports_fetch_time(self):
        dates = pd.to_datetime(["2026-09-24", "2026-09-25"])
        close = pd.DataFrame(
            {"FPT.VN": [65300, 64700], "GLD": [391.69, 393.41],
             "HPG.VN": [20800, 20650], "VND=X": [26007, 25974]},
            index=dates,
        )
        data = pd.concat({"Close": close}, axis=1)
        with patch("server.yf.download", return_value=data) as download:
            result = fetch_market_data("2026-09-24", "2026-09-25", ["FPT.VN", "HPG.VN", "GLD"])
        self.assertEqual(len(result["rows"]), 8)
        self.assertEqual(result["rows"][-1], {"session_date": "2026-09-25", "symbol": "USDVND", "close": 25974.0})
        self.assertIn("fetched_at_utc", result)
        self.assertFalse(download.call_args.kwargs["auto_adjust"])

    def test_invalid_tickers_rejected_before_provider_call(self):
        with patch("server.yf.download") as download:
            with self.assertRaisesRegex(ValueError, "không trùng lặp"):
                fetch_market_data("2026-09-24", "2026-09-25", ["FPT.VN", "FPT.VN"])
        download.assert_not_called()

    def test_empty_provider_response_never_falls_back(self):
        with patch("server.yf.download", return_value=pd.DataFrame()):
            with self.assertRaisesRegex(RuntimeError, "không trả giá close"):
                fetch_market_data("2026-09-24", "2026-09-25", ["FPT.VN", "GLD"])


if __name__ == "__main__":
    unittest.main()
