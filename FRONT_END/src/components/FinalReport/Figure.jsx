import React from 'react';

const Figure = ({ title, className = "" }) => (
    <div className={`figure-item inline-figure ${className}`}>
        <div className="figure-title">{title}</div>
        <div className="figure-map-placeholder small-placeholder">
            <div className="placeholder-content">
                <i className="map-icon">🗺️</i>
                <p>Map will be dynamically loaded</p>
            </div>
        </div>
    </div>
);

export default Figure;
