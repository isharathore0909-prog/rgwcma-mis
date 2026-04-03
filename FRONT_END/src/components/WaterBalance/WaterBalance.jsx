import React, { useState, useEffect } from 'react';
import './WaterBalance.css';
import { calculatorService } from '../../services/calculatorService';

const WaterBalance = ({
    utilizationData = { gw: 0, sw: 0 },
    availabilityData = { gw: '', sw: '' },
    onBack,
    onSave,
    onSummary
}) => {
    // State for Availability Inputs
    const [availability, setAvailability] = useState({
        gw: availabilityData.gw || '',
        sw: availabilityData.sw || ''
    });

    const [balances, setBalances] = useState({
        gwBalance: 0,
        swBalance: 0,
        totalBalance: 0
    });

    useEffect(() => {
        if (availabilityData.gw || availabilityData.sw) {
            setAvailability({
                gw: availabilityData.gw || '',
                sw: availabilityData.sw || ''
            });
        }
    }, [availabilityData]);

    // Recalculate balance when inputs or props change
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await calculatorService.calculateUtilization({
                    available_gw: availability.gw || 0,
                    available_sw: availability.sw || 0,
                    utilized_gw: utilizationData.gw || 0,
                    utilized_sw: utilizationData.sw || 0
                }, 'water_balance');
                setBalances(res);
            } catch (e) {
                console.error('Balance calculation error:', e);
            }
        };

        const timer = setTimeout(fetchBalance, 600);
        return () => clearTimeout(timer);
    }, [availability, utilizationData]);

    const handleAvailabilityChange = (field, value) => {
        setAvailability(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const availTotal = (parseFloat(availability.gw) || 0) + (parseFloat(availability.sw) || 0);
    const utilGwVal = utilizationData.gw || 0;
    const utilSwVal = utilizationData.sw || 0;
    const utilTotal = utilGwVal + utilSwVal;

    return (
        <div className="water-balance-container">
            <header className="wb-header">
                <h2>Water Balance</h2>
            </header>

            {/* Water Availability Section */}
            <section className="wb-section">
                <h3 className="wb-section-title">Water Availability (ha m)</h3>
                <div className="wb-form-grid">
                    <div className="wb-form-row">
                        <label>Total Ground Water Available <i className="info-icon">i</i> :</label>
                        <input
                            type="number"
                            placeholder="Enter Ground Water.."
                            value={availability.gw}
                            onChange={(e) => handleAvailabilityChange('gw', e.target.value)}
                        />
                    </div>
                    <div className="wb-form-row">
                        <label>Total Surface Water Available <i className="info-icon">i</i> :</label>
                        <input
                            type="number"
                            placeholder="Enter Surface Water.."
                            value={availability.sw}
                            onChange={(e) => handleAvailabilityChange('sw', e.target.value)}
                        />
                    </div>
                    <div className="wb-form-row">
                        <label>Total Water Availability <i className="info-icon">i</i> :</label>
                        <input
                            type="text"
                            value={availTotal > 0 ? availTotal.toFixed(2) : ''}
                            disabled
                            className="wb-value-display"
                        />
                    </div>
                </div>
            </section>

            {/* Water Utilization Section */}
            <section className="wb-section">
                <h3 className="wb-section-title">Water Utilization (ha m)</h3>
                <div className="wb-form-grid">
                    <div className="wb-form-row">
                        <label>Total Ground Water Utilization <i className="info-icon">i</i> :</label>
                        <input
                            type="text"
                            value={utilGwVal.toFixed(2)}
                            disabled
                            className="wb-value-display"
                        />
                    </div>
                    <div className="wb-form-row">
                        <label>Total Surface Water Utilization <i className="info-icon">i</i> :</label>
                        <input
                            type="text"
                            value={utilSwVal.toFixed(2)}
                            disabled
                            className="wb-value-display"
                        />
                    </div>
                    <div className="wb-form-row">
                        <label>Total Water Utilization <i className="info-icon">i</i> :</label>
                        <input
                            type="text"
                            value={utilTotal.toFixed(2)}
                            disabled
                            className="wb-value-display"
                        />
                    </div>
                </div>
            </section>

            {/* Balance Section */}
            <section className="wb-section">
                <h3 className="wb-section-title">Balance [Surplus (+) / Deficit (-)] (ha m)</h3>
                <div className="wb-form-grid">
                    <div className="wb-form-row">
                        <label>Total Ground Water Balance <i className="info-icon">i</i> :</label>
                        <div className="wb-input-with-status">
                            <input
                                type="text"
                                value={balances.gwBalance.toFixed(2)}
                                disabled
                                className={`wb-value-display ${balances.gwBalance >= 0 ? 'surplus-text' : 'deficit-text'}`}
                            />
                            <span className={`status-indicator ${balances.gwBalance >= 0 ? 'surplus' : 'deficit'}`}>
                                {balances.gwBalance >= 0 ? '▲ Surplus' : '▼ Deficit'}
                            </span>
                        </div>
                    </div>
                    <div className="wb-form-row">
                        <label>Total Surface Water Balance <i className="info-icon">i</i> :</label>
                        <div className="wb-input-with-status">
                            <input
                                type="text"
                                value={balances.swBalance.toFixed(2)}
                                disabled
                                className={`wb-value-display ${balances.swBalance >= 0 ? 'surplus-text' : 'deficit-text'}`}
                            />
                            <span className={`status-indicator ${balances.swBalance >= 0 ? 'surplus' : 'deficit'}`}>
                                {balances.swBalance >= 0 ? '▲ Surplus' : '▼ Deficit'}
                            </span>
                        </div>
                    </div>
                    <div className="wb-form-row">
                        <label>Total Water Balance <i className="info-icon">i</i> :</label>
                        <div className="wb-input-with-status">
                            <input
                                type="text"
                                value={balances.totalBalance.toFixed(2)}
                                disabled
                                className={`wb-value-display ${balances.totalBalance >= 0 ? 'surplus-text' : 'deficit-text'}`}
                            />
                            <span className={`status-indicator ${balances.totalBalance >= 0 ? 'surplus' : 'deficit'}`}>
                                {balances.totalBalance >= 0 ? '▲ Surplus' : '▼ Deficit'}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="wb-footer-msg">
                Before going to the summary page or next, click on the save button
            </div>

            <div className="wb-actions">
                <button className="wb-btn wb-btn-back" onClick={onBack}>Back</button>
                <button className="wb-btn wb-btn-save" onClick={() => onSave({ availability, balance: balances })}>Save</button>
                <button className="wb-btn wb-btn-summary" onClick={onSummary}>Summary</button>
            </div>
        </div>
    );
};

export default WaterBalance;
