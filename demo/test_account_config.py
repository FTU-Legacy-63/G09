import os
import unittest
from unittest.mock import patch
from account_config import account_config


class AccountConfigTests(unittest.TestCase):
    def test_only_publishable_key_is_exposed(self):
        with patch.dict(os.environ, {"VERCEL":"1","SUPABASE_URL":"https://abcdefghijklmnopqrst.supabase.co","SUPABASE_PUBLISHABLE_KEY":"sb_publishable_test","SUPABASE_SERVICE_ROLE_KEY":"secret-admin"}, clear=True):
            config = account_config()
            self.assertTrue(config["configured"])
            self.assertNotIn("secret-admin", str(config))

    def test_admin_key_or_invalid_url_cannot_be_published(self):
        for url,key in [("https://abcdefghijklmnopqrst.supabase.co","sb_secret_test"),("https://evil.example","sb_publishable_test")]:
            with patch.dict(os.environ, {"VERCEL":"1","SUPABASE_URL":url,"SUPABASE_PUBLISHABLE_KEY":key}, clear=True):
                self.assertEqual(account_config(), {"configured":False})

    def test_fresh_clone_without_config_has_no_account(self):
        with patch.dict(os.environ, {"VERCEL":"1"}, clear=True):
            self.assertEqual(account_config(), {"configured":False})
