import React from 'react';

const ChartFigure = ({ title }) => {
    return (
        <div className="chart-figure">
            <div className="chart-title">{title}</div>
            <div className="chart-placeholder">
                <div className="chart-icon">
                    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                        <rect x="10" y="35" width="8" height="15" fill="#4299e1" opacity="0.8" />
                        <rect x="22" y="25" width="8" height="25" fill="#48bb78" opacity="0.8" />
                        <rect x="34" y="20" width="8" height="30" fill="#ed8936" opacity="0.8" />
                        <rect x="46" y="15" width="8" height="35" fill="#9f7aea" opacity="0.8" />
                    </svg>
                </div>
                <p className="chart-message">Analytical chart will be dynamically loaded</p>
            </div>
        </div>
    );
};

export default ChartFigure;
