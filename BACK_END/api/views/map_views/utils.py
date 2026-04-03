
import math
import urllib.request
from django.core.cache import cache

def haversine(lat1, lon1, lat2, lon2):
    """Calculate distance in KM between two points."""
    R = 6371
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat / 2) * math.sin(dLat / 2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon / 2) * math.sin(dLon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def get_wms_image(wms_url, cache_key=None):
    """Unified helper to fetch and cache WMS images with robust error handling."""
    if cache_key:
        cached = cache.get(cache_key)
        if cached: return cached, 'image/png'

    try:
        req = urllib.request.Request(wms_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response:
            img_data = response.read()
            content_type = response.info().get_content_type()
            
            # Basic validation: if it's XML (error) or too small (blank)
            if b'<?xml' in img_data[:100] or len(img_data) < 1000:
                return None, None
                
            if cache_key:
                cache.set(cache_key, img_data, 86400)
            return img_data, content_type
    except Exception as e:
        print(f"DEBUG: WMS helper failed for {wms_url[:80]}: {str(e)}")
        return None, None
