import React from 'react';
import { SUPPLY_TABS } from './supplyConfig';

const SupplySideTabs = ({ activeTab, onSelect }) => {
    return (
        <div className="intervention-tabs">
            {SUPPLY_TABS.map(tab => (
                <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onSelect(tab.id)}
                >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

export default SupplySideTabs;
