"""Vercel endpoint for the current Vietnam 10-year government-bond yield."""

import json
from http.server import BaseHTTPRequestHandler

from demo.risk_free_data import fetch_risk_free_rate


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        body = json.dumps(fetch_risk_free_rate(), ensure_ascii=False, allow_nan=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "public, max-age=60")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)