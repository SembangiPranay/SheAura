import urllib.request
import ssl
from bs4 import BeautifulSoup
import json
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

with open('scratch_sheaura_products.json', 'r', encoding='utf-8') as f:
    api_products = json.load(f)

scraped_catalog = []

for p in api_products:
    slug = p.get('slug')
    name = p.get('name')
    url = f"https://sheaura.shop/product/{slug}/"
    
    product_data = {
        "id": p.get('id'),
        "name": name,
        "slug": slug,
        "permalink": url,
        "categories": [c.get('name') for c in p.get('categories', [])],
        "prices": p.get('prices', {}),
        "api_short_description": p.get('short_description', ''),
        "api_images": [img.get('src') for img in p.get('images', [])],
        "tabs": {},
        "attributes": {},
        "additional_images": []
    }
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=12) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            soup = BeautifulSoup(html, 'html.parser')
            
            # Extract tabs
            tabs = soup.find_all(class_='woocommerce-Tabs-panel')
            for t in tabs:
                t_id = t.get('id', 'tab')
                product_data["tabs"][t_id] = t.get_text(separator='\n').strip()
                
            # Extract any attribute table
            attr_table = soup.find(class_='woocommerce-product-attributes')
            if attr_table:
                rows = attr_table.find_all('tr')
                for r in rows:
                    th = r.find('th')
                    td = r.find('td')
                    if th and td:
                        product_data["attributes"][th.get_text(strip=True)] = td.get_text(strip=True)
                        
            # Extract all gallery images from HTML
            for img in soup.find_all('img'):
                src = img.get('src') or img.get('data-src') or img.get('data-large_image')
                if src and 'wp-content/uploads' in src and src not in product_data["additional_images"]:
                    product_data["additional_images"].append(src)
                    
            print(f"Scraped {slug}: {len(product_data['tabs'])} tabs, {len(product_data['attributes'])} attrs, {len(product_data['additional_images'])} images")
    except Exception as e:
        print(f"Failed {slug}: {e}")
        
    scraped_catalog.append(product_data)

with open('data_sheaura_shop_full.json', 'w', encoding='utf-8') as f:
    json.dump(scraped_catalog, f, indent=2, ensure_ascii=False)

print(f"Successfully scraped and saved {len(scraped_catalog)} products to data_sheaura_shop_full.json")
