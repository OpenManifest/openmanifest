"""Serve a static web export with index.html fallback (SPA). Usage: python3 scripts/serve-web-build.py <dir> <port>"""
import http.server, os, sys
ROOT, PORT = sys.argv[1], int(sys.argv[2])
class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def send_head(self):
        if not os.path.exists(self.translate_path(self.path)): self.path = "/index.html"
        return super().send_head()
http.server.ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
