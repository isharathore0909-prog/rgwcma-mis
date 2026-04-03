import React, { useState, useEffect } from 'react';
import './MapsUpload.css';

const MapsUpload = ({ gpId, data, onBack, onSave, onNext }) => {
    const [files, setFiles] = useState({
        locationMap: { name: 'Location.jpg', uploaded: true, preview: null },
        watershedMap: { name: 'Watershed.jpg', uploaded: true, preview: null },
        aquiferMap: { name: 'Aquifer.jpg', uploaded: true, preview: null }
    });

    const handleFileChange = (e, mapType) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFiles(prev => ({
                ...prev,
                [mapType]: {
                    name: file.name,
                    uploaded: true,
                    preview: URL.createObjectURL(file)
                }
            }));
        }
    };

    const handleDelete = (mapType) => {
        if (files[mapType].preview && files[mapType].preview.startsWith('blob:')) {
            URL.revokeObjectURL(files[mapType].preview);
        }
        setFiles(prev => ({
            ...prev,
            [mapType]: { name: 'No file chosen', uploaded: false, preview: null }
        }));
    };

    const handleDownload = (mapType) => {
        const file = files[mapType];
        if (!file || !file.uploaded) return;

        if (file.preview && file.preview.startsWith('blob:')) {
            const link = document.createElement('a');
            link.href = file.preview;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Silent fallback for pre-existing system files
            console.log(`Preparing download for ${file.name}...`);
        }
    };

    return (
        <div className="maps-upload-container">
            <div className="upload-rows">
                {/* Row 1: Location Map */}
                <div className="upload-row">
                    <div className="row-content">
                        <div className="row-label">
                            <span className="row-number">1. </span>
                            <span className="row-title">Location Map </span>
                            <span className="file-types">(*.jpg, *.png): *</span>
                        </div>
                        <div className="row-controls">
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    id="location-map-input"
                                    onChange={(e) => handleFileChange(e, 'locationMap')}
                                    accept=".jpg,.jpeg,.png"
                                />
                                <label htmlFor="location-map-input" className="choose-file-btn">Choose file</label>
                                <span
                                    className={`file-name ${files.locationMap.uploaded ? 'download-link' : ''}`}
                                    onClick={() => handleDownload('locationMap')}
                                    title={files.locationMap.uploaded ? 'Click to download' : ''}
                                >
                                    {files.locationMap.name}
                                </span>
                            </div>
                            <button className="delete-btn" onClick={() => handleDelete('locationMap')}>Delete</button>
                        </div>
                    </div>
                </div>

                {/* Row 2: Watershed and Drainage Map */}
                <div className="upload-row">
                    <div className="row-content">
                        <div className="row-label">
                            <span className="row-number">2. </span>
                            <span className="row-title">Watershed and Drainage Map </span>
                            <span className="file-types">(*.jpg, *.png): *</span>
                        </div>
                        <div className="row-controls">
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    id="watershed-map-input"
                                    onChange={(e) => handleFileChange(e, 'watershedMap')}
                                    accept=".jpg,.jpeg,.png"
                                />
                                <label htmlFor="watershed-map-input" className="choose-file-btn">Choose file</label>
                                <span
                                    className={`file-name ${files.watershedMap.uploaded ? 'download-link' : ''}`}
                                    onClick={() => handleDownload('watershedMap')}
                                    title={files.watershedMap.uploaded ? 'Click to download' : ''}
                                >
                                    {files.watershedMap.name}
                                </span>
                            </div>
                            <button className="delete-btn" onClick={() => handleDelete('watershedMap')}>Delete</button>
                        </div>
                    </div>
                </div>

                {/* Row 3: Aquifer Map */}
                <div className="upload-row">
                    <div className="row-content">
                        <div className="row-label">
                            <span className="row-number">3. </span>
                            <span className="row-title">Aquifer Map </span>
                            <span className="file-types">(*.jpg, *.png): *</span>
                        </div>
                        <div className="row-controls">
                            <div className="file-input-wrapper">
                                <input
                                    type="file"
                                    id="aquifer-map-input"
                                    onChange={(e) => handleFileChange(e, 'aquiferMap')}
                                    accept=".jpg,.jpeg,.png"
                                />
                                <label htmlFor="aquifer-map-input" className="choose-file-btn">Choose file</label>
                                <span
                                    className={`file-name ${files.aquiferMap.uploaded ? 'download-link' : ''}`}
                                    onClick={() => handleDownload('aquiferMap')}
                                    title={files.aquiferMap.uploaded ? 'Click to download' : ''}
                                >
                                    {files.aquiferMap.name}
                                </span>
                            </div>
                            <button className="delete-btn" onClick={() => handleDelete('aquiferMap')}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="action-buttons">
                <button className="btn-back" onClick={onBack}>Back</button>
                <button className="btn-save" onClick={onSave}>Save</button>
                <button className="btn-next" onClick={onNext}>Next</button>
            </div>
        </div>
    );
};

export default MapsUpload;
