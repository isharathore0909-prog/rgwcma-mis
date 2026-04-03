import numpy as np
from PIL import Image, ImageDraw
import io
import base64

def generate_contour_map(points, bounds, width=600, height=500, p=2.0, buckets=None, show_labels=False, high_density=False):

    if not points:
        return None

    pts_x = np.array([p['x'] for p in points])
    pts_y = np.array([p['y'] for p in points])
    pts_v = np.array([p['v'] for p in points])

    x = np.linspace(0, width, width)
    y = np.linspace(0, height, height)
    X, Y = np.meshgrid(x, y)

    def idw_vectorized(x_pts, y_pts, v_pts, grid_x, grid_y, p_pow):
        gx = grid_x.ravel()
        gy = grid_y.ravel()
        chunk_size = 50000
        result = np.zeros(gx.shape)
        for i in range(0, len(gx), chunk_size):
            cx = gx[i:i+chunk_size, np.newaxis]
            cy = gy[i:i+chunk_size, np.newaxis]
            d2 = (cx - x_pts)**2 + (cy - y_pts)**2
            d2[d2 < 1e-12] = 1e-12
            w = 1.0 / (d2**(p_pow/2.0))
            w_sum = np.sum(w, axis=1)
            result[i:i+chunk_size] = np.sum(w * v_pts, axis=1) / w_sum
        return result.reshape(grid_x.shape)

    grid = idw_vectorized(pts_x, pts_y, pts_v, X, Y, p)
    
    # DEBUG LOG
    print(f"DEBUG: Grid Range: {np.min(grid):.2f} to {np.max(grid):.2f}, Data Pts Range: {np.min(pts_v):.2f} to {np.max(pts_v):.2f}")

    g_min = float(np.min(grid)) if grid.size > 0 else 0.0
    g_max = float(np.max(grid)) if grid.size > 0 else 10.0
    
    if g_min == g_max:
        g_max = g_min + 1.0
    
    target_lines = 20 if high_density else 8
    raw_step = (g_max - g_min) / target_lines if g_max > g_min else 1.0
    
    if raw_step <= 0:
        raw_step = 1.0
        
    magnitude = 10 ** np.floor(np.log10(raw_step))
    norm_step = raw_step / magnitude
    
    if norm_step < 1.5:
        nice_step = 1.0
    elif norm_step < 3:
        nice_step = 2.0
    elif norm_step < 7.5:
        nice_step = 5.0
    else:
        nice_step = 10.0
        
    actual_step = nice_step * magnitude
    if actual_step < 0.1:
        actual_step = 0.1
        
    def get_line_idx(v):
        return np.floor(v / actual_step)

    line_indices = get_line_idx(grid)
    lines_x = np.zeros_like(grid, dtype=bool)
    lines_y = np.zeros_like(grid, dtype=bool)
    lines_x[:, 1:] = line_indices[:, 1:] != line_indices[:, :-1]
    lines_y[1:, :] = line_indices[1:, :] != line_indices[:-1, :]
    is_line_grid = lines_x | lines_y

    data = np.zeros((height, width, 4), dtype=np.uint8)
    if buckets:
        for i in range(len(buckets)):
            b = buckets[i]
            mask = (grid >= b['min']) & (grid < b['max'])
            if i == len(buckets) - 1:
                mask = mask | (grid >= b['max'])
            data[mask, 0] = b['rgb'][0]
            data[mask, 1] = b['rgb'][1]
            data[mask, 2] = b['rgb'][2]
            data[mask, 3] = 255

    data[is_line_grid, 0:3] = 0
    data[is_line_grid, 3] = 160

    img = Image.fromarray(data, 'RGBA')
    if show_labels:
        draw = ImageDraw.Draw(img)
        unique_lids = np.unique(line_indices)
        if high_density:
            # Water Level: 1 label per contour level
            lvl_step = 1 
            min_len = 100 
        if high_density:
            # Water Level: Multiple labels per level, spaced widely
            lvl_step = 1 
            min_len = 15 
            pts_count = 10
            min_dist_global = 30
            min_dist_level = 150
        else:
            # Water Quality: 
            lvl_step = 1 
            min_len = 15 
            pts_count = 10
            min_dist_global = 40
            min_dist_level = 150

        placed_points = []
        for lid in unique_lids[::lvl_step]:
            if lid < 0: continue
            mask = is_line_grid & (np.abs(line_indices - lid) < 0.5)
            coords = np.argwhere(mask)
            
            if len(coords) > min_len:
                label_val = lid * actual_step
                
                # Format smartly: 10.0 -> 10, 10.5 -> 10.5
                if abs(round(label_val) - label_val) < 0.02:
                    label_text = f"{int(round(label_val))}"
                else:
                    label_text = f"{label_val:.1f}"
                
                # Search across the entire collection of points
                n_tests = min(100, len(coords))
                test_indices = [int(len(coords) * (i + 1) / (n_tests + 1)) for i in range(n_tests)]
                
                labels_drawn = 0
                level_placed = []
                for p_idx in test_indices:
                    if labels_drawn >= pts_count: break
                    
                    y_px, x_px = coords[p_idx]
                    
                    # Tighter padding to allow labels near boundaries
                    if not (15 < x_px < width - 15 and 15 < y_px < height - 15):
                        continue
                        
                    # 1. Distance check against all previously placed labels (Global)
                    too_close = False
                    for px, py in placed_points:
                        if (x_px - px)**2 + (y_px - py)**2 < min_dist_global**2:
                            too_close = True
                            break
                    if too_close: continue
                    
                    # 2. Distance check against labels of THIS EXACT SAME LEVEL
                    too_close_level = False
                    for px, py in level_placed:
                        if (x_px - px)**2 + (y_px - py)**2 < min_dist_level**2:
                            too_close_level = True
                            break
                    if too_close_level: continue
                    
                    level_placed.append((x_px, y_px))
                    # Draw text with halo for readability
                    draw.text((x_px-1, y_px-1), label_text, fill=(255,255,255,255))
                    draw.text((x_px+1, y_px+1), label_text, fill=(255,255,255,255))
                    draw.text((x_px-1, y_px+1), label_text, fill=(255,255,255,255))
                    draw.text((x_px+1, y_px-1), label_text, fill=(255,255,255,255))
                    draw.text((x_px, y_px), label_text, fill=(0,0,0,255))
                    
                    placed_points.append((x_px, y_px))
                    labels_drawn += 1





    
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return f"data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode()}"

def get_parameter_analysis(parameter, values):
    p_key = parameter.lower()
    is_quality = p_key not in ['decadal_pre', 'decadal_pst'] and not p_key.startswith('pre_') and not p_key.startswith('pst_')
    unit = 'mg/l' if is_quality else 'm'
    if p_key == 'ec': unit = 'µS/cm'
    elif p_key == 'ph': unit = 'pH'

    if not values:
        if is_quality:
            buckets = [{'min': 0, 'max': 5, 'rgb': [152, 251, 152], 'label': 'N/A'}, {'min': 5, 'max': 100, 'rgb': [255, 105, 97], 'label': 'No Data'}]
        else:
            buckets = [
                {'min': 0, 'max': 5, 'rgb': [224, 255, 255], 'label': '0-5m'},
                {'min': 5, 'max': 10, 'rgb': [135, 206, 250], 'label': '5-10m'},
                {'min': 10, 'max': 15, 'rgb': [0, 191, 255], 'label': '10-15m'},
                {'min': 15, 'max': 20, 'rgb': [30, 144, 255], 'label': '15-20m'},
                {'min': 20, 'max': 25, 'rgb': [152, 251, 152], 'label': '20-25m'},
                {'min': 25, 'max': 30, 'rgb': [50, 205, 50], 'label': '25-30m'},
                {'min': 30, 'max': 35, 'rgb': [255, 255, 180], 'label': '30-35m'},
                {'min': 35, 'max': 40, 'rgb': [255, 215, 0], 'label': '35-40m'},
                {'min': 40, 'max': 50, 'rgb': [255, 165, 0], 'label': '40-50m'},
                {'min': 50, 'max': 60, 'rgb': [255, 140, 0], 'label': '50-60m'},
                {'min': 60, 'max': 1000, 'rgb': [255, 105, 97], 'label': '> 60m'}
            ]
        return {'buckets': buckets, 'min': 0, 'max': 10, 'unit': unit, 'is_quality': is_quality}


    # For Water Level (non-quality), use fixed buckets for consistency across different maps
    if not is_quality:
        buckets = [
            {'min': 0, 'max': 5, 'rgb': [224, 255, 255], 'label': '0-5m'},
            {'min': 5, 'max': 10, 'rgb': [135, 206, 250], 'label': '5-10m'},
            {'min': 10, 'max': 15, 'rgb': [0, 191, 255], 'label': '10-15m'},
            {'min': 15, 'max': 20, 'rgb': [30, 144, 255], 'label': '15-20m'},
            {'min': 20, 'max': 25, 'rgb': [152, 251, 152], 'label': '20-25m'},
            {'min': 25, 'max': 30, 'rgb': [50, 205, 50], 'label': '25-30m'},
            {'min': 30, 'max': 35, 'rgb': [255, 255, 180], 'label': '30-35m'},
            {'min': 35, 'max': 40, 'rgb': [255, 215, 0], 'label': '35-40m'},
            {'min': 40, 'max': 50, 'rgb': [255, 165, 0], 'label': '40-50m'},
            {'min': 50, 'max': 60, 'rgb': [255, 140, 0], 'label': '50-60m'},
            {'min': 60, 'max': 1000, 'rgb': [255, 105, 97], 'label': '> 60m'}
        ]
        min_v, max_v = min(values), max(values)
        return {'buckets': buckets, 'min': min_v, 'max': max_v, 'unit': unit, 'is_quality': False}

    min_v, max_v = min(values), max(values)
    thresholds = []
    if p_key == 'ph': thresholds = [6.5, 8.5]
    elif p_key == 'nitrate': thresholds = [45]
    elif p_key == 'fluoride': thresholds = [1.0, 1.5]
    elif p_key == 'chloride': thresholds = [250, 1000]
    elif p_key == 'ec': thresholds = [750, 2250]
    elif p_key == 'tds': thresholds = [500, 2000]
    elif p_key == 'hardness': thresholds = [200, 600]
    elif p_key == 'alkalinity': thresholds = [200, 600]
    elif 'iron' in p_key: thresholds = [0.3, 1.0]


    buckets = []
    if len(thresholds) > 0:
        limit = thresholds[-1]
        f_max = max(max_v, limit * 1.6)
        if p_key == 'ph':
            buckets = [{'min': 0, 'max': 6.5, 'rgb': [255, 105, 97], 'label': '< 6.5'}, {'min': 6.5, 'max': 8.5, 'rgb': [152, 251, 152], 'label': '6.5-8.5'}, {'min': 8.5, 'max': 14, 'rgb': [135, 206, 250], 'label': '> 8.5'}]
        elif len(thresholds) == 2:
            buckets = [{'min': 0, 'max': thresholds[0], 'rgb': [152, 251, 152], 'label': f'< {thresholds[0]}'}, {'min': thresholds[0], 'max': thresholds[1], 'rgb': [255, 223, 100], 'label': f'{thresholds[0]}-{thresholds[1]}'}, {'min': thresholds[1], 'max': f_max, 'rgb': [255, 105, 97], 'label': f'> {thresholds[1]}'}]
        else:
            buckets = [{'min': 0, 'max': limit, 'rgb': [152, 251, 152], 'label': f'< {limit}'}, {'min': limit, 'max': f_max, 'rgb': [255, 105, 97], 'label': f'> {limit}'}]
        return {'buckets': buckets, 'min': 0, 'max': f_max, 'unit': unit, 'is_quality': True}
    else:
        # Fallback for other non-WL, non-threshold parameters (if any)
        if max_v - min_v < 0.1: max_v, min_v = min_v + 1, min_v - 1
        diff = max_v - min_v
        d_colors = [[224, 255, 255], [135, 206, 250], [152, 251, 152], [255, 255, 180], [255, 105, 97]]
        for i, rgb in enumerate(d_colors):
            b_min = min_v + (i * diff / 5)
            b_max = min_v + ((i + 1) * diff / 5)
            buckets.append({'min': b_min, 'max': b_max, 'rgb': rgb, 'label': f"{b_min:.1f}-{b_max:.1f}"})
        return {'buckets': buckets, 'min': min_v, 'max': max_v, 'unit': unit, 'is_quality': False}


def utm_to_latlon(easting, northing):
    import math
    sa, sb = 6378137.0, 6356752.314245
    e2 = math.sqrt((sa**2) - (sb**2)) / sb
    e2sq, c = e2**2, sa**2 / sb
    x, y = easting - 500000, northing
    lon0 = (43 * 6 - 183) * math.pi / 180
    M = y / 0.9996
    phi = M / 6367449.1458
    e = (1 - sb / sa) / (1 + sb / sa)
    lat = phi + (3 * e / 2 - 27 * e**3 / 32) * math.sin(2 * phi) + (21 * e**2 / 16 - 55 * e**4 / 32) * math.sin(4 * phi) + (151 * e**3 / 96) * math.sin(6 * phi)
    N = c / math.sqrt(1 + e2sq * (math.cos(lat)**2))
    T, C = (math.tan(lat)**2), e2sq * (math.cos(lat)**2)
    R = c * (1 - e2sq) / ((1 + e2sq * (math.cos(lat)**2))**1.5)
    D = x / (N * 0.9996)
    latitude = lat - (N * math.tan(lat) / R) * (D**2 / 2 - (5 + 3 * T + 10 * C - 4 * C**2 - 9 * e2sq) * D**4 / 24 + (61 + 90 * T + 298 * C + 45 * T**2 - 252 * e2sq - 3 * C**2) * D**6 / 720)
    longitude = lon0 + (D - (1 + 2 * T + C) * D**3 / 6 + (5 - 2 * C + 28 * T - 3 * C**2 + 8 * e2sq + 24 * T**2) * D**5 / 120) / math.cos(lat)
    return [longitude * 180 / math.pi, latitude * 180 / math.pi]
