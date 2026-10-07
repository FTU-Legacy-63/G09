import json
from http.server import BaseHTTPRequestHandler
from demo.account_config import account_config


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        body = json.dumps(account_config()).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Referrer-Policy", "no-referrer")
        self.end_headers()
        self.wfile.write(body)
