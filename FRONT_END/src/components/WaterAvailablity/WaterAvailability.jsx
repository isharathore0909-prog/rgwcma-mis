import React, { useState, useEffect, useCallback } from 'react';
import './WaterAvailability.css';
import { calculatorService } from '../../services/calculatorService';

// Imported Components
import MonsoonTab from './components/MonsoonTab';
import NonMonsoonTab from './components/NonMonsoonTab';
import AnnualTab from './components/AnnualTab';

// Add a simple debounce timeout ref outside or use a hook, for now simple global-ish let (per module)
let calcTimeout = null;

const WaterAvailability = ({ onBack, onSave, onSummary, formData = {}, setFormData }) => {
    // We use a single state object initialized from props
    // We only update parent on specific actions or debounce, but for now let's just make it work.
    const [localData, setLocalData] = useState(formData || {});
    const [activeTab, setActiveTab] = useState('MONSOON');
    const [bodies, setBodies] = useState(formData?.surfaceWaterBodies || [
        { id: 1, type: 'Ponds', count: 0, capacity: 0 }
    ]);
    const [isCalculating, setIsCalculating] = useState(false);

    // Sync local state with parent props when they arrive (e.g. from API)
    useEffect(() => {
        if (formData && Object.keys(formData).length > 0 && !isCalculating) {
            setLocalData(prev => ({ ...prev, ...formData }));
        }
    }, [formData, isCalculating]);

    // Scroll to top whenever tab changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab]);

    // Update parent periodically or on save. For now, we update on every change but avoid loops.
    const updateParent = useCallback((newData) => {
        if (setFormData) {
            setFormData(newData);
        }
    }, [setFormData]);

    const performBackendCalculation = async (data) => {
        setIsCalculating(true);
        try {
            const result = await calculatorService.calculateGEC(data);
            setLocalData(result);
            updateParent(result);
        } catch (error) {
            console.error('Calculation error:', error);
        } finally {
            setIsCalculating(false);
        }
    };

    const handleFieldChange = (field, value) => {
        setLocalData(prev => {
            let nextData = { ...prev, [field]: value };

            // Sync areas
            if (field === 'areaCommandHa' || field === 'areaNonCommandHa' || field === 'saline_area_ha') {
                const c = parseFloat(field === 'areaCommandHa' ? value : prev.areaCommandHa) || 0;
                const nc = parseFloat(field === 'areaNonCommandHa' ? value : prev.areaNonCommandHa) || 0;
                const s = parseFloat(field === 'saline_area_ha' ? value : prev.saline_area_ha) || 0;
                nextData.areaHa = c + nc + s;
            } else if (field === 'areaHa') {
                // If total area changes, reset split or keep as non-command (handled in backend but good for UI)
                const total = parseFloat(value) || 0;
                if (!prev.areaCommandHa && !prev.areaNonCommandHa) {
                    nextData.areaNonCommandHa = total;
                }
            }

            // Trigger calculation with the latest data
            if (calcTimeout) clearTimeout(calcTimeout);
            calcTimeout = setTimeout(() => {
                performBackendCalculation(nextData);
            }, 600);

            return nextData;
        });
    };

    const updateBodies = (newBodies) => {
        setBodies(newBodies);
        const totalCap = newBodies.reduce((sum, b) => sum + (parseFloat(b.capacity) || 0), 0);
        const nextData = {
            ...localData,
            surfaceWaterBodies: newBodies,
            totalStorageCapacity: totalCap
        };
        setLocalData(nextData);

        if (calcTimeout) clearTimeout(calcTimeout);
        calcTimeout = setTimeout(() => {
            performBackendCalculation(nextData);
        }, 600);
    };

    const addBody = () => {
        const newBodies = [...bodies, { id: Date.now(), type: 'Ponds', count: 0, capacity: 0 }];
        updateBodies(newBodies);
    };

    const handleBodyFieldChange = (id, field, value) => {
        const newBodies = bodies.map(b => b.id === id ? { ...b, [field]: value } : b);
        updateBodies(newBodies);
    };

    const handleNextTab = () => {
        if (activeTab === 'MONSOON') setActiveTab('NON_MONSOON');
        else if (activeTab === 'NON_MONSOON') setActiveTab('ANNUAL');
    };

    return (
        <div className="water-availability-container">
            <header className="wa-header">
                <h2>Water Availability Assessment</h2>
            </header>

            <div className="wa-tabs">
                <button
                    className={`wa-tab ${activeTab === 'MONSOON' ? 'active' : ''}`}
                    onClick={() => setActiveTab('MONSOON')}
                >
                    1. Monsoon Season
                </button>
                <button
                    className={`wa-tab ${activeTab === 'NON_MONSOON' ? 'active' : ''}`}
                    onClick={() => setActiveTab('NON_MONSOON')}
                >
                    2. Non-Monsoon Season
                </button>
                <button
                    className={`wa-tab ${activeTab === 'ANNUAL' ? 'active' : ''}`}
                    onClick={() => setActiveTab('ANNUAL')}
                >
                    3. Annual Summary
                </button>
            </div>

            {activeTab === 'MONSOON' && <MonsoonTab formData={localData} handleChange={handleFieldChange} />}
            {activeTab === 'NON_MONSOON' && <NonMonsoonTab formData={localData} handleChange={handleFieldChange} />}
            {activeTab === 'ANNUAL' && (
                <AnnualTab
                    formData={localData}
                    handleChange={handleFieldChange}
                    bodies={bodies}
                    handleBodyFieldChange={handleBodyFieldChange}
                    addBody={addBody}
                />
            )}

            <div className="wa-footer-msg">
                Before going to the summary page or next, click on the save button
            </div>

            <div className="wa-actions">
                <button className="wa-btn wa-btn-back" onClick={onBack}>Back</button>
                <button className="wa-btn wa-btn-save" onClick={onSave}>Save</button>

                {(activeTab === 'MONSOON' || activeTab === 'NON_MONSOON') && (
                    <button className="wa-btn wa-btn-summary" onClick={handleNextTab}>Next</button>
                )}

                {activeTab === 'ANNUAL' && (
                    <button className="wa-btn wa-btn-summary" onClick={onSummary}>Summary</button>
                )}
            </div>
        </div>
    );
};

export default WaterAvailability;
