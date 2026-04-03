import React, { useState, useEffect } from 'react';
import SupplySideTabs from './SupplySide/SupplySideTabs';
import RechargeStructure from './SupplySide/RechargeStructure';
import ConservationStructure from './SupplySide/ConservationStructure';
import { INITIAL_SUPPLY_DATA } from './SupplySide/supplyConfig';
import './Management.css';
import './DemandSideManagement.css'; // Shared theme with Demand and Water Utilization

const SupplySideManagement = ({ onBack, onSave, onFinish, initialData }) => {
    const [activeTab, setActiveTab] = useState('recharge');
    const [data, setData] = useState(initialData || INITIAL_SUPPLY_DATA);

    // Sync with initialData if it changes (e.g. from API fetch in parent)
    useEffect(() => {
        if (initialData) {
            setData(initialData);
        }
    }, [initialData]);

    // Scroll to top whenever tab changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab]);

    const handleAddStructure = (structure) => {
        const updatedData = { ...data };
        updatedData[activeTab].push({ id: Date.now(), ...structure });
        setData(updatedData);
    };

    const handleDeleteStructure = (id) => {
        const updatedData = { ...data };
        updatedData[activeTab] = updatedData[activeTab].filter(item => item.id !== id);
        setData(updatedData);
    };


    const handleNextStep = () => {
        if (activeTab === 'recharge') {
            setActiveTab('conservation');
        } else {
            onFinish(data);
        }
    };

    return (
        <div className="demand-mgmt-wrapper">
            <header className="mgmt-header" style={{ marginBottom: '30px', textAlign: 'center' }}>
                <h2 style={{ color: 'var(--wu-primary)', fontSize: '2rem', fontWeight: '800' }}>Supply Side Management</h2>
                <p className="mgmt-subtitle" style={{ color: '#64748b' }}>Augmenting groundwater through recharge and conservation structures</p>
            </header>

            <SupplySideTabs activeTab={activeTab} onSelect={setActiveTab} />

            <main className="supply-content-area">
                {activeTab === 'recharge' ? (
                    <RechargeStructure
                        data={data.recharge}
                        onAdd={handleAddStructure}
                        onDelete={handleDeleteStructure}
                    />
                ) : (
                    <ConservationStructure
                        data={data.conservation}
                        onAdd={handleAddStructure}
                        onDelete={handleDeleteStructure}
                    />
                )}
            </main>

            <div className="mgmt-actions">
                <button className="mgmt-btn back" onClick={onBack}>Back</button>
                <button className="mgmt-btn save" onClick={() => onSave(data)}>Save</button>
                <button className="mgmt-btn next" onClick={handleNextStep}>
                    {activeTab === 'conservation' ? 'Summary' : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default SupplySideManagement;
