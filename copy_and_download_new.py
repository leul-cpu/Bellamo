import os
import shutil
import urllib.request
import json

def run():
    bellamo_dir = r"c:\Users\leula\OneDrive\Desktop\WORK\Bellamo"
    thumbnails_dir = os.path.join(bellamo_dir, "assets", "thumbnails")
    os.makedirs(thumbnails_dir, exist_ok=True)
    
    print("--- 1. Copying local thumbnails from Bellanawit and Moh folders ---")
    
    copies = [
        # Bellanawit thumbnails
        (r"c:\Users\leula\OneDrive\Desktop\WORK\Bellanawit\thumbnails\thumb_new_2.jpg", "thumb_new_2.jpg"),
        (r"c:\Users\leula\OneDrive\Desktop\WORK\Bellanawit\thumbnails\thumb_15.jpg", "thumb_15.jpg"),
        (r"c:\Users\leula\OneDrive\Desktop\WORK\Bellanawit\thumbnails\thumb_10.jpg", "thumb_10.jpg"),
        (r"c:\Users\leula\OneDrive\Desktop\WORK\Bellanawit\thumbnails\thumb_9.jpg", "thumb_9.jpg"),
        
        # Moh thumbnails
        (r"c:\Users\leula\OneDrive\Desktop\WORK\Moh\assets\thumbnails\thumb_ZSmYVbfnR.jpg", "thumb_ZSmYVbfnR.jpg"),
        (r"c:\Users\leula\OneDrive\Desktop\WORK\Moh\assets\thumbnails\thumb_ZSmYVG9yv.jpg", "thumb_ZSmYVG9yv.jpg")
    ]
    
    for src, dest_name in copies:
        dest = os.path.join(thumbnails_dir, dest_name)
        if os.path.exists(src):
            try:
                shutil.copy2(src, dest)
                print(f"Success: Copied {os.path.basename(src)} -> {dest_name}")
            except Exception as e:
                print(f"Error copying {src}: {e}")
        else:
            print(f"Warning: Source file not found: {src}")
            
    print("\n--- 2. Downloading thumbnails for the two new TikTok links ---")
    
    downloads = [
        ("https://vt.tiktok.com/ZSCdRLjGx/", "thumb_ZSCdRLjGx.jpg"),
        ("https://www.tiktok.com/@atlantic.trading/video/7650555374302432520", "thumb_Moh_Atlantic.jpg")
    ]
    
    for url, dest_name in downloads:
        dest_path = os.path.join(thumbnails_dir, dest_name)
        oembed_url = f"https://www.tiktok.com/oembed?url={url}"
        print(f"Fetching oEmbed for: {url}")
        try:
            req = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode('utf-8'))
                thumb_url = data.get("thumbnail_url")
                title = data.get("title", "TikTok Video")
                print(f"Title: {title}")
                print(f"Thumbnail URL: {thumb_url}")
                
                if thumb_url:
                    img_req = urllib.request.Request(thumb_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(img_req) as img_resp, open(dest_path, 'wb') as out_f:
                        out_f.write(img_resp.read())
                    print(f"Success: Downloaded and saved -> {dest_name}\n")
                else:
                    print("Error: No thumbnail URL found in oEmbed data.\n")
        except Exception as e:
            print(f"Error downloading for {url}: {e}\n")

if __name__ == "__main__":
    run()
