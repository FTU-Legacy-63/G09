"""Ticker/name search boundary tests; price lookup is tested separately."""

import unittest
from unittest.mock import patch

from symbol_search import search_stocks


class SymbolSearchTests(unittest.TestCase):
    def test_vietnamese_name_matches_alias_without_diacritics(self):
        with patch("symbol_search.yf.Search") as search:
            search.return_value.quotes = []
            result = search_stocks("Hòa Phát")
        self.assertEqual(result["results"][0]["symbol"], "HPG.VN")
        self.assertEqual(search.call_args.args[0], "hoa phat")

    def test_exact_company_name_ranks_ahead_of_related_names(self):
        with patch("symbol_search.yf.Search") as search:
            search.return_value.quotes = [
                {"symbol": "HPA.VN", "quoteType": "EQUITY", "shortname": "HOA PHAT AGRICULTURE"},
                {"symbol": "HPG.VN", "quoteType": "EQUITY", "shortname": "HOA PHAT GROUP"},
            ]
            result = search_stocks("Hòa Phát")
        self.assertEqual(result["results"][0]["symbol"], "HPG.VN")

    def test_brand_name_matches_when_yahoo_name_search_does_not(self):
        with patch("symbol_search.yf.Search") as search:
            search.return_value.quotes = []
            result = search_stocks("Vietcombank")
        self.assertEqual([item["symbol"] for item in result["results"]], ["VCB.VN"])

    def test_only_vietnamese_equities_are_returned(self):
        quotes = [
            {"symbol": "FPT.VN", "quoteType": "EQUITY", "longname": "FPT Corporation"},
            {"symbol": "FPTE", "quoteType": "EQUITY", "shortname": "Foreign stock"},
            {"symbol": "E1VFVN30.VN", "quoteType": "ETF", "shortname": "VN ETF"},
        ]
        with patch("symbol_search.yf.Search") as search:
            search.return_value.quotes = quotes
            result = search_stocks("FPT")
        self.assertIn("FPT.VN", [item["symbol"] for item in result["results"]])
        self.assertNotIn("FPTE", [item["symbol"] for item in result["results"]])
        self.assertNotIn("E1VFVN30.VN", [item["symbol"] for item in result["results"]])

    def test_invalid_query_is_rejected_before_provider(self):
        with patch("symbol_search.yf.Search") as search:
            with self.assertRaisesRegex(ValueError, "2 đến 60"):
                search_stocks("F")
        search.assert_not_called()

    def test_provider_error_keeps_alias_but_not_unknown_name(self):
        with patch("symbol_search.yf.Search", side_effect=RuntimeError("provider down")):
            self.assertEqual(search_stocks("Vinamilk")["results"][0]["symbol"], "VNM.VN")
            with self.assertRaisesRegex(RuntimeError, "thử lại"):
                search_stocks("khong co ten nay")


if __name__ == "__main__":
    unittest.main()
