import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SelectionNavbar.css';

const SelectionNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Persist location.state to sessionStorage to survive page refreshes
    const state = React.useMemo(() => {
        if (location.state) {
            sessionStorage.setItem('gpSelectionState', JSON.stringify(location.state));
            return location.state;
        }
        const stored = sessionStorage.getItem('gpSelectionState');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse stored state:', e);
            }
        }
        return {};
    }, [location.state]);

    const cleanName = (name) => {
        if (!name) return "";
        return name.toString().split('_')[0].trim().toUpperCase();
    };

    const districtName = cleanName(state.districtName);
    const blockName = cleanName(state.blockName);
    const gpName = cleanName(state.gpName);

    if (!location.state && Object.keys(state).length === 0) {
        // Optional: Could redirect to dashboard if no GP is selected
        // navigate('/');
    }

    return (
        <div className="gp-top-bar no-print">
            <div className="breadcrumbs">
                <div className="crumb-item">
                    <span className="crumb-label">STATE:</span>
                    <span className="crumb-value">RAJASTHAN</span>
                </div>

                <span className="crumb-separator">/</span>

                <div className="crumb-item">
                    <span className="crumb-label">DISTRICT:</span>
                    <span className="crumb-value">{(districtName || 'AJMER').toUpperCase()}</span>
                </div>

                <span className="crumb-separator">/</span>

                <div className="crumb-item">
                    <span className="crumb-label">BLOCK:</span>
                    <span className="crumb-value">{(blockName || 'PISANGAN').toUpperCase()}</span>
                </div>

                <span className="crumb-separator">/</span>

                <div className="crumb-item">
                    <span className="crumb-label">GRAM PANCHAYAT:</span>
                    <span className="crumb-value">{(gpName || 'BHAGWANPURA').toUpperCase()}</span>
                </div>
            </div>

            <div className="top-bar-actions">
                <button
                    className="back-button"
                    onClick={() => navigate('/')}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Dashboard
                </button>
            </div>
        </div>
    );
};

export default SelectionNavbar;
