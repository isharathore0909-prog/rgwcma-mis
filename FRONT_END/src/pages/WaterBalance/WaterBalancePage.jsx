import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SelectionNavbar from '../../components/Shared/SelectionNavbar';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import WaterBalance from '../../components/WaterBalance/WaterBalance';
import WaterBalanceSummary from '../../components/WaterBalance/WaterBalanceSummary';
import './WaterBalancePage.css';

const WaterBalancePage = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve passed data
    const utilizationTotals = location.state?.utilizationData || { gw: 0, sw: 0 };
    const detailedUtilization = location.state?.detailedUtilization || null;
    const availabilityFullData = location.state?.availabilityData || {};

    // Prepare initial props for WaterBalance
    const initialAvailability = {
        gw: availabilityFullData.totalGwAvailable || '',
        sw: availabilityFullData.totalSwAvailable || ''
    };

    // Local state for this page
    const [currentStep, setCurrentStep] = useState('form'); // 'form' or 'summary'
    const [balanceData, setBalanceData] = useState(null); // Will hold calculated balance

    const data = {
        state: "RAJASTHAN",
        district: location.state?.districtName || "AJMER",
        block: location.state?.blockName || "AJMER RURAL",
        gpName: location.state?.gpName || "ARADKA",
    };

    const handleSave = (data) => {
        // data contains { availability: {gw, sw}, balance: {gw, sw} }
        setBalanceData({
            availability: data.availability,
            utilization: utilizationTotals,
            balance: data.balance
        });
        alert('Water Balance data saved!');
    };

    // Scroll to top whenever step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    const handleShowSummary = () => {
        if (!balanceData) {
            alert('Please save the data first.');
            return;
        }
        setCurrentStep('summary');
    };

    const handleBackToForm = () => {
        setCurrentStep('form');
    };

    const handleBackToUtilization = () => {
        // Navigate back to Utilization page
        navigate('/water-utilization', {
            state: {
                ...location.state,
                availabilityData: availabilityFullData
            }
        });
    };

    const handleNext = () => {
        if (!balanceData) {
            alert('Please save data first');
            return;
        }
        navigate('/water-budget', {
            state: {
                ...location.state,
                availabilityData: availabilityFullData,
                utilizationData: utilizationTotals,
                balanceData: balanceData.balance,
                detailedUtilization: detailedUtilization
            }
        });
    };

    return (
        <div className="wb-page-container">
            <SelectionNavbar />

            <div className="wb-content">
                {currentStep === 'form' && (
                    <WaterBalance
                        utilizationData={utilizationTotals}
                        availabilityData={initialAvailability}
                        onBack={handleBackToUtilization}
                        onSave={handleSave}
                        onSummary={handleShowSummary}
                    />
                )}

                {currentStep === 'summary' && (
                    <WaterBalanceSummary
                        data={balanceData}
                        onBack={handleBackToForm}
                        onNext={handleNext}
                    />
                )}
            </div>
        </div>
    );
};

export default WaterBalancePage;
