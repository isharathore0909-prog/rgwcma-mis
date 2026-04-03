import React, { useState } from 'react';

const DiversificationSection = ({ seasonLabel, data, onAddOriginal, onAddChanged, onDeleteChanged }) => {
    const [newOriginal, setNewOriginal] = useState({ category: '', type: '', name: '', area: '', waterReq: '' });
    const [newChanged, setNewChanged] = useState({ origId: '', category: '', type: '', name: '', area: '', waterReq: '' });
    const [selectedOrig, setSelectedOrig] = useState(null);

    const handleAddOriginal = () => {
        if (!newOriginal.name) return;
        onAddOriginal(newOriginal);
        setNewOriginal({ category: '', type: '', name: '', area: '', waterReq: '' });
    };

    const handleAddChanged = () => {
        if (!newChanged.name || !selectedOrig) return;
        onAddChanged({ ...newChanged, origId: selectedOrig.id, origName: selectedOrig.name, origArea: selectedOrig.area });
        setNewChanged({ origId: '', category: '', type: '', name: '', area: '', waterReq: '' });
        setSelectedOrig(null);
    };

    const originalCrops = data.original || [];
    const changedCrops = data.changed || [];

    const totalOriginalDemand = originalCrops.reduce((sum, c) => sum + (parseFloat(c.waterReq || 0) / 1000) * parseFloat(c.area || 0), 0);

    return (
        <div className="diversification-section">
            <h3 className="section-title">{seasonLabel}</h3>

            <div className="div-sub-section">
                <h4 className="sub-title">Original Crops</h4>

                {/* Entry for Original (so user can actually test it) */}
                <div className="entry-grid">
                    <div className="input-group"><label>Category</label><input type="text" value={newOriginal.category} onChange={e => setNewOriginal({ ...newOriginal, category: e.target.value })} /></div>
                    <div className="input-group"><label>Type</label><input type="text" value={newOriginal.type} onChange={e => setNewOriginal({ ...newOriginal, type: e.target.value })} /></div>
                    <div className="input-group"><label>Name</label><input type="text" value={newOriginal.name} onChange={e => setNewOriginal({ ...newOriginal, name: e.target.value })} /></div>
                    <div className="input-group"><label>Area (ha)</label><input type="number" value={newOriginal.area} onChange={e => setNewOriginal({ ...newOriginal, area: e.target.value })} /></div>
                    <div className="input-group"><label>Water Req (mm)</label><input type="number" value={newOriginal.waterReq} onChange={e => setNewOriginal({ ...newOriginal, waterReq: e.target.value })} /></div>
                    <button className="add-btn" onClick={handleAddOriginal}>Add Original Crop</button>
                </div>

                <div className="table-responsive">
                    <table className="demand-table">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Crop Category</th>
                                <th>Crop Type</th>
                                <th>Crop Name</th>
                                <th>Area under Conventional Irrigation (ha)</th>
                                <th>Water Requirement (mm)</th>
                                <th>Water Demand (ha m)</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {originalCrops.map((crop, index) => (
                                <tr key={crop.id}>
                                    <td>{index + 1}</td>
                                    <td>{crop.category}</td>
                                    <td>{crop.type}</td>
                                    <td>{crop.name}</td>
                                    <td>{crop.area}</td>
                                    <td>{crop.waterReq}</td>
                                    <td className="highlight-val">{((parseFloat(crop.waterReq || 0) / 1000) * parseFloat(crop.area || 0)).toFixed(4)}</td>
                                    <td>
                                        <button className="mgmt-btn-small" onClick={() => setSelectedOrig(crop)}>
                                            {selectedOrig?.id === crop.id ? 'Selected' : 'Change Crop'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            <tr className="total-row">
                                <td colSpan="6">Total</td>
                                <td className="total-val">{totalOriginalDemand.toFixed(4)}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="div-sub-section" style={{ marginTop: '40px' }}>
                <h4 className="sub-title">Changed Crops</h4>

                {selectedOrig && (
                    <div className="selection-status">
                        Changing Crop: <strong>{selectedOrig.name}</strong> ({selectedOrig.area} ha)
                    </div>
                )}

                <div className="entry-grid">
                    <div className="input-group"><label>Crop Category</label><input type="text" value={newChanged.category} onChange={e => setNewChanged({ ...newChanged, category: e.target.value })} /></div>
                    <div className="input-group"><label>Crop Type</label><input type="text" value={newChanged.type} onChange={e => setNewChanged({ ...newChanged, type: e.target.value })} /></div>
                    <div className="input-group"><label>Crop Name</label><input type="text" value={newChanged.name} onChange={e => setNewChanged({ ...newChanged, name: e.target.value })} /></div>
                    <div className="input-group"><label>Area Under Crop Shifted (ha)</label><input type="number" value={newChanged.area} onChange={e => setNewChanged({ ...newChanged, area: e.target.value })} /></div>
                    <div className="input-group"><label>Water Requirement (mm)</label><input type="number" value={newChanged.waterReq} onChange={e => setNewChanged({ ...newChanged, waterReq: e.target.value })} /></div>
                    <button className="add-btn" onClick={handleAddChanged} disabled={!selectedOrig}>Save Changed Crop</button>
                </div>

                <div className="table-responsive">
                    <table className="demand-table multi-header">
                        <thead>
                            <tr className="head-category">
                                <th colSpan="3">Original Crop</th>
                                <th colSpan="5">Changed Crop</th>
                                <th></th>
                            </tr>
                            <tr>
                                <th>S.No.</th>
                                <th>Crop Name</th>
                                <th>Area under Conv. Irr. (ha)</th>
                                <th>Crop Category</th>
                                <th>Crop Type</th>
                                <th>Crop Name</th>
                                <th>Area Under Crop Shifted (ha)</th>
                                <th>Water Req. (mm)</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {changedCrops.map((crop, index) => (
                                <tr key={crop.id}>
                                    <td>{index + 1}</td>
                                    <td>{crop.origName}</td>
                                    <td>{crop.origArea}</td>
                                    <td>{crop.category}</td>
                                    <td>{crop.type}</td>
                                    <td>{crop.name}</td>
                                    <td>{crop.area}</td>
                                    <td>{crop.waterReq}</td>
                                    <td><button className="del-btn" onClick={() => onDeleteChanged(crop.id)}>Delete</button></td>
                                </tr>
                            ))}
                            {changedCrops.length === 0 && (
                                <tr><td colSpan="9" className="empty-msg">No changes recorded.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DiversificationSection;
