import React, { useState } from 'react';
import './WaterBudget.css';
import { calculateStageOfExtraction, categorizeUnit } from '../../utils/gecCalculations';

const WaterBudget = ({ onBack, onSave, onSummary, formData = {}, setFormData }) => {

    // Local state for UI inputs to allow typing decimals (strings)
    const [localData, setLocalData] = useState(formData || {});

    // Sync from props if changed externally
    React.useEffect(() => {
        if (formData) setLocalData(prev => ({ ...prev, ...formData }));
    }, [formData]);

    // Recalculate if props change
    React.useEffect(() => {
        const newData = { ...localData, ...formData };
        // Recalculate GEC metrics
        const netAvailability = newData.netAnnualGwAvailability || newData.totalGwAvailable || 0;
        const grossDraft = newData.grossGwDraft || newData.gwWithdrawal || 0;

        const stage = calculateStageOfExtraction(grossDraft, netAvailability);
        const cat = categorizeUnit(stage);

        if (stage !== newData.stageOfExtraction || cat !== newData.category) {
            const updated = { ...newData, stageOfExtraction: stage, category: cat };
            setLocalData(updated);
            if (setFormData) setFormData(updated);
        }
    }, [formData?.netAnnualGwAvailability, formData?.grossGwDraft, formData?.totalGwAvailable, formData?.gwWithdrawal]);

    const handleFieldChange = (field, value) => {
        // Keep as string in state to allow typing decimals/minus
        const updatedData = { ...localData, [field]: value };

        // Simple calculation logic for budget
        updatedData.totalInflow = (parseFloat(updatedData.rainfallInflow) || 0) + (parseFloat(updatedData.gwInflow) || 0) + (parseFloat(updatedData.canalInflow) || 0);
        updatedData.totalOutflow = (parseFloat(updatedData.irrigationOutflow) || 0) + (parseFloat(updatedData.domesticOutflow) || 0) + (parseFloat(updatedData.industrialOutflow) || 0);
        updatedData.netBudget = updatedData.totalInflow - updatedData.totalOutflow;

        // GEC Calculations
        const netAvailability = updatedData.netAnnualGwAvailability || updatedData.totalGwAvailable || 0;
        const grossDraft = updatedData.grossGwDraft || updatedData.gwWithdrawal || 0;

        updatedData.stageOfExtraction = calculateStageOfExtraction(grossDraft, netAvailability);
        updatedData.category = categorizeUnit(updatedData.stageOfExtraction);

        setLocalData(updatedData);
        if (setFormData) setFormData(updatedData);
    };

    return (
        <div className="water-budget-container">
            <header className="wbg-header">
                <h2>Water Budget</h2>
            </header>

            {/* 1. Water Inflow */}
            <section className="wbg-section">
                <h3 className="wbg-section-title">1. Water Inflow (Annual)</h3>
                <div className="wbg-form-grid">
                    <div className="wbg-form-row">
                        <label>a. Rainfall Inflow (ha m) <i className="info-icon">i</i> :</label>
                        <input
                            type="number"
                            step="0.01"
                            value={localData.rainfallInflow || ''}
                            onChange={(e) => handleFieldChange('rainfallInflow', e.target.value)}
                        />
                    </div>
                    <div className="wbg-form-row">
                        <label>b. Ground Water Inflow (ha m) <i className="info-icon">i</i> :</label>
                        <input
                            type="number"
                            step="0.01"
                            value={localData.gwInflow || ''}
                            onChange={(e) => handleFieldChange('gwInflow', e.target.value)}
                        />
                    </div>
                    <div className="wbg-form-row">
                        <label>c. Canal/Surface Inflow (ha m) <i className="info-icon">i</i> :</label>
                        <input
                            type="number"
                            step="0.01"
                            value={localData.canalInflow || ''}
                            onChange={(e) => handleFieldChange('canalInflow', e.target.value)}
                        />
                    </div>
                    <div className="wbg-form-row highlight blue">
                        <label>d. Total Inflow (ha m) <i className="info-icon">i</i> :</label>
                        <span className="wbg-value">{Number(localData.totalInflow || 0).toFixed(2)}</span>
                    </div>
                </div>
            </section>

            {/* 2. Water Outflow */}
            <section className="wbg-section">
                <h3 className="wbg-section-title">2. Water Outflow (Annual)</h3>
                <div className="wbg-form-grid">
                    <div className="wbg-form-row">
                        <label>a. Irrigation Outflow (ha m) <i className="info-icon">i</i> :</label>
                        <input
                            type="number"
                            step="0.01"
                            value={localData.irrigationOutflow || ''}
                            onChange={(e) => handleFieldChange('irrigationOutflow', e.target.value)}
                        />
                    </div>
                    <div className="wbg-form-row">
                        <label>b. Domestic Outflow (ha m) <i className="info-icon">i</i> :</label>
                        <input
                            type="number"
                            step="0.01"
                            value={localData.domesticOutflow || ''}
                            onChange={(e) => handleFieldChange('domesticOutflow', e.target.value)}
                        />
                    </div>
                    <div className="wbg-form-row">
                        <label>c. Industrial Outflow (ha m) <i className="info-icon">i</i> :</label>
                        <input
                            type="number"
                            step="0.01"
                            value={localData.industrialOutflow || ''}
                            onChange={(e) => handleFieldChange('industrialOutflow', e.target.value)}
                        />
                    </div>
                    <div className="wbg-form-row highlight blue">
                        <label>d. Total Outflow (ha m) <i className="info-icon">i</i> :</label>
                        <span className="wbg-value">{Number(localData.totalOutflow || 0).toFixed(2)}</span>
                    </div>
                </div>
            </section>

            {/* 3. GEC Assessment Results */}
            <section className="wbg-section">
                <h3 className="wbg-section-title">3. GEC 2015 Assessment</h3>
                <div className="wbg-form-grid">
                    <div className="wbg-form-row">
                        <label>Net Annual Ground Water Availability (ha m):</label>
                        <input
                            type="number"
                            value={localData.netAnnualGwAvailability || localData.totalGwAvailable || ''}
                            onChange={(e) => handleFieldChange('netAnnualGwAvailability', e.target.value)}
                        />
                    </div>
                    <div className="wbg-form-row">
                        <label>Gross Ground Water Draft for All Uses (ha m):</label>
                        <input
                            type="number"
                            value={localData.grossGwDraft || localData.gwWithdrawal || ''}
                            onChange={(e) => handleFieldChange('grossGwDraft', e.target.value)}
                        />
                    </div>
                    <div className="wbg-form-row highlight blue">
                        <label>Stage of Ground Water Extraction (%):</label>
                        <span className="wbg-value">{Number(localData.stageOfExtraction || 0).toFixed(2)} %</span>
                    </div>
                    <div className="wbg-form-row highlight" style={{
                        backgroundColor:
                            localData.category?.includes('SAFE') ? '#f0fff4' :
                                localData.category?.includes('SEMI-CRITICAL') ? '#fffaf0' :
                                    localData.category?.includes('CRITICAL') ? '#fff5f5' : '#fff5f5',
                        borderColor:
                            localData.category?.includes('SAFE') ? '#48bb78' :
                                localData.category?.includes('SEMI-CRITICAL') ? '#ed8936' : '#e53e3e'
                    }}>
                        <label>Categorization:</label>
                        <span className="wbg-value font-large" style={{
                            color: localData.category?.includes('SAFE') ? '#38a169' :
                                localData.category?.includes('SEMI-CRITICAL') ? '#dd6b20' : '#e53e3e'
                        }}>
                            {localData.category || 'Unknown'}
                        </span>
                    </div>
                </div>
            </section>

            <div className="wbg-footer-msg">
                Before going to the summary page or next, click on the save button
            </div>

            <div className="wbg-actions">
                <button className="wbg-btn wbg-btn-back" onClick={onBack}>Back</button>
                <button className="wbg-btn wbg-btn-save" onClick={onSave}>Save</button>
                <button className="wbg-btn wbg-btn-summary" onClick={onSummary}>Summary</button>
            </div>
        </div>
    );
};

export default WaterBudget;
