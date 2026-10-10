"""Static-site regressions; run with: python3 -m unittest discover -s tests -v."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
PAGES = sorted(ROOT.glob("*.html")) + sorted((ROOT / "projects").glob("*.html"))
PHONE = "+919005564240"
DISPLAY_PHONE = "+91 90055 64240"
WHATSAPP = "https://wa.me/919005564240"


class PageParser(HTMLParser):
    def __init__(self, content):
        super().__init__(convert_charrefs=True)
        self.elements = []
        self.schemas = []
        self._schema = None
        self.feed(content)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.elements.append((tag, attrs))
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self._schema = ""

    def handle_data(self, data):
        if self._schema is not None:
            self._schema += data

    def handle_endtag(self, tag):
        if tag == "script" and self._schema is not None:
            self.schemas.append(json.loads(self._schema))
            self._schema = None


class PortfolioTests(unittest.TestCase):
    def test_all_portfolio_pages_are_covered(self):
        self.assertEqual(len(PAGES), 36)

    def test_correct_phone_and_whatsapp_on_every_page(self):
        for page in PAGES:
            with self.subTest(page=page.relative_to(ROOT)):
                content = page.read_text()
                self.assertNotRegex(content, r"90055\s*54240")
                self.assertIn(DISPLAY_PHONE, content)
                parser = PageParser(content)
                calls = [a["href"] for tag, a in parser.elements
                         if tag == "a" and a.get("href", "").startswith("tel:")]
                chats = [a["href"] for tag, a in parser.elements
                         if tag == "a" and "wa.me/" in a.get("href", "")]
                self.assertTrue(calls)
                self.assertTrue(chats)
                self.assertEqual(set(calls), {"tel:" + PHONE})
                self.assertEqual(set(chats), {WHATSAPP})

    def test_search_engine_phone_is_correct(self):
        person = PageParser((ROOT / "index.html").read_text()).schemas[0]
        self.assertEqual(person["telephone"], PHONE)
        self.assertEqual(person["name"], "Sarim Khan")

    def test_intro_is_shared_and_runs_before_page_content(self):
        for page in PAGES:
            with self.subTest(page=page.relative_to(ROOT)):
                prefix = "../" if page.parent.name == "projects" else ""
                content = page.read_text()
                parser = PageParser(content)
                loaders = [a for tag, a in parser.elements if tag == "script"
                           and a.get("src", "").endswith("/loader.js")]
                self.assertEqual(len(loaders), 1)
                self.assertEqual(loaders[0]["src"], prefix + "assets/js/loader.js")
                self.assertNotIn("defer", loaders[0])
                self.assertNotIn("async", loaders[0])
                self.assertRegex(content, r'<body[^>]*>\s*<script src="' +
                                 re.escape(prefix + "assets/js/loader.js") + r'"></script>')
                self.assertIn('<link rel="stylesheet" href="' + prefix +
                              'assets/css/loader.css">', content)

    def test_local_resources_and_page_links_resolve(self):
        for page in PAGES:
            for tag, attrs in PageParser(page.read_text()).elements:
                for key in ("href", "src", "data-src"):
                    value = attrs.get(key, "")
                    url = urlsplit(value)
                    if not url.path or url.scheme or url.netloc:
                        continue
                    with self.subTest(page=page.relative_to(ROOT), url=value):
                        target = page.parent / unquote(url.path)
                        self.assertTrue(target.is_file(), f"Missing local resource: {target}")

    def test_phone_can_be_copied_without_a_nested_button(self):
        parser = PageParser((ROOT / "contact.html").read_text())
        buttons = [a for tag, a in parser.elements if tag == "button"]
        self.assertTrue(any(a.get("data-copy") == DISPLAY_PHONE for a in buttons))
        self.assertTrue(any(a.get("data-copy") == "sarim.sam786@gmail.com" for a in buttons))

    def test_intro_is_lightweight_and_accessible(self):
        script = (ROOT / "assets/js/loader.js").read_text()
        style = (ROOT / "assets/css/loader.css").read_text()
        self.assertIn("var DURATION = 2000;", script)
        self.assertIn("DURATION - FADE_DURATION", script)
        self.assertIn('pathLength="1"', script)
        self.assertIn("stroke-dashoffset", style)
        self.assertIn("prefers-reduced-motion: reduce", script)
        self.assertIn('role="status"', script)
        self.assertIn('"pagehide"', script)
        self.assertIn('"portfolio:ready"', script)
        self.assertNotIn("sessionStorage", script)
        self.assertNotIn("<img", script)
        self.assertNotIn("fetch(", script)


if __name__ == "__main__":
    unittest.main()
