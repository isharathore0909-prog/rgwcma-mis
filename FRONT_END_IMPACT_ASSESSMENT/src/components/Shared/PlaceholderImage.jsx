import React from 'react';

/**
 * Shared Placeholder component to display a "No Image" icon and message 
 * when maps, WMS layers, or graphs are unavailable.
 */
const PlaceholderImage = ({ title, height = '350px', width = '100%', message = "Initializing...", style = {} }) => {
    return (
        <div className="chart-figure" style={{ width, margin: '0', ...style }}>
            {title && <div className="chart-title">{title}</div>}
            <div className="chart-placeholder" style={{
                height,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                gap: '12px',
                padding: '20px'
            }}>
                {/* SVG Icon matching the user's request (Image Placeholder) */}
                <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: 0.8 }}
                >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="#94a3b8" />
                    <path d="M21 15l-5-5L5 21" />
                    <path d="M15 13l3-3 3 3" />
                </svg>
            </div>
        </div>
    );
};

export default PlaceholderImage;
