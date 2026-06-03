import React, { useState, useEffect } from 'react';
import { locationService } from '../../services/locationService';
import PlaceholderImage from '../Shared/PlaceholderImage';

const LocationMap = ({ gpId, title, isPrint, projectCenter, metaData }) => {
    const [mapData, setMapData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!gpId) return;
        const controller = new AbortController();
        setLoading(true);
        // We only use projectCenter for the API call if we explicitly want the buffer scope (Impact Assessment).
        // In Final Report, we want the GP scope, so we pass null/null.
        const lat = projectCenter ? projectCenter[1] : null;
        const lon = projectCenter ? projectCenter[0] : null;

        locationService.getLocationComposition(gpId, lat, lon, controller.signal)
            .then(res => setMapData(res))
            .catch(err => {
                if (err.name !== 'AbortError') {
                    console.error("Error fetching location composition:", err);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [gpId, projectCenter, metaData]);

    const getBBox = (geometry) => {
        if (!geometry || !geometry.coordinates) return null;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const visit = (node) => {
            if (typeof node[0] === 'number') {
                minX = Math.min(minX, node[0]); maxX = Math.max(maxX, node[0]);
                minY = Math.min(minY, node[1]); maxY = Math.max(maxY, node[1]);
            } else node.forEach(visit);
        };
        visit(geometry.coordinates);
        if (minX === Infinity) return null;
        return { minX, minY, maxX, maxY };
    };

    const project = (lng, lat, bbox, width, height, padding = 0.2) => {
        if (!bbox) return [0, 0];
        const dx = bbox.maxX - bbox.minX || 0.01;
        const dy = bbox.maxY - bbox.minY || 0.01;
        const p_minX = bbox.minX - dx * padding;
        const p_maxX = bbox.maxX + dx * padding;
        const p_minY = bbox.minY - dy * padding;
        const p_maxY = bbox.maxY + dy * padding;
        const x = ((lng - p_minX) / (p_maxX - p_minX)) * width;
        const y = height - ((lat - p_minY) / (p_maxY - p_minY)) * height;
        return [x, y];
    };

    const geometryToPath = (geometry, bbox, width, height, padding = 0.2) => {
        if (!geometry || !bbox) return "";
        const projectPt = (pt) => project(pt[0], pt[1], bbox, width, height, padding).join(",");
        if (geometry.type === "Polygon") {
            return geometry.coordinates.map(ring => "M " + ring.map(projectPt).join(" L ") + " Z").join(" ");
        } else if (geometry.type === "MultiPolygon") {
            return geometry.coordinates.map(poly => poly.map(ring => "M " + ring.map(projectPt).join(" L ") + " Z").join(" ")).join(" ");
        }
        return "";
    };

    const renderGrid = (bbox, width, height, padding = 0.2) => {
        if (!bbox) return null;
        const dx = bbox.maxX - bbox.minX || 0.01;
        const dy = bbox.maxY - bbox.minY || 0.01;
        const p_minX = bbox.minX - dx * padding;
        const p_maxX = bbox.maxX + dx * padding;
        const p_minY = bbox.minY - dy * padding;
        const p_maxY = bbox.maxY + dy * padding;
        const lines = [];

        // Vertical lines (Longitude)
        for (let i = 0; i <= 4; i++) {
            const xVal = p_minX + i * ((p_maxX - p_minX) / 4);
            const [x] = project(xVal, p_minY, bbox, width, height, padding);
            lines.push(
                <g key={`x-${i}`}>
                    <line x1={x} y1={0} x2={x} y2={height} stroke="#444" strokeWidth="0.5" strokeDasharray="2,2" />
                    <text x={x} y={-10} fontSize="9" textAnchor="middle" fill="#000" fontWeight="bold">{xVal.toFixed(2)}°E</text>
                    <text x={x} y={height + 15} fontSize="9" textAnchor="middle" fill="#000" fontWeight="bold">{xVal.toFixed(2)}°E</text>
                </g>
            );
        }

        // Horizontal lines (Latitude)
        for (let i = 0; i <= 4; i++) {
            const yVal = p_minY + i * ((p_maxY - p_minY) / 4);
            const [, y] = project(p_minX, yVal, bbox, width, height, padding);
            lines.push(
                <g key={`y-${i}`}>
                    <line x1={0} y1={y} x2={width} y2={y} stroke="#444" strokeWidth="0.5" strokeDasharray="2,2" />
                    <text x={-10} y={y} fontSize="9" textAnchor="end" dominantBaseline="middle" fill="#000" fontWeight="bold">{yVal.toFixed(2)}°N</text>
                    <text x={width + 10} y={y} fontSize="9" textAnchor="start" dominantBaseline="middle" fill="#000" fontWeight="bold">{yVal.toFixed(2)}°N</text>
                </g>
            );
        }
        return lines;
    };

    if (loading || !mapData) {
        return (
            <PlaceholderImage
                title={title}
                height="500px"
                message="Generating Location Map..."
            />
        );
    }

    const { gp_boundary, block_boundary, district_boundary, rajasthan_boundary, meta } = mapData;
    const mainBBox = getBBox(gp_boundary);
    const rjBBox = getBBox(rajasthan_boundary);
    const distBBox = getBBox(district_boundary);
    const blockBBox = getBBox(block_boundary);

    const mainW = 600, mainH = 450, insetW = 280, insetH = 180;
    const activeLat = projectCenter ? projectCenter[1] : (metaData?.latitude || null);
    const activeLon = projectCenter ? projectCenter[0] : (metaData?.longitude || null);
    const markerPoint = (activeLat && activeLon) ? project(activeLon, activeLat, mainBBox, mainW, mainH) : null;
    const insetMarkerPoint = (activeLat && activeLon) ? project(activeLon, activeLat, blockBBox, insetW, insetH, 0.1) : null;

    return (
        <div className="location-map-master-container" style={{
            fontFamily: 'Arial, sans-serif',
            background: '#000',
            padding: '3px',
            width: '100%',
            maxWidth: '1200px',
            margin: '20px auto',
            boxSizing: 'border-box'
        }}>
            <style>{`.spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <div style={{ background: '#fff', display: 'flex', flexDirection: 'row' }}>

                {/* Main Content Area */}
                <div style={{ flex: 1, background: '#FCF9E8', position: 'relative', borderRight: '3px solid #000' }}>

                    {/* Header Overlay */}
                    <div style={{ position: 'absolute', top: 30, right: 30, textAlign: 'right', zIndex: 10 }}>
                        <h1 style={{
                            margin: 0,
                            fontSize: '2.4rem',
                            fontWeight: 900,
                            color: '#1e293b',
                            textDecoration: 'underline',
                            textUnderlineOffset: '6px'
                        }}>LOCATION MAP</h1>
                        <div style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            marginTop: '10px',
                            lineHeight: 1.4,
                            color: '#000'
                        }}>
                            Gram Panchayat: {meta?.gp || metaData?.gpName}<br />
                            Block: {meta?.block || metaData?.block}, Dist. {meta?.district || metaData?.district}
                        </div>
                    </div>

                    {/* SVG Map */}
                    <div style={{ padding: '60px 80px 40px 80px', height: '100%', boxSizing: 'border-box' }}>
                        <svg width="100%" height="100%" viewBox={`-100 -100 ${mainW + 200} ${mainH + 200}`} preserveAspectRatio="xMidYMid meet">
                            {renderGrid(mainBBox, mainW, mainH)}

                            {/* GP Boundary */}
                            <path
                                d={geometryToPath(gp_boundary, mainBBox, mainW, mainH)}
                                fill="#F0F9E8"
                                stroke="#000"
                                strokeWidth="2.5"
                            />

                            {/* Project Marker */}
                            {markerPoint && (
                                <g>
                                    <circle cx={markerPoint[0]} cy={markerPoint[1]} r="8" fill="rgba(59, 130, 246, 0.4)">
                                        <animate attributeName="r" from="6" to="12" dur="1.5s" repeatCount="indefinite" />
                                        <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" />
                                    </circle>
                                    <circle cx={markerPoint[0]} cy={markerPoint[1]} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
                                </g>
                            )}
                        </svg>
                    </div>
                </div>

                {/* Right Side Column (Insets) */}
                <div style={{ width: insetW + 40, display: 'flex', flexDirection: 'column', background: '#fff' }}>

                    {/* Rajasthan Inset */}
                    <div style={{ borderBottom: '3px solid #000', padding: '15px' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '10px', color: '#1e293b' }}>RAJASTHAN</div>
                        <div style={{ border: '1px solid #ccc', padding: '5px' }}>
                            <svg width={insetW} height={insetH} viewBox={`0 0 ${insetW} ${insetH}`}>
                                <path d={geometryToPath(rajasthan_boundary, rjBBox, insetW, insetH, 0.05)} fill="#fff" stroke="#444" strokeWidth="1" />
                                <path d={geometryToPath(district_boundary, rjBBox, insetW, insetH, 0.05)} fill="#fff" stroke="#444" strokeWidth="1" />
                            </svg>
                        </div>
                    </div>

                    {/* District Inset */}
                    <div style={{ borderBottom: '3px solid #000', padding: '15px' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '10px', color: '#1e293b' }}>{meta?.district?.toUpperCase() || 'DISTRICT'}</div>
                        <div style={{ border: '1px solid #ccc', padding: '5px' }}>
                            <svg width={insetW} height={insetH} viewBox={`0 0 ${insetW} ${insetH}`}>
                                <path d={geometryToPath(district_boundary, distBBox, insetW, insetH, 0.1)} fill="#fff" stroke="#444" strokeWidth="1" />
                                <path d={geometryToPath(block_boundary, distBBox, insetW, insetH, 0.1)} fill="#fff" stroke="#444" strokeWidth="1.5" />
                            </svg>
                        </div>
                    </div>

                    {/* Block Inset */}
                    <div style={{ padding: '15px' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '10px', color: '#1e293b' }}>{meta?.block?.toUpperCase() || 'BLOCK'}</div>
                        <div style={{ border: '1px solid #ccc', padding: '5px' }}>
                            <svg width={insetW} height={insetH} viewBox={`0 0 ${insetW} ${insetH}`}>
                                <path d={geometryToPath(block_boundary, blockBBox, insetW, insetH, 0.1)} fill="#fff" stroke="#444" strokeWidth="1.2" />
                                <path
                                    d={geometryToPath(gp_boundary, blockBBox, insetW, insetH, 0.1)}
                                    fill="#fca5a5"
                                    stroke="red"
                                    strokeWidth="2.5"
                                />
                                {insetMarkerPoint && (
                                    <circle cx={insetMarkerPoint[0]} cy={insetMarkerPoint[1]} r="4" fill="#3b82f6" stroke="#fff" strokeWidth="1" />
                                )}
                            </svg>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LocationMap;
