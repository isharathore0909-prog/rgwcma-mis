import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SelectionNavbar from '../../components/Shared/SelectionNavbar';
import { locationService } from '../../services/locationService';
import { useLanguage } from '../../context/LanguageContext';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import '../WaterAvailability/WaterAvailabilityPage.css';
import '../ImpactAssessment/ImpactAssessmentPage.css';
import './FinalReportPage.css';

// Optimized Components
import ReportHeader from '../../components/Shared/ReportHeader';
import {
    ChapterGPInfo,
    ChapterSalientFeatures,
    ChapterAboutProject,
    ChapterHydrogeology,
    ChapterEstimation,
    ChapterManagement,
    ChapterConclusion
} from '../../components/FinalReport/Chapters';
import PrintHeaderFooter, { RepeatingHeader, RepeatingFooter } from '../../components/Shared/PrintHeaderFooter';
import '../../components/Shared/PrintStyles.css';

const FinalReportPage = () => {
    useScrollToTop();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const { gpId } = location.state || {};

    const [waterLevelData, setWaterLevelData] = useState([]);
    const [waterQualityData, setWaterQualityData] = useState([]);
    const [aquiferTrendData, setAquiferTrendData] = useState([]);
    const [gpAquiferData, setGpAquiferData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch all necessary data for report
    useEffect(() => {
        if (gpId) {
            const controller = new AbortController();
            setLoading(true);

            Promise.all([
                locationService.getAquiferWaterLevelData(gpId, controller.signal),
                locationService.getWaterQualityData(gpId, controller.signal),
                locationService.getAquiferTrend(gpId, controller.signal),
                locationService.getAquiferData(gpId, controller.signal)
            ]).then(([levelData, qualityData, trendData, aquiferData]) => {
                if (levelData) setWaterLevelData(levelData);
                if (qualityData) setWaterQualityData(qualityData);
                if (trendData) setAquiferTrendData(trendData);
                if (aquiferData) setGpAquiferData(aquiferData);
            }).catch(err => {
                if (err.name !== 'AbortError') {
                    console.error("Error fetching report data:", err);
                }
            }).finally(() => {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            });

            return () => controller.abort();
        }
    }, [gpId]);

    const [isPrint, setIsPrint] = useState(false);

    // Detect print state for correct chart rendering
    useEffect(() => {
        const before = () => {
            setIsPrint(true);
            window.dispatchEvent(new Event('resize'));
        };
        const after = () => setIsPrint(false);

        window.addEventListener("beforeprint", before);
        window.addEventListener("afterprint", after);

        return () => {
            window.removeEventListener("beforeprint", before);
            window.removeEventListener("afterprint", after);
        };
    }, []);

    const cleanName = (name) => {
        if (!name || name === "-") return "-";
        return name.toString().split('_')[0].trim().toUpperCase();
    };

    const metaData = {
        state: "RAJASTHAN",
        district: cleanName(location.state?.districtName),
        block: cleanName(location.state?.blockName),
        gpName: cleanName(location.state?.gpName),
        year: "2023-24",
        userName: "spmu.atal@rajasthan.gov.in",
        coordinates: "-",
        accreditationNo: "-",
        gpId: location.state?.gpId || "-",
        blockArea: "-",
        gpArea: "-",
        watershedCode: "-",
        watershedName: "-",
        watershedBlockArea: "-",
        subBasinCode: "-",
        subBasinName: "-",
        basinCode: "-",
        basinName: "-"
    };

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <div className="wa-report-paper-wrapper fr-report-wrapper">
            <SelectionNavbar />


            <div className="report-grey-section">
                <div className="wa-report-container printable-report fr-report-container">
                    <PrintHeaderFooter
                        title="WATER SECURITY PLAN REPORT"
                        metaData={metaData}
                    />

                    <table className="print-layout-table">
                        <thead>
                            <tr>
                                <td>
                                    <div className="print-layout-header-spacer">
                                        <RepeatingHeader title="WATER SECURITY PLAN REPORT" t={t} />
                                    </div>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <ReportHeader
                                        title="WATER SECURITY PLAN REPORT"
                                        metaData={metaData}
                                        dateStr={dateStr}
                                        timeStr={timeStr}
                                    />

                                    <div className="wa-report-content">
                                        <div className="impact-full-report">
                                            <ChapterGPInfo metaData={metaData} isPrint={isPrint} />
                                            <ChapterAboutProject gpId={gpId} metaData={metaData} isPrint={isPrint} />
                                            <ChapterHydrogeology
                                                gpId={gpId}
                                                waterLevelData={waterLevelData}
                                                waterQualityData={waterQualityData}
                                                aquiferTrendData={aquiferTrendData}
                                                loading={loading}
                                                isPrint={isPrint}
                                            />
                                            <ChapterEstimation gpAquiferData={gpAquiferData} isPrint={isPrint} />
                                            <ChapterManagement isPrint={isPrint} />
                                            <ChapterConclusion isPrint={isPrint} />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td>
                                    <div className="print-layout-footer-spacer">
                                        <RepeatingFooter metaData={metaData} />
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="wa-report-actions no-print">
                    <button className="btn-back" onClick={() => navigate('/impact-assessment', { state: location.state })}>Back</button>
                    <button className="btn-next" onClick={() => navigate('/')}>Finish</button>
                </div>
            </div>
        </div>
    );
};

export default FinalReportPage;
