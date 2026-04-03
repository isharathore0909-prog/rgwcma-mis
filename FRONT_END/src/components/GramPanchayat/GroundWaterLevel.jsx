import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { locationService } from '../../services/locationService';
import './GroundWaterLevel.css';

const GroundWaterLevel = ({ onBack, onSave, onNext }) => {
    const locationHook = useLocation();
    const { gpId } = locationHook.state || {};

    const [waterLevelData, setWaterLevelData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (gpId) {
            const controller = new AbortController();
            setLoading(true);
            locationService.getAquiferWaterLevelData(gpId, controller.signal)
                .then(data => {
                    if (data && Array.isArray(data)) {
                        setWaterLevelData(data);
                    }
                })
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error("Error fetching aquifer water level data:", err);
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
        "Site Name",
        "Location Details",
        "Latitude",
        "Longitude",
        "Date",
        "Well ID",
        "Type of Well",
        "Other Well Type",
        "Ownership Type",
        "Government Source",
        "Diameter of well(m)",
        "Depth of Well(mbmp)",
        "Height of Measuring Point(mbgl)"
    ];

    // Helper to render cell value safely
    const renderCell = (val) => (val !== null && val !== undefined) ? val : '-';

    return (
        <div className="gw-level-container">
            <div className="table-wrapper">
                <div className="table-header-bar">
                    Ground Water Level
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
                            ) : waterLevelData.length > 0 ? (
                                waterLevelData.map((row, idx) => (
                                    <tr key={idx}>
                                        <td>{renderCell(idx + 1)}</td>
                                        <td>{renderCell(row.village_name)}</td>
                                        <td>{renderCell('-')}</td>
                                        <td>{renderCell(row.latitude)}</td>
                                        <td>{renderCell(row.longitude)}</td>
                                        <td>{renderCell('-')}</td>
                                        <td>{renderCell(row.well_id)}</td>
                                        <td>{renderCell('-')}</td>
                                        <td>{renderCell('-')}</td>
                                        <td>{renderCell('-')}</td>
                                        <td>{renderCell('-')}</td>
                                        <td>{renderCell('-')}</td>
                                        <td>{renderCell(row.well_depth)}</td>
                                        <td>{renderCell('-')}</td>
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
                <button className="btn-next" onClick={onNext}>Next</button>
            </div>
        </div>
    );
};

export default GroundWaterLevel;
