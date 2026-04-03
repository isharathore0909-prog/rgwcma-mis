import React, { useState } from 'react';

const InnovativeSection = ({ seasonLabel, crops, onAdd, onDelete }) => {
    const [newCrop, setNewCrop] = useState({
        measure: '',
        category: '',
        type: '',
        name: '',
        area: '',
        waterReq: '',
        savingPercent: ''
    });

    const handleAdd = () => {
        if (!newCrop.name || !newCrop.area || !newCrop.measure) return;
        onAdd(newCrop);
        setNewCrop({
            measure: '', category: '', type: '', name: '', area: '',
            waterReq: '', savingPercent: ''
        });
    };

    const MEASURE_OPTIONS = [
        "Solar Pump",
        "Mulching",
        "Laser Land Leveling",
        "Hydrogel Application",
        "Other"
    ];

    return (
        <div className="innovative-section-content">
            <h3 className="section-title">{seasonLabel}</h3>

            <div className="entry-grid">
                <div className="input-group">
                    <label>Other water saving Measures/Innovative measures</label>
                    <select value={newCrop.measure} onChange={e => setNewCrop({ ...newCrop, measure: e.target.value })}>
                        <option value="">--Select Measure--</option>
                        {MEASURE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div className="input-group">
                    <label>Crop Category</label>
                    <input type="text" value={newCrop.category} onChange={e => setNewCrop({ ...newCrop, category: e.target.value })} />
                </div>
                <div className="input-group">
                    <label>Crop Type</label>
                    <input type="text" value={newCrop.type} onChange={e => setNewCrop({ ...newCrop, type: e.target.value })} />
                </div>
                <div className="input-group">
                    <label>Crop Name</label>
                    <input type="text" value={newCrop.name} onChange={e => setNewCrop({ ...newCrop, name: e.target.value })} />
                </div>
                <div className="input-group">
                    <label>Area Proposed (ha)</label>
                    <input type="number" value={newCrop.area} onChange={e => setNewCrop({ ...newCrop, area: e.target.value })} />
                </div>
                <div className="input-group">
                    <label>Water Requirement (mm)</label>
                    <input type="number" value={newCrop.waterReq} onChange={e => setNewCrop({ ...newCrop, waterReq: e.target.value })} />
                </div>
                <div className="input-group">
                    <label>Water Saving(%)</label>
                    <input type="number" value={newCrop.savingPercent} onChange={e => setNewCrop({ ...newCrop, savingPercent: e.target.value })} />
                </div>
                <button className="add-btn" onClick={handleAdd}>Add Entry</button>
            </div>

            <div className="table-responsive">
                <table className="demand-table">
                    <thead>
                        <tr>
                            <th>S.No.</th>
                            <th>Other water saving Measures/Innovative measures</th>
                            <th>Crop Category</th>
                            <th>Crop Type</th>
                            <th>Crop Name</th>
                            <th>Area Proposed (ha)</th>
                            <th>Water Req. (mm)</th>
                            <th>Water Demand (ha m)</th>
                            <th>Water Saving(%)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {crops.map((crop, index) => (
                            <tr key={crop.id}>
                                <td>{index + 1}</td>
                                <td>{crop.measure}</td>
                                <td>{crop.category}</td>
                                <td>{crop.type}</td>
                                <td>{crop.name}</td>
                                <td>{crop.area}</td>
                                <td>{crop.waterReq}</td>
                                <td className="highlight-val">{((parseFloat(crop.waterReq || 0) / 1000) * parseFloat(crop.area || 0)).toFixed(4)}</td>
                                <td>{crop.savingPercent}</td>
                                <td><button className="del-btn" onClick={() => onDelete(crop.id)}>Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InnovativeSection;
