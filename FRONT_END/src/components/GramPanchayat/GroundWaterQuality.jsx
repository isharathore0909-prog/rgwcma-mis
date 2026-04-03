import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { locationService } from '../../services/locationService';
import './GroundWaterQuality.css';

const GroundWaterQuality = ({ onBack, onSave, onSummary }) => {
    const locationHook = useLocation();
    const { gpId } = locationHook.state || {}; // Ensure we get gpId from state

    const [qualityData, setQualityData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (gpId) {
            const controller = new AbortController();
            setLoading(true);
            locationService.getWaterQualityData(gpId, controller.signal)
                .then(data => {
                    if (data && Array.isArray(data)) {
                        setQualityData(data);
                    }
                })
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error("Error fetching water quality data:", err);
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) {
                        setLoading(false);
                    }
                });

            return () => controller.abort();
        }
    }, [gpId]);

    const headers = [
        "S.No.",
        "Village Name",
        "Location",
        "Latitude",
        "Longitude",
        "Year",
        "Well Type",
        "Source",
        "Well ID",
        "Well Depth (mbgl)",
        "Aquifer",
        "PH",
        "EC (µS/cm)"
    ];

    // Helper to render cell value safely
    const renderCell = (val) => (val !== null && val !== undefined) ? val : '-';

    return (
        <div className="gw-quality-container">
            <div className="table-wrapper">
                <div className="table-header-bar">
                    Ground Water Quality
                </div>
                <div className="table-scroll">
                    <table className="gw-table">
                        <thead>
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={headers.length} className="no-data-cell">
                                        Loading...
                                    </td>
                                </tr>
                            ) : qualityData.length > 0 ? (
                                qualityData.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{renderCell(idx + 1)}</td>
                                        <td>{renderCell(row.village_name)}</td>
                                        <td>{renderCell('-')}</td>
                                        <td>{renderCell(row.latitude)}</td>
                                        <td>{renderCell(row.longitude)}</td>
                                        <td>{renderCell(row.meta_date)}</td>
                                        <td>{renderCell(row.type_of_well)}</td>
                                        <td>{renderCell('-')}</td>
                                        <td>{renderCell(row.well_id)}</td>
                                        <td>{renderCell(row.well_depth)}</td>
                                        <td>{renderCell('-')}</td>
                                        <td>{renderCell(row.ph)}</td>
                                        <td>{renderCell(row.ec)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={headers.length} className="no-data-cell">
                                        No Data Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="action-buttons">
                <button className="btn-back" onClick={onBack}>Back</button>
                <button className="btn-save" onClick={onSave}>Save</button>
                <button className="btn-summary" onClick={onSummary}>
                    Summary
                </button>
            </div>
        </div>
    );
};

export default GroundWaterQuality;
