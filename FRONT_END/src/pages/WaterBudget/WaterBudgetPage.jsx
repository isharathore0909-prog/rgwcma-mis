import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SelectionNavbar from '../../components/Shared/SelectionNavbar';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import WaterBudget from '../../components/WaterBudget/WaterBudget';
import WaterBudgetSummary from '../../components/WaterBudget/WaterBudgetSummary';
import './WaterBudgetPage.css';

const WaterBudgetPage = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const location = useLocation();

    const availabilityData = location.state?.availabilityData || {};
    const utilizationTotals = location.state?.utilizationData || { gw: 0, sw: 0 };
    const detailedUtilization = location.state?.detailedUtilization || null;

    // Helper to calculate specific sector totals
    const getOutflows = () => {
        if (!detailedUtilization) return { irrigation: 0, domestic: 0, industrial: 0 };

        const domestic = (detailedUtilization.demandMetData?.human?.gwVol || 0) +
            (detailedUtilization.demandMetData?.human?.swVol || 0) +
            (detailedUtilization.demandMetData?.livestock?.gwVol || 0) +
            (detailedUtilization.demandMetData?.livestock?.swVol || 0);

        const irrigation = (detailedUtilization.irrigationData?.gwVol || 0) +
            (detailedUtilization.irrigationData?.swVol || 0);

        const industrial = (detailedUtilization.industrialData?.entries?.reduce((s, e) => s + (e.gwVol || 0) + (e.swVol || 0), 0) || 0) +
            (detailedUtilization.otherUsesData?.entries?.reduce((s, e) => s + (e.gwVol || 0) + (e.swVol || 0), 0) || 0);

        return { irrigation, domestic, industrial };
    };

    const outflows = getOutflows();

    const [currentView, setCurrentView] = useState('form'); // 'form' or 'summary'
    const [formData, setFormData] = useState({
        rainfallInflow: availabilityData.totalGwRechargeRainfall || 0,
        gwInflow: availabilityData.totalGwRechargeOther || 0,
        canalInflow: availabilityData.totalSwAvailable || 0,
        totalInflow: availabilityData.totalWaterAvailable || 0,
        irrigationOutflow: outflows.irrigation,
        domesticOutflow: outflows.domestic,
        industrialOutflow: outflows.industrial,
        totalOutflow: outflows.irrigation + outflows.domestic + outflows.industrial,
        netBudget: (availabilityData.totalWaterAvailable || 0) - (outflows.irrigation + outflows.domestic + outflows.industrial),
        // GEC data mapped from previous steps
        netAnnualGwAvailability: availabilityData.totalGwAvailable || 0,
        grossGwDraft: utilizationTotals.gw || 0
    });

    const data = {
        state: "RAJASTHAN",
        district: location.state?.districtName || "AJMER",
        block: location.state?.blockName || "AJMER RURAL",
        gpName: location.state?.gpName || "ARADKA",
    };

    const handleBack = () => {
        if (currentView === 'summary') {
            setCurrentView('form');
        } else {
            // Back to balance
            navigate('/water-balance', {
                state: {
                    ...location.state,
                    availabilityData,
                    utilizationData: utilizationTotals
                }
            });
        }
    };

    const handleSave = (updatedData) => {
        setFormData(updatedData || formData);
        alert('Water Budget data saved successfully!');
    };

    // Scroll to top whenever currentView changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentView]);

    const handleSummary = () => {
        setCurrentView('summary');
    };

    const handleNext = () => {
        // Navigate to Demand Side Management
        navigate('/demand-side-management', {
            state: {
                ...location.state,
                budgetData: formData,
                availabilityData,
                utilizationTotals
            }
        });
    };

    return (
        <div className="wbg-page-container">
            <SelectionNavbar />

            <div className="wbg-content">
                {currentView === 'form' ? (
                    <WaterBudget
                        formData={formData}
                        setFormData={setFormData}
                        onBack={handleBack}
                        onSave={handleSave}
                        onSummary={handleSummary}
                    />
                ) : (
                    <WaterBudgetSummary
                        data={formData}
                        onBack={handleBack}
                        onNext={handleNext}
                    />
                )}
            </div>
        </div>
    );
};

export default WaterBudgetPage;
