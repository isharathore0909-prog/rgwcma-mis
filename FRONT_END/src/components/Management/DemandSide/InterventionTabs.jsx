import React from 'react';

const INTERVENTION_TYPES = [
    { id: 'sprinkler', label: 'Micro-Irrigation through Sprinkler', icon: '🚿' },
    { id: 'drip', label: 'Micro-Irrigation through Drip', icon: '💧' },
    { id: 'pipelines', label: 'Irrigation through underground pipelines', icon: '🚜' },
    { id: 'diversification', label: 'Crop diversification', icon: '🌽' },
    { id: 'innovative', label: 'Innovative measures / others', icon: '✨' }
];

const InterventionTabs = ({ activeId, onSelect }) => {
    return (
        <div className="intervention-tabs">
            {INTERVENTION_TYPES.map(intv => (
                <button
                    key={intv.id}
                    className={`tab-btn ${activeId === intv.id ? 'active' : ''}`}
                    onClick={() => onSelect(intv.id)}
                >
                    <span className="tab-icon">{intv.icon}</span>
                    <span className="tab-label">{intv.label}</span>
                </button>
            ))}
        </div>
    );
};

export default InterventionTabs;
export { INTERVENTION_TYPES };
