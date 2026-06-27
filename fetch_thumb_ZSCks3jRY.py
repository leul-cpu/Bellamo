import urllib.request
import json
import ssl
import os

ssl._create_default_https_context = ssl._create_unverified_context

url = 'https://vt.tiktok.com/ZSCks3jRY/'
dest = r'assets\thumbnails\thumb_ZSCks3jRY.jpg'

os.makedirs('assets/thumbnails', exist_ok=True)

# Step 1: Follow redirect to get real URL
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
})
res = urllib.request.urlopen(req, timeout=15)
real_url = res.url.split('?')[0]
print('Real URL:', real_url)

# Step 2: Fetch oEmbed
oembed_url = 'https://www.tiktok.com/oembed?url=' + real_url
req2 = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
res2 = urllib.request.urlopen(req2, timeout=15)
data = json.loads(res2.read().decode())
thumb_url = data.get('thumbnail_url', '')
title = data.get('title', 'N/A')
print('Title:', title)
print('Thumbnail URL:', thumb_url[:100] if thumb_url else 'None')

# Step 3: Download thumbnail
if thumb_url:
    img_req = urllib.request.Request(thumb_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(img_req, timeout=15) as r, open(dest, 'wb') as f:
        f.write(r.read())
    print('Saved to:', dest)
else:
    print('No thumbnail found!')
