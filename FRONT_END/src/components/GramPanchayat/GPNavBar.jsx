import React from 'react';
import { ASSET_URLS } from '../../api/config';
import './GPNavBar.css';

const GPNavBar = ({ activeStep, onStepChange }) => {
    const navItems = [
        { id: 1, label: 'Gram Panchayat (Basic Hydrology Info)', icon: `${ASSET_URLS.icons8}48/000000/landscape.png` },
        { id: 2, label: 'Maps Upload', icon: `${ASSET_URLS.icons8}48/000000/map-pin.png` },
        { id: 3, label: 'Ground Water Level', icon: `${ASSET_URLS.icons8}48/000000/marker.png` },
        { id: 4, label: 'Ground Water Quality', icon: `${ASSET_URLS.icons8}48/000000/test-tube.png` }
    ];

    return (
        <div className="gp-header-nav">
            {navItems.map((item) => (
                <div
                    key={item.id}
                    className={`nav-item ${activeStep === item.id ? 'active' : ''}`}
                    onClick={() => onStepChange(item.id)}
                >
                    <div className="icon-circle">
                        <img src={item.icon} alt={item.label} className="nav-icon-img" />
                    </div>
                    <div className="label-wrapper">
                        <span className="nav-label">{item.label}</span>

                    </div>
                </div>
            ))}
        </div>
    );
};

export default GPNavBar;
