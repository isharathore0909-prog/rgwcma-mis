import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { locationService } from '../../services/locationService';
import './GPSummaryReport.css';
import ReportHeader from '../Shared/ReportHeader';
import ReportBreadcrumb from '../Shared/ReportBreadcrumb';
import LocationMap from '../GIS/LocationMap';
import DrainageMap from '../GIS/DrainageMap';
import AquiferMap from '../GIS/AquiferMap';

const GPSummaryReport = ({ data, onBack, onWaterAvailability }) => {
    const locationHook = useLocation();
    const { gpId } = locationHook.state || {};

    const [waterLevelData, setWaterLevelData] = useState([]);
    const [waterQualityData, setWaterQualityData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (gpId) {
            setLoading(true);

            // Fetch both water level and water quality data
            Promise.all([
                locationService.getAquiferWaterLevelData(gpId),
                locationService.getWaterQualityData(gpId)
            ])
                .then(([levelData, qualityData]) => {
                    if (levelData && Array.isArray(levelData)) {
                        setWaterLevelData(levelData);
                    }
                    if (qualityData && Array.isArray(qualityData)) {
                        setWaterQualityData(qualityData);
                    }
                })
                .catch(err => console.error("Error fetching data:", err))
                .finally(() => setLoading(false));
        }
    }, [gpId]);

    // Shared headers for the report tables
    const levelHeaders = [
        "S.No.", "Site Name", "Location Details", "Latitude", "Longitude", "Well ID", "Type of Well", "Depth of Well(mbmp)"
    ];

    const qualityHeaders = [
        "S.No.", "Village Name", "Location", "Latitude", "Longitude", "Well Type", "Source", "PH", "EC (µS/cm)"
    ];

    // Current date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB'); // dd/mm/yyyy
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const metaData = {
        state: data.state || "Rajasthan",
        district: data.district || "District",
        block: data.block || "Block",
        gp: data.gpName || "GP",
        year: "2023-24",
        userName: "SPMU_Rajasthan_nodal@rajasthan.gov.in" // Placeholder or props
    };

    // Helper to render cell value safely
    const renderCell = (val) => (val !== null && val !== undefined) ? val : '-';

    return (
        <div className="wa-report-paper-wrapper">
            <div className="wa-report-container printable-report">
                <ReportHeader
                    title="Gram Panchayat Water Management Report"
                    metaData={metaData}
                    dateStr={dateStr}
                    timeStr={timeStr}
                />

                <ReportBreadcrumb
                    state={metaData.state}
                    district={metaData.district}
                    block={metaData.block}
                    gp={metaData.gp}
                    year={metaData.year}
                />

                <div className="wa-report-content">
                    {/* Section 1: Basic Information */}
                    <section className="report-section">
                        <h2 className="section-title">1. Basic Information</h2>
                        <div className="info-grid">
                            <div className="info-item"><strong>State:</strong> {data.state}</div>
                            <div className="info-item"><strong>District:</strong> {data.district}</div>
                            <div className="info-item"><strong>Block:</strong> {data.block}</div>
                            <div className="info-item"><strong>Gram Panchayat:</strong> {data.gpName}</div>
                            <div className="info-item"><strong>LGD Code:</strong> {data.lgdCode}</div>
                            <div className="info-item"><strong>Block Area:</strong> {data.blockArea} Ha</div>
                            <div className="info-item"><strong>GP Area:</strong> {data.gpArea} Ha</div>
                            <div className="info-item"><strong>Watershed:</strong> {data.watershedName} ({data.watershedCode})</div>
                            <div className="info-item"><strong>Basin:</strong> {data.basinName} ({data.subBasinName})</div>
                        </div>
                    </section>

                    {/* Section 2: Maps Status */}
                    <section className="report-section">
                        <h2 className="section-title">2. Uploaded Maps</h2>
                        <div className="maps-layout-grid">
                            <div className="map-placeholder summary-map-card map-area-location">
                                <div className="map-type">Location Map</div>
                                <div className="map-visual-container location-container">
                                    <LocationMap gpId={gpId} metaData={data} isPrint={true} />
                                </div>
                                <div className="status-tag uploaded">System Reference Generated</div>
                            </div>
                            <div className="map-placeholder summary-map-card map-area-watershed">
                                <div className="map-type">Watershed and Drainage Map</div>
                                <div className="map-visual-container small-map-container">
                                    <DrainageMap gpId={gpId} isPrint={true} />
                                </div>
                                <div className="status-tag uploaded">System Reference Generated</div>
                            </div>
                            <div className="map-placeholder summary-map-card map-area-aquifer">
                                <div className="map-type">Aquifer Map</div>
                                <div className="map-visual-container small-map-container">
                                    <AquiferMap gpId={gpId} isPrint={true} />
                                </div>
                                <div className="status-tag uploaded">System Reference Generated</div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Ground Water Level */}
                    <section className="report-section">
                        <h2 className="section-title">3. Ground Water Level Data</h2>
                        <div className="table-responsive">
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        {levelHeaders.map((h, i) => <th key={i}>{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={levelHeaders.length} className="placeholder-row">Loading...</td>
                                        </tr>
                                    ) : waterLevelData.length > 0 ? (
                                        waterLevelData.map((row, idx) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                <td>{renderCell(row.village_name)}</td>
                                                <td>{renderCell('-')}</td>
                                                <td>{renderCell(row.latitude)}</td>
                                                <td>{renderCell(row.longitude)}</td>
                                                <td>{renderCell(row.well_id)}</td>
                                                <td>{renderCell('-')}</td>
                                                <td>{renderCell(row.well_depth)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={levelHeaders.length} className="placeholder-row">No data records available for this period.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Section 4: Ground Water Quality */}
                    <section className="report-section">
                        <h2 className="section-title">4. Ground Water Quality Data</h2>
                        <div className="table-responsive">
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        {qualityHeaders.map((h, i) => <th key={i}>{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={qualityHeaders.length} className="placeholder-row">Loading...</td>
                                        </tr>
                                    ) : waterQualityData.length > 0 ? (
                                        waterQualityData.map((row, idx) => (
                                            <tr key={idx}>
                                                <td>{idx + 1}</td>
                                                <td>{renderCell(row.village_name)}</td>
                                                <td>{renderCell('-')}</td>
                                                <td>{renderCell(row.latitude)}</td>
                                                <td>{renderCell(row.longitude)}</td>
                                                <td>{renderCell(row.type_of_well)}</td>
                                                <td>{renderCell('-')}</td>
                                                <td>{renderCell(row.ph)}</td>
                                                <td>{renderCell(row.ec)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={qualityHeaders.length} className="placeholder-row">No data records available for this period.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <footer className="report-footer">
                        <p>© 2024 Rajasthan State Ground Water Authority. This is a computer generated summary.</p>
                    </footer>
                </div>
            </div>

            <div className="wa-report-actions no-print">
                <button className="btn-back-edit-bottom" onClick={onBack}>Back to Edit</button>
                <button className="btn-water-availability" onClick={onWaterAvailability}>Go to Water Availability</button>
            </div>
        </div>
    );
};

export default GPSummaryReport;
