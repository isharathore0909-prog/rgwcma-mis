import React from 'react';
import './IndustrialSection.css';
import industrialImage from '../../assets/icons/industrial_water_treatment.png';

const IndustrialSection = ({ data, onFormChange, onAdd, onDelete }) => {
    const { entries, currentForm } = data;

    const calculateTotals = () => {
        return entries.reduce((acc, e) => ({
            demand: acc.demand + e.totalDemand,
            gw: acc.gw + e.gwVol,
            sw: acc.sw + e.swVol
        }), { demand: 0, gw: 0, sw: 0 });
    };

    const totals = calculateTotals();

    return (
        <div className="industrial-container">
            <h2 className="section-title-main">Industrial Water Utilization</h2>

            <div className="industrial-top-layout">
                {/* Entry Form */}
                <div className="industrial-form-card">
                    <div className="form-group-row">
                        <label>Industry Name*</label>
                        <select
                            value={currentForm.name}
                            onChange={(e) => onFormChange('name', e.target.value)}
                        >
                            <option value="">Select Industry</option>
                            <option value="Textile Mill">Textile Mill</option>
                            <option value="Cement Industry">Cement Industry</option>
                            <option value="Mining">Mining</option>
                            <option value="Stone Crusher">Stone Crusher</option>
                            <option value="Thermal Power Plant">Thermal Power Plant</option>
                            <option value="Solar Power Plant">Solar Power Plant</option>
                            <option value="Infrastructure Project">Infrastructure Project</option>
                            <option value="Food Processing">Food Processing</option>
                            <option value="Pharmaceuticals">Pharmaceuticals</option>
                            <option value="Chemical Plant">Chemical Plant</option>
                            <option value="Automobile Industry">Automobile Industry</option>
                            <option value="Tannery / Leather">Tannery / Leather</option>
                            <option value="Cold Storage">Cold Storage</option>
                            <option value="Other Industry">Other Industry</option>
                        </select>
                    </div>



                    <div className="form-group-row">
                        <label>Daily Water Requirement (l/day)*</label>
                        <input
                            type="number"
                            value={currentForm.dailyReq || ''}
                            onChange={(e) => onFormChange('dailyReq', e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="form-group-row">
                        <label>No. of Days in Use*</label>
                        <input
                            type="number"
                            value={currentForm.days || ''}
                            onChange={(e) => onFormChange('days', e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="form-group-row">
                        <label>% of Water Demand met from GW*</label>
                        <input
                            type="number"
                            value={currentForm.gwPct || ''}
                            onChange={(e) => onFormChange('gwPct', e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="form-group-row">
                        <label>% of Water Demand met from SW*</label>
                        <input
                            type="number"
                            value={currentForm.swPct || ''}
                            onChange={(e) => onFormChange('swPct', e.target.value)}
                            placeholder="0"
                        />
                    </div>



                    <button className="btn-add-entry" onClick={onAdd}>+ Add Industry Entry</button>
                </div>

                {/* Illustration Area */}
                <div className="industrial-illustration">
                    <img src={industrialImage} alt="Industrial Water Treatment Plant" />
                    <div className="illustration-overlay">
                        <div className="overlay-content">
                            <h3>Department of Water Resources</h3>
                            <p>Calculating the industrial water demand based on daily requirement and source-wise distribution.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Entries Table */}
            <div className="industrial-table-wrapper">
                <table className="wu-table">
                    <thead>
                        <tr>
                            <th colSpan="8" className="table-main-header">Industrial Water Utilization Summary</th>
                        </tr>
                        <tr>
                            <th>Sr No</th>
                            <th>Industry Name</th>
                            <th>Daily Req (l/day)</th>
                            <th>Total Demand (ha m)</th>
                            <th>GW %</th>
                            <th>SW %</th>
                            <th>GW Vol (ha m)</th>
                            <th>SW Vol (ha m)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, index) => (
                            <tr key={entry.id}>
                                <td>{index + 1}</td>
                                <td>{entry.name}</td>
                                <td>{entry.dailyReq}</td>
                                <td className="calculated-val">{entry.totalDemand.toFixed(6)}</td>
                                <td>{entry.gwPct}</td>
                                <td>{entry.swPct}</td>
                                <td className="calculated-val">{entry.gwVol.toFixed(6)}</td>
                                <td className="calculated-val">{entry.swVol.toFixed(6)}</td>
                                <td>
                                    <button className="btn-delete-entry" onClick={() => onDelete(entry.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {entries.length > 0 && (
                            <tr className="total-row">
                                <td colSpan="2">Total</td>
                                <td className="calculated-val">{totals.demand.toFixed(6)}</td>
                                <td colSpan="2"></td>
                                <td className="calculated-val">{totals.gw.toFixed(6)}</td>
                                <td className="calculated-val">{totals.sw.toFixed(6)}</td>
                                <td></td>
                            </tr>
                        )}
                        {entries.length === 0 && (
                            <tr>
                                <td colSpan="8" className="table-empty-message">No industry entries added yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IndustrialSection;
