import json
from http.server import BaseHTTPRequestHandler
from demo.data_status import data_status


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        body = json.dumps(data_status(), ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)
