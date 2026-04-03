import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SelectionNavbar from '../../components/Shared/SelectionNavbar';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import DemandSideManagement from '../../components/Management/DemandSideManagement';
import { locationService } from '../../services/locationService';
import { INITIAL_DATA } from '../../components/Management/DemandSide/demandConfig';
import '../../components/Management/Management.css';
import '../../components/Management/DemandSideManagement.css';
import '../../pages/WaterAvailability/WaterAvailabilityPage.css';

const DemandSideManagementPage = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const location = useLocation();

    // Preserve previous context
    const prevContext = location.state || {};
    const { gpId } = location.state || {};

    const [interventions, setInterventions] = useState(INITIAL_DATA);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (gpId) {
            const controller = new AbortController();
            setLoading(true);
            locationService.getGPExcelData(gpId, controller.signal)
                .then(res => {
                    const records = res.excel_records || (Array.isArray(res) ? res : []);
                    if (records && records.length > 0) {
                        const mainRecord = records[0]; // Use first record for baseline demand data
                        const newData = JSON.parse(JSON.stringify(INITIAL_DATA));

                        // 1. Sprinkler
                        if (mainRecord.sprinkler_kharif_crop_name) {
                            newData.sprinkler.kharif.push({
                                id: 'sk1',
                                category: mainRecord.sprinkler_kharif_crop_category,
                                type: mainRecord.sprinkler_kharif_crop_type,
                                name: mainRecord.sprinkler_kharif_crop_name,
                                areaConv: mainRecord.sprinkler_kharif_area_under_conventional_irrigation_ha,
                                netReq: mainRecord.sprinkler_kharif_net_water_requirement_mm,
                                areaProposed: mainRecord.sprinkler_kharif_area_proposed_for_sprinkler_ha,
                                cost: mainRecord.sprinkler_funding_approximate_estimated_cost_in_lakh,
                                savingPercent: 25 // Standard for Sprinkler
                            });
                        }
                        if (mainRecord.sprinkler_rabi_crop_name) {
                            newData.sprinkler.rabi.push({
                                id: 'sr1',
                                category: mainRecord.sprinkler_rabi_crop_category,
                                type: mainRecord.sprinkler_rabi_crop_type,
                                name: mainRecord.sprinkler_rabi_crop_name,
                                areaConv: mainRecord.sprinkler_rabi_area_under_conventional_irrigation_ha,
                                netReq: mainRecord.sprinkler_rabi_net_water_requirement_mm,
                                areaProposed: mainRecord.sprinkler_rabi_area_proposed_for_sprinkler_ha,
                                cost: mainRecord.sprinkler_funding_approximate_estimated_cost_in_lakh,
                                savingPercent: 25
                            });
                        }
                        if (mainRecord.sprinkler_summer_crop_name) {
                            newData.sprinkler.summer.push({
                                id: 'ss1',
                                category: mainRecord.sprinkler_summer_crop_category,
                                type: mainRecord.sprinkler_summer_crop_type,
                                name: mainRecord.sprinkler_summer_crop_name,
                                areaConv: mainRecord.sprinkler_summer_area_under_conventional_irrigation_ha,
                                netReq: mainRecord.sprinkler_summer_net_water_requirement_mm,
                                areaProposed: mainRecord.sprinkler_summer_area_proposed_for_sprinkler_ha,
                                cost: mainRecord.sprinkler_funding_approximate_estimated_cost_in_lakh,
                                savingPercent: 25
                            });
                        }

                        // 2. Drip
                        if (mainRecord.drip_kharif_crop_name) {
                            newData.drip.kharif.push({
                                id: 'dk1',
                                category: mainRecord.drip_kharif_crop_category,
                                type: mainRecord.drip_kharif_crop_type,
                                name: mainRecord.drip_kharif_crop_name,
                                areaConv: mainRecord.drip_kharif_area_under_conventional_irrigation_ha,
                                netReq: mainRecord.drip_kharif_net_water_requirement_mm,
                                areaProposed: mainRecord.drip_kharif_area_proposed_for_drip_ha,
                                cost: mainRecord.drip_funding_approximate_estimated_cost_in_lakh,
                                savingPercent: 40 // Standard for Drip
                            });
                        }
                        if (mainRecord.drip_rabi_crop_name) {
                            newData.drip.rabi.push({
                                id: 'dr1',
                                category: mainRecord.drip_rabi_crop_category,
                                type: mainRecord.drip_rabi_crop_type,
                                name: mainRecord.drip_rabi_crop_name,
                                areaConv: mainRecord.drip_rabi_area_under_conventional_irrigation_ha,
                                netReq: mainRecord.drip_rabi_net_water_requirement_mm,
                                areaProposed: mainRecord.drip_rabi_area_proposed_for_drip_ha,
                                cost: mainRecord.drip_funding_approximate_estimated_cost_in_lakh,
                                savingPercent: 40
                            });
                        }
                        if (mainRecord.drip_summer_crop_name) {
                            newData.drip.summer.push({
                                id: 'ds1',
                                category: mainRecord.drip_summer_crop_category,
                                type: mainRecord.drip_summer_crop_type,
                                name: mainRecord.drip_summer_crop_name,
                                areaConv: mainRecord.drip_summer_area_under_conventional_irrigation_ha,
                                netReq: mainRecord.drip_summer_net_water_requirement_mm,
                                areaProposed: mainRecord.drip_summer_area_proposed_for_drip_ha,
                                cost: mainRecord.drip_funding_approximate_estimated_cost_in_lakh,
                                savingPercent: 40
                            });
                        }

                        // 3. Pipelines
                        if (mainRecord.pipeline_kharif_crop_name) {
                            newData.pipelines.kharif.push({
                                id: 'pk1',
                                category: mainRecord.pipeline_kharif_crop_category,
                                type: mainRecord.pipeline_kharif_crop_type,
                                name: mainRecord.pipeline_kharif_crop_name,
                                areaConv: mainRecord.pipeline_kharif_area_under_conventional_irrigation_ha,
                                netReq: mainRecord.pipeline_kharif_net_water_requirement_mm,
                                areaProposed: mainRecord.pipeline_kharif_area_proposed_for_pipelines_ha,
                                cost: mainRecord.pipeline_funding_approximate_estimated_cost_in_lakh,
                                savingPercent: 15 // Standard for Pipelines
                            });
                        }
                        if (mainRecord.pipeline_rabi_crop_name) {
                            newData.pipelines.rabi.push({
                                id: 'pr1',
                                category: mainRecord.pipeline_rabi_crop_category,
                                type: mainRecord.pipeline_rabi_crop_type,
                                name: mainRecord.pipeline_rabi_crop_name,
                                areaConv: mainRecord.pipeline_rabi_area_under_conventional_irrigation_ha,
                                netReq: mainRecord.pipeline_rabi_net_water_requirement_mm,
                                areaProposed: mainRecord.pipeline_rabi_area_proposed_for_pipelines_ha,
                                cost: mainRecord.pipeline_funding_approximate_estimated_cost_in_lakh,
                                savingPercent: 15
                            });
                        }
                        if (mainRecord.pipeline_summer_crop_name) {
                            newData.pipelines.summer.push({
                                id: 'ps1',
                                category: mainRecord.pipeline_summer_crop_category,
                                type: mainRecord.pipeline_summer_crop_type,
                                name: mainRecord.pipeline_summer_crop_name,
                                areaConv: mainRecord.pipeline_summer_area_under_conventional_irrigation_ha,
                                netReq: mainRecord.pipeline_summer_net_water_requirement_mm,
                                areaProposed: mainRecord.pipeline_summer_area_proposed_for_pipelines_ha,
                                cost: mainRecord.pipeline_funding_approximate_estimated_cost_in_lakh,
                                savingPercent: 15
                            });
                        }

                        // 4. Diversification
                        if (mainRecord.div_kharif_original_crop_name) {
                            newData.diversification.kharif.original.push({
                                id: 'do1',
                                category: mainRecord.div_kharif_original_crop_category,
                                type: mainRecord.div_kharif_original_crop_type,
                                name: mainRecord.div_kharif_original_crop_name,
                                waterReq: mainRecord.div_kharif_original_water_req_mm,
                                area: mainRecord.div_kharif_original_area_ha
                            });
                            newData.diversification.kharif.changed.push({
                                id: 'dc1',
                                category: mainRecord.div_kharif_changed_crop_category,
                                type: mainRecord.div_kharif_changed_crop_type,
                                name: mainRecord.div_kharif_changed_crop_name,
                                waterReq: mainRecord.div_kharif_changed_water_req_mm,
                                area: mainRecord.div_kharif_changed_area_ha,
                                cost: mainRecord.div_funding_estimated_cost_in_lakh
                            });
                        }
                        if (mainRecord.div_rabi_original_crop_name) {
                            newData.diversification.rabi.original.push({
                                id: 'dro1',
                                category: mainRecord.div_rabi_original_crop_category,
                                type: mainRecord.div_rabi_original_crop_type,
                                name: mainRecord.div_rabi_original_crop_name,
                                waterReq: mainRecord.div_rabi_original_water_req_mm,
                                area: mainRecord.div_rabi_original_area_ha
                            });
                            newData.diversification.rabi.changed.push({
                                id: 'drc1',
                                category: mainRecord.div_rabi_changed_crop_category,
                                type: mainRecord.div_rabi_changed_crop_type,
                                name: mainRecord.div_rabi_changed_crop_name,
                                waterReq: mainRecord.div_rabi_changed_water_req_mm,
                                area: mainRecord.div_rabi_changed_area_ha,
                                cost: mainRecord.div_funding_estimated_cost_in_lakh
                            });
                        }
                        if (mainRecord.div_summer_original_crop_name) {
                            newData.diversification.summer.original.push({
                                id: 'dso1',
                                category: mainRecord.div_summer_original_crop_category,
                                type: mainRecord.div_summer_original_crop_type,
                                name: mainRecord.div_summer_original_crop_name,
                                waterReq: mainRecord.div_summer_original_water_req_mm,
                                area: mainRecord.div_summer_original_area_ha
                            });
                            newData.diversification.summer.changed.push({
                                id: 'dsc1',
                                category: mainRecord.div_summer_changed_crop_category,
                                type: mainRecord.div_summer_changed_crop_type,
                                name: mainRecord.div_summer_changed_crop_name,
                                waterReq: mainRecord.div_summer_changed_water_req_mm,
                                area: mainRecord.div_summer_changed_area_ha,
                                cost: mainRecord.div_funding_estimated_cost_in_lakh
                            });
                        }

                        // 5. Innovative
                        if (mainRecord.inn_kharif_measure) {
                            newData.innovative.kharif.push({
                                id: 'in1',
                                measure: mainRecord.inn_kharif_measure,
                                category: mainRecord.inn_kharif_crop_category,
                                name: mainRecord.inn_kharif_crop_name,
                                waterReq: mainRecord.inn_kharif_water_req_mm,
                                savingPercent: mainRecord.inn_kharif_water_saving_percent,
                                area: mainRecord.inn_kharif_area_proposed_ha,
                                cost: mainRecord.inn_funding_estimated_cost_in_lakh
                            });
                        }
                        if (mainRecord.inn_rabi_measure) {
                            newData.innovative.rabi.push({
                                id: 'inr1',
                                measure: mainRecord.inn_rabi_measure,
                                category: mainRecord.inn_rabi_crop_category,
                                name: mainRecord.inn_rabi_crop_name,
                                waterReq: mainRecord.inn_rabi_water_req_mm,
                                savingPercent: mainRecord.inn_rabi_water_saving_percent,
                                area: mainRecord.inn_rabi_area_proposed_ha,
                                cost: mainRecord.inn_funding_estimated_cost_in_lakh
                            });
                        }
                        if (mainRecord.inn_summer_measure) {
                            newData.innovative.summer.push({
                                id: 'ins1',
                                measure: mainRecord.inn_summer_measure,
                                category: mainRecord.inn_summer_crop_category,
                                name: mainRecord.inn_summer_crop_name,
                                waterReq: mainRecord.inn_summer_water_req_mm,
                                savingPercent: mainRecord.inn_summer_water_saving_percent,
                                area: mainRecord.inn_summer_area_proposed_ha,
                                cost: mainRecord.inn_funding_estimated_cost_in_lakh
                            });
                        }

                        setInterventions(newData);
                    }
                })
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error("Error fetching demand side data:", err);
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) {
                        setLoading(false);
                    }
                });

            return () => controller.abort();
        }
    }, [gpId]);

    const handleSave = (data) => {
        setInterventions(data);
        alert('Demand Side interventions saved!');
    };

    const handleNext = () => {
        navigate('/supply-side-management', {
            state: { ...prevContext, demandInterventions: interventions }
        });
    };

    return (
        <div className="wa-page-container">
            <SelectionNavbar />

            <div className="wa-content">
                {loading ? (
                    <div className="loading-state">Loading Demand Side Data...</div>
                ) : (
                    <DemandSideManagement
                        initialData={interventions}
                        onBack={() => navigate('/water-budget', { state: prevContext })}
                        onSave={handleSave}
                        onNext={handleNext}
                    />
                )}
            </div>
        </div>
    );
};

export default DemandSideManagementPage;
