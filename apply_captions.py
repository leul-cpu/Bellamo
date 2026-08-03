"""
apply_captions.py  (v2 - fixed)
---------------------------------
Reads captions_fetched.json and patches index.html by finding each card
via its unique TikTok URL snippet (not the HTML comment, which was fragile).

    python apply_captions.py
"""

import re
import json
import html as html_module

HTML_FILE     = "index.html"
CAPTIONS_FILE = "captions_fetched.json"

# Maps card_id → unique string that appears inside the href of that card's watch-link
URL_SNIPPETS = {
    "ZS4RHkKR3":    "ZS4RHkKR3",
    "ZSXuDjSJg":    "ZSXuDjSJg",
    "ZSXuD4ntF":    "ZSXuD4ntF",
    "ZSxNFETHb":    "ZSxNFETHb",
    "ZSxNF3poH":    "ZSxNF3poH",
    "ZSxNFcpvU":    "ZSxNFcpvU",
    "ZSXDvSJfA":    "ZSXDvSJfA",
    "ZSCdRLjGx":    "ZSCdRLjGx",
    "ZSxN1ojmp":    "ZSxN1ojmp",
    "ZSH7xSt37":    "ZSH7xSt37",
    "ZSH7xFtYn":    "ZSH7xFtYn",
    "ZSCks3jRY":    "ZSCks3jRY",
    "ZSCJQd5t1":    "ZSCJQd5t1",
    "Moh_Atlantic": "7650555374302432520",   # unique video ID in the full URL
    "ZSmYVG9yv":    "ZSmYVG9yv",
    "ZSmYVbfnR":    "ZSmYVbfnR",
    "ZSmYqyRFw":    "ZSmYqyRFw",
    "ZSx2BBGY1":    "ZSx2BBGY1",
    "ZSx2B2XWW":    "ZSx2B2XWW",
}


def patch_card(html_text: str, card_id: str, caption: str) -> str:
    """
    Strategy:
      1. Find the watch-link <a href> that contains the unique URL snippet.
      2. Walk BACKWARDS from there to the start of that portfolio-card div.
      3. Within that card block, replace the first <p>…</p> inside card-content.
    """
    snippet = URL_SNIPPETS.get(card_id)
    if not snippet:
        print(f"  ✗  No URL snippet defined for '{card_id}'")
        return html_text

    # Find the snippet specifically inside an href="..." attribute (skips HTML comments)
    href_needle = f'href="' 
    search_start = 0
    idx = -1
    while True:
        pos = html_text.find(href_needle, search_start)
        if pos == -1:
            break
        end_quote = html_text.find('"', pos + len(href_needle))
        href_val = html_text[pos + len(href_needle):end_quote]
        if snippet in href_val:
            idx = pos
            break
        search_start = end_quote + 1

    if idx == -1:
        print(f"  ✗  URL snippet '{snippet}' not found in any href in HTML")
        return html_text

    # Walk backwards to find the start of the enclosing portfolio-card div
    card_open = html_text.rfind('<div class="portfolio-card', 0, idx)
    if card_open == -1:
        print(f"  ✗  Could not find enclosing portfolio-card for '{card_id}'")
        return html_text

    # Walk forwards to find the end of that card (next portfolio-card or closing grid)
    next_card = html_text.find('<div class="portfolio-card', card_open + 1)
    card_close = next_card if next_card != -1 else len(html_text)

    card_html = html_text[card_open:card_close]

    # Replace the first <p>…</p> inside card-content
    escaped_caption = html_module.escape(caption)

    patched_card, n = re.subn(
        r'(<div class="card-content">[\s\S]*?<p>)([\s\S]*?)(</p>)',
        lambda mo: mo.group(1) + escaped_caption + mo.group(3),
        card_html,
        count=1,
        flags=re.DOTALL,
    )

    if n == 0:
        print(f"  ✗  <p> tag not found in card-content for '{card_id}'")
        return html_text

    return html_text[:card_open] + patched_card + html_text[card_close:]


def main():
    with open(CAPTIONS_FILE, "r", encoding="utf-8") as f:
        captions = json.load(f)

    with open(HTML_FILE, "r", encoding="utf-8") as f:
        html_text = f.read()

    patched_count = 0

    for card_id, caption in captions.items():
        print(f"Patching [{card_id}] …")
        new_html = patch_card(html_text, card_id, caption)
        if new_html != html_text:
            html_text = new_html
            patched_count += 1
            print(f"  ✅ OK")
        else:
            print(f"  ⚠  No change")

    with open(HTML_FILE, "w", encoding="utf-8") as f:
        f.write(html_text)

    print(f"\n✅ Patched {patched_count}/{len(captions)} cards → {HTML_FILE}")


if __name__ == "__main__":
    main()
