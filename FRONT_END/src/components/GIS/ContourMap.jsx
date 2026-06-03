import React, { useState, useEffect, useMemo } from 'react';
import { locationService } from '../../services/locationService';
import PlaceholderImage from '../Shared/PlaceholderImage';

const ContourMap = ({ gpId, title, parameter, isPrint, projectCenter }) => {
    const [boundary, setBoundary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mapData, setMapData] = useState(null);
    const [bounds, setBounds] = useState(null);
    const mapId = useMemo(() => `contour-map-${gpId}-${parameter}-${Math.random().toString(36).substr(2, 5)}`, [gpId, parameter]);

    useEffect(() => {
        if (!gpId) return;
        setLoading(true);

        const fetchData = async () => {
            try {
                const lat = projectCenter ? projectCenter[1] : null;
                const lon = projectCenter ? projectCenter[0] : null;

                const data = await locationService.getContourMap(gpId, parameter, lat, lon);

                if (data.boundary) setBoundary(data.boundary);
                if (data.bbox) {
                    const [minX, minY, maxX, maxY] = data.bbox;
                    setBounds({ minX, minY, maxX, maxY });
                }
                setMapData(data);
            } catch (err) {
                console.error("Error fetching contour map data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [gpId, parameter, projectCenter]);

    const project = (c, b, w, h) => [
        ((c[0] - b.minX) / (b.maxX - b.minX)) * w,
        h - ((c[1] - b.minY) / (b.maxY - b.minY)) * h
    ];

    if (loading || !boundary || !bounds || !mapData) {
        return (
            <PlaceholderImage
                title={title}
                height="400px"
                message={loading ? "Modeling Contours..." : "Initializing..."}
            />
        );
    }


    const svgW = mapData.width || 600;
    const svgH = mapData.height || 500;
    const projS = (c) => { const p = project(c, bounds, svgW, svgH); return `${p[0]},${p[1]}`; };
    const pathD = boundary.type === 'Polygon' ? "M " + boundary.coordinates[0].map(projS).join(" L ") + " Z" : boundary.coordinates.map(poly => "M " + poly[0].map(projS).join(" L ") + " Z").join(" ");

    const { heatmap_url, analysis } = mapData;
    const markerPoint = projectCenter ? project(projectCenter, bounds, svgW, svgH) : null;

    return (
        <div style={{ width: '100%', margin: '0' }}>
            <div className="chart-title" style={{ padding: '5px 0' }}>{title}</div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '0', background: '#fff', border: '1px solid #e2e8f0', width: '100%', height: isPrint ? '185px' : '350px' }}>
                <div style={{ flex: '1', position: 'relative', overflow: 'hidden', height: '100%', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet">
                        <defs><clipPath id={mapId}><path d={pathD} /></clipPath></defs>
                        {heatmap_url && <image x="0" y="0" width={svgW} height={svgH} href={heatmap_url} clipPath={`url(#${mapId})`} preserveAspectRatio="none" />}

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
                    {mapData.well_count === 0 && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 800, color: '#94a3b8', background: 'rgba(255,255,255,0.8)', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>NO SAMPLES FOUND</div>
                    )}
                </div>

                <div style={{ width: isPrint ? '130px' : '220px', padding: '15px', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, marginBottom: '15px', textTransform: 'uppercase', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
                        {parameter.toUpperCase()} ({analysis.unit})
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '8px' }}>
                            {analysis.buckets.map((b, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: `rgb(${b.rgb.join(',')})`,
                                        borderRadius: '2px',
                                        border: '1px solid rgba(0,0,0,0.1)',
                                        printColorAdjust: 'exact',
                                        WebkitPrintColorAdjust: 'exact'
                                    }}></div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>{b.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContourMap;
