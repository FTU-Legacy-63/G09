"""Vercel Python Function for fresh Finfolio market prices."""

import json
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

from demo.server import fetch_market_data


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = parse_qs(urlparse(self.path).query)
        try:
            result = fetch_market_data(
                query.get("start", [""])[0],
                query.get("end", [""])[0],
                query.get("symbol", []),
                query.get("benchmark", ["VN30.VN"])[0],
            )
            self.send_json(200, result)
        except ValueError as exc:
            self.send_json(400, {"error": str(exc)})
        except RuntimeError as exc:
            self.send_json(502, {"error": str(exc)})

    def send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False, allow_nan=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
