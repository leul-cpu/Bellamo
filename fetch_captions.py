"""
fetch_captions.py
-----------------
Fetches the real TikTok captions for every portfolio card in index.html
using the TikTok oEmbed API (no API key needed), then patches the
<p> description inside each .card-content block.

Run from the Bellamo folder:
    python fetch_captions.py
"""

import re
import time
import json
import urllib.request
import urllib.parse
import urllib.error
import html as html_module

# ---------------------------------------------------------------------------
# All TikTok links from the portfolio section.
# Key   = short TikTok ID used in the HTML comment to locate the card
# Value = URL to fetch from
# ---------------------------------------------------------------------------
PORTFOLIO_LINKS = [
    # Blen cards
    ("ZS4RHkKR3",    "https://vt.tiktok.com/ZS4RHkKR3/"),
    ("ZSXuDjSJg",    "https://vt.tiktok.com/ZSXuDjSJg/"),
    ("ZSXuD4ntF",    "https://vt.tiktok.com/ZSXuD4ntF/"),
    ("ZSxNFETHb",    "https://vt.tiktok.com/ZSxNFETHb/"),
    ("ZSxNF3poH",    "https://vt.tiktok.com/ZSxNF3poH/"),
    ("ZSxNFcpvU",    "https://vt.tiktok.com/ZSxNFcpvU/"),
    ("ZSXDvSJfA",    "https://vt.tiktok.com/ZSXDvSJfA/"),
    ("ZSCdRLjGx",    "https://vt.tiktok.com/ZSCdRLjGx/"),
    ("ZSxN1ojmp",    "https://vt.tiktok.com/ZSxN1ojmp/"),
    ("ZSH7xSt37",    "https://vt.tiktok.com/ZSH7xSt37/"),
    ("ZSH7xFtYn",    "https://vt.tiktok.com/ZSH7xFtYn/"),
    ("ZSCks3jRY",    "https://vt.tiktok.com/ZSCks3jRY/"),
    ("ZSCJQd5t1",    "https://vt.tiktok.com/ZSCJQd5t1/"),
    # Mohammed cards
    ("Moh_Atlantic", "https://www.tiktok.com/@atlantic.trading/video/7650555374302432520"),
    ("ZSmYVG9yv",    "https://vt.tiktok.com/ZSmYVG9yv/"),
    ("ZSmYVbfnR",    "https://vt.tiktok.com/ZSmYVbfnR/"),
    ("ZSmYqyRFw",    "https://vt.tiktok.com/ZSmYqyRFw/"),
    ("ZSx2BBGY1",    "https://vt.tiktok.com/ZSx2BBGY1/"),
    ("ZSx2B2XWW",    "https://vt.tiktok.com/ZSx2B2XWW/"),
]

OEMBED_BASE = "https://www.tiktok.com/oembed?url={}"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}


def resolve_short_url(short_url: str) -> str:
    """Follow HTTP redirects on a vt.tiktok.com short link."""
    req = urllib.request.Request(short_url, headers=HEADERS)
    try:
        opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler())
        resp = opener.open(req, timeout=12)
        return resp.url
    except Exception:
        return short_url


def fetch_caption(url: str):
    """Call the TikTok oEmbed endpoint and return the 'title' (caption)."""
    encoded = urllib.parse.quote(url, safe="")
    oembed_url = OEMBED_BASE.format(encoded)
    req = urllib.request.Request(oembed_url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("title", "").strip() or None
    except urllib.error.HTTPError as e:
        print(f"    ⚠  HTTP {e.code} — {oembed_url}")
        return None
    except Exception as e:
        print(f"    ⚠  Error: {e}")
        return None


def patch_html(html_text: str, card_id: str, caption: str) -> str:
    """
    Locate the portfolio card by its HTML comment (e.g. <!-- ... ZS4RHkKR3 ... -->)
    and replace the first <p>…</p> inside .card-content with the new caption.
    """
    # Find the HTML comment that marks this card
    comment_pat = re.compile(
        r"(<!--[^>]*?" + re.escape(card_id) + r"[^>]*?-->)",
        re.DOTALL,
    )
    m = comment_pat.search(html_text)
    if not m:
        print(f"    ✗  HTML comment for '{card_id}' not found — skipping patch")
        return html_text

    block_start = m.start()

    # The card ends just before the next portfolio-card div (or end of grid)
    next_card = re.search(r'<div class="portfolio-card', html_text[m.end():])
    block_end = (m.end() + next_card.start()) if next_card else len(html_text)

    card_html = html_text[block_start:block_end]

    # Replace the first <p>…</p> inside card-content
    escaped = html_module.escape(caption)
    new_card_html = re.sub(
        r"(<div class=\"card-content\">[\s\S]*?<p>)([\s\S]*?)(</p>)",
        lambda mo: mo.group(1) + escaped + mo.group(3),
        card_html,
        count=1,
        flags=re.DOTALL,
    )

    return html_text[:block_start] + new_card_html + html_text[block_end:]


def main():
    html_path = "index.html"

    print("📄 Reading index.html …")
    with open(html_path, "r", encoding="utf-8") as f:
        html_text = f.read()

    results = {}
    failed  = []

    for card_id, url in PORTFOLIO_LINKS:
        print(f"\n🔗  [{card_id}]  {url}")

        # Resolve short URL to canonical
        canonical = url
        if "vt.tiktok.com" in url:
            print("     → Resolving short URL …")
            canonical = resolve_short_url(url)
            print(f"     → {canonical}")
            time.sleep(0.6)

        caption = fetch_caption(canonical)

        if caption:
            preview = caption[:90] + ("…" if len(caption) > 90 else "")
            print(f"     ✅ Caption: {preview}")
            results[card_id] = caption
            html_text = patch_html(html_text, card_id, caption)
        else:
            print(f"     ✗  Could not fetch caption — description left unchanged")
            failed.append(card_id)

        time.sleep(1.2)   # polite delay between requests

    # ── Save patched HTML ─────────────────────────────────────────────────
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_text)

    # ── Save JSON summary ─────────────────────────────────────────────────
    with open("captions_fetched.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print(f"✅ Patched {len(results)}/{len(PORTFOLIO_LINKS)} cards in {html_path}")
    if failed:
        print(f"⚠  Failed cards (descriptions unchanged): {', '.join(failed)}")
    print("📁 Caption dump saved to: captions_fetched.json")


if __name__ == "__main__":
    main()
