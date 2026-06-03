import React, { useState, useEffect, useRef } from 'react';
import { locationService } from '../../services/locationService';
import { ASSET_URLS } from '../../api/config';
import LocationMap from './LocationMap';
import PlaceholderImage from '../Shared/PlaceholderImage';

const WellLocationMap = ({ gpId, title, isPrint, projectCenter, metaData, isFinalReport = false }) => {
    const [mapData, setMapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef(null);
    const leafletMap = useRef(null);

    useEffect(() => {
        if (!gpId) return;
        const controller = new AbortController();
        setLoading(true);
        const lat = projectCenter ? projectCenter[1] : null;
        const lon = projectCenter ? projectCenter[0] : null;

        locationService.getLocationComposition(gpId, lat, lon, controller.signal)
            .then(res => setMapData(res))
            .catch(err => {
                if (err.name !== 'AbortError') {
                    console.error("Error fetching map composition:", err);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

        return () => controller.abort();
    }, [gpId, projectCenter]);

    useEffect(() => {
        // Only initialize Leaflet if NOT in Final Report mode and we have data
        if (isFinalReport || !mapData || !mapRef.current || !window.L) return;

        // Cleanup previous map instance
        if (leafletMap.current) {
            leafletMap.current.remove();
        }

        const L = window.L;
        const { gp_boundary, project_area, wells } = mapData;

        // Initialize Map
        const center = projectCenter ? [projectCenter[1], projectCenter[0]] : [26.5, 74.5];
        leafletMap.current = L.map(mapRef.current, {
            zoomControl: !isPrint,
            attributionControl: false
        }).setView(center, 13);

        // Add Tile Layer
        L.tileLayer(ASSET_URLS.osm_tiles).addTo(leafletMap.current);

        const group = L.featureGroup().addTo(leafletMap.current);

        // 1. Add Project Area / Buffer
        if (project_area && project_area.coordinates) {
            L.geoJSON(project_area, {
                style: { color: '#ef4444', weight: 2, dashArray: '8, 5', fillOpacity: 0.1, fillColor: '#fef2f2' }
            }).addTo(group);
        }

        // Wells rendering removed as requested

        // 3. Add Project Marker
        // 3. Add Project Marker
        if (projectCenter) {
            const marker = L.marker([projectCenter[1], projectCenter[0]], {
                icon: L.divIcon({
                    className: 'custom-div-icon',
                    html: `<svg width="28" height="42" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 0C5.37258 0 0 5.37258 0 12C0 21 12 30 12 36C12 30 24 21 24 12C24 5.37258 18.6274 0 12 0ZM12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" fill="#3b82f6"/>
                    </svg>`,
                    iconSize: [28, 42],
                    iconAnchor: [14, 42],
                    popupAnchor: [0, -42]
                })
            }).addTo(leafletMap.current);

        }

        // Fit Bounds
        if (group.getBounds().isValid()) {
            leafletMap.current.fitBounds(group.getBounds(), { padding: [40, 40] });
        } else if (projectCenter) {
            leafletMap.current.setView([projectCenter[1], projectCenter[0]], 14);
        }

    }, [mapData, projectCenter, isPrint, isFinalReport]);

    // Mode Selection: Final Report gets the GIS SVG map, Impact Assessment gets Leaflet
    if (isFinalReport) {
        return <LocationMap gpId={gpId} title={title} isPrint={isPrint} projectCenter={projectCenter} metaData={metaData} />;
    }

    if (loading || !mapData) {
        return (
            <PlaceholderImage
                title={title}
                height={isPrint ? '400px' : '500px'}
                message="Initializing Interactive Map..."
            />
        );
    }

    return (
        <div className="leaflet-map-wrapper" style={{ width: '100%', margin: '0' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <div style={{ height: isPrint ? '400px' : '500px', width: '100%', border: '1px solid #e2e8f0', position: 'relative', background: '#f8fafc' }}>
                <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            </div>
        </div>
    );
};

export default WellLocationMap;
