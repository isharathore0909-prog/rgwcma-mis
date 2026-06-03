import React, { useState, useEffect, useMemo } from 'react';
import { locationService } from '../../services/locationService';
import PlaceholderImage from '../Shared/PlaceholderImage';

const DEMContourMap = ({ gpId, title, isPrint, projectCenter }) => {
    const [boundary, setBoundary] = useState(null);
    const [mapData, setMapData] = useState(null);
    const [contourGeoJSON, setContourGeoJSON] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bounds, setBounds] = useState(null);
    const [mapDims, setMapDims] = useState({ w: 600, h: 450 });
    const mapId = useMemo(() => `dem-contour-map-${gpId}-${Math.random().toString(36).substr(2, 5)}`, [gpId]);

    useEffect(() => {
        if (!gpId) return;
        setLoading(true);

        const fetchData = async () => {
            try {
                const lat = projectCenter ? projectCenter[1] : null;
                const lon = projectCenter ? projectCenter[0] : null;

                const data = await locationService.getDEMContourMap(gpId, lat, lon);

                if (data.boundary) setBoundary(data.boundary);
                if (data.bbox) {
                    const [minX, minY, maxX, maxY] = data.bbox;
                    setBounds({ minX, minY, maxX, maxY });
                }
                if (data.width && data.height) {
                    setMapDims({ w: data.width, h: data.height });
                }

                setMapData(data);
                if (data.contour_geojson) {
                    setContourGeoJSON(data.contour_geojson);
                }
            } catch (err) {
                console.error("Error fetching contour data:", err);
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

    if (loading || !boundary || !bounds || !mapData) {
        return (
            <PlaceholderImage
                title={title}
                height="400px"
                message={loading ? "Generating Contours (10m)..." : "Initializing..."}
            />
        );
    }

    const projS = (c) => { const p = project(c, bounds, svgW, svgH); return `${p[0]},${p[1]}`; };

    // Support multi-polygon and simple polygon
    const boundaryPath = boundary.type === 'Polygon'
        ? "M " + boundary.coordinates[0].map(projS).join(" L ") + " Z"
        : boundary.coordinates.map(poly => "M " + poly[0].map(projS).join(" L ") + " Z").join(" ");

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
                    height: isPrint ? '185px' : '400px'
                }}
            >
                <div style={{ flex: '1', position: 'relative', overflow: 'hidden', height: '100%', backgroundColor: '#fff', borderRight: '1px solid #e2e8f0' }}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="xMidYMid meet">
                        <defs><clipPath id={mapId}><path d={boundaryPath} /></clipPath></defs>

                        <g clipPath={`url(#${mapId})`}>
                            {contourGeoJSON && contourGeoJSON.features.map((f, i) => {
                                const { type, coordinates } = f.geometry;
                                const elev = f.properties.elevation;
                                let d = "";
                                if (type === 'LineString') d = "M " + coordinates.map(projS).join(" L ");
                                else if (type === 'MultiLineString') d = coordinates.map(line => "M " + line.map(projS).join(" L ")).join(" ");

                                if (!d) return null;
                                const isMajor = elev % 50 === 0;

                                const elements = [];
                                elements.push(
                                    <path key={`path-${i}`} d={d} fill="none" stroke={isMajor ? "#b45309" : "#d97706"} strokeWidth={isMajor ? "1.2" : "0.6"} strokeOpacity="0.8" />
                                );
                                if (i % 5 === 0 && coordinates.length > 5) {
                                    const mid = project(coordinates[Math.floor(coordinates.length / 2)], bounds, svgW, svgH);
                                    elements.push(
                                        <text key={`text-${i}`} x={mid[0]} y={mid[1]} fontSize="4" fontWeight="700" fill="#92400e" textAnchor="middle" dominantBaseline="middle" style={{ paintOrder: 'stroke', stroke: 'white', strokeWidth: '1.5px' }}>
                                            {elev}m
                                        </text>
                                    );
                                }
                                return elements;
                            })}
                        </g>

                        {!boundary.is_buffer ? (
                            <path d={boundaryPath} fill="none" stroke="#2c3e50" strokeWidth="2" />
                        ) : (
                            <path d={boundaryPath} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6,4" />
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
                </div>

                <div style={{ width: isPrint ? '150px' : '230px', padding: '15px', display: 'flex', flexDirection: 'column', backgroundColor: '#fff' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 900, marginBottom: '20px', textTransform: 'uppercase', borderBottom: '3px solid #b45309', paddingBottom: '8px' }}>
                        Contour Legend
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '25px', height: '2px', backgroundColor: '#b45309' }}></div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Major (50m)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '25px', height: '1px', backgroundColor: '#d97706' }}></div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>Minor (10m)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DEMContourMap;
