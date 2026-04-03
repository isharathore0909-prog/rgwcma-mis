import React from 'react';

const SEASONS = [
    { id: 'kharif', label: 'Kharif Crops', icon: '🌾' },
    { id: 'rabi', label: 'Rabi Crops', icon: '🌾' },
    { id: 'summer', label: 'Summer Crops', icon: '☀️' },
    { id: 'funding', label: 'Funding Source', icon: '💰' }
];

const SeasonSidebar = ({ activeId, onSelect, getSeasonTotals, totalReduction }) => {
    return (
        <aside className="demand-sidebar">
            <div className="season-selector">
                {SEASONS.map(s => {
                    const stats = s.id !== 'funding' ? getSeasonTotals(s.id) : null;
                    return (
                        <div
                            key={s.id}
                            className={`season-card ${activeId === s.id ? 'active' : ''}`}
                            onClick={() => onSelect(s.id)}
                        >
                            <div className="season-header">
                                <span className="season-icon">{s.icon}</span>
                                <span className="season-name">{s.label}</span>
                            </div>
                            {stats && (
                                <div className="season-stats">
                                    {stats.label1 && <p>{stats.label1} = {stats.val1} (ha m)</p>}
                                    {stats.label2 && <p>{stats.label2} = {stats.val2} (ha m)</p>}
                                    {stats.label3 && <p>{stats.label3} = {stats.val3} (ha m)</p>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="total-reduction-box">
                Total Reduction in Water Demand (ha m): <strong>{totalReduction}</strong>
            </div>
        </aside>
    );
};

export default SeasonSidebar;
export { SEASONS };
