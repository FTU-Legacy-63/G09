"""Hybrid provider routing and validated daily snapshots."""
import unittest
from datetime import datetime, timezone
from unittest.mock import patch
import pandas as pd
import server
import vn_data


def entry():
    return {"source": "TradingView via tvdatafeed", "exchange": "HOSE", "adjustment": "splits", "fetched_at_utc": datetime.now(timezone.utc).isoformat(), "prices": [[f"2026-09-{day}", 100 + day] for day in range(21, 26)]}


class HybridTests(unittest.TestCase):
    def test_vn_only_never_downloads_yahoo(self):
        with patch("server.get_vn_series", side_effect=lambda symbol: (entry(), "daily_snapshot")), patch("server.yf.download") as yahoo:
            result = server.fetch_market_data("2026-09-21", "2026-09-25", ["VIC", "FRT"])
        yahoo.assert_not_called()
        self.assertEqual(len(result["rows"]), 15)
        self.assertEqual(result["benchmark"], "VN30.VN")
        self.assertEqual(result["vn_sources"]["VIC.VN"]["last_session"], "2026-09-25")

    def test_hybrid_yahoo_receives_only_commodity_and_fx(self):
        close = pd.DataFrame({"GLD": [200, 201], "VND=X": [26000, 26100]}, index=pd.to_datetime(["2026-09-24", "2026-09-25"]))
        with patch("server.get_vn_series", side_effect=lambda symbol: (entry(), "daily_snapshot")), patch("server.yf.download", return_value=pd.concat({"Close": close}, axis=1)) as yahoo:
            result = server.fetch_market_data("2026-09-21", "2026-09-25", ["VIC", "GLD"])
        self.assertEqual(set(yahoo.call_args.args[0]), {"GLD", "VND=X"})
        self.assertTrue(any(row["symbol"] == "USDVND" for row in result["rows"]))

    def test_benchmark_provider_exception_keeps_vn_portfolio(self):
        with patch("server.get_vn_series", side_effect=lambda symbol: (entry(), "daily_snapshot")), patch("server.yf.download", side_effect=Exception("timeout")):
            result = server.fetch_market_data("2026-09-21", "2026-09-25", ["VIC", "FRT"], "GLD")
        self.assertEqual(len(result["rows"]), 10)
        self.assertIn("benchmark", result["benchmark_notice"])

    def test_essential_commodity_exception_is_controlled(self):
        with patch("server.get_vn_series", side_effect=lambda symbol: (entry(), "daily_snapshot")), patch("server.yf.download", side_effect=Exception("timeout")):
            with self.assertRaises(RuntimeError):
                server.fetch_market_data("2026-09-21", "2026-09-25", ["VIC", "GLD"])

    def test_fresh_snapshot_preserves_actual_timestamp(self):
        cached = entry()
        with patch("vn_data._snapshot", return_value={"series": {"VIC.VN": cached}}), patch("vn_data.fetch_vn_series") as live:
            result, mode = vn_data.get_vn_series("VIC.VN")
        live.assert_not_called()
        self.assertEqual(mode, "daily_snapshot")
        self.assertEqual(result["fetched_at_utc"], cached["fetched_at_utc"])

    def test_corrupt_or_stale_snapshot_loads_provider(self):
        for bad in [dict(entry(), fetched_at_utc="2020-01-01T00:00:00+00:00"), dict(entry(), prices=[["invalid", 1]] * 5), dict(entry(), prices=list(reversed(entry()["prices"]))), dict(entry(), source="unknown")]:
            with self.subTest(bad=bad), patch("vn_data._snapshot", return_value={"series": {"VIC.VN": bad}}), patch("vn_data.fetch_vn_series", return_value=entry()) as live:
                _, mode = vn_data.get_vn_series("VIC.VN")
                self.assertEqual(mode, "on_demand")
                live.assert_called_once()


if __name__ == "__main__":
    unittest.main()
