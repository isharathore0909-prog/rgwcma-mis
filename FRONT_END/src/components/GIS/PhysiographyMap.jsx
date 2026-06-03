import React, { useEffect, useState, useMemo } from 'react';
import { locationService } from '../../services/locationService';
import { BASE_URL } from '../../api/config';

const PhysiographyMap = ({ gpId, title, isPrint }) => {
    const [mapData, setMapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imgStatus, setImgStatus] = useState('loading');
    const mapId = useMemo(() => `physio-clip-${Math.random().toString(36).substr(2, 9)}`, []);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                // We use the same service but can pass custom type if needed, 
                // but the metadata (bbox) is the same.
                const data = await locationService.getDEMMap(gpId);
                setMapData(data);
            } catch (err) {
                console.error("Failed to load physiography metadata:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMetadata();
    }, [gpId]);

    if (loading) return <div className="map-loading">Loading Physiography Map...</div>;
    if (!mapData) return null;

    const [minX, minY, maxX, maxY] = mapData.bbox;
    const svgW = 800;
    const svgH = 600;

    const scaleX = (x) => ((x - minX) / (maxX - minX)) * svgW;
    const scaleY = (y) => svgH - ((y - minY) / (maxY - minY)) * svgH;

    const mapUrl = useMemo(() => `${BASE_URL}/dem-map/?gp_id=${gpId}&type=colored`, [gpId]);

    return (
        <div className="report-figure-container">
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '10px',
                background: 'white',
                padding: '15px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                border: '1px solid #e2e8f0',
                position: 'relative'
            }}>
                {/* Map View */}
                <div style={{ flex: '2', position: 'relative', height: isPrint ? '180px' : '400px', width: '100%', backgroundColor: '#f8fafc', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 10, fontSize: '0.65rem', fontWeight: 800, color: '#475569', background: 'rgba(255,255,255,0.8)', padding: '2px 6px', borderRadius: '4px' }}>
                        {title || "Physiography Map"}
                    </div>

                    <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: '100%', display: 'block' }}>
                        <defs>
                            <clipPath id={mapId}>
                                {mapData.boundary?.coordinates?.map((polygon, i) => (
                                    <path
                                        key={i}
                                        d={polygon[0].map((coord, ci) => `${ci === 0 ? 'M' : 'L'} ${scaleX(coord[0])} ${scaleY(coord[1])}`).join(' ') + ' Z'}
                                        fill="black"
                                    />
                                ))}
                            </clipPath>
                        </defs>

                        {/* Background Topo Layer (Colored) */}
                        <image
                            x="0"
                            y="0"
                            width={svgW}
                            height={svgH}
                            href={mapUrl}
                            clipPath={`url(#${mapId})`}
                            preserveAspectRatio="none"
                            onLoad={() => setImgStatus('loaded')}
                            onError={() => setImgStatus('error')}
                        />

                        {/* GP Boundary Highlight */}
                        {mapData.boundary?.coordinates?.map((polygon, i) => (
                            <path
                                key={`outline-${i}`}
                                d={polygon[0].map((coord, ci) => `${ci === 0 ? 'M' : 'L'} ${scaleX(coord[0])} ${scaleY(coord[1])}`).join(' ') + ' Z'}
                                fill="none"
                                stroke="#1e293b"
                                strokeWidth="2"
                                strokeDasharray="5,3"
                                opacity="0.8"
                            />
                        ))}
                    </svg>

                    {imgStatus === 'loading' && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                            <div className="loader-spinner"></div>
                            <div style={{ fontSize: '0.6rem', marginTop: '10px', color: '#64748b' }}>Rendering Physiography Units...</div>
                        </div>
                    )}

                    {imgStatus === 'error' && (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '0.7rem' }}>
                            Physiography Service Timeout
                        </div>
                    )}

                </div>

                {/* Legend Container */}
                <div style={{
                    flex: isPrint ? '0' : '0.8',
                    width: isPrint ? '150px' : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '10px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px',
                    height: isPrint ? '180px' : '400px'
                }}>
                    <div style={{
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        marginBottom: '15px',
                        color: '#1e293b',
                        textTransform: 'uppercase',
                        borderBottom: '2.5px solid #cbd5e1',
                        paddingBottom: '8px'
                    }}>
                        Physiography (Elevation)
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '15px' }}>
                            <div style={{
                                width: '25px',
                                height: '200px',
                                background: 'linear-gradient(to top, #326802, #75b021, #fde43d, #eb5e2a, #7d3c11, #ffffff)',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                WebkitPrintColorAdjust: 'exact',
                                printColorAdjust: 'exact'
                            }}></div>
                            <div style={{ fontSize: '0.75rem', color: '#475569', display: 'flex', flexDirection: 'column', height: '200px', justifyContent: 'space-between', fontWeight: 700 }}>
                                <span>High (Peaks)</span>
                                <span>Mid (Plains)</span>
                                <span>Low (Valleys)</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #cbd5e1', fontSize: '0.55rem', color: '#64748b', fontWeight: 600 }}>
                        Filtered by Terrain Units (30m)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhysiographyMap;
