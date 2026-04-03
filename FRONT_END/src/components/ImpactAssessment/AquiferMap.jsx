import React, { useState, useEffect, useMemo } from 'react';
import { locationService } from '../../services/locationService';
import PlaceholderImage from '../Shared/PlaceholderImage';

const AquiferMap = ({ gpId, title, isPrint, projectCenter }) => {
    const [boundary, setBoundary] = useState(null);
    const [aquiferData, setAquiferData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bounds, setBounds] = useState(null);

    // Hooks must be at the top
    const [mapDims, setMapDims] = useState({ w: 500, h: 400 });
    const mapId = useMemo(() => `aquifer-map-${gpId}-${Math.random().toString(36).substr(2, 5)}`, [gpId]);

    const aquiferColors = {
        'Alluvium': '#BEFFE8', 'Younger Alluvium': '#A6FF00', 'Older Alluvium': '#E1E1E1',
        'Hard Rock': '#FFBEBE', 'Fractured': '#D3FFBE', 'Weathered': '#FFFFBE',
        'Consolidated': '#E69800', 'Unconsolidated': '#A6FF00', 'Gneiss': '#B8A6DC',
        'Schist': '#A8C9E6', 'Granite': '#F4B6C2', 'Basalt': '#708090',
        'Sandstone': '#F4A460', 'Limestone': '#ADD8E6', 'Quartzite': '#F0E68C',
        'Phyllite': '#4682B4', 'Shale': '#D2B48C', 'Hills': '#8B4513',
        'Dolomite': '#E0FFFF', 'Rhyolite': '#BC8F8F', 'default': '#94A3B8'
    };

    const getAquiferColor = (p) => {
        if (!p) return aquiferColors.default;
        const keys = ['lithology', 'description', 'desc', 'layer_name', 'name', 'aquifer_type'];
        for (const k of keys) {
            if (p[k]) {
                const val = String(p[k]).toLowerCase();
                for (const [type, color] of Object.entries(aquiferColors)) {
                    if (val.includes(type.toLowerCase())) return color;
                }
            }
        }
        return aquiferColors.default;
    };

    const uniqueTypes = useMemo(() => {
        if (!aquiferData || !aquiferData.features) return [];
        const typesMap = new Map();
        aquiferData.features.forEach(f => {
            if (f.geometry && f.geometry.coordinates && f.geometry.coordinates.length > 0) {
                const props = f.properties || {};
                const label = props.lithology || props.description || props.name || "Aquifer Unit";
                if (!typesMap.has(label)) typesMap.set(label, getAquiferColor(props));
            }
        });
        return Array.from(typesMap.entries()).map(([name, color]) => ({ name, color }));
    }, [aquiferData]);

    useEffect(() => {
        if (!gpId) return;
        setLoading(true);

        const fetchData = async () => {
            try {
                const lat = projectCenter ? projectCenter[1] : null;
                const lon = projectCenter ? projectCenter[0] : null;

                const data = await locationService.getAquiferMap(gpId, lat, lon);

                if (data.boundary) setBoundary(data.boundary);
                if (data.bbox) {
                    const [minX, minY, maxX, maxY] = data.bbox;
                    setBounds({ minX, minY, maxX, maxY });
                }
                if (data.width && data.height) {
                    setMapDims({ w: data.width, h: data.height });
                }
                setAquiferData(data);
            } catch (err) {
                console.error("Error fetching aquifer map data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [gpId, projectCenter]);

    const svgW = mapDims.w;
    const svgH = mapDims.h;
    const project = (c, b, w, h) => [
        ((c[0] - b.minX) / (b.maxX - b.minX)) * w,
        h - ((c[1] - b.minY) / (b.maxY - b.minY)) * h
    ];

    if (loading || !boundary || !bounds) {
        return (
            <PlaceholderImage
                title={title}
                height="400px"
                message={loading ? "Loading Aquifer Data..." : "Initializing..."}
            />
        );
    }

    const projS = (c) => { const p = project(c, bounds, svgW, svgH); return `${p[0]},${p[1]}`; };
    const pathD = boundary.type === 'Polygon' ? "M " + boundary.coordinates[0].map(projS).join(" L ") + " Z" : boundary.coordinates.map(poly => "M " + poly[0].map(projS).join(" L ") + " Z").join(" ");
    const markerPoint = projectCenter ? project(projectCenter, bounds, svgW, svgH) : null;

    return (
        <div style={{ width: '100%', margin: '0' }}>
            <div className="chart-title" style={{ padding: '5px 0' }}>{title}</div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '0', background: '#fff', border: '1px solid #e2e8f0', width: '100%', height: isPrint ? '185px' : '400px' }}>
                <div style={{ flex: '1', position: 'relative', overflow: 'hidden', height: '100%', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet">
                        <defs><clipPath id={mapId}><path d={pathD} /></clipPath></defs>
                        <g clipPath={`url(#${mapId})`}>
                            {aquiferData?.features?.map((f, i) => {
                                const color = getAquiferColor(f.properties);
                                if (f.geometry.type === 'Polygon') {
                                    return f.geometry.coordinates.map((r, j) => <path key={`${i}-${j}`} d={"M " + r.map(projS).join(" L ") + " Z"} fill={color} fillOpacity="0.6" stroke="#334155" strokeWidth="0.5" />);
                                } else if (f.geometry.type === 'MultiPolygon') {
                                    return f.geometry.coordinates.map((p, j) => p.map((r, k) => <path key={`${i}-${j}-${k}`} d={"M " + r.map(projS).join(" L ") + " Z"} fill={color} fillOpacity="0.6" stroke="#334155" strokeWidth="0.5" />));
                                }
                                return null;
                            })}
                        </g>

                        {!boundary.is_buffer && (
                            <path d={pathD} fill="none" stroke="#2c3e50" strokeWidth="2" />
                        )}
                        {boundary.is_buffer && (
                            <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4,2" opacity="0.5" />
                        )}

                        {markerPoint && (
                            <g>
                                <circle cx={markerPoint[0]} cy={markerPoint[1]} r="10" fill="rgba(239, 68, 68, 0.3)">
                                    <animate attributeName="r" from="6" to="14" dur="1.5s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                                </circle>
                                <circle cx={markerPoint[0]} cy={markerPoint[1]} r="4" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                            </g>
                        )}
                    </svg>
                </div>

                <div style={{ width: isPrint ? '150px' : '230px', padding: '15px', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, marginBottom: '15px', textTransform: 'uppercase', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>Aquifer Units</div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {uniqueTypes.map((t, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: t.color,
                                    borderRadius: '2px',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    printColorAdjust: 'exact',
                                    WebkitPrintColorAdjust: 'exact'
                                }}></div>
                                <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{t.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AquiferMap;
