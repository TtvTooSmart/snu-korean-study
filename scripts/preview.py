# Optional preview adapter. Normal use: python -m http.server 8000
import argparse, http.server
p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=4173);p.add_argument('--host',default='0.0.0.0');a,_=p.parse_known_args()
http.server.ThreadingHTTPServer((a.host,a.port),http.server.SimpleHTTPRequestHandler).serve_forever()
