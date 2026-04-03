import React from 'react';
import './GPInfoCard.css';

const GPInfoCard = ({ data, onSave, onNext }) => {
    return (
        <div className="gp-card-container">
            <div className="gp-section-header">
                Gram Panchayat (Basic Hydrology Info)
            </div>

            <div className="gp-form-body">
                <div className="form-row">
                    <label>1. State :</label>
                    <div className="input-box green-text">{data.state}</div>
                </div>
                <div className="form-row">
                    <label>2. District :</label>
                    <div className="input-box green-text">{data.district}</div>
                </div>
                <div className="form-row">
                    <label>3. Block / Taluk :</label>
                    <div className="input-box green-text">{data.block}</div>
                </div>
                <div className="form-row">
                    <label>4. Gram Panchayat Name :</label>
                    <div className="input-box green-text">{data.gpName}</div>
                </div>
                <div className="form-row">
                    <label>5. Gram Panchayat LGD Code ℹ️ :</label>
                    <div className="input-box green-text">{data.lgdCode}</div>
                </div>
                <div className="form-row">
                    <label>6. Block Area (ha) :</label>
                    <div className="input-box green-text">{data.blockArea}</div>
                </div>
                <div className="form-row">
                    <label>7. Gram Panchayat Area (ha) :</label>
                    <div className="input-box green-text">{data.gpArea}</div>
                </div>
                <div className="form-row">
                    <label>8. Watershed Code :</label>
                    <div className="input-box gray-text">{data.watershedCode}</div>
                </div>
                <div className="form-row">
                    <label>9. Watershed Name :</label>
                    <div className="input-box gray-text">{data.watershedName}</div>
                </div>
                <div className="form-row">
                    <label>10. Watershed Area in Block / Taluk (ha) :</label>
                    <div className="input-box placeholder-text">{data.watershedAreaInBlock}</div>
                </div>
                <div className="form-row">
                    <label>11. Sub-basin Code :</label>
                    <div className="input-box placeholder-text">{data.subBasinCode}</div>
                </div>
                <div className="form-row">
                    <label>12. Sub Basin Name:</label>
                    <div className="input-box dropdown-look">
                        {data.subBasinName}
                        <span className="dropdown-arrow">▼</span>
                    </div>
                </div>
                <div className="form-row">
                    <label>13. Basin Code :</label>
                    <div className="input-box placeholder-text">{data.basinCode}</div>
                </div>
                <div className="form-row">
                    <label>14. Basin Name <span className="required-star">*</span>:</label>
                    <div className="input-box dropdown-look">
                        {data.basinName}
                        <span className="dropdown-arrow">▼</span>
                    </div>
                </div>
            </div>

            <div className="gp-section-header">
                Hydrogeological Profile (GEC Parameters)
            </div>

            <div className="gp-form-body">
                <div className="form-row">
                    <label>15. Assessment Unit Type <span className="required-star">*</span>:</label>
                    <div className="input-box dropdown-look">
                        {data.assessmentUnitType || 'Gram Panchayat'}
                        <span className="dropdown-arrow">▼</span>
                    </div>
                </div>
                <div className="form-row">
                    <label>16. Hydrogeology (Terrain) <span className="required-star">*</span>:</label>
                    <div className="input-box dropdown-look">
                        {data.hydrogeology || 'Hard Rock'}
                        <span className="dropdown-arrow">▼</span>
                    </div>
                </div>
                <div className="form-row">
                    <label>17. Aquifer Type <span className="required-star">*</span>:</label>
                    <div className="input-box dropdown-look">
                        {data.aquiferType || 'Unconfined'}
                        <span className="dropdown-arrow">▼</span>
                    </div>
                </div>
            </div>

            <div className="gp-footer-actions">
                <div className="warning-text">
                    Before going to the summary page or next, click on the save button
                </div>
                <div className="action-buttons">
                    <button className="btn-save" onClick={onSave}>Save</button>
                    <button className="btn-next" onClick={onNext}>Next</button>
                </div>
            </div>
        </div>
    );
};

export default GPInfoCard;
