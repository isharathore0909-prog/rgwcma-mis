import React, { useState } from 'react';
import { CONSERVATION_TYPES, WORK_PROPOSED_OPTIONS } from './supplyConfig';

const ConservationStructure = ({ data, onAdd, onDelete }) => {
    const [inputs, setInputs] = useState({
        villageName: '',
        locationDetails: '',
        structureType: '',
        latitude: '',
        longitude: '',
        workProposed: '',
        storageCapacity: '',
        annualFillings: '',
        effectiveStorage: '',
        financialYear: '',
        departmentName: '',
        schemeName: '',
        estimatedCost: ''
    });

    const calculatedEffectiveStorage = (parseFloat(inputs.storageCapacity || 0) * parseFloat(inputs.annualFillings || 0)).toFixed(4);

    const handleAdd = () => {
        if (!inputs.villageName || !inputs.structureType) return;
        onAdd({ ...inputs, effectiveStorage: calculatedEffectiveStorage });
        setInputs({
            villageName: '', locationDetails: '', structureType: '', latitude: '', longitude: '',
            workProposed: '', storageCapacity: '', annualFillings: '', effectiveStorage: '',
            financialYear: '', departmentName: '', schemeName: '', estimatedCost: ''
        });
    };

    return (
        <div className="supply-section-content">
            <h3 className="section-title">Water Conservation Structure</h3>

            <div className="entry-form-container">
                <div className="form-grid-vertical">
                    <div className="form-item">
                        <label>Village Name* :</label>
                        <select value={inputs.villageName} onChange={e => setInputs({ ...inputs, villageName: e.target.value })}>
                            <option value="">--Select VillageName--</option>
                            <option value="Ajaysar">Ajaysar</option>
                        </select>
                    </div>
                    <div className="form-item">
                        <label>Location Details :</label>
                        <input type="text" placeholder="Location" value={inputs.locationDetails} onChange={e => setInputs({ ...inputs, locationDetails: e.target.value })} />
                    </div>
                    <div className="form-item">
                        <label>Type of Water Conservation Structure* :</label>
                        <select value={inputs.structureType} onChange={e => setInputs({ ...inputs, structureType: e.target.value })}>
                            <option value="">--Select Structure--</option>
                            {CONSERVATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="form-item">
                        <label>Latitude of proposed structure* :</label>
                        <input type="number" value={inputs.latitude} onChange={e => setInputs({ ...inputs, latitude: e.target.value })} />
                    </div>
                    <div className="form-item">
                        <label>Longitude of proposed structure* :</label>
                        <input type="number" value={inputs.longitude} onChange={e => setInputs({ ...inputs, longitude: e.target.value })} />
                    </div>
                    <div className="form-item">
                        <label>Work Proposed *:</label>
                        <select value={inputs.workProposed} onChange={e => setInputs({ ...inputs, workProposed: e.target.value })}>
                            <option value="">--Select Work Proposed--</option>
                            {WORK_PROPOSED_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>
                    <div className="form-item">
                        <label>Storage capacity (ha m) *:</label>
                        <input type="number" value={inputs.storageCapacity} onChange={e => setInputs({ ...inputs, storageCapacity: e.target.value })} />
                    </div>
                    <div className="form-item">
                        <label>Annual no. of fillings *:</label>
                        <input type="number" value={inputs.annualFillings} onChange={e => setInputs({ ...inputs, annualFillings: e.target.value })} />
                    </div>
                    <div className="form-item">
                        <label>Effective storage available for use (ha m) :</label>
                        <input type="text" value={calculatedEffectiveStorage} readOnly className="readonly-input" />
                    </div>
                    <div className="form-item">
                        <label>Financial year*:</label>
                        <select value={inputs.financialYear} onChange={e => setInputs({ ...inputs, financialYear: e.target.value })}>
                            <option value="">--Select Financial Year--</option>
                            <option value="2023-24">2023-24</option>
                            <option value="2024-25">2024-25</option>
                        </select>
                    </div>
                    <div className="form-item">
                        <label>Department Name*:</label>
                        <select value={inputs.departmentName} onChange={e => setInputs({ ...inputs, departmentName: e.target.value })}>
                            <option value="">--Select Department Name--</option>
                            <option value="Department of Agriculture">Department of Agriculture</option>
                            <option value="Panchayati Raj Institutions (PRI)">Panchayati Raj Institutions (PRI)</option>
                        </select>
                    </div>
                    <div className="form-item">
                        <label>Scheme Name*:</label>
                        <select value={inputs.schemeName} onChange={e => setInputs({ ...inputs, schemeName: e.target.value })}>
                            <option value="">--Select Scheme--</option>
                            <option value="MANREGA">MANREGA</option>
                        </select>
                    </div>
                    <div className="form-item">
                        <label>Total Approximate Estimated Cost (In lakh) *:</label>
                        <input type="number" value={inputs.estimatedCost} onChange={e => setInputs({ ...inputs, estimatedCost: e.target.value })} />
                    </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button className="add-btn" style={{ width: '200px' }} onClick={handleAdd}>Add Structure</button>
                </div>
            </div>

            <div className="table-responsive" style={{ marginTop: '30px' }}>
                <table className="demand-table">
                    <thead>
                        <tr>
                            <th>Sr. No.</th>
                            <th>Go to Map</th>
                            <th>Village Name</th>
                            <th>Location details</th>
                            <th>Type of Water Conservation Structure</th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                            <th>Work proposed</th>
                            <th>Storage capacity (ha m)</th>
                            <th>Annual no. of fillings</th>
                            <th>Effective storage (ha m)</th>
                            <th>Financial Year</th>
                            <th>Department Name</th>
                            <th>Scheme Name</th>
                            <th>Approx Cost (lakh)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={item.id}>
                                <td>{index + 1}</td>
                                <td style={{ textAlign: 'center' }}><span style={{ cursor: 'pointer', color: '#2563eb' }}>📍</span></td>
                                <td>{item.villageName}</td>
                                <td>{item.locationDetails}</td>
                                <td>{item.structureType}</td>
                                <td>{item.latitude}</td>
                                <td>{item.longitude}</td>
                                <td>{item.workProposed}</td>
                                <td>{item.storageCapacity}</td>
                                <td>{item.annualFillings}</td>
                                <td className="highlight-val">{item.effectiveStorage}</td>
                                <td>{item.financialYear}</td>
                                <td>{item.departmentName}</td>
                                <td>{item.schemeName}</td>
                                <td>{item.estimatedCost}</td>
                                <td>
                                    <button className="del-btn" onClick={() => onDelete(item.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="save-container" style={{ textAlign: 'center', margin: '20px 0' }}>
                <p className="notice-text">Before going to the summary page or next, click on the save button</p>
            </div>
        </div>
    );
};

export default ConservationStructure;
