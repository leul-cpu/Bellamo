import urllib.request
import json
import os
import re
import html

# Target Video URLs to fetch
urls = [
    "https://vt.tiktok.com/ZSqpJLfq2/",
    "https://vt.tiktok.com/ZSqgK3QcS/",
    "https://vt.tiktok.com/ZSqgKvPrr/",
    "https://vt.tiktok.com/ZSqgEuRcM/",
    "https://vt.tiktok.com/ZSqgEFbsk/",
    "https://vt.tiktok.com/ZSqgE2RAG/",
    "https://vt.tiktok.com/ZSqgE677N/",
    "https://vt.tiktok.com/ZSqgEyrPy/",
    "https://vt.tiktok.com/ZSqgEYyRM/",
    "https://vt.tiktok.com/ZSqgEy6gj/",
    "https://vt.tiktok.com/ZSqgEfSC7/",
    "https://vt.tiktok.com/ZSqgEFh9d/",
    "https://vt.tiktok.com/ZSqgEvmax/",
]

# Workspace directory
current_dir = os.path.dirname(os.path.abspath(__file__))
if os.path.exists(os.path.join(current_dir, 'index.html')):
    base_dir = current_dir
else:
    base_dir = r"c:\Users\leula\OneDrive\Desktop\WORK\Bellamo"

index_html_path = os.path.join(base_dir, 'index.html')
thumb_dir = os.path.join(base_dir, 'assets', 'thumbnails')
os.makedirs(thumb_dir, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

print(f"Checking {len(urls)} videos for missing thumbnails and metadata...\n")

downloaded_count = 0

for idx, url in enumerate(urls, start=1):
    slug = url.strip().rstrip('/').split('/')[-1].split('?')[0]
    thumb_filename = f"thumb_{slug}.jpg"
    thumb_path = os.path.join(thumb_dir, thumb_filename)

    # If thumbnail already exists on disk, skip downloading
    if os.path.exists(thumb_path) and os.path.getsize(thumb_path) > 1000:
        print(f"[{idx}/{len(urls)}]  Thumbnail already present: {thumb_filename}")
        continue

    print(f"[{idx}/{len(urls)}] ▶️  Fetching thumbnail & metadata for: {slug} ({url})...")
    api_url = f"https://www.tiktok.com/oembed?url={url}"

    try:
        req = urllib.request.Request(api_url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            data = json.loads(response.read().decode('utf-8'))

        title = data.get('title', '')
        author_name = data.get('author_name', '')
        thumb_url = data.get('thumbnail_url', '')

        if thumb_url:
            try:
                img_req = urllib.request.Request(thumb_url, headers=headers)
                with urllib.request.urlopen(img_req, timeout=20) as img_resp:
                    with open(thumb_path, 'wb') as f:
                        f.write(img_resp.read())
                print(f"     ✓ Successfully saved thumbnail: {thumb_filename} ({os.path.getsize(thumb_path):,} bytes)")
                downloaded_count += 1
            except Exception as e:
                print(f"     ✗ Thumbnail download failed: {e}")
        else:
            print("     ! No thumbnail URL found in oEmbed")

    except Exception as e:
        print(f"     ✗ Error querying oEmbed for {url}: {e}")

print(f"\nDone! Newly downloaded: {downloaded_count} thumbnail(s).")
