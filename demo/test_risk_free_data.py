import unittest
from datetime import date
from unittest.mock import patch

from risk_free_data import fetch_risk_free_rate, parse_hnx_risk_free


class RiskFreeDataTests(unittest.TestCase):
    def test_hnx_uses_10_year_par_yield_not_spot_rates(self):
        html = '''<input id="txtDateYC" value="26/10/2026" />
        <table><tr><th>Kỳ hạn còn lại</th><th>Spot rate liên tục (%)</th><th>Par yield (%)</th><th>Spot rate theo năm (%)</th></tr>
        <tr><td>10 năm</td><td>4,4318870317</td><td>4,48819581584828</td><td>4,53156218749526</td></tr></table>'''
        quote = parse_hnx_risk_free(html, today=date(2026, 10, 26))
        self.assertAlmostEqual(quote["annual"], 0.0448819581584828)
        self.assertEqual(quote["observedAt"], "2026-10-26")
        self.assertIn("HNX", quote["source"])

    def test_hnx_rejects_stale_or_unlabelled_quotes(self):
        html = '''<input id="txtDateYC" value="01/10/2026" />
        <table><tr><th>Tenor</th><th>Par yield (%)</th></tr><tr><td>10 years</td><td>4.5</td></tr></table>'''
        with self.assertRaisesRegex(ValueError, "stale"):
            parse_hnx_risk_free(html, today=date(2026, 10, 26))
        with self.assertRaisesRegex(ValueError, "missing"):
            parse_hnx_risk_free('<input id="txtDateYC" value="26/10/2026" />', today=date(2026, 10, 26))

    def test_provider_failure_uses_neutral_finfolio_default(self):
        with patch("requests.post", side_effect=RuntimeError("provider unavailable")):
            quote = fetch_risk_free_rate()
        self.assertEqual(quote["annual"], 0.03)
        self.assertEqual(quote["percent"], 3.0)
        self.assertNotIn("fallback", quote["source"].casefold())


if __name__ == "__main__":
    unittest.main()