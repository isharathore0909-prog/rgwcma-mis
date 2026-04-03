import React from 'react';
import './OtherUsesSection.css';
import irrigationImage from '../../assets/icons/irrigation_system_aerial.png';

const OtherUsesSection = ({ data, onFormChange, onAdd, onDelete }) => {
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
        <div className="other-uses-container">
            <h2 className="section-title-main">Other Water Uses (Recreational, Religious, etc.)</h2>

            <div className="other-uses-top-layout">
                {/* Entry Form */}
                <div className="other-uses-form-card">
                    <div className="form-group-row">
                        <label>Type of Use*</label>
                        <select
                            value={currentForm.type}
                            onChange={(e) => onFormChange('type', e.target.value)}
                        >
                            <option value="">Select Type</option>
                            <option value="Parks / City Gardening">Parks / City Gardening</option>
                            <option value="Religious / Templates">Religious / Temple / Pilgrimage</option>
                            <option value="Construction Site">Construction Site</option>
                            <option value="Fire Fighting Services">Fire Fighting Services</option>
                            <option value="Swimming Pool">Swimming Pool</option>
                            <option value="City Fountain / Aesthetics">City Fountain / Aesthetics</option>
                            <option value="Cattle Pond (Public)">Cattle Pond (Public)</option>
                            <option value="Public Toilets / Bio-Toilets">Public Toilets / Bio-Toilets</option>
                            <option value="Seasonal Mela / Events">Seasonal Mela / Events</option>
                            <option value="Other">Other</option>
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
                    <button className="btn-add-entry-alt" onClick={onAdd}>+ Add Use Record</button>
                </div>

                {/* Illustration Area */}
                <div className="other-uses-illustration">
                    <img src={irrigationImage} alt="Irrigation System" />
                    <div className="illustration-overlay-alt">
                        <div className="overlay-content-alt">
                            <h3>Recreational & Communal Water</h3>
                            <p>Proper documentation of communal and recreational water usage ensures balanced distribution in water-scarce regions.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Entries Table */}
            <div className="other-uses-table-wrapper">
                <table className="wu-table">
                    <thead>
                        <tr>
                            <th colSpan="10" className="table-main-header">Summary of Other Water Uses</th>
                        </tr>
                        <tr>
                            <th>Sr No</th>
                            <th>Type of Use</th>
                            <th>Daily Req (l/day)</th>
                            <th>Days in Use</th>
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
                                <td>{entry.type}</td>
                                <td>{entry.dailyReq}</td>
                                <td>{entry.days}</td>
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
                                <td colSpan="4">Total</td>
                                <td className="calculated-val">{totals.demand.toFixed(6)}</td>
                                <td colSpan="2"></td>
                                <td className="calculated-val">{totals.gw.toFixed(6)}</td>
                                <td className="calculated-val">{totals.sw.toFixed(6)}</td>
                                <td></td>
                            </tr>
                        )}
                        {entries.length === 0 && (
                            <tr>
                                <td colSpan="10" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No records added yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OtherUsesSection;
