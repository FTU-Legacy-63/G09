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
            with self.assertRaisesRegex(ValueError, "trùng lặp"):
                fetch_market_data("2026-09-24", "2026-09-25", ["FPT.VN", "FPT.VN"])
        download.assert_not_called()

    def test_empty_provider_response_never_falls_back(self):
        with patch("server.yf.download", return_value=pd.DataFrame()):
            with self.assertRaisesRegex(RuntimeError, "không trả giá close"):
                fetch_market_data("2026-09-24", "2026-09-25", ["FPT.VN", "GLD"])

    def test_custom_vietnam_stocks_and_selected_benchmark(self):
        dates = pd.to_datetime(["2026-09-24", "2026-09-25"])
        close = pd.DataFrame(
            {"VCB.VN": [60000, 60100], "HPG.VN": [20800, 20650], "E1VFVN30.VN": [28000, 28100]},
            index=dates,
        )
        with patch("server.yf.download", return_value=pd.concat({"Close": close}, axis=1)) as download:
            result = fetch_market_data("2026-09-24", "2026-09-25", ["VCB", "HPG.VN"], "E1VFVN30.VN")
        self.assertEqual(result["benchmark"], "E1VFVN30.VN")
        self.assertEqual(set(download.call_args.args[0]), {"VCB.VN", "HPG.VN", "E1VFVN30.VN"})
        self.assertNotIn("VND=X", result["requested_symbols"])

    def test_missing_user_stock_returns_error(self):
        dates = pd.to_datetime(["2026-09-24", "2026-09-25"])
        close = pd.DataFrame({"PVI.VN": [float("nan"), float("nan")], "GLD": [390, 391], "VND=X": [26000, 26000]}, index=dates)
        with patch("server.yf.download", return_value=pd.concat({"Close": close}, axis=1)):
            with self.assertRaisesRegex(RuntimeError, "PVI.VN"):
                fetch_market_data("2026-09-24", "2026-09-25", ["PVI", "GLD"])


if __name__ == "__main__":
    unittest.main()
