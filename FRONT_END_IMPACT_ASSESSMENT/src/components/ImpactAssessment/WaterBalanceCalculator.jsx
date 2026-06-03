import React, { useState, useMemo } from 'react';
import './WaterBalanceCalculator.css';

const WaterBalanceCalculator = ({ isPrint, projectTypeProp = 'infrastructure' }) => {
    const projectType = projectTypeProp;

    const [inputs, setInputs] = useState({
        // Infrastructure Defaults
        residential_fresh: 24,
        residential_flushing: 19,
        restaurant_fresh: 17,
        restaurant_flushing: 5,
        foodcourt_fresh: 4,
        foodcourt_flushing: 2,
        visitors_fresh: 16,
        visitors_flushing: 32,
        dg_cooling: 3,
        gardening: 3,
        ac: 67,

        // Mining Defaults
        groundwater_dewatering: 50,
        surface_runoff: 20,
        freshwater_borewell: 10,
        recycled_water_etp: 15,
        stormwater_storage: 5,
        dust_suppression: 30,
        drilling_usage: 10,
        mineral_processing: 25,
        slurry_transport: 5,
        tailings_makeup: 10,
        workshop_washing: 5,
        mine_domestic: 5,
        greenbelt_irrigation: 5,
        firefighting_reserve: 5,

        // Industry Defaults
        ind_process_water: 100,
        ind_boiler_feed: 20,
        ind_cooling_tower: 40,
        ind_dm_ro_plant: 15,
        ind_scrubbers: 10,
        ind_floor_wash: 5,
        ind_domestic: 10,
        ind_gardening: 5,
        ind_rainwater: 10,
        ind_recycled: 30
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInputs(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const results = useMemo(() => {
        if (projectType === 'infrastructure') {
            const totalFresh = inputs.residential_fresh + inputs.restaurant_fresh + inputs.foodcourt_fresh + inputs.visitors_fresh;
            const totalFlushing = inputs.residential_flushing + inputs.restaurant_flushing + inputs.foodcourt_flushing + inputs.visitors_flushing;
            const totalOther = inputs.dg_cooling + inputs.gardening + inputs.ac;

            const totalDemand = totalFresh + totalFlushing + totalOther;

            const totalDomesticFresh = inputs.residential_fresh + inputs.restaurant_fresh + inputs.foodcourt_fresh + inputs.visitors_fresh;
            const totalWaste = (totalDomesticFresh * 0.85) + totalFlushing;

            const proposedSTP = Math.ceil(totalWaste * 1.15);
            const treatedWater = totalWaste * 0.9;

            const reusedWater = totalFlushing + inputs.dg_cooling + inputs.gardening + (inputs.ac * 0.1);

            return {
                totalDemand,
                totalFresh,
                totalReused: reusedWater,
                totalWaste,
                proposedTreatment: proposedSTP,
                treatedWater,
                typeLabel: 'STP',
                breakdown: [
                    { label: 'Residential', fresh: inputs.residential_fresh, flush: inputs.residential_flushing, total: inputs.residential_fresh + inputs.residential_flushing },
                    { label: 'Restaurant', fresh: inputs.restaurant_fresh, flush: inputs.restaurant_flushing, total: inputs.restaurant_fresh + inputs.restaurant_flushing },
                    { label: 'Food Court', fresh: inputs.foodcourt_fresh, flush: inputs.foodcourt_flushing, total: inputs.foodcourt_fresh + inputs.foodcourt_flushing },
                    { label: 'Visitors', fresh: inputs.visitors_fresh, flush: inputs.visitors_flushing, total: inputs.visitors_fresh + inputs.visitors_flushing },
                    { label: 'DG Cooling', fresh: inputs.dg_cooling, flush: 0, total: inputs.dg_cooling },
                    { label: 'Gardening', fresh: inputs.gardening, flush: 0, total: inputs.gardening },
                    { label: 'Air Cond.', fresh: inputs.ac, flush: 0, total: inputs.ac },
                ]
            };
        } else if (projectType === 'mining') {
            const totalUtilization = inputs.dust_suppression + inputs.drilling_usage + inputs.mineral_processing + inputs.slurry_transport + inputs.tailings_makeup + inputs.workshop_washing + inputs.mine_domestic + inputs.greenbelt_irrigation + inputs.firefighting_reserve;

            const freshWaterReq = inputs.freshwater_borewell;

            const waste_processing = inputs.mineral_processing * 0.7;
            const waste_workshop = inputs.workshop_washing * 0.9;
            const waste_domestic = inputs.mine_domestic * 0.8;
            const waste_pit = inputs.groundwater_dewatering * 0.95;

            const totalWaste = waste_processing + waste_workshop + waste_domestic + waste_pit;
            const proposedETP = Math.ceil(totalWaste * 1.1);
            const treatedWater = totalWaste * 0.85;

            const reusedWater = inputs.recycled_water_etp;

            return {
                totalDemand: totalUtilization,
                totalFresh: freshWaterReq,
                totalReused: reusedWater,
                totalWaste,
                proposedTreatment: proposedETP,
                treatedWater,
                typeLabel: 'ETP/STP',
                breakdown: [
                    { label: 'Dust Suppression', fresh: 0, flush: inputs.dust_suppression, total: inputs.dust_suppression },
                    { label: 'Mineral Processing', fresh: 0, flush: inputs.mineral_processing, total: inputs.mineral_processing },
                    { label: 'Drilling', fresh: 0, flush: inputs.drilling_usage, total: inputs.drilling_usage },
                    { label: 'Tailings Makeup', fresh: 0, flush: inputs.tailings_makeup, total: inputs.tailings_makeup },
                    { label: 'Workshop/Washing', fresh: 0, flush: inputs.workshop_washing, total: inputs.workshop_washing },
                    { label: 'Mine Domestic', fresh: inputs.mine_domestic, flush: 0, total: inputs.mine_domestic },
                    { label: 'Greenbelt', fresh: 0, flush: inputs.greenbelt_irrigation, total: inputs.greenbelt_irrigation },
                ]
            };
        } else {
            // INDUSTRIAL LOGIC
            const totalDemand = inputs.ind_process_water + inputs.ind_boiler_feed + inputs.ind_cooling_tower + inputs.ind_dm_ro_plant + inputs.ind_scrubbers + inputs.ind_floor_wash + inputs.ind_domestic + inputs.ind_gardening;

            const waste_process = inputs.ind_process_water * 0.8;
            const waste_boiler = inputs.ind_boiler_feed * 0.1;
            const waste_cooling = inputs.ind_cooling_tower * 0.2;
            const waste_domestic = inputs.ind_domestic * 0.85;
            const waste_wash = inputs.ind_floor_wash * 0.9;

            const totalWaste = waste_process + waste_boiler + waste_cooling + waste_domestic + waste_wash;
            const proposedZLD = Math.ceil(totalWaste * 1.1);
            const treatedWater = totalWaste * 0.95;

            const freshWaterReq = Math.max(0, totalDemand - inputs.ind_recycled - (inputs.ind_rainwater * 0.5));

            return {
                totalDemand,
                totalFresh: freshWaterReq,
                totalReused: inputs.ind_recycled,
                totalWaste,
                proposedTreatment: proposedZLD,
                treatedWater,
                typeLabel: 'ETP/ZLD',
                breakdown: [
                    { label: 'Process Water', fresh: 0, flush: inputs.ind_process_water, total: inputs.ind_process_water },
                    { label: 'Boiler Feed', fresh: 0, flush: inputs.ind_boiler_feed, total: inputs.ind_boiler_feed },
                    { label: 'Cooling Tower', fresh: 0, flush: inputs.ind_cooling_tower, total: inputs.ind_cooling_tower },
                    { label: 'DM/RO Plant', fresh: 0, flush: inputs.ind_dm_ro_plant, total: inputs.ind_dm_ro_plant },
                    { label: 'Scrubbers', fresh: 0, flush: inputs.ind_scrubbers, total: inputs.ind_scrubbers },
                    { label: 'Domestic', fresh: inputs.ind_domestic, flush: 0, total: inputs.ind_domestic },
                    { label: 'Gardening', fresh: 0, flush: inputs.ind_gardening, total: inputs.ind_gardening },
                ]
            };
        }
    }, [inputs, projectType]);

    const activeInputFields = projectType === 'infrastructure'
        ? ['residential_fresh', 'residential_flushing', 'restaurant_fresh', 'restaurant_flushing', 'foodcourt_fresh', 'foodcourt_flushing', 'visitors_fresh', 'visitors_flushing', 'dg_cooling', 'gardening', 'ac']
        : projectType === 'mining'
            ? ['groundwater_dewatering', 'surface_runoff', 'freshwater_borewell', 'recycled_water_etp', 'stormwater_storage', 'dust_suppression', 'drilling_usage', 'mineral_processing', 'slurry_transport', 'tailings_makeup', 'workshop_washing', 'mine_domestic', 'greenbelt_irrigation', 'firefighting_reserve']
            : ['ind_process_water', 'ind_boiler_feed', 'ind_cooling_tower', 'ind_dm_ro_plant', 'ind_scrubbers', 'ind_floor_wash', 'ind_domestic', 'ind_gardening', 'ind_rainwater', 'ind_recycled'];

    return (
        <div className="water-balance-wrapper">
            <div className={`water-balance-calc no-print ${projectType}-mode`}>
                <div className="calc-sidebar">
                    <div className="sidebar-header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                        INPUT PARAMETERS
                    </div>

                    <div className="input-scroll-area">
                        {activeInputFields.map(key => (
                            <div key={key} className="modern-input-group">
                                <label>{key.replace(/_/g, ' ')}</label>
                                <div className="input-wrapper">
                                    <input
                                        type="number"
                                        name={key}
                                        value={inputs[key]}
                                        onChange={handleInputChange}
                                    />
                                    <span className="unit">KLD</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="calc-main">
                    <div className="main-top-nav">
                        <div>
                            <h2>Water Balance Analytics</h2>
                            <p className="project-subtitle">{projectType.toUpperCase()} PROJECT MODEL</p>
                        </div>
                        <div className="total-indicator">
                            <span className="dot"></span>
                            {results.totalDemand.toFixed(1)} KLD Total Demand
                        </div>
                    </div>

                    <div className="analytics-grid">
                        <div className="metric-tile glass-blue">
                            <div className="tile-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" /></svg>
                            </div>
                            <div className="tile-data">
                                <span className="t-val">{results.totalFresh.toFixed(1)}</span>
                                <span className="t-lbl">Fresh Water Demand</span>
                            </div>
                        </div>

                        <div className="metric-tile glass-green">
                            <div className="tile-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
                            </div>
                            <div className="tile-data">
                                <span className="t-val">{results.totalReused.toFixed(1)}</span>
                                <span className="t-lbl">Recycled & Reuse</span>
                            </div>
                        </div>

                        <div className="metric-tile glass-red">
                            <div className="tile-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                            </div>
                            <div className="tile-data">
                                <span className="t-val">{results.totalWaste.toFixed(1)}</span>
                                <span className="t-lbl">Waste Water Gen.</span>
                            </div>
                        </div>

                        <div className="metric-tile glass-purple">
                            <div className="tile-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>
                            </div>
                            <div className="tile-data">
                                <span className="t-val">{results.proposedTreatment}</span>
                                <span className="t-lbl">Proposed {results.typeLabel}</span>
                            </div>
                        </div>
                    </div>

                    <div className="impact-footer">
                        * Calculation logic follows CPHEEO standards and standard engineering discharge coefficients.
                    </div>
                </div>
            </div>

            <div className="water-balance-print-container">
                <div className="water-balance-print">
                    <div className="wb-diagram-header">
                        <h2>{projectType.toUpperCase()} WATER BALANCE ({results.totalDemand.toFixed(0)} KLD)</h2>
                    </div>

                    <div className="wb-main-flow">
                        <div className="wb-summary-panel">
                            <div className="wb-highlight-box primary">
                                <div className="lbl">TOTAL WATER DEMAND</div>
                                <div className="val">{results.totalDemand.toFixed(0)} KLD</div>
                            </div>
                            <div className="wb-split-boxes">
                                <div className="wb-mini-box fresh">FRESH: {results.totalFresh.toFixed(0)}</div>
                                <div className="wb-mini-box treated">REUSED: {results.totalReused.toFixed(0)}</div>
                            </div>
                        </div>

                        <div className="wb-breakdown-panel">
                            {results.breakdown.map((item, i) => (
                                <div key={i} className="wb-detail-row">
                                    <div className="wb-row-label">{item.label}</div>
                                    <div className="wb-row-connector"></div>
                                    <div className="wb-data-cells">
                                        <div className="cell total">Total: {item.total}</div>
                                        {item.fresh > 0 && <div className="cell fresh">Fresh: {item.fresh}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="wb-processing-panel">
                            <div className="wb-status-box waste">
                                <div className="lbl">GEN. WASTE WATER</div>
                                <div className="val">{results.totalWaste.toFixed(0)} KLD</div>
                            </div>
                            <div className="wb-arrow-down"></div>
                            <div className="wb-unit-box stp">
                                <div className="lbl">PROPOSED {results.typeLabel}</div>
                                <div className="val">{results.proposedTreatment} KLD</div>
                            </div>
                            <div className="wb-arrow-down"></div>
                            <div className="wb-status-box treated">
                                <div className="lbl">TREATED WATER</div>
                                <div className="val">{results.treatedWater.toFixed(0)} KLD</div>
                            </div>
                            <div className="wb-arrow-down"></div>
                            <div className="wb-status-box final">
                                {projectType === 'industry' ? 'ZERO LIQUID DISCHARGE (ZLD)' : 'SAFE DISPOSAL / REUSE'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaterBalanceCalculator;
