import React, { useState } from 'react';

const FundingSection = ({ fundingData, onAdd, onDelete, interventionLabel, autoValues }) => {
    const isInnovative = interventionLabel === 'other measures';

    const [inputs, setInputs] = useState({
        measure: '',
        specificArea: '',
        year: '',
        department: '',
        scheme: '',
        cost: ''
    });

    const handleAdd = () => {
        onAdd(inputs);
        setInputs({ ...inputs, measure: '', specificArea: '', department: '', scheme: '', cost: '' });
    };

    const MEASURE_OPTIONS = ["Solar Pump", "Mulching", "Laser Land Leveling", "Hydrogel Application", "Other"];

    return (
        <div className="funding-section-content">
            <h3 className="section-title">Funding Source</h3>

            <div className="funding-form entry-grid">
                <div className="input-group full-width-input">
                    <label>
                        {isInnovative
                            ? 'Total Area Proposed for other measures (ha)'
                            : interventionLabel === 'Diversification'
                                ? 'Total Area Proposed Under Crop Shifted (ha)'
                                : `Total Area Proposed for ${interventionLabel} (ha)`}
                    </label>
                    <input type="text" value={autoValues.areaProp} readOnly className="readonly-input" />
                </div>

                {isInnovative && (
                    <div className="input-group full-width-input">
                        <label>Other water saving Measures/Innovative measures</label>
                        <select value={inputs.measure} onChange={e => setInputs({ ...inputs, measure: e.target.value })}>
                            <option value="">--Select Innovative measures--</option>
                            {MEASURE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                )}

                <div className="input-group full-width-input">
                    <label>
                        {isInnovative
                            ? 'Total Area Proposed for Selected Innovative measures (ha)'
                            : interventionLabel === 'Diversification'
                                ? 'Area Proposed for Crop Diversification (ha)'
                                : `Area Proposed for ${interventionLabel} (ha)`}
                    </label>
                    <input
                        type="text"
                        value={isInnovative
                            ? (autoValues.measuresMap?.[inputs.measure] || 0).toFixed(4)
                            : autoValues.areaProp}
                        readOnly
                        className="readonly-input"
                    />
                </div>

                <div className="input-group full-width-input">
                    <label>
                        {isInnovative ? 'Area Proposed for other measures (ha)' : `Area Proposed for ${interventionLabel} (ha)`}
                    </label>
                    <input type="number" value={inputs.specificArea} onChange={e => setInputs({ ...inputs, specificArea: e.target.value })} />
                </div>
                <div className="input-group">
                    <label>Financial Year</label>
                    <select value={inputs.year} onChange={e => setInputs({ ...inputs, year: e.target.value })}>
                        <option value="">--Select Financial Year--</option>
                        <option value="2023-24">2023-24</option>
                        <option value="2024-25">2024-25</option>
                        <option value="2025-26">2025-26</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Department Name</label>
                    <select value={inputs.department} onChange={e => setInputs({ ...inputs, department: e.target.value })}>
                        <option value="">--Select Department name--</option>
                        <option value="Department of Agriculture">Department of Agriculture</option>
                        <option value="Department of Horticulture">Department of Horticulture</option>
                        <option value="Panchayati Raj">Panchayati Raj</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Scheme Name</label>
                    <select value={inputs.scheme} onChange={e => setInputs({ ...inputs, scheme: e.target.value })}>
                        <option value="">--Select Scheme name--</option>
                        <option value="PMKSY">PMKSY</option>
                        <option value="ATAL BHUJAL YOJANA">ATAL BHUJAL YOJANA</option>
                        <option value="MGNREGA">MGNREGA</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Approximate Estimated Cost (in lakh)</label>
                    <input type="number" value={inputs.cost} onChange={e => setInputs({ ...inputs, cost: e.target.value })} />
                </div>
                <button className="add-btn" onClick={handleAdd}>Save Funding Data</button>
            </div>

            <div className="table-responsive">
                <table className="demand-table">
                    <thead>
                        <tr>
                            <th>Sr No</th>
                            <th>
                                {isInnovative ? 'Total Area Proposed for other measures (ha)' : 'Total Area under Conventional Irrigation (ha)'}
                            </th>
                            <th>
                                {isInnovative
                                    ? 'Other water saving Measures/Innovative measures'
                                    : interventionLabel === 'Diversification'
                                        ? 'Total Area Proposed Under Crop Shifted (ha)'
                                        : `Total Area Proposed for ${interventionLabel} (ha)`}
                            </th>
                            <th>
                                {isInnovative
                                    ? 'Total Area Proposed for Selected Innovative measures (ha)'
                                    : interventionLabel === 'Diversification'
                                        ? 'Area Proposed for Crop Diversification (ha)'
                                        : `Area Proposed for ${interventionLabel} (ha)`}
                            </th>
                            <th>
                                {isInnovative ? 'Area Proposed for other measures (ha)' : null}
                            </th>
                            <th>Financial Year</th>
                            <th>Department Name</th>
                            <th>Scheme Name</th>
                            <th>Approximate Estimated Cost (in lakh)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fundingData.map((f, index) => (
                            <tr key={f.id}>
                                <td>{index + 1}</td>
                                <td>{f.areaConv}</td>
                                <td>{isInnovative ? f.measure : f.areaProp}</td>
                                <td>{isInnovative ? f.areaProp : f.specificArea}</td>
                                {isInnovative && <td>{f.specificArea}</td>}
                                <td>{f.year}</td>
                                <td>{f.department}</td>
                                <td>{f.scheme}</td>
                                <td className="highlight-val">{f.cost}</td>
                                <td><button className="del-btn" onClick={() => onDelete(f.id)}>Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FundingSection;
