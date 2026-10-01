import unittest
from unittest.mock import patch
import global_data
from symbol_search import search_instruments
from server import fetch_market_data
import pandas as pd

class GlobalTests(unittest.TestCase):
    def test_unknown_vn_ticker_can_be_selected_for_explicit_unverified_lookup(self):
        with patch('symbol_search.yf.Search',side_effect=RuntimeError('down')):
            result=search_instruments('ZZZ','vn')
        self.assertTrue(result['results'][0]['unverified'])
        self.assertEqual(result['results'][0]['symbol'],'ZZZ.VN')

    def test_search_exposes_provider_equities_etfs_and_crypto_not_futures(self):
        with patch('symbol_search.yf.Search') as search:
            search.return_value.quotes=[{'symbol':'AMD','quoteType':'EQUITY','longname':'Advanced Micro Devices','currency':'USD'},{'symbol':'BTC-USD','quoteType':'CRYPTOCURRENCY','shortname':'Bitcoin'},{'symbol':'GC=F','quoteType':'FUTURE','shortname':'Gold Futures'},{'symbol':'TQQQ','quoteType':'ETF','shortname':'3x leveraged Nasdaq'}]
            symbols=[x['symbol'] for x in search_instruments('amd','global')['results']]
        self.assertIn('AMD',symbols);self.assertNotIn('GC=F',symbols);self.assertNotIn('TQQQ',symbols)

    def test_vn_etf_and_bond_filter(self):
        with patch('symbol_search.yf.Search') as search:
            search.return_value.quotes=[]
            self.assertEqual(search_instruments('PVI','vn')['results'][0]['symbol'],'PVI.VN')
            self.assertEqual(search_instruments('TLT','bond')['results'][0]['className'],'Bond ETF')
            self.assertEqual(search_instruments('GLD','commodity')['results'][0]['className'],'Commodity proxy')

    def test_unknown_currency_and_derivative_metadata_rejected(self):
        for meta in [{'instrumentType':'EQUITY','currency':'GBP'},{'instrumentType':'FUTURE','currency':'USD'},{'instrumentType':'ETF','currency':'USD','longName':'3x leveraged fund'}]:
            with self.subTest(meta=meta),patch('global_data.yf.Ticker') as ticker:
                ticker.return_value.get_history_metadata.return_value=meta
                global_data._resolve.cache_clear()
                with self.assertRaises(ValueError): global_data.resolve_global('TEST')

    def test_index_is_benchmark_only(self):
        with patch('global_data._resolve',return_value={'className':'Benchmark index','currency':'USD','name':'Index'}):
            with self.assertRaises(ValueError):global_data.resolve_global('^TEST')
            self.assertEqual(global_data.resolve_global('^TEST',benchmark=True)['currency'],'USD')

    def test_multi_asset_prices_all_have_metadata_and_fx(self):
        close=pd.DataFrame({s:[10,11] for s in ['AAPL','TLT','BTC-USD','SPY','VND=X']},index=pd.to_datetime(['2026-09-24','2026-09-25']))
        with patch('server.yf.download',return_value=pd.concat({'Close':close},axis=1)) as download:
            result=fetch_market_data('2026-09-24','2026-09-25',['YF:AAPL','YF:TLT','YF:BTC-USD'],'SPY')
        self.assertEqual(result['instruments']['BTC-USD']['className'],'Crypto')
        self.assertEqual(result['instruments']['TLT']['className'],'Bond ETF')
        self.assertEqual(set(download.call_args.args[0]),{'AAPL','TLT','BTC-USD','SPY','VND=X'})

if __name__=='__main__':unittest.main()
