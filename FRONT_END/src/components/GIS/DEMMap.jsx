import React, { useState, useEffect, useMemo } from 'react';
import { locationService } from '../../services/locationService';
import { BASE_URL } from '../../api/config';
import PlaceholderImage from '../Shared/PlaceholderImage';

const DEMMap = ({ gpId, title, isPrint, projectCenter }) => {
    const [boundary, setBoundary] = useState(null);
    const [mapUrl, setMapUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bounds, setBounds] = useState(null);
    const [imgStatus, setImgStatus] = useState('loading');
    const [mapDims, setMapDims] = useState({ w: 600, h: 450 });
    const mapId = useMemo(() => `dem-map-${gpId}-${Math.random().toString(36).substr(2, 5)}`, [gpId]);

    useEffect(() => {
        if (!gpId) return;
        setLoading(true);
        setImgStatus('loading');

        const fetchData = async () => {
            try {
                const lat = projectCenter ? projectCenter[1] : null;
                const lon = projectCenter ? projectCenter[0] : null;
                const data = await locationService.getDEMMap(gpId, lat, lon);

                if (data.boundary) setBoundary(data.boundary);
                if (data.bbox) {
                    const [minX, minY, maxX, maxY] = data.bbox;
                    setBounds({ minX, minY, maxX, maxY });
                }
                if (data.width && data.height) {
                    setMapDims({ w: data.width, h: data.height });
                }
                const baseUrl = `${BASE_URL}/dem-map/?gp_id=${gpId}&type=colored`;
                const params = lat ? `&lat=${lat}&lon=${lon}` : '';
                setMapUrl(`${baseUrl}${params}`);
            } catch (err) {
                console.error("Error fetching DEM data:", err);
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
                height="350px"
                message={loading ? "Generating Hillshade Map..." : "Initializing..."}
            />
        );
    }

    const projS = (c) => { const p = project(c, bounds, svgW, svgH); return `${p[0]},${p[1]}`; };
    const pathD = boundary.type === 'Polygon' ? "M " + boundary.coordinates[0].map(projS).join(" L ") + " Z" : boundary.coordinates.map(poly => "M " + poly[0].map(projS).join(" L ") + " Z").join(" ");

    const markerPoint = projectCenter ? project(projectCenter, bounds, svgW, svgH) : null;

    return (
        <div style={{ width: '100%', margin: '0' }}>
            <div className="chart-title" style={{ padding: '5px 0' }}>{title}</div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '0',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    width: '100%',
                    height: isPrint ? '200px' : '400px'
                }}
            >
                <div style={{ flex: '1', position: 'relative', overflow: 'hidden', height: '100%', backgroundColor: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet">
                        <defs><clipPath id={mapId}><path d={pathD} /></clipPath></defs>

                        <g clipPath={`url(#${mapId})`}>
                            {mapUrl && (
                                <image
                                    x="0" y="0" width={svgW} height={svgH} href={mapUrl}
                                    preserveAspectRatio="none"
                                    onLoad={() => setImgStatus('loaded')}
                                    onError={() => setImgStatus('error')}
                                />
                            )}
                        </g>

                        {!boundary.is_buffer ? (
                            <path d={pathD} fill="none" stroke="#2c3e50" strokeWidth="2" />
                        ) : (
                            <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6,4" />
                        )}

                        {markerPoint && (
                            <g>
                                <circle cx={markerPoint[0]} cy={markerPoint[1]} r="10" fill="rgba(239, 68, 68, 0.3)">
                                    <animate attributeName="r" from="6" to="14" dur="1.5s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                                </circle>
                                <circle cx={markerPoint[0]} cy={markerPoint[1]} r="5" fill="#ef4444" stroke="#fff" strokeWidth="2" />
                            </g>
                        )}
                    </svg>

                    {imgStatus === 'loading' && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(248,250,252,0.8)' }}>
                            <div className="spinner"></div>
                        </div>
                    )}
                </div>

                <div style={{ width: isPrint ? '150px' : '200px', padding: '15px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, marginBottom: '15px', textTransform: 'uppercase', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
                        Elevation (m amsl)
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px', justifyContent: 'center' }}>
                        <div style={{
                            width: '20px',
                            height: '150px',
                            background: 'linear-gradient(to top, #448f48, #d9d068, #a86b36, #ffffff)',
                            borderRadius: '2px',
                            border: '1px solid #cbd5e1',
                            printColorAdjust: 'exact',
                            WebkitPrintColorAdjust: 'exact'
                        }}></div>
                        <div style={{ fontSize: '0.7rem', color: '#475569', display: 'flex', flexDirection: 'column', height: '150px', justifyContent: 'space-between', fontWeight: 700 }}>
                            <span>High</span>
                            <span>Low</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DEMMap;
