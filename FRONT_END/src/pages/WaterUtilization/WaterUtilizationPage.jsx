import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SelectionNavbar from '../../components/Shared/SelectionNavbar';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import WaterUtilization from '../../components/WaterUtilization/WaterUtilization';
import WaterUtilizationSummary from '../../components/WaterUtilization/WaterUtilizationSummary';
import { locationService } from '../../services/locationService';
import './WaterUtilizationPage.css';

const WaterUtilizationPage = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const location = useLocation();

    // Receive availability data if passed from previous step
    const availabilityData = location.state?.availabilityData || {};

    const [currentStep, setCurrentStep] = useState('utilization'); // utilization, summary
    const [utilizationData, setUtilizationData] = useState(null);

    const data = {
        state: "RAJASTHAN",
        district: location.state?.districtName || "AJMER",
        block: location.state?.blockName || "AJMER RURAL",
        gpName: location.state?.gpName || "ARADKA",
    };

    const { gpId } = location.state || {};

    useEffect(() => {
        if (gpId && !utilizationData) {
            const controller = new AbortController();
            locationService.getAquiferData(gpId, controller.signal)
                .then(res => {
                    if (res && res.utilization) {
                        const u = res.utilization;

                        // Pre-calculate crop demands
                        const k_crops = u.kharif.name ? [{
                            id: 'k1',
                            category: u.kharif.category,
                            type: u.kharif.type,
                            name: u.kharif.name,
                            area: u.kharif.area,
                            requirement: u.kharif.nir
                        }] : [];

                        const r_crops = u.rabi.name ? [{
                            id: 'r1',
                            category: u.rabi.category,
                            type: u.rabi.type,
                            name: u.rabi.name,
                            area: u.rabi.area,
                            requirement: u.rabi.nir
                        }] : [];

                        const z_crops = u.zaid.name ? [{
                            id: 'z1',
                            category: u.zaid.category,
                            type: u.zaid.type,
                            name: u.zaid.name,
                            area: u.zaid.area,
                            requirement: u.zaid.nir
                        }] : [];

                        const k_demand = k_crops.reduce((acc, c) => acc + (Number(c.area) * Number(c.requirement) / 1000), 0);
                        const r_demand = r_crops.reduce((acc, c) => acc + (Number(c.area) * Number(c.requirement) / 1000), 0);
                        const z_demand = z_crops.reduce((acc, c) => acc + (Number(c.area) * Number(c.requirement) / 1000), 0);
                        const total_irr_demand = k_demand + r_demand + z_demand;

                        setUtilizationData({
                            humanPopulation: res.population || 0,
                            humanDailyRequirement: 70, // Standard LPCD
                            livestockData: [
                                { id: 1, name: '', count: 0, requirement: 0, total: 0 },
                                { id: 2, name: '', count: 0, requirement: 0, total: 0 },
                                { id: 3, name: '', count: 0, requirement: 0, total: 0 },
                                { id: 4, name: '', count: 0, requirement: 0, total: 0 },
                                { id: 5, name: '', count: 0, requirement: 0, total: 0 }
                            ],
                            demandMetData: {
                                human: { requirement: 0, gwPct: 100, gwVol: 0, swPct: 0, swVol: 0 },
                                livestock: { requirement: 0, gwPct: 30, gwVol: 0, swPct: 70, swVol: 0 },
                            },
                            irrigationData: {
                                activeSeason: 'kharif',
                                seasons: {
                                    kharif: { demand: k_demand, crops: k_crops },
                                    rabi: { demand: r_demand, crops: r_crops },
                                    summer: { demand: z_demand, crops: z_crops }
                                },
                                gwPct: 100,
                                swPct: 0,
                                gwVol: total_irr_demand,
                                swVol: 0
                            },
                            industrialData: {
                                entries: u.industry.name ? [{
                                    id: 'i1',
                                    name: u.industry.name,
                                    dailyReq: u.industry.daily_req,
                                    days: u.industry.days,
                                    gwPct: 100,
                                    swPct: 0,
                                    totalDemand: (Number(u.industry.daily_req) * Number(u.industry.days)) / 10000000,
                                    gwVol: (Number(u.industry.daily_req) * Number(u.industry.days)) / 10000000,
                                    swVol: 0
                                }] : [],
                                currentForm: {
                                    name: '', dailyReq: 0, days: 0, gwPct: 0, swPct: 0,
                                    dewateringDepth: 0, dewateringDuration: 0, dewateringQuantity: 0,
                                    wastewaterGenerated: 0, treatedQuantity: 0, recycledReusedQuantity: 0,
                                    treatmentSystem: '', reusePurpose: '',
                                    salineQuantity: 0, salineQuality: '', disposalStrategy: ''
                                }
                            },
                            otherUsesData: {
                                entries: u.other.type ? [{
                                    id: 'o1',
                                    type: u.other.type,
                                    dailyReq: u.other.daily_req,
                                    days: u.other.days,
                                    gwPct: 100,
                                    swPct: 0,
                                    totalDemand: (Number(u.other.daily_req) * Number(u.other.days)) / 10000000,
                                    gwVol: (Number(u.other.daily_req) * Number(u.other.days)) / 10000000,
                                    swVol: 0
                                }] : [],
                                currentForm: { type: '', dailyReq: 0, days: 0, gwPct: 0, swPct: 0 }
                            },
                            abstractionData: {
                                entries: [],
                                currentForm: { type: '', count: 0, discharge: 0, pumpingHours: 0, operationalDays: 0 }
                            }
                        });
                    }
                })
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error("Error fetching water utilization data:", err);
                    }
                });

            return () => controller.abort();
        }
    }, [gpId, utilizationData]);

    // Scroll to top whenever step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStep]);

    const handleBackToForm = () => {
        setCurrentStep('utilization');
    };

    const handleGoToBalance = () => {
        const totals = calculateTotals(utilizationData);

        navigate('/water-balance', {
            state: {
                ...location.state,
                availabilityData: availabilityData,
                utilizationData: totals,         // Simple { gw, sw } for Balance component
                detailedUtilization: utilizationData // Full data if needed
            }
        });
    };

    const calculateTotals = (data) => {
        if (!data) return { gw: 0, sw: 0 };
        // This logic mimics what I wrote in the wizard earlier

        // GW Total
        let gw = (data.demandMetData?.human?.gwVol || 0) +
            (data.demandMetData?.livestock?.gwVol || 0) +
            (data.irrigationData?.gwVol || 0) +
            (data.industrialData?.entries?.reduce((s, e) => s + (e.gwVol || 0), 0) || 0) +
            (data.otherUsesData?.entries?.reduce((s, e) => s + (e.gwVol || 0), 0) || 0);

        // SW Total
        let sw = (data.demandMetData?.human?.swVol || 0) +
            (data.demandMetData?.livestock?.swVol || 0) +
            (data.irrigationData?.swVol || 0) +
            (data.industrialData?.entries?.reduce((s, e) => s + (e.swVol || 0), 0) || 0) +
            (data.otherUsesData?.entries?.reduce((s, e) => s + (e.swVol || 0), 0) || 0);

        return { gw, sw };
    };

    const handleUtilizationNext = (formData) => {
        setUtilizationData(formData);
        setCurrentStep('summary');
    };

    const handleUtilizationSave = (formData) => {
        setUtilizationData(formData);
        alert('Utilization Data Saved!');
    };

    return (
        <div className="wu-page-container">
            <SelectionNavbar />

            {currentStep === 'utilization' && (
                <div className="wu-content">
                    <WaterUtilization
                        data={utilizationData} // Pass existing data if any
                        onBack={() => navigate('/water-availability')}
                        onSave={handleUtilizationSave}
                        onNext={handleUtilizationNext}
                    />
                </div>
            )}

            {currentStep === 'summary' && (
                <WaterUtilizationSummary
                    data={utilizationData}
                    onBack={handleBackToForm}
                    onGoToBalance={handleGoToBalance}
                />
            )}
        </div>
    );
};

export default WaterUtilizationPage;
