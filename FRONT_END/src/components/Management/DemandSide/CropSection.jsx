import React, { useState } from 'react';

const CropSection = ({ seasonLabel, crops, onAdd, onDelete, reductionPercent, interventionLabel }) => {
    const [newCrop, setNewCrop] = useState({
        category: '',
        type: '',
        name: '',
        areaConv: '',
        netReq: '',
        areaProposed: ''
    });

    const handleAdd = () => {
        if (!newCrop.name || !newCrop.areaProposed) return;
        onAdd(newCrop);
        setNewCrop({ category: '', type: '', name: '', areaConv: '', netReq: '', areaProposed: '' });
    };

    return (
        <div className="crop-section-content">
            <h3 className="section-title">{seasonLabel}</h3>

            <div className="entry-grid">
                <div className="input-group">
                    <label>Crop Category</label>
                    <input type="text" value={newCrop.category} onChange={e => setNewCrop({ ...newCrop, category: e.target.value })} placeholder="e.g. General Crops" />
                </div>
                <div className="input-group">
                    <label>Crop Type</label>
                    <input type="text" value={newCrop.type} onChange={e => setNewCrop({ ...newCrop, type: e.target.value })} placeholder="e.g. Cereal" />
                </div>
                <div className="input-group">
                    <label>Crop Name</label>
                    <input type="text" value={newCrop.name} onChange={e => setNewCrop({ ...newCrop, name: e.target.value })} placeholder="e.g. Wheat" />
                </div>
                <div className="input-group">
                    <label>Area under Conventional Irrigation (ha)</label>
                    <input type="number" value={newCrop.areaConv} onChange={e => setNewCrop({ ...newCrop, areaConv: e.target.value })} />
                </div>
                <div className="input-group">
                    <label>Net Water Requirement (mm)</label>
                    <input type="number" value={newCrop.netReq} onChange={e => setNewCrop({ ...newCrop, netReq: e.target.value })} />
                </div>
                <div className="input-group">
                    <label>Area Proposed for {interventionLabel} (ha)</label>
                    <input type="number" value={newCrop.areaProposed} onChange={e => setNewCrop({ ...newCrop, areaProposed: e.target.value })} />
                </div>
                <button className="add-btn" onClick={handleAdd}>Add Crop Entry</button>
            </div>

            <div className="table-responsive">
                <table className="demand-table">
                    <thead>
                        <tr>
                            <th>S.No.</th>
                            <th>Crop Category</th>
                            <th>Crop Type</th>
                            <th>Crop Name</th>
                            <th>Area under Conv. Irr. (ha)</th>
                            <th>Net Water Req. (mm)</th>
                            <th>Area Proposed for {interventionLabel} (ha)</th>
                            <th>Standard Reduction in Water Demand ({reductionPercent * 100}%)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {crops.map((crop, index) => (
                            <tr key={crop.id}>
                                <td>{index + 1}</td>
                                <td>{crop.category}</td>
                                <td>{crop.type}</td>
                                <td>{crop.name}</td>
                                <td>{crop.areaConv}</td>
                                <td>{crop.netReq}</td>
                                <td>{crop.areaProposed}</td>
                                <td className="highlight-val">{(crop.netReq * reductionPercent).toFixed(2)}</td>
                                <td><button className="del-btn" onClick={() => onDelete(crop.id)}>Delete</button></td>
                            </tr>
                        ))}
                        {crops.length === 0 && (
                            <tr><td colSpan="9" className="empty-msg">No entries added for this season.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CropSection;
