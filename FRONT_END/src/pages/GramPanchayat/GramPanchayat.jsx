import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SelectionNavbar from '../../components/Shared/SelectionNavbar';
import GPNavBar from '../../components/GramPanchayat/GPNavBar';
import GPInfoCard from '../../components/GramPanchayat/GPInfoCard';
import MapsUpload from '../../components/GramPanchayat/MapsUpload';
import GroundWaterLevel from '../../components/GramPanchayat/GroundWaterLevel';
import GroundWaterQuality from '../../components/GramPanchayat/GroundWaterQuality';
import GPSummaryReport from '../../components/GramPanchayat/GPSummaryReport';
import { locationService } from '../../services/locationService';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import './GramPanchayat.css';

const GramPanchayat = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const location = useLocation();

    // Get step from query params if available
    const searchParams = new URLSearchParams(location.search);
    const initialStep = parseInt(searchParams.get('step')) || 1;

    const [activeStep, setActiveStep] = useState(initialStep);

    // Extract location info from state
    const { districtName, blockName, gpName, gpId } = location.state || {};

    // Initial state with fallbacks, but prefer loading actual data
    const [data, setData] = useState({
        state: "RAJASTHAN",
        district: districtName || "AJMER",
        block: blockName || "PISANGAN",
        gpName: gpName || "BHAGWANPURA",
        lgdCode: gpId || "33782",
        blockArea: "", // To be fetched from API
        gpArea: "",     // To be fetched from API
        watershedCode: "",
        watershedName: "",
        watershedAreaInBlock: "",
        subBasinCode: "",
        subBasinName: "",
        basinCode: "",
        basinName: "",
        // New GEC fields
        assessmentUnitType: "Gram Panchayat",
        hydrogeology: "",
        aquiferType: "",
        areaHa: ""
    });

    // Fetch real data when GP ID is present
    useEffect(() => {
        if (gpId) {
            const controller = new AbortController();
            locationService.getAquiferData(gpId, controller.signal)
                .then(res => {
                    if (res) {
                        setData(prev => ({
                            ...prev,
                            // Update with fetched data if available
                            gpName: res.gp_name || prev.gpName,
                            gpArea: res.area_ha ? String(res.area_ha) : prev.gpArea,
                            areaHa: res.area_ha ? String(res.area_ha) : prev.areaHa,
                            // Maps other potential fields from API if they exist in future
                            lgdCode: String(res.gp_id || gpId),
                        }));
                    }
                })
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error("Error fetching GP info:", err);
                    }
                });

            return () => controller.abort();
        }
    }, [gpId]);

    // Scroll to top whenever activeStep changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [activeStep]);


    const renderStepContent = () => {
        switch (activeStep) {
            case 1:
                return <GPInfoCard
                    data={data}
                    onNext={() => setActiveStep(2)}
                    onSave={() => { }}
                />;
            case 2:
                return <MapsUpload
                    gpId={gpId}
                    data={data}
                    onBack={() => setActiveStep(1)}
                    onSave={() => { }}
                    onNext={() => setActiveStep(3)}
                />;
            case 3:
                return <GroundWaterLevel
                    onBack={() => setActiveStep(2)}
                    onSave={() => { }}
                    onNext={() => setActiveStep(4)}
                />;
            case 4:
                return <GroundWaterQuality
                    onBack={() => setActiveStep(3)}
                    onSave={() => { }}
                    onSummary={() => setActiveStep(5)}
                />;
            case 5:
                return <GPSummaryReport
                    data={data}
                    onBack={() => setActiveStep(4)}
                    onWaterAvailability={() => navigate('/water-availability', { state: location.state })}
                />;
            default:
                return <GPInfoCard data={data} />;
        }
    };

    return (
        <div className="gp-container">
            <SelectionNavbar />

            {/* Navigation Component - Hidden in Report view */}
            {activeStep !== 5 && (
                <GPNavBar activeStep={activeStep} onStepChange={setActiveStep} />
            )}

            {/* Conditional Content */}
            {renderStepContent()}

        </div>
    );
};

export default GramPanchayat;
