import urllib.request
import json
import os

videos = [
    {
        'url': 'https://vt.tiktok.com/ZSXuDjSJg/',
        'dest_path': r'c:\Users\leula\OneDrive\Desktop\WORK\Bellamo\assets\thumbnails\thumb_ZSXuDjSJg.jpg'
    },
    {
        'url': 'https://vt.tiktok.com/ZSXuD4ntF/',
        'dest_path': r'c:\Users\leula\OneDrive\Desktop\WORK\Bellamo\assets\thumbnails\thumb_ZSXuD4ntF.jpg'
    }
]

for video in videos:
    url = video['url']
    dest_path = video['dest_path']
    
    oembed_url = f'https://www.tiktok.com/oembed?url={url}'
    print(f'\nFetching oEmbed for: {url}')

    req = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
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
    except Exception as e:
        print(f"Error fetching data for {url}: {e}")
