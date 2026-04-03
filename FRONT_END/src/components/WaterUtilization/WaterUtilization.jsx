import React, { useState, useEffect, useMemo } from 'react';
import { ASSET_URLS } from '../../api/config';
import IrrigationSection from './IrrigationSection';
import IndustrialSection from './IndustrialSection';
import OtherUsesSection from './OtherUsesSection';
import AbstractionStructure from './AbstractionStructure';
import { calculatorService } from '../../services/calculatorService';
import {
    calculateIrrigationDemand,
    calculateIndustrialEntry,
    calculateOtherUsesEntry,
    calculateAbstractionDraft,
    calculateDemandMet
} from '../../utils/waterUtilizationCalculations';
import { LIVESTOCK_NORMS } from '../../utils/gecNorms';
import './WaterUtilization.css';

const WaterUtilization = ({ data, onBack, onSave, onNext }) => {
    const [activeTab, setActiveTab] = useState('drinking');
    const [formData, setFormData] = useState(data || {
        humanPopulation: 0,
        humanDailyRequirement: 0,
        totalHumanWaterRequired: 0,
        livestockPopulation: 0,
        livestockDailyRequirement: 0,
        totalLivestockWaterRequired: 0,
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
                kharif: { demand: 0, crops: [] },
                rabi: { demand: 0, crops: [] },
                summer: { demand: 0, crops: [] }
            },
            gwPct: 100,
            swPct: 0,
            gwVol: 0,
            swVol: 0
        },
        industrialData: {
            entries: [],
            currentForm: {
                name: '', dailyReq: 0, days: 0, gwPct: 0, swPct: 0,
                dewateringDepth: 0, dewateringDuration: 0, dewateringQuantity: 0,
                wastewaterGenerated: 0, treatedQuantity: 0, recycledReusedQuantity: 0,
                treatmentSystem: '', reusePurpose: '',
                salineQuantity: 0, salineQuality: '', disposalStrategy: ''
            }
        },
        otherUsesData: {
            entries: [],
            currentForm: { type: '', dailyReq: 0, days: 0, gwPct: 0, swPct: 0 }
        },
        abstractionData: {
            entries: [],
            currentForm: { type: '', count: 0, discharge: 0, pumpingHours: 0, operationalDays: 0 }
        }
    });

    // Sync local state with parent props when they arrive (e.g. from API)
    useEffect(() => {
        if (data && Object.keys(data).length > 0) {
            setFormData(prev => ({ ...prev, ...data }));
        }
    }, [data]);

    // Scroll to top whenever tab changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeTab]);

    const tabs = [
        { id: 'drinking', label: 'Drinking/Domestic(L/day)', icon: `${ASSET_URLS.icons8}96/000000/water.png` },
        { id: 'irrigation', label: 'Irrigation(ha m)', icon: `${ASSET_URLS.icons8}96/000000/tractor.png` },
        { id: 'industrial', label: 'Industrial Use(ha m)', icon: `${ASSET_URLS.icons8}96/000000/factory.png` },
        { id: 'abstraction', label: 'Abs. Structures', icon: `${ASSET_URLS.flaticon}512/4607/4607872.png` },
        { id: 'other', label: 'Other Uses (if any)(ha m)', icon: `${ASSET_URLS.icons8}96/000000/more.png` },
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleLivestockChange = (index, field, value) => {
        const newData = [...formData.livestockData];
        newData[index][field] = value;

        if (field === 'name') {
            const norm = LIVESTOCK_NORMS.find(n => n.type === value);
            if (norm) {
                newData[index].requirement = norm.requirement;
            }
        }

        if (field === 'count' || field === 'requirement' || field === 'name') {
            newData[index].total = (Number(newData[index].count) || 0) * (Number(newData[index].requirement) || 0);
        }

        setFormData(prev => ({
            ...prev,
            livestockData: newData
        }));
    };

    const handleNestedInputChange = (category, field, value) => {
        setFormData(prev => {
            const numVal = Number(value) || 0;
            const updatedCategory = { ...prev.demandMetData[category], [field]: numVal };

            // Auto-calculate volumes if pct or requirement changes
            if (field === 'gwPct' || field === 'swPct' || field === 'requirement') {
                const volumes = calculateDemandMet(updatedCategory.requirement, updatedCategory.gwPct, updatedCategory.swPct);
                updatedCategory.gwVol = volumes.gwVol;
                updatedCategory.swVol = volumes.swVol;
            }

            return {
                ...prev,
                demandMetData: {
                    ...prev.demandMetData,
                    [category]: updatedCategory
                }
            };
        });
    };

    const handleIrrigationSeasonChange = (season) => {
        setFormData(prev => ({
            ...prev,
            irrigationData: {
                ...prev.irrigationData,
                activeSeason: season
            }
        }));
    };

    const handleIrrigationSummaryChange = (field, value) => {
        const numVal = Number(value) || 0;
        setFormData(prev => {
            const updated = { ...prev.irrigationData, [field]: numVal };
            const totalDemand = Object.values(updated.seasons).reduce((acc, s) => acc + s.demand, 0);

            const volumes = calculateDemandMet(totalDemand, updated.gwPct, updated.swPct);
            updated.gwVol = volumes.gwVol;
            updated.swVol = volumes.swVol;

            return {
                ...prev,
                irrigationData: updated
            };
        });
    };

    const addCrop = () => {
        const season = formData.irrigationData.activeSeason;
        const newCrop = {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `crop-${Date.now()}-${Math.random()}`,
            category: '',
            type: '',
            name: '',
            area: 0,
            requirement: 0
        };

        setFormData(prev => ({
            ...prev,
            irrigationData: {
                ...prev.irrigationData,
                seasons: {
                    ...prev.irrigationData.seasons,
                    [season]: {
                        ...prev.irrigationData.seasons[season],
                        crops: [...prev.irrigationData.seasons[season].crops, newCrop]
                    }
                }
            }
        }));
    };

    const deleteCrop = (id) => {
        const season = formData.irrigationData.activeSeason;
        setFormData(prev => ({
            ...prev,
            irrigationData: {
                ...prev.irrigationData,
                seasons: {
                    ...prev.irrigationData.seasons,
                    [season]: {
                        ...prev.irrigationData.seasons[season],
                        crops: prev.irrigationData.seasons[season].crops.filter(c => c.id !== id)
                    }
                }
            }
        }));
    };

    const handleCropChange = (id, field, value) => {
        const season = formData.irrigationData.activeSeason;
        setFormData(prev => {
            const currentCrops = prev.irrigationData.seasons[season].crops;
            const updatedCrops = currentCrops.map(c =>
                c.id === id ? { ...c, [field]: value } : c
            );

            // Recalculate season demand using util function
            const newDemand = calculateIrrigationDemand(updatedCrops);

            return {
                ...prev,
                irrigationData: {
                    ...prev.irrigationData,
                    seasons: {
                        ...prev.irrigationData.seasons,
                        [season]: {
                            ...prev.irrigationData.seasons[season],
                            crops: updatedCrops,
                            demand: newDemand
                        }
                    }
                }
            };
        });
    };

    // Industrial Handlers
    const handleIndustrialFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            industrialData: {
                ...prev.industrialData,
                currentForm: { ...prev.industrialData.currentForm, [field]: value }
            }
        }));
    };

    const addIndustrialEntry = () => {
        setFormData(prev => {
            const form = prev.industrialData.currentForm;
            const entryCalc = calculateIndustrialEntry(form);

            const newEntry = {
                id: Date.now(),
                ...form,
                ...entryCalc
            };
            return {
                ...prev,
                industrialData: {
                    entries: [...prev.industrialData.entries, newEntry],
                    currentForm: {
                        name: '', dailyReq: 0, days: 0, gwPct: 0, swPct: 0,
                        dewateringDepth: 0, dewateringDuration: 0, dewateringQuantity: 0,
                        wastewaterGenerated: 0, treatedQuantity: 0, recycledReusedQuantity: 0,
                        treatmentSystem: '', reusePurpose: '',
                        salineQuantity: 0, salineQuality: '', disposalStrategy: ''
                    }
                }
            };
        });
    };

    const deleteIndustrialEntry = (id) => {
        setFormData(prev => ({
            ...prev,
            industrialData: {
                ...prev.industrialData,
                entries: prev.industrialData.entries.filter(e => e.id !== id)
            }
        }));
    };

    // Other Uses Handlers
    const handleOtherUsesFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            otherUsesData: {
                ...prev.otherUsesData,
                currentForm: { ...prev.otherUsesData.currentForm, [field]: value }
            }
        }));
    };

    const addOtherUsesEntry = () => {
        setFormData(prev => {
            const form = prev.otherUsesData.currentForm;
            const entryCalc = calculateOtherUsesEntry(form);

            const newEntry = {
                id: Date.now(),
                ...form,
                ...entryCalc
            };
            return {
                ...prev,
                otherUsesData: {
                    entries: [...prev.otherUsesData.entries, newEntry],
                    currentForm: { type: '', dailyReq: 0, days: 0, gwPct: 0, swPct: 0 }
                }
            };
        });
    };

    const deleteOtherUsesEntry = (id) => {
        setFormData(prev => ({
            ...prev,
            otherUsesData: {
                ...prev.otherUsesData,
                entries: prev.otherUsesData.entries.filter(e => e.id !== id)
            }
        }));
    };

    // Abstraction Handlers
    const handleAbstractionFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            abstractionData: {
                ...prev.abstractionData,
                currentForm: { ...prev.abstractionData.currentForm, [field]: value }
            }
        }));
    };

    const addAbstractionEntry = () => {
        setFormData(prev => {
            const form = prev.abstractionData.currentForm;
            const annualDraft = calculateAbstractionDraft(form.count, form.discharge, form.pumpingHours, form.operationalDays);

            const newEntry = {
                id: Date.now(),
                ...form,
                annualDraft: annualDraft
            };

            return {
                ...prev,
                abstractionData: {
                    entries: [...prev.abstractionData.entries, newEntry],
                    currentForm: { type: '', count: 0, discharge: 0, pumpingHours: 0, operationalDays: 0 }
                }
            };
        });
    };

    const deleteAbstractionEntry = (id) => {
        setFormData(prev => ({
            ...prev,
            abstractionData: {
                ...prev.abstractionData,
                entries: prev.abstractionData.entries.filter(e => e.id !== id)
            }
        }));
    };

    // Calculate livestock totals
    const { totalLivestockCount, totalLivestockRequirement, avgLivestockRequirement } = useMemo(() => {
        const count = formData.livestockData.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
        const req = formData.livestockData.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
        const avg = count > 0 ? (req / count) : 0;
        return { totalLivestockCount: count, totalLivestockRequirement: req, avgLivestockRequirement: avg };
    }, [formData.livestockData]);

    // Auto-calculate Annual Water Requirements (ha m) using backend
    useEffect(() => {
        const fetchDemands = async () => {
            try {
                // We need both human and livestock demands
                const humanReq = await calculatorService.calculateUtilization({
                    population: formData.humanPopulation,
                    dailyReq: formData.humanDailyRequirement
                }, 'human_demand');

                const livestockReq = await calculatorService.calculateUtilization({
                    livestockData: formData.livestockData
                }, 'livestock_demand');

                setFormData(prev => {
                    const nextDemandMet = { ...prev.demandMetData };

                    nextDemandMet.human = {
                        ...nextDemandMet.human,
                        requirement: humanReq,
                        gwVol: Number(((humanReq * nextDemandMet.human.gwPct) / 100).toFixed(2)),
                        swVol: Number(((humanReq * nextDemandMet.human.swPct) / 100).toFixed(2))
                    };

                    nextDemandMet.livestock = {
                        ...nextDemandMet.livestock,
                        requirement: livestockReq,
                        gwVol: Number(((livestockReq * nextDemandMet.livestock.gwPct) / 100).toFixed(2)),
                        swVol: Number(((livestockReq * nextDemandMet.livestock.swPct) / 100).toFixed(2))
                    };

                    return { ...prev, demandMetData: nextDemandMet };
                });
            } catch (error) {
                console.error('Utilization calculation error:', error);
            }
        };

        const timer = setTimeout(() => {
            fetchDemands();
        }, 800);

        return () => clearTimeout(timer);
    }, [formData.humanPopulation, formData.humanDailyRequirement, formData.livestockData]);

    const handleNextStep = () => {
        if (activeTab === 'drinking') {
            setActiveTab('irrigation');
        } else if (activeTab === 'irrigation') {
            setActiveTab('industrial');
        } else if (activeTab === 'industrial') {
            setActiveTab('abstraction');
        } else if (activeTab === 'abstraction') {
            setActiveTab('other');
        } else {
            onNext(formData);
        }
    };

    const handleBackStep = () => {
        if (activeTab === 'other') {
            setActiveTab('abstraction');
        } else if (activeTab === 'abstraction') {
            setActiveTab('industrial');
        } else if (activeTab === 'industrial') {
            setActiveTab('irrigation');
        } else if (activeTab === 'irrigation') {
            setActiveTab('drinking');
        } else {
            onBack();
        }
    };

    return (
        <div className="wu-container">
            <div className="wu-header-tabs">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <div className="tab-icon-wrapper">
                            <img src={tab.icon} alt={tab.label} className="tab-icon-img" />
                        </div>
                        <div className="tab-label-wrapper">
                            <span className="tab-label">{tab.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {activeTab === 'drinking' && (
                <div className="wu-content-body">
                    <div className="wu-section-grid">
                        <div className="wu-category-box">
                            <div className="category-icon-large">
                                <img src={`${ASSET_URLS.icons8}96/000000/group.png`} alt="Humans" />
                            </div>
                            <div className="category-inputs">
                                <div className="input-row">
                                    <label>A. Total Human Population :</label>
                                    <input
                                        type="number"
                                        value={formData.humanPopulation}
                                        onChange={(e) => handleInputChange('humanPopulation', e.target.value)}
                                    />
                                </div>
                                <div className="input-row">
                                    <label>Daily water requirement (LPCD)* :</label>
                                    <input
                                        type="number"
                                        value={formData.humanDailyRequirement}
                                        onChange={(e) => handleInputChange('humanDailyRequirement', e.target.value)}
                                    />
                                </div>
                                <div className="input-row">
                                    <label>Total Water Required For Humans (L/day) :</label>
                                    <input
                                        type="number"
                                        disabled
                                        value={formData.humanPopulation * formData.humanDailyRequirement}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="wu-category-box">
                            <div className="category-icon-large">
                                <img src={`${ASSET_URLS.icons8}96/000000/cow.png`} alt="Livestock" />
                            </div>
                            <div className="category-inputs">
                                <div className="input-row">
                                    <label>B. Total Livestock Population :</label>
                                    <input type="number" disabled value={totalLivestockCount} />
                                </div>
                                <div className="input-row">
                                    <label>Daily Average water requirement (LPCD) :</label>
                                    <input type="number" disabled value={avgLivestockRequirement.toFixed(2)} />
                                </div>
                                <div className="input-row">
                                    <label>Total Water Required for Livestock (L/day) :</label>
                                    <input type="number" disabled value={totalLivestockRequirement} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="wu-table">
                            <thead>
                                <tr>
                                    <th>Sr. No.</th>
                                    <th>Livestock</th>
                                    <th>Total Number</th>
                                    <th>Daily water requirement (LPCD) for Livestock</th>
                                    <th>Total Daily water requirement (L/Day)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formData.livestockData.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>
                                            <select
                                                value={item.name}
                                                onChange={(e) => handleLivestockChange(index, 'name', e.target.value)}
                                                className="wu-select"
                                            >
                                                <option value="">-- Select --</option>
                                                {LIVESTOCK_NORMS.map(norm => (
                                                    <option key={norm.type} value={norm.type}>{norm.type}</option>
                                                ))}
                                                <option value="Other">Other</option>
                                            </select>
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={item.count}
                                                onChange={(e) => handleLivestockChange(index, 'count', Number(e.target.value))}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={item.requirement}
                                                onChange={(e) => handleLivestockChange(index, 'requirement', Number(e.target.value))}
                                            />
                                        </td>
                                        <td className="calculated-val">{(item.count * item.requirement).toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-container">
                        <table className="wu-table">
                            <thead>
                                <tr>
                                    <th colSpan="6" className="table-main-header">Drinking/Domestic</th>
                                </tr>
                                <tr>
                                    <th rowSpan="2">Category</th>
                                    <th rowSpan="2">Annual Water Requirement (ha m)</th>
                                    <th colSpan="4" className="text-center">Water Demand Met From (ha m)</th>
                                </tr>
                                <tr>
                                    <th>% of Water Demand Met From Ground Water</th>
                                    <th>Water Demand Met From Ground Water (ha m)</th>
                                    <th>% of Water Demand Met From Surface Water</th>
                                    <th>Water Demand Met From Surface Water (ha m)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Human</td>
                                    <td><input type="number" value={formData.demandMetData.human.requirement} onChange={(e) => handleNestedInputChange('human', 'requirement', e.target.value)} /></td>
                                    <td><input type="number" value={formData.demandMetData.human.gwPct} onChange={(e) => handleNestedInputChange('human', 'gwPct', e.target.value)} /></td>
                                    <td className="calculated-val">{formData.demandMetData.human.gwVol}</td>
                                    <td><input type="number" value={formData.demandMetData.human.swPct} onChange={(e) => handleNestedInputChange('human', 'swPct', e.target.value)} /></td>
                                    <td className="calculated-val">{formData.demandMetData.human.swVol}</td>
                                </tr>
                                <tr>
                                    <td>Livestock</td>
                                    <td><input type="number" value={formData.demandMetData.livestock.requirement} onChange={(e) => handleNestedInputChange('livestock', 'requirement', e.target.value)} /></td>
                                    <td><input type="number" value={formData.demandMetData.livestock.gwPct} onChange={(e) => handleNestedInputChange('livestock', 'gwPct', e.target.value)} /></td>
                                    <td className="calculated-val">{formData.demandMetData.livestock.gwVol}</td>
                                    <td><input type="number" value={formData.demandMetData.livestock.swPct} onChange={(e) => handleNestedInputChange('livestock', 'swPct', e.target.value)} /></td>
                                    <td className="calculated-val">{formData.demandMetData.livestock.swVol}</td>
                                </tr>
                                <tr className="total-row">
                                    <td>Total</td>
                                    <td>{(formData.demandMetData.human.requirement + formData.demandMetData.livestock.requirement).toFixed(2)}</td>
                                    <td></td>
                                    <td className="calculated-val">{(formData.demandMetData.human.gwVol + formData.demandMetData.livestock.gwVol).toFixed(2)}</td>
                                    <td></td>
                                    <td className="calculated-val">{(formData.demandMetData.human.swVol + formData.demandMetData.livestock.swVol).toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'irrigation' && (
                <IrrigationSection
                    data={formData.irrigationData}
                    onSeasonChange={handleIrrigationSeasonChange}
                    onSummaryChange={handleIrrigationSummaryChange}
                    onAddCrop={addCrop}
                    onDeleteCrop={deleteCrop}
                    onCropChange={handleCropChange}
                />
            )}

            {activeTab === 'industrial' && (
                <IndustrialSection
                    data={formData.industrialData}
                    onFormChange={handleIndustrialFormChange}
                    onAdd={addIndustrialEntry}
                    onDelete={deleteIndustrialEntry}
                />
            )}

            {activeTab === 'other' && (
                <OtherUsesSection
                    data={formData.otherUsesData}
                    onFormChange={handleOtherUsesFormChange}
                    onAdd={addOtherUsesEntry}
                    onDelete={deleteOtherUsesEntry}
                />
            )}

            {activeTab === 'abstraction' && (
                <AbstractionStructure
                    data={formData.abstractionData}
                    onFormChange={handleAbstractionFormChange}
                    onAdd={addAbstractionEntry}
                    onDelete={deleteAbstractionEntry}
                />
            )}

            <div className="wu-warning">
                Before going to the summary page or next, click on the save button
            </div>

            <div className="wu-actions">
                <button className="btn-wu-back" onClick={handleBackStep}>Back</button>
                <button className="btn-wu-save" onClick={() => onSave(formData)}>Save</button>
                <button className="btn-wu-next" onClick={handleNextStep}>
                    {activeTab === 'other' ? 'Summary' : 'Next'}
                </button>
            </div>
        </div>
    );
};

export default WaterUtilization;
