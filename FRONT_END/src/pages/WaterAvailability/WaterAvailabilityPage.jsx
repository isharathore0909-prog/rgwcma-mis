import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SelectionNavbar from '../../components/Shared/SelectionNavbar';
import WaterAvailability from '../../components/WaterAvailablity/WaterAvailability';
import WaterAvailabilityReport from '../../components/WaterAvailablity/WaterAvailabilityReport';
import { locationService } from '../../services/locationService';
import { calculateRFF, GEC_NORMS } from '../../utils/gecNorms';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import './WaterAvailabilityPage.css';

const WaterAvailabilityPage = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const location = useLocation();
    const [currentView, setCurrentView] = useState('availability');

    // Centralized State
    const [availabilityData, setAvailabilityData] = useState({
        annualRainfall: 0,
        estVolumeRainfall: 0,
        evapotranspiration: 0,
        estEvapoLosses: 0,
        estWaterAvailRainfall: 0,
        weightedRunoffCoeff: 0,
        rainfallRunoff: 0,
        gwRechargeRainfallMonsoon: 0,
        gwRechargeRainfallNonMonsoon: 0,
        totalGwRechargeRainfall: 0,
        gwRechargeOtherMonsoon: 0,
        gwRechargeOtherNonMonsoon: 0,
        totalGwRechargeOther: 0,
        naturalDischargeLosses: 0,
        totalGwAvailable: 0,
        gwWithdrawal: 0,
        surfaceWaterBodies: [
            { id: 1, type: 'Ponds', count: 0, capacity: 0 }
        ],
        totalStorageCapacity: 0,
        storageLossesPct: 10,
        swAvailableStorages: 0,
        transportedWater: 0,
        totalSwAvailable: 0,
        totalWaterAvailable: 0,
        // GEC Fields
        assessmentUnitType: 'Gram Panchayat',
        hydrogeology: 'Hard Rock',
        aquiferType: 'Unconfined',
        areaHa: 0,
        areaCommandHa: 0,
        areaNonCommandHa: 0,
        preMonsoonDepth: '',
        postMonsoonDepth: '',
        specificYield: 0.015,
        gwRechargeWtMethod: 0,
        isRainfallLess10Pct: 'No',

        // Detailed Monsoon Components (Eq 6 & 7)
        currentMonsoonRainfall: 0,
        normalMonsoonRainfall: 0,
        gwRechargeFromIrrigationMonsoon: 0,
        gwRechargeFromCanalsMonsoon: 0,
        gwRechargeFromTanksMonsoon: 0,
        gwRechargeFromWCSMonsoon: 0, // Water Conservation Structures
        gwExtractionMonsoon: 0,

        // Detailed Non-Monsoon Components
        gwRechargeFromCanalsNonMonsoon: 0,

        // Deviation & RIF Validation
        rifValue: 0.10, // Rainfall Infiltration Factor
        gwRechargeRifMethod: 0,
        percentDeviation: 0,
        finalRainfallRecharge: 0,

        // Calculator Fields (Canals)
        rc_canalType: '',
        rc_wettedArea: 0,
        rc_seepageFactor: 0,
        rc_days: 0,

        // Non-Monsoon Canals
        rc_canalType_nm: '',
        rc_wettedArea_nm: 0,
        rc_seepageFactor_nm: 0,
        rc_days_nm: 0,

        // Calculator Fields (SW Irrigation)
        rswi_avgDischarge: 0,
        rswi_days: 0,
        rswi_returnFlowFactor: 0,

        // Calculator Fields (GW Irrigation)
        rgwi_extraction: 0,
        rgwi_returnFlowFactor: 0,

        // Calculator Fields (Tanks & Ponds)
        rtp_avgWaterSpreadArea: 0,
        rtp_days: 0,
        rtp_rechargeFactor: 1.4,

        rtp_avgWaterSpreadArea_nm: 0,
        rtp_days_nm: 0,
        rtp_rechargeFactor_nm: 1.4,

        // Non-Monsoon Return Flow
        rgwi_gw_draft_nm: 0,
        rgwi_sw_draft_nm: 0,
        rgwi_gw_rff_nm: 0,
        rgwi_sw_rff_nm: 0,

        // Calculator Fields (Water Conservation Structures)
        rwcs_grossStorage: 0,
        rwcs_rechargeFactor: 0.5, // Default usually 50%
        rwcs_grossStorage_nm: 0,
        rwcs_rechargeFactor_nm: 0.2, // GEC standard for non-monsoon

        // Extraction Breakdown
        ge_irrigation: 0,
        ge_domestic: 0,
        ge_industrial: 0,

        // Stage of Extraction & Allocation (Eq 26 & 27)
        stageOfExtraction: 0,
        allocationDomestic: 0, // Computed
        allocation_N: 0, // Population Density
        allocation_Lg: 1.0, // Fractional Load (Default 1.0)
        allocation_Area: 0, // Area for allocation calculation (usually same as assessment area)

        // Potential Resources (Eq 29 & 30)
        potentialResourceShallow: 0,
        shallow_Area: 0, // Area of shallow water table zone

        // Potential Resources (Eq 29 & 30)
        potentialResourceFlood: 0,
        flood_Area: 0, // Flood Prone Area
        flood_RetentionDays: 0, // N days

        // Advanced: In-Storage (Static) Resources (Unconfined) (Eq 31)
        bottomOfUnconfinedAquifer: 0, // Z2 (mbgl) or Elevation? usually mbgl for thickness calc if levels are mbgl
        // formula says A * (Z2 - Z1) * Sy. If Z1 is pre-monsoon depth (mbgl) and Z2 is bottom depth (mbgl).
        // Thickness = Z2 - Z1.
        staticGroundWaterResource: 0,

        // Advanced: Ground Water Assessment of Confined Aquifer (Eq 32-37)
        confinedArea: 0,
        storativity: 0.0001, // S
        piezometricHeadPre: 0, // h_pre
        piezometricHeadPost: 0, // h_post
        bottomOfTopConfiningLayer: 0, // h0
        dynamicConfinedResource: 0,
        instorageConfinedResource: 0,
        totalConfinedResource: 0,

        // Advanced: Unit Draft Normalization (Eq 38-40)
        unitDraft_discharge: 0, // m3/hr
        unitDraft_hours: 0,
        unitDraft_days: 0,
        // Rainfall details already exist (current/normal) but might be specific for draft year
        unitDraft_value: 0,
        unitDraft_normalized: 0
    });

    // Persist and retrieve state to survive refreshes
    const state = React.useMemo(() => {
        if (location.state && location.state.gpId) {
            sessionStorage.setItem('gpSelectionState', JSON.stringify(location.state));
            return location.state;
        }
        const stored = sessionStorage.getItem('gpSelectionState');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse stored state:', e);
            }
        }
        return {};
    }, [location.state]);

    const { gpId, districtName, blockName, gpName } = state;

    useEffect(() => {
        if (gpId) {
            const controller = new AbortController();
            const signal = controller.signal;

            // Fetch current monsoon rainfall
            locationService.getAverageRainfall(gpId, signal)
                .then(res => {
                    if (res && res.average_monsoon_rainfall !== undefined) {
                        setAvailabilityData(prev => ({
                            ...prev,
                            currentMonsoonRainfall: res.average_monsoon_rainfall
                        }));
                    }
                })
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error("Error fetching monsoon rainfall:", err);
                    }
                });

            // Fetch normal monsoon rainfall
            locationService.getNormalMonsoonRainfall(gpId, signal)
                .then(res => {
                    if (res && res.normal_monsoon_rainfall !== undefined) {
                        setAvailabilityData(prev => ({
                            ...prev,
                            normalMonsoonRainfall: res.normal_monsoon_rainfall
                        }));
                    }
                })
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error("Error fetching normal monsoon rainfall:", err);
                    }
                });

            // Fetch aquifer data (pre/post monsoon depths) and SW Irrigation info
            locationService.getAquiferData(gpId, signal)
                .then(res => {
                    setAvailabilityData(prev => {
                        const updates = {};

                        // Update water levels if they exist
                        if (res.pre_monsoon_avg !== null && res.post_monsoon_avg !== null) {
                            updates.preMonsoonDepth = res.pre_monsoon_avg;
                            updates.postMonsoonDepth = res.post_monsoon_avg;
                        }

                        // Update SW Irrigation fields if they exist
                        if (res.sw_avg_discharge_m3_hr !== undefined) {
                            updates.rswi_avgDischarge = res.sw_avg_discharge_m3_hr;
                            updates.rswi_pumpingHours = res.sw_pumping_hours;
                            updates.rswi_days = res.sw_pumping_days;
                        }

                        // Update other pre-fill fields
                        if (res.area_ha !== undefined) {
                            updates.areaHa = res.area_ha;
                            // Default to non-command if not split
                            if (!prev.areaCommandHa && !prev.areaNonCommandHa) {
                                updates.areaNonCommandHa = res.area_ha;
                            }
                        }
                        if (res.population !== undefined) updates.population = res.population;
                        if (res.pre_monsoon_avg !== null && res.pre_monsoon_avg !== undefined) {
                            updates.preMonsoonDepth = res.pre_monsoon_avg;
                        }
                        if (res.post_monsoon_avg !== null && res.post_monsoon_avg !== undefined) {
                            updates.postMonsoonDepth = res.post_monsoon_avg;
                        }

                        // New fields from api_exceldata
                        if (res.bottom_unconfined !== undefined) updates.bottomOfUnconfinedAquifer = res.bottom_unconfined;
                        if (res.confined_aquifer_area !== undefined) updates.confinedArea = res.confined_aquifer_area;
                        if (res.pre_monsoon_piezometric_heads !== undefined) updates.piezometricHeadPre = res.pre_monsoon_piezometric_heads;
                        if (res.post_monsoon_piezometric_heads !== undefined) updates.piezometricHeadPost = res.post_monsoon_piezometric_heads;
                        if (res.bottom_of_confining_layer !== undefined) updates.bottomOfTopConfiningLayer = res.bottom_of_confining_layer;

                        if (res.canal_days !== undefined) {
                            updates.rc_days = res.canal_days;
                            updates.rc_days_nm = 245; // GEC standard for non-monsoon
                        }
                        if (res.canal_mcm !== undefined) {
                            updates.rc_wettedArea = res.canal_mcm;
                            updates.rc_wettedArea_nm = res.canal_mcm;
                        }
                        if (res.tp_days !== undefined) {
                            updates.rtp_days = res.tp_days;
                            updates.rtp_days_nm = 245; // GEC standard for non-monsoon
                        }
                        if (res.tp_mcm !== undefined) {
                            updates.rtp_avgWaterSpreadArea = res.tp_mcm;
                            updates.rtp_avgWaterSpreadArea_nm = res.tp_mcm;
                        }
                        if (res.wcs_storage !== undefined) {
                            updates.rwcs_grossStorage = res.wcs_storage;
                            updates.rwcs_grossStorage_nm = res.wcs_storage;
                        }

                        // Auto-Map Aquifer based Seepage Norms
                        const aquiferDetails = res.aquifer_details || res.water_budget?.aquifer_details;
                        if (aquiferDetails) {
                            if (aquiferDetails.seepage_norm_category) {
                                const category = aquiferDetails.seepage_norm_category;
                                updates.rc_canalType = category;
                                updates.rc_canalType_nm = category;

                                const selectedNorm = GEC_NORMS.canal_seepage.find(c => c.type === category);
                                if (selectedNorm) {
                                    updates.rc_seepageFactor = selectedNorm.recommended;
                                    updates.rc_seepageFactor_nm = selectedNorm.recommended;
                                }
                            }

                            // Auto-adopt GWD Recommended Norms for RIF and SY
                            if (aquiferDetails.recommended_rif !== undefined) {
                                updates.rifValue = aquiferDetails.recommended_rif;
                            }
                            if (aquiferDetails.recommended_sy !== undefined) {
                                updates.specificYield = aquiferDetails.recommended_sy;
                            }
                        }

                        // Set a default Specific Yield if not already set by backend
                        if (updates.specificYield === undefined && !prev.specificYield) {
                            updates.specificYield = 0.02;
                        }

                        // Pre-calculate Return Flow Factors (RFF) to avoid 0 recharge on load
                        const depth = res.pre_monsoon_avg || updates.preMonsoonDepth || 10;
                        const postDepth = res.post_monsoon_avg || updates.postMonsoonDepth || depth;

                        updates.rswi_returnFlowFactor = calculateRFF(depth, 'SW', 'NON_PADDY');
                        updates.rgwi_returnFlowFactor = calculateRFF(depth, 'GW', 'NON_PADDY');

                        // Non-Monsoon RFFs
                        updates.rgwi_gw_rff_nm = calculateRFF(postDepth, 'GW', 'NON_PADDY');
                        updates.rgwi_sw_rff_nm = calculateRFF(postDepth, 'SW', 'NON_PADDY');

                        // Set Tank and WCS defaults
                        updates.rtp_rechargeFactor = GEC_NORMS.tanks_and_ponds.recommended;
                        updates.rtp_rechargeFactor_nm = GEC_NORMS.tanks_and_ponds.recommended;
                        updates.rwcs_rechargeFactor = GEC_NORMS.wcs.monsoon / 100.0;
                        updates.rwcs_rechargeFactor_nm = GEC_NORMS.wcs.non_monsoon / 100.0;

                        // Map Advanced GEC-2015 metrics if calculated by backend
                        if (res.water_budget) {
                            const wb = res.water_budget;
                            updates.saline_area_proportion = wb.availability?.saline_area_proportion;
                            updates.saline_area_ha = wb.availability?.saline_area_ha;
                            updates.fresh_area_ha = wb.availability?.fresh_area_ha;

                            updates.pre_slope = wb.budget?.pre_slope;
                            updates.pst_slope = wb.budget?.pst_slope;
                            updates.trends_declining = wb.budget?.trends_declining;
                            updates.final_category = wb.budget?.final_category;
                            updates.provisional_category = wb.budget?.provisional_category;

                            updates.projected_domestic_25yr = wb.utilization?.projected_domestic_25yr;
                            updates.net_future_availability_future = wb.utilization?.net_future_availability_future;

                            updates.terrainType = wb.aquifer_details?.terrain;
                            updates.custom_nd_percent = wb.budget?.custom_nd_percent;
                            updates.terrainFixedDischarge = wb.aquifer_details?.spring_discharge_ha_m;
                        }

                        return { ...prev, ...res, ...updates };
                    });
                })
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error("Error fetching aquifer data:", err);
                    }
                });

            return () => {
                controller.abort();
            };
        }
    }, [gpId]);


    const metaData = {
        state: "RAJASTHAN",
        district: location.state?.districtName || "AJMER",
        block: location.state?.blockName || "AJMER RURAL",
        gpName: location.state?.gpName || "ARADKA",
    };

    // Scroll to top whenever view changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentView]);

    const handleViewChange = (view) => {
        setCurrentView(view);
    };

    const handleAvailabilitySave = (data) => {
        setAvailabilityData(data);
        alert('Availability Data Saved!');
    };

    const handleNext = () => {
        // Navigate to Utilization page with the data and preserve location context
        navigate('/water-utilization', {
            state: {
                ...location.state,
                availabilityData: availabilityData
            }
        });
    };

    const renderContent = () => {
        switch (currentView) {
            case 'availability':
                return (
                    <WaterAvailability
                        formData={availabilityData}
                        setFormData={setAvailabilityData}
                        onBack={() => navigate('/')}
                        onSave={() => handleAvailabilitySave(availabilityData)}
                        onSummary={() => handleViewChange('report')}
                    />
                );
            case 'report':
                return (
                    <WaterAvailabilityReport
                        data={availabilityData}
                        metadata={metaData}
                        onBack={() => handleViewChange('availability')}
                        onNext={handleNext}
                    />
                );
            default:
                return <div>Unknown View</div>;
        }
    };

    return (
        <div className="wa-page-container" >
            <SelectionNavbar />

            <div className="wa-content">
                {renderContent()}
            </div>
        </div >
    );
};

export default WaterAvailabilityPage;
