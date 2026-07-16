import urllib.request
import json
import os

url = 'https://vt.tiktok.com/ZSXDvSJfA/'
dest_path = r'c:\Users\leula\OneDrive\Desktop\WORK\Bellamo\assets\thumbnails\thumb_ZSXDvSJfA.jpg'

oembed_url = f'https://www.tiktok.com/oembed?url={url}'
print(f'Fetching oEmbed for: {url}')

req = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode('utf-8'))
    thumb_url = data.get('thumbnail_url')
    title = data.get('title', 'TikTok Video')
    print(f'Title: {title}')
    print(f'Thumbnail URL: {thumb_url}')

    if thumb_url:
        img_req = urllib.request.Request(thumb_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(img_req) as img_resp, open(dest_path, 'wb') as out_f:
            out_f.write(img_resp.read())
        print(f'Success: Saved to {dest_path}')
    else:
        print('Error: No thumbnail URL found.')
