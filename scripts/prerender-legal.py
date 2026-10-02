#!/usr/bin/env python3
"""Prerender the legal pages to static HTML.

Why this exists: /terms and /privacy are the two URLs filed with Twilio/TCR for
A2P 10DLC registration. Reviewer tooling does not reliably execute JavaScript,
and the SPA shell is ~1.2 KB of empty <div id="root">. A reviewer fetching the
URL with a plain HTTP client sees no legal text at all -- which is what produced
error 30882 (Terms and Conditions issues) and 30908 (privacy policy can not be
verified) on the first filing.

This renders each page in headless Chrome against the local production server,
then writes the fully-rendered markup to dist/<route>/index.html. Cloudflare
Pages serves that file directly on a hit to the route, ahead of the _redirects
SPA fallback. The original module <script> tags are preserved, so React still
boots and takes over for real users.

Usage: python3 scripts/prerender-legal.py [origin]
       origin defaults to http://127.0.0.1:4200 (the bun prod server)
"""
import os
import sys
import pathlib
from playwright.sync_api import sync_playwright

ORIGIN = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:4200"
DIST = pathlib.Path(__file__).resolve().parent.parent / "packages" / "web" / "dist"

# Every alias gets its own static file, so the reviewer sees real text no matter
# which URL was filed.
ROUTES = [
    "/terms", "/terms-of-service", "/legal", "/sms-terms", "/messaging-terms",
    "/privacy", "/privacy-policy", "/privacy-notice", "/sms-privacy",
]

# Public marketing routes. The brand's registered website (morrishive.com) points
# at this same Pages project, so a human A2P reviewer may land on the homepage
# before ever reaching /terms. Unprerendered it is a ~1.2 KB empty shell, which
# reads as a dead site. "/" writes dist/index.html, which is also the _redirects
# SPA fallback target -- React re-routes on hydration, so deep links still work.
PUBLIC_ROUTES = ["/", "/pricing", "/platform"]

# Must appear in the rendered privacy markup or the carrier check fails.
CARRIER = ("No mobile information is sold or shared with any third party "
           "for marketing or promotional purposes")

failed = 0
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome",
                          args=["--no-sandbox"])
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    for route in ROUTES:
        res = pg.goto(ORIGIN + route, wait_until="networkidle", timeout=60000)
        pg.wait_for_timeout(2500)
        status = res.status if res else 0
        text = pg.inner_text("body")
        html = pg.content()
        if status != 200 or len(text) < 2000:
            print(f"FAIL {route} status={status} chars={len(text)}")
            failed += 1
            continue
        # Flat <route>.html, NOT <route>/index.html. A directory index makes
        # Cloudflare Pages answer the bare URL with a 308 redirect to the
        # trailing-slash form; an HTTP client that does not follow redirects
        # then reads an empty body, which is the exact failure this script
        # exists to prevent.
        out = DIST / (route.lstrip("/") + ".html")
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(html, encoding="utf-8")
        print(f"ok   {route:<18} status={status} chars={len(text):>6} "
              f"html={len(html):>7}B carrierSentence={CARRIER in html}")

    for route in PUBLIC_ROUTES:
        res = pg.goto(ORIGIN + route, wait_until="networkidle", timeout=60000)
        pg.wait_for_timeout(2500)
        status = res.status if res else 0
        text = pg.inner_text("body")
        html = pg.content()
        if status != 200 or len(text) < 1000:
            print(f"FAIL {route} status={status} chars={len(text)}")
            failed += 1
            continue
        name = "index.html" if route == "/" else route.lstrip("/") + ".html"
        out = DIST / name
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(html, encoding="utf-8")
        print(f"ok   {route:<18} status={status} chars={len(text):>6} "
              f"html={len(html):>7}B -> {name}")
    b.close()

if failed:
    print(f"{failed} route(s) failed to prerender")
    sys.exit(1)
