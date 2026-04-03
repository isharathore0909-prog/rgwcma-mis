import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SelectionNavbar from '../../components/Shared/SelectionNavbar';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import SupplySideManagement from '../../components/Management/SupplySideManagement';
import ManagementSummary from '../../components/Management/ManagementSummary';
import { locationService } from '../../services/locationService';
import { INITIAL_SUPPLY_DATA } from '../../components/Management/SupplySide/supplyConfig';
import '../../components/Management/Management.css';
import '../../pages/WaterAvailability/WaterAvailabilityPage.css';

const SupplySideManagementPage = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const location = useLocation();

    const demandData = location.state?.demandInterventions || {};
    const { gpId } = location.state || {};

    const [supplyData, setSupplyData] = useState(INITIAL_SUPPLY_DATA);
    const [loading, setLoading] = useState(false);
    const [showSummary, setShowSummary] = useState(false);

    // Scroll to top whenever view changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [showSummary]);

    useEffect(() => {
        if (gpId) {
            const controller = new AbortController();
            setLoading(true);
            locationService.getGPExcelData(gpId, controller.signal)
                .then(res => {
                    const records = res.excel_records || (Array.isArray(res) ? res : []);
                    if (records && records.length > 0) {
                        const newData = JSON.parse(JSON.stringify(INITIAL_SUPPLY_DATA));

                        records.forEach(record => {
                            // 1. ARS (Artificial Recharge Structure)
                            if (record.ars_type_of_artificial_recharge_structure) {
                                newData.recharge.push({
                                    id: `ars-${record.id}`,
                                    villageName: record.ars_village_name,
                                    locationDetails: record.ars_location_details,
                                    structureType: record.ars_type_of_artificial_recharge_structure,
                                    latitude: record.ars_latitude,
                                    longitude: record.ars_longitude,
                                    workProposed: record.ars_work_proposed,
                                    storageCapacity: record.ars_storage_capacity_ha_m,
                                    annualFillings: record.ars_annual_no_of_fillings,
                                    rechargePercent: record.ars_recharge_percent,
                                    annualGWRecharge: record.ars_annual_gw_recharge_ha_m,
                                    financialYear: record.ars_financial_year,
                                    departmentName: record.ars_department_name,
                                    schemeName: record.ars_scheme_name,
                                    estimatedCost: record.ars_estimated_cost_in_lakh
                                });
                            }

                            // 2. WCS (Water Conservation Structure)
                            if (record.wcs_type_of_water_conservation_structure) {
                                newData.conservation.push({
                                    id: `wcs-${record.id}`,
                                    villageName: record.wcs_village_name,
                                    locationDetails: record.wcs_location_details,
                                    structureType: record.wcs_type_of_water_conservation_structure,
                                    latitude: record.wcs_latitude,
                                    longitude: record.wcs_longitude,
                                    workProposed: record.wcs_work_proposed,
                                    storageCapacity: record.wcs_storage_capacity_ha_m,
                                    annualFillings: record.wcs_annual_no_of_fillings,
                                    effectiveStorage: record.wcs_effective_storage_available_ha_m,
                                    financialYear: record.wcs_financial_year,
                                    departmentName: record.wcs_department_name,
                                    schemeName: record.wcs_scheme_name,
                                    estimatedCost: record.wcs_estimated_cost_in_lakh
                                });
                            }
                        });

                        setSupplyData(newData);
                    }
                })
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error("Error fetching supply side data:", err);
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

    const data = {
        state: "RAJASTHAN",
        district: location.state?.districtName || "AJMER",
        block: location.state?.blockName || "AJMER RURAL",
        gpName: location.state?.gpName || "ARADKA",
    };

    const handleSave = (finalSupplyData) => {
        setSupplyData(finalSupplyData);
        alert('Supply Side structures saved!');
    };

    const handleFinish = (finalSupplyData) => {
        setSupplyData(finalSupplyData);
        setShowSummary(true); // Toggle to summary view
    };

    if (showSummary) {
        return (
            <ManagementSummary
                demandData={demandData}
                supplyData={supplyData}
                metadata={{
                    state: data.state,
                    district: data.district,
                    block: data.block,
                    gp: data.gpName,
                    year: "2023-24",
                    userName: "SPMU_Rajasthan"
                }}
                onBack={() => setShowSummary(false)}
                onDownload={() => alert('Downloading Report...')}
                onNext={() => navigate('/impact-assessment', { state: location.state })}
            />
        );
    }

    return (
        <div className="wa-page-container">
            <SelectionNavbar />

            <div className="wa-content">
                {loading ? (
                    <div className="loading-state">Loading Supply Side Data...</div>
                ) : (
                    <SupplySideManagement
                        initialData={supplyData}
                        onBack={() => navigate('/demand-side-management', { state: location.state })}
                        onSave={handleSave}
                        onFinish={handleFinish}
                    />
                )}
            </div>
        </div>
    );
};

export default SupplySideManagementPage;
