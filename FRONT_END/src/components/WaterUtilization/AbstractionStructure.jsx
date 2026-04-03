import React from 'react';
import './AbstractionStructure.css';
import pumpImage from '../../assets/flow_images/groundwater_pump.png';

const AbstractionStructure = ({ data, onFormChange, onAdd, onDelete }) => {
    const { entries, currentForm } = data;

    const calculateTotalDraft = () => {
        return entries.reduce((acc, e) => acc + (e.annualDraft || 0), 0);
    };

    const totalAnnualDraft = calculateTotalDraft();

    return (
        <div className="abstraction-container">
            <h2 className="section-title-main">Groundwater Abstraction Structures</h2>

            <div className="abstraction-top-layout">
                {/* Entry Form */}
                <div className="abstraction-form-card">
                    <div className="form-group-row">
                        <label>Structure Type*</label>
                        <select
                            value={currentForm.type}
                            onChange={(e) => onFormChange('type', e.target.value)}
                        >
                            <option value="">Select Structure</option>
                            <option value="Dug Well">Dug Well</option>
                            <option value="Bore Well">Bore Well / Tube Well</option>
                            <option value="DCB">Dug Cum Bore Well</option>
                        </select>
                    </div>
                    <div className="form-group-row">
                        <label>Count (Active)*</label>
                        <input
                            type="number"
                            value={currentForm.count || ''}
                            onChange={(e) => onFormChange('count', e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="form-group-row">
                        <label>Avg. Discharge (m³/hr)*</label>
                        <input
                            type="number"
                            value={currentForm.discharge || ''}
                            onChange={(e) => onFormChange('discharge', e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="form-group-row">
                        <label>Pumping Hours (Hrs/Day)*</label>
                        <input
                            type="number"
                            value={currentForm.pumpingHours || ''}
                            onChange={(e) => onFormChange('pumpingHours', e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="form-group-row">
                        <label>Operational Days (Days/Year)*</label>
                        <input
                            type="number"
                            value={currentForm.operationalDays || ''}
                            onChange={(e) => onFormChange('operationalDays', e.target.value)}
                            placeholder="0"
                        />
                    </div>

                    <button className="btn-add-entry" onClick={onAdd}>+ Add Structure</button>
                </div>

                {/* Illustration Area / Info Box */}
                <div className="abstraction-illustration">
                    <img src={pumpImage} alt="Groundwater Pump" className="illustration-img" />
                    <div className="illustration-overlay">
                        <div className="overlay-content">
                            <h3>Abstraction Details</h3>
                            <p>Capture details of groundwater lifting devices to cross-verify utilization estimates.</p>
                            <p className="formula-hint">Draft = (Count × Discharge × Hours × Days) / 10,000 (ha m)</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Entries Table */}
            <div className="abstraction-table-wrapper">
                <table className="wu-table">
                    <thead>
                        <tr>
                            <th colSpan="8" className="table-main-header">Abstraction Structure Summary</th>
                        </tr>
                        <tr>
                            <th>Sr No</th>
                            <th>Structure Type</th>
                            <th>Count</th>
                            <th>Discharge (m³/hr)</th>
                            <th>Hrs/Day</th>
                            <th>Days/Year</th>
                            <th>Annual Draft (ha m)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, index) => (
                            <tr key={entry.id}>
                                <td>{index + 1}</td>
                                <td>{entry.type}</td>
                                <td>{entry.count}</td>
                                <td>{entry.discharge}</td>
                                <td>{entry.pumpingHours}</td>
                                <td>{entry.operationalDays}</td>
                                <td className="calculated-val">{entry.annualDraft.toFixed(6)}</td>
                                <td>
                                    <button className="btn-delete-entry" onClick={() => onDelete(entry.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {entries.length > 0 && (
                            <tr className="total-row">
                                <td colSpan="6">Total Estimated Draft (ha m)</td>
                                <td className="calculated-val">{totalAnnualDraft.toFixed(6)}</td>
                                <td></td>
                            </tr>
                        )}
                        {entries.length === 0 && (
                            <tr>
                                <td colSpan="8" className="table-empty-message">No structures added yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AbstractionStructure;
