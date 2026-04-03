import React, { useState, useEffect } from 'react';
import InterventionTabs from './DemandSide/InterventionTabs';
import SeasonSidebar from './DemandSide/SeasonSidebar';
import CropSection from './DemandSide/CropSection';
import DiversificationSection from './DemandSide/DiversificationSection';
import InnovativeSection from './DemandSide/InnovativeSection';
import FundingSection from './DemandSide/FundingSection';
import { INTERVENTION_TYPES, SEASONS, INITIAL_DATA } from './DemandSide/demandConfig';
import './DemandSideManagement.css';

const DemandSideManagement = ({ onBack, onSave, onNext, initialData }) => {
    const [activeIntervention, setActiveIntervention] = useState('sprinkler');
    const [activeSeason, setActiveSeason] = useState('kharif');
    const [data, setData] = useState(initialData || INITIAL_DATA);

    // Sync with initialData if it changes (e.g. from API fetch in parent)
    useEffect(() => {
        if (initialData) {
            setData(initialData);
        }
    }, [initialData]);

    // Scroll to top whenever intervention or season changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeIntervention, activeSeason]);

    const activeIntervObj = INTERVENTION_TYPES.find(i => i.id === activeIntervention);
    const reductionPercent = activeIntervObj.reduction;
    const isSpecial = activeIntervObj.type === 'special';

    const handleAddCrop = (newCrop) => {
        const entry = { id: Date.now(), ...newCrop };
        const updatedData = { ...data };
        if (isSpecial) {
            updatedData[activeIntervention][activeSeason].original.push(entry);
        } else {
            updatedData[activeIntervention][activeSeason].push(entry);
        }
        setData({ ...updatedData });
    };

    const handleAddChangedCrop = (newCrop) => {
        const entry = { id: Date.now(), ...newCrop };
        const updatedData = { ...data };
        updatedData[activeIntervention][activeSeason].changed.push(entry);
        setData({ ...updatedData });
    };

    const handleDeleteCrop = (id) => {
        const updatedData = { ...data };
        if (isSpecial) {
            updatedData[activeIntervention][activeSeason].original = updatedData[activeIntervention][activeSeason].original.filter(item => item.id !== id);
        } else {
            updatedData[activeIntervention][activeSeason] = updatedData[activeIntervention][activeSeason].filter(item => item.id !== id);
        }
        setData({ ...updatedData });
    };

    const handleAddFunding = (inputs) => {
        const areaValues = getAutoAreaValues();
        const entry = {
            id: Date.now(),
            ...inputs,
            areaConv: areaValues.areaConv,
            areaProp: areaValues.areaProp
        };
        const updatedData = { ...data };
        updatedData[activeIntervention].funding.push(entry);
        setData({ ...updatedData });
    };

    const getSeasonTotals = (sId) => {
        const seasonData = data[activeIntervention][sId];

        if (isSpecial) {
            const originalCrops = seasonData.original || [];
            const changedCrops = seasonData.changed || [];

            const origDemand = originalCrops.reduce((sum, c) => sum + (parseFloat(c.waterReq || 0) / 1000) * parseFloat(c.area || 0), 0);
            const changedDemand = changedCrops.reduce((sum, c) => sum + (parseFloat(c.waterReq || 0) / 1000) * parseFloat(c.area || 0), 0);
            const reduction = origDemand - changedDemand;

            return {
                label1: "Original Crop Water Demand",
                val1: origDemand === 0 ? "(ha m)" : origDemand.toFixed(2),
                label2: "Changed Crop Water Demand",
                val2: changedDemand === 0 ? "(ha m)" : changedDemand.toFixed(2),
                label3: "Reduction in Water Demand",
                val3: reduction === 0 ? "(ha m)" : reduction.toFixed(2)
            };
        } else if (activeIntervObj.type === 'innovative') {
            const crops = seasonData || [];
            const totalDemand = crops.reduce((sum, c) => sum + (parseFloat(c.waterReq || 0) / 1000) * parseFloat(c.area || 0), 0);
            const reduction = crops.reduce((sum, c) => sum + ((parseFloat(c.waterReq || 0) / 1000) * parseFloat(c.area || 0)) * (parseFloat(c.savingPercent || 0) / 100), 0);

            return {
                label1: "Total Water Demand",
                val1: totalDemand === 0 ? "0.00" : totalDemand.toFixed(2),
                label2: "Reduction in Water Demand",
                val2: reduction === 0 ? "0.00" : reduction.toFixed(2),
                label3: "",
                val3: reduction.toFixed(4)
            };
        } else {
            const crops = seasonData || [];
            const totalWaterDemand = crops.reduce((sum, c) => sum + (parseFloat(c.netReq || 0) / 1000) * parseFloat(c.areaConv || 0), 0);
            const reduction = crops.reduce((sum, c) => sum + (parseFloat(c.netReq || 0) / 1000) * parseFloat(c.areaProposed || 0) * reductionPercent, 0);
            const netWaterDemand = totalWaterDemand - reduction;

            return {
                label1: "Total Water Demand",
                val1: totalWaterDemand === 0 ? "(ha m)" : totalWaterDemand.toFixed(2),
                label2: "Net Water Demand",
                val2: netWaterDemand === 0 ? "(ha m)" : netWaterDemand.toFixed(2),
                label3: "Reduction in Water Demand",
                val3: reduction === 0 ? "(ha m)" : reduction.toFixed(2)
            };
        }
    };

    const getTotalReductionByIntv = () => {
        const seasons = ['kharif', 'rabi', 'summer'];
        let total = 0;

        seasons.forEach(s => {
            const stats = getSeasonTotals(s);
            const val = parseFloat(stats.val3);
            if (!isNaN(val)) total += val;
        });

        return total === 0 ? "0.0000" : total.toFixed(4);
    };

    const getAutoAreaValues = () => {
        const seasons = ['kharif', 'rabi', 'summer'];
        let areaConv = 0;
        let areaProp = 0;
        const measuresMap = {};

        seasons.forEach(s => {
            if (isSpecial) {
                const crops = data[activeIntervention][s].original || [];
                const changed = data[activeIntervention][s].changed || [];
                areaConv += crops.reduce((sum, c) => sum + parseFloat(c.area || 0), 0);
                areaProp += changed.reduce((sum, c) => sum + parseFloat(c.area || 0), 0);
            } else if (activeIntervObj.type === 'innovative') {
                const crops = data[activeIntervention][s] || [];
                areaProp += crops.reduce((sum, c) => sum + parseFloat(c.area || 0), 0);
                // Aggregating by measure for the funding dropdown
                crops.forEach(c => {
                    if (c.measure) {
                        measuresMap[c.measure] = (measuresMap[c.measure] || 0) + parseFloat(c.area || 0);
                    }
                });
            } else {
                const crops = data[activeIntervention][s] || [];
                areaConv += crops.reduce((sum, c) => sum + parseFloat(c.areaConv || 0), 0);
                areaProp += crops.reduce((sum, c) => sum + parseFloat(c.areaProposed || 0), 0);
            }
        });

        return {
            areaConv: areaConv.toFixed(4),
            areaProp: areaProp.toFixed(4),
            measuresMap
        };
    };

    const interventionLabel = activeIntervObj.shortLabel;


    const handleNextStep = () => {
        const currentIndex = INTERVENTION_TYPES.findIndex(i => i.id === activeIntervention);
        if (currentIndex < INTERVENTION_TYPES.length - 1) {
            setActiveIntervention(INTERVENTION_TYPES[currentIndex + 1].id);
            setActiveSeason('kharif');
        } else {
            onNext();
        }
    };

    const isLastStep = INTERVENTION_TYPES.findIndex(i => i.id === activeIntervention) === INTERVENTION_TYPES.length - 1;

    return (
        <div className="demand-mgmt-wrapper">
            <InterventionTabs
                activeId={activeIntervention}
                onSelect={(id) => { setActiveIntervention(id); setActiveSeason('kharif'); }}
            />

            <div className="demand-main-container">
                <SeasonSidebar
                    activeId={activeSeason}
                    onSelect={setActiveSeason}
                    getSeasonTotals={getSeasonTotals}
                    totalReduction={getTotalReductionByIntv()}
                />

                <main className="demand-content-area">
                    {activeSeason !== 'funding' ? (
                        isSpecial ? (
                            <DiversificationSection
                                seasonLabel={SEASONS.find(s => s.id === activeSeason).label}
                                data={data[activeIntervention][activeSeason]}
                                onAddOriginal={handleAddCrop}
                                onAddChanged={handleAddChangedCrop}
                                onDeleteChanged={(id) => {
                                    const updatedData = { ...data };
                                    updatedData[activeIntervention][activeSeason].changed = updatedData[activeIntervention][activeSeason].changed.filter(c => c.id !== id);
                                    setData({ ...updatedData });
                                }}
                            />
                        ) : activeIntervObj.type === 'innovative' ? (
                            <InnovativeSection
                                seasonLabel={SEASONS.find(s => s.id === activeSeason).label}
                                crops={data[activeIntervention][activeSeason]}
                                onAdd={handleAddCrop}
                                onDelete={handleDeleteCrop}
                            />
                        ) : (
                            <CropSection
                                seasonLabel={SEASONS.find(s => s.id === activeSeason).label}
                                crops={data[activeIntervention][activeSeason]}
                                onAdd={handleAddCrop}
                                onDelete={handleDeleteCrop}
                                reductionPercent={reductionPercent}
                                interventionLabel={interventionLabel}
                            />
                        )
                    ) : (
                        <FundingSection
                            fundingData={data[activeIntervention].funding}
                            onAdd={handleAddFunding}
                            onDelete={(id) => {
                                const updatedData = { ...data };
                                updatedData[activeIntervention].funding = updatedData[activeIntervention].funding.filter(f => f.id !== id);
                                setData({ ...updatedData });
                            }}
                            interventionLabel={interventionLabel}
                            autoValues={getAutoAreaValues()}
                        />
                    )}
                </main>
            </div>

            <div className="mgmt-actions">
                <button className="mgmt-btn back" onClick={onBack}>Back</button>
                <button className="mgmt-btn save" onClick={() => onSave(data)}>Save</button>
                <button className="mgmt-btn next" onClick={handleNextStep}>
                    {isLastStep ? "Go to Supply Side" : "Next"}
                </button>
            </div>
        </div>
    );
};

export default DemandSideManagement;
