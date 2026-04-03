import React, { useState, useEffect, useMemo } from 'react';
import { locationService } from '../../services/locationService';
import { BASE_URL } from '../../api/config';
import PlaceholderImage from '../Shared/PlaceholderImage';

const LULCMap = ({ gpId, title, isPrint, projectCenter }) => {
    const [boundary, setBoundary] = useState(null);
    const [mapUrl, setMapUrl] = useState(null);
    const [mapData, setMapData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bounds, setBounds] = useState(null);
    const [imgStatus, setImgStatus] = useState('idle');
    const [infra, setInfra] = useState(null);
    const [mapDims, setMapDims] = useState({ w: 600, h: 450 });
    const mapId = useMemo(() => `lulc-map-${gpId}-${Math.random().toString(36).substr(2, 5)}`, [gpId]);

    useEffect(() => {
        if (!gpId) return;
        setLoading(true);
        setImgStatus('loading');

        const fetchData = async () => {
            try {
                const lat = projectCenter ? projectCenter[1] : null;
                const lon = projectCenter ? projectCenter[0] : null;
                const data = await locationService.getLULCMap(gpId, lat, lon);
                if (data.boundary) setBoundary(data.boundary);
                if (data.bbox) {
                    const [minX, minY, maxX, maxY] = data.bbox;
                    setBounds({ minX, minY, maxX, maxY });
                }
                if (data.width && data.height) {
                    setMapDims({ w: data.width, h: data.height });
                }
                setMapUrl(`${BASE_URL}/lulc-map/?gp_id=${gpId}${lat ? `&lat=${lat}&lon=${lon}` : ''}`);
                setMapData(data);

                // Fetch infrastructure info
                try {
                    const infraData = await locationService.getInfrastructureInfo(gpId, lat, lon);
                    setInfra(infraData);
                } catch (iErr) {
                    console.error("Error fetching infrastructure:", iErr);
                }

                setImgStatus('loaded');
            } catch (err) {
                console.error("Error fetching LULC data:", err);
                setImgStatus('error');
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
                message={loading ? "Discovering LULC Data..." : "Initializing..."}
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
                            {mapUrl && <image x="0" y="0" width={svgW} height={svgH} href={mapUrl} preserveAspectRatio="none" onLoad={() => setImgStatus('loaded')} onError={() => setImgStatus('error')} />}
                        </g>

                        {!boundary.is_buffer ? (
                            <path d={pathD} fill="none" stroke="#2c3e50" strokeWidth="2" />
                        ) : (
                            <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6,4" />
                        )}

                        {markerPoint && (
                            <g>
                                <circle cx={markerPoint[0]} cy={markerPoint[1]} r="10" fill="rgba(59, 130, 246, 0.3)">
                                    <animate attributeName="r" from="6" to="14" dur="1.5s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                                </circle>
                                <circle cx={markerPoint[0]} cy={markerPoint[1]} r="5" fill="#3b82f6" stroke="#fff" strokeWidth="2" />
                            </g>
                        )}
                    </svg>
                    {imgStatus === 'error' && (
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.7rem', color: '#ef4444', fontWeight: 700, background: 'rgba(255,255,255,0.9)', padding: '10px', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                            SERVICE UNAVAILABLE
                        </div>
                    )}
                    <div style={{ position: 'absolute', top: 12, left: 15, background: 'rgba(255,255,255,0.8)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.55rem', fontWeight: 700, color: '#64748b' }}>SOURCE: BHUVAN NRSC</div>
                </div>

                <div style={{ width: isPrint ? '150px' : '230px', padding: '15px', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, marginBottom: '15px', textTransform: 'uppercase', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>LULC Categories</div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {mapData?.found_units?.map((u, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: u.color,
                                    borderRadius: '2px',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    printColorAdjust: 'exact',
                                    WebkitPrintColorAdjust: 'exact'
                                }}></div>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>{u.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {infra && (
                <div style={{
                    marginTop: '15px',
                    padding: '12px 18px',
                    background: '#fff',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#1e293b',
                        marginBottom: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ width: '4px', height: '14px', background: '#3b82f6', borderRadius: '2px' }}></span>
                        Nearby Connectivity & Infrastructure
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isPrint ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '12px'
                    }}>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', fontSize: '0.55rem' }}>Nearest Hospital</span>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                {infra.hospital ? `${infra.hospital.name} (~${infra.hospital.distance_km} km)` : 'No major hospital within 20km'}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', fontSize: '0.55rem' }}>Railway Station</span>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                {infra.railway_station ? `${infra.railway_station.name} (~${infra.railway_station.distance_km} km)` : 'No major station within 50km'}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', fontSize: '0.55rem' }}>Bus Station</span>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                {infra.bus_station ? `${infra.bus_station.name} (~${infra.bus_station.distance_km} km)` : 'No major bus station within 20km'}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', fontSize: '0.55rem' }}>Nearest Airport</span>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>
                                {infra.airport ? `${infra.airport.name} (~${infra.airport.distance_km} km)` : 'No major airport within 100km'}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LULCMap;
