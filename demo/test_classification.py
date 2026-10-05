import unittest
from unittest.mock import patch
import requests
from classification import company_classifications, _scan


class ClassificationTests(unittest.TestCase):
    def setUp(self):
        _scan.cache_clear()

    def test_exact_listing_fields_and_non_stock_exclusion(self):
        with patch('classification.requests.post') as post:
            post.return_value.json.return_value={'data':[
                {'s':'HOSE:FPT','d':['FPT','FPT','stock','Technology Services','Information Technology Services']},
                {'s':'HOSE:E1VFVN30','d':['E1VFVN30','ETF','fund','Miscellaneous','Funds']},
                {'s':'HOSE:OTHER','d':['OTHER','OTHER','stock','Bad','Bad']},
            ]}
            result=company_classifications({'FPT.VN':'HOSE','E1VFVN30.VN':'HOSE'},[])
        self.assertEqual(result['FPT.VN']['sector'],'Technology Services')
        self.assertEqual(result['FPT.VN']['industry'],'Information Technology Services')
        self.assertEqual(result['FPT.VN']['classification_listing'],'HOSE:FPT')
        self.assertEqual(result['E1VFVN30.VN']['className'],'Equity ETF')
        self.assertNotIn('sector',result['E1VFVN30.VN'])
        self.assertNotIn('OTHER.VN',result)

    def test_provider_failure_is_optional_and_not_cached(self):
        with patch('classification.requests.post',side_effect=requests.Timeout()):
            self.assertEqual(company_classifications({'FPT.VN':'HOSE'},[]),{})
        self.assertEqual(_scan.cache_info().currsize,0)

    def test_null_labels_and_conflicting_listings_do_not_invent_classification(self):
        with patch('classification.requests.post') as post:
            post.return_value.json.return_value={'data':[
                {'s':'NASDAQ:AMD','d':['AMD','AMD','stock','Electronic Technology','Semiconductors']},
                {'s':'NYSE:AMD','d':['AMD','Other','stock','Finance','Insurance']},
                {'s':'NASDAQ:MSFT','d':['MSFT','MSFT','stock',None,None]},
            ]}
            result=company_classifications({},['AMD','MSFT'])
        self.assertTrue(result['AMD']['classification_ambiguous'])
        self.assertNotIn('MSFT',result)
