import React from 'react';
import { ASSET_URLS } from '../../api/config';
import './IrrigationSection.css';

const IrrigationSection = ({ data, onSeasonChange, onSummaryChange, onAddCrop, onDeleteCrop, onCropChange }) => {
    const activeSeason = data.activeSeason;
    const seasonData = data.seasons[activeSeason];
    const totalDemand = Object.values(data.seasons).reduce((acc, s) => acc + s.demand, 0);

    return (
        <div className="irrigation-content">
            <div className="irrigation-layout">
                {/* Sidebar: Season Selector */}
                <div className="irrigation-sidebar">
                    {['kharif', 'rabi', 'summer'].map(sKey => {
                        const isActive = activeSeason === sKey;
                        return (
                            <div
                                key={sKey}
                                className={`season-card ${isActive ? 'active' : ''}`}
                                onClick={() => onSeasonChange(sKey)}
                            >
                                <div className="season-header">
                                    <div className="season-icon">
                                        <img
                                            src={`${ASSET_URLS.icons8}48/000000/${sKey === 'kharif' ? 'wheat' : sKey === 'rabi' ? 'barley' : 'sunflower'}.png`}
                                            alt={sKey}
                                        />
                                    </div>
                                    <span className="season-name">
                                        {sKey.charAt(0).toUpperCase() + sKey.slice(1)} Crops
                                    </span>
                                </div>
                                <div className="demand-badge">
                                    Demand: {data.seasons[sKey].demand.toFixed(2)} ha m
                                </div>
                            </div>
                        );
                    })}

                    <div className="irrigation-summary-grid">
                        <div className="summary-item">
                            <label>Total Water Demand</label>
                            <div className="calculated-val" style={{ fontSize: '1.2rem' }}>
                                {totalDemand.toFixed(2)} ha m
                            </div>
                        </div>
                        <div className="summary-item">
                            <label>% from GW</label>
                            <input
                                type="number"
                                value={data.gwPct || ''}
                                onChange={(e) => onSummaryChange('gwPct', e.target.value)}
                                placeholder="0"
                            />
                        </div>
                        <div className="summary-item">
                            <label>% from SW</label>
                            <input
                                type="number"
                                value={data.swPct || ''}
                                onChange={(e) => onSummaryChange('swPct', e.target.value)}
                                placeholder="0"
                            />
                        </div>
                        <div className="summary-item">
                            <label>Vol from GW (ha m)</label>
                            <div className="calculated-val">
                                {(totalDemand * (data.gwPct || 0) / 100).toFixed(2)}
                            </div>
                        </div>
                        <div className="summary-item">
                            <label>Vol from SW (ha m)</label>
                            <div className="calculated-val">
                                {(totalDemand * (data.swPct || 0) / 100).toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Area: Crop Table */}
                <div className="irrigation-main-content">
                    <div className="crop-table-container">
                        <div className="crop-table-title">
                            {activeSeason.charAt(0).toUpperCase() + activeSeason.slice(1)} Crops Details
                        </div>
                        <table className="wu-table">
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Crop Category</th>
                                    <th>Crop Type</th>
                                    <th>Crop Name</th>
                                    <th>Area (ha)</th>
                                    <th>NIR (mm)</th>
                                    <th style={{ textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {seasonData.crops.map((crop, index) => (
                                    <tr key={crop.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <input
                                                type="text"
                                                value={crop.category}
                                                onChange={(e) => onCropChange(crop.id, 'category', e.target.value)}
                                                placeholder="Category"
                                                style={{ textAlign: 'left', width: '100%' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={crop.type}
                                                onChange={(e) => onCropChange(crop.id, 'type', e.target.value)}
                                                placeholder="Type"
                                                style={{ textAlign: 'left', width: '100%' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={crop.name}
                                                onChange={(e) => onCropChange(crop.id, 'name', e.target.value)}
                                                placeholder="Name"
                                                style={{ textAlign: 'left', width: '100%' }}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={crop.area || ''}
                                                onChange={(e) => onCropChange(crop.id, 'area', e.target.value)}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={crop.requirement || ''}
                                                onChange={(e) => onCropChange(crop.id, 'requirement', e.target.value)}
                                                placeholder="0"
                                            />
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button className="btn-delete-crop" onClick={() => onDeleteCrop(crop.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                {seasonData.crops.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                            No crops added for {activeSeason} season yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <div style={{ padding: '15px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-start' }}>
                            <button className="btn-add-crop" onClick={onAddCrop} style={{ margin: 0 }}>+ Add New Crop Record</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IrrigationSection;
