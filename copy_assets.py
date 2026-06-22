import os
import shutil
import urllib.request
import json

def copy_and_download():
    # Define paths
    bellamo_dir = os.path.dirname(os.path.abspath(__file__))
    thumbnails_dir = os.path.join(bellamo_dir, "assets", "thumbnails")
    
    # 1. Create thumbnails directory if not exists
    os.makedirs(thumbnails_dir, exist_ok=True)
    print(f"Created/verified directory: {thumbnails_dir}")
    
    # 2. Files to copy
    # Go up one level from Bellamo to WORK directory
    work_dir = os.path.dirname(bellamo_dir)
    
    to_copy = [
        (os.path.join(work_dir, "Moh", "assets", "thumbnails", "thumb_ZSmYqyRFw.jpg"), "thumb_ZSmYqyRFw.jpg"),
        (os.path.join(work_dir, "Moh", "assets", "thumbnails", "thumb_ZSx2BBGY1.jpg"), "thumb_ZSx2BBGY1.jpg"),
        (os.path.join(work_dir, "Moh", "assets", "thumbnails", "thumb_ZSx2B2XWW.jpg"), "thumb_ZSx2B2XWW.jpg"),
        (os.path.join(work_dir, "Bellanawit", "thumbnails", "thumb_16.jpg"), "thumb_16.jpg"),
        (os.path.join(work_dir, "Bellanawit", "thumbnails", "thumb_new_3.jpg"), "thumb_new_3.jpg")
    ]
    
    for src, dest_name in to_copy:
        dest = os.path.join(thumbnails_dir, dest_name)
        try:
            if os.path.exists(src):
                shutil.copy2(src, dest)
                print(f"Copied: {src} -> {dest}")
            else:
                print(f"Source file not found: {src}")
        except Exception as e:
            print(f"Error copying {src}: {e}")
            
    # 3. Download thumbnail for new TikTok
    new_tiktok_url = "https://vt.tiktok.com/ZSCJQd5t1/"
    oembed_url = f"https://www.tiktok.com/oembed?url={new_tiktok_url}"
    dest_new_thumb = os.path.join(thumbnails_dir, "thumb_ZSCJQd5t1.jpg")
    
    print(f"Fetching oEmbed data for: {new_tiktok_url}")
    try:
        req = urllib.request.Request(oembed_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            thumb_url = data.get("thumbnail_url")
            
            if thumb_url:
                print(f"Downloading thumbnail from: {thumb_url}")
                img_req = urllib.request.Request(thumb_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(img_req) as img_response, open(dest_new_thumb, 'wb') as out_file:
                    out_file.write(img_response.read())
                print(f"Successfully downloaded and saved: {dest_new_thumb}")
            else:
                print("No thumbnail_url in oEmbed response.")
    except Exception as e:
        print(f"Error downloading TikTok thumbnail: {e}")

if __name__ == "__main__":
    copy_and_download()
