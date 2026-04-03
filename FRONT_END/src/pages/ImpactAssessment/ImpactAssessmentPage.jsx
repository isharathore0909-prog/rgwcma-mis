import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SelectionNavbar from '../../components/Shared/SelectionNavbar';
import { locationService } from '../../services/locationService';
import { useLanguage } from '../../context/LanguageContext';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import './ImpactAssessmentPage.css';

// Reusing generic components from FinalReport where applicable for consistency
import ReportHeader from '../../components/Shared/ReportHeader';
import ReportBreadcrumb from '../../components/Shared/ReportBreadcrumb';
// Importing specific ImpactAssessment components
import {
    ChapterSalientFeatures,
    ChapterAboutProject,
    ChapterHydrogeology,
    ChapterTubewells,
    ChapterMiningPlan,
    ChapterMiningManagement,
    ChapterImpactAssessment,
    AnalyticalCharts,
    ChapterConclusion
} from '../../components/ImpactAssessment/Chapters';
import PrintHeaderFooter, { RepeatingHeader, RepeatingFooter } from '../../components/Shared/PrintHeaderFooter';
import '../../components/Shared/PrintStyles.css';

const ImpactAssessmentPage = () => {
    useScrollToTop();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();

    // Persist location.state to sessionStorage to survive page refreshes
    const [persistedState, setPersistedState] = useState(() => {
        const stored = sessionStorage.getItem('impactAssessmentState');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse stored state:', e);
            }
        }
        return location.state || {};
    });

    // Update sessionStorage whenever location.state changes
    useEffect(() => {
        if (location.state) {
            sessionStorage.setItem('impactAssessmentState', JSON.stringify(location.state));
            setPersistedState(location.state);
        }
    }, [location.state]);

    const { gpId } = persistedState;

    const [reportType, setReportType] = useState('industry'); // 'industry' or 'infrastructure'
    const [waterLevelData, setWaterLevelData] = useState([]);
    const [waterQualityData, setWaterQualityData] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    const [waterbodiesData, setWaterbodiesData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPrint, setIsPrint] = useState(false);

    // Scroll to top whenever reportType changes (Industry/Infrastructure/Mining)
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [reportType]);

    useEffect(() => {
        const handleBeforePrint = () => {
            setIsPrint(true);
            // Force a resize event to ensure Recharts and other responsive components update for the print layout
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        };
        const handleAfterPrint = () => setIsPrint(false);

        window.addEventListener('beforeprint', handleBeforePrint);
        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            window.removeEventListener('beforeprint', handleBeforePrint);
            window.removeEventListener('afterprint', handleAfterPrint);
        };
    }, []);

    // Fetch water level and quality data
    useEffect(() => {
        if (gpId) {
            const controller = new AbortController();
            const signal = controller.signal;
            setLoading(true);

            Promise.all([
                locationService.getAquiferWaterLevelData(gpId, signal),
                locationService.getWaterQualityData(gpId, signal),
                locationService.getAquiferData(gpId, signal)
            ])
                .then(([levelData, qualityData, summary]) => {
                    if (levelData && Array.isArray(levelData)) {
                        setWaterLevelData(levelData);
                    }
                    if (qualityData && Array.isArray(qualityData)) {
                        setWaterQualityData(qualityData);
                    }
                    if (summary) {
                        setSummaryData(summary);
                    }
                })
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error("Error fetching initial data:", err);
                    }
                })
                .finally(() => {
                    if (!signal.aborted) {
                        setLoading(false);
                    }
                });

            // Separate fetch for map-related info that might depend on lat/lon
            const { lat, lon } = persistedState || {};
            locationService.getWaterbodiesInfo(gpId, lat, lon, signal)
                .then(data => setWaterbodiesData(data))
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error("Error fetching waterbodies info:", err);
                    }
                });

            return () => controller.abort();
        }
    }, [gpId, persistedState]);

    // Data State (originally Mock)
    const [editableMetaData, setEditableMetaData] = useState({
        state: "RAJASTHAN",
        district: persistedState?.districtName || "AJMER",
        block: persistedState?.blockName || "AJMER RURAL",
        gpName: persistedState?.gpName || "ARADKA",
        year: "2023-24",
        userName: persistedState?.userName || "SPMU_RAJASTHAN_8_NODAL.ATAL@RAJASTHAN.GOV.IN",
        projectName: "", // Added field for name of project
        coordinates: persistedState?.coordinates || "26.4499° N, 74.6399° E",
        projectCategory: "Industrial / Infrastructure",
        totalSiteArea: "12.5 Hectares",
        accreditationNo: "CGWA/NOC/2023/1245",
        topography: "Undulating / Pediment Plain",
        drainage: "Drains into local 'Nalla' towards Southeast",
        aquiferSystem: "Single layer hard rock aquifer system"
    });

    // Synchronize editableMetaData when persistedState (navigated state) arrives or changes
    useEffect(() => {
        if (persistedState && Object.keys(persistedState).length > 0) {
            setEditableMetaData(prev => ({
                ...prev,
                district: persistedState.districtName || prev.district,
                block: persistedState.blockName || prev.block,
                gpName: persistedState.gpName || prev.gpName,
                userName: persistedState.userName || prev.userName,
                // If coordinates or other fields exist in the state, use them
                ...(persistedState.coordinates && { coordinates: persistedState.coordinates }),
                ...(persistedState.projectName && { projectName: persistedState.projectName })
            }));
        }
    }, [persistedState]);

    const [isEditing, setIsEditing] = useState(false);
    const [manualAnalysis, setManualAnalysis] = useState(null);
    const [tubewellEntries, setTubewellEntries] = useState([
        { id: 1, detail: 'BW - 01 (Exist.)', aquifer: '', depth: '', diameter: '', log: '', hp: '', discharge: '', usage: '' },
        { id: 2, detail: 'BW - 02 (Prop.)', aquifer: '', depth: '', diameter: '', log: '', hp: '', discharge: '', usage: '' }
    ]);

    const [miningData, setMiningData] = useState({
        minePlanDetails: 'Year wise plan including excavation depth and area. Seepage KLD/KLY included.',
        estimationWalls: [
            { id: 'w1', year: 'Year 1', period: 'Pre', benchRL: '', waterRL: '', faceLength: '', faceWidth: '', satThick: '', gradient: '', hydCond: '', seepageDay: '', annual: '' },
            { id: 'w2', year: 'Year 1', period: 'Post', benchRL: '', waterRL: '', faceLength: '', faceWidth: '', satThick: '', gradient: '', hydCond: '', seepageDay: '', annual: '' }
        ],
        estimationBottom: [
            { id: 'b1', year: 'Year 1', period: 'Pre-Monsoon', hydCond: '', seepageDay: '', annualSeepage: '' },
            { id: 'b2', year: 'Year 1', period: 'Post-Monsoon', hydCond: '', seepageDay: '', annualSeepage: '' }
        ],
        seepageSummary: [
            { id: 's1', year: 'Year 1', period: 'Pre / Post', annualSeepage: '' },
            { id: 's2', year: 'Year 2', period: 'Pre / Post', annualSeepage: '' },
            { id: 's3', year: 'Year 3', period: 'Pre / Post', annualSeepage: '' },
            { id: 's4', year: 'Year 4', period: 'Pre / Post', annualSeepage: '' },
            { id: 's5', year: 'Year 5', period: 'Pre / Post', annualSeepage: '' }
        ],
        dewateringPlan: '',
        modellingStatus: '',
        drinkingWater: '',
        irrigation: '',
        dustSuppression: ''
    });

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const parseCoordinates = (coordStr) => {
        if (!coordStr) return null;
        try {
            // Remove common symbols and normalize separators
            const cleanStr = coordStr.replace(/[°'"]/g, '').replace(/\s+/g, ' ');
            const parts = cleanStr.includes(',') ? cleanStr.split(',') : cleanStr.split(' ');
            const cleanedParts = parts.filter(p => p.trim() !== "").map(p => p.trim());

            if (cleanedParts.length < 2) return null;

            const parsePart = (part) => {
                let val = parseFloat(part);
                if (isNaN(val)) return null;
                const lower = part.toLowerCase();
                // Handle N/S/E/W suffixes or prefixes
                if (lower.includes('s') || lower.includes('w') || lower.includes('pashchim') || lower.includes('dakshin')) {
                    val = -Math.abs(val);
                }
                return val;
            };

            // Heuristic to identify which part is Lat/Lon if not obvious
            // Usually Lat is ~26 in Rajasthan and Lon is ~74
            const val1 = parsePart(cleanedParts[0]);
            const val2 = parsePart(cleanedParts[1]);

            if (val1 === null || val2 === null) return null;

            // In Rajasthan, Lon (70-78) is always > Lat (23-30)
            if (Math.abs(val1) > Math.abs(val2)) {
                return [val1, val2]; // val1 is likely Lon
            } else {
                return [val2, val1]; // val2 is likely Lon
            }
        } catch (e) {
            console.error("Coord parse error:", e);
            return null;
        }
    };

    const projectCenter = React.useMemo(() => parseCoordinates(editableMetaData.coordinates), [editableMetaData.coordinates]);

    // ANALYTICAL LOGIC FOR IMPACT ASSESSMENT
    const computedAnalysis = React.useMemo(() => {
        if (!summaryData) return {
            roi: "850m",
            headDrop: "0.18m",
            threat: "No significant drawdown near surface bodies",
            qualityStatus: "No potential for salinity ingress",
            mitigation: "Water reuse (38.5%) + Rainwater harvesting",
            treatment: "N/A (TDS within 500 mg/l)",
            recyclingRate: "38.5%",
            salineRequirement: "Not Applicable",
            monitoring: "Digital Meters + IoT Telemetry",
            sopStatus: "MODFLOW study included in Annexure II"
        };

        const discharge = summaryData.sw_avg_discharge_m3_hr || 0;
        const roiVal = Math.min(1500, Math.max(500, 500 + (discharge * 3.5)));
        const dropVal = (discharge / 500) * 0.5;

        // Quality check
        const avgTDS = waterQualityData.length > 0
            ? waterQualityData.reduce((acc, curr) => acc + (curr.tds || 0), 0) / waterQualityData.length
            : 0;

        const isSaline = avgTDS > 1000;
        const treatmentTech = isSaline ? "Reverse Osmosis (RO) + Ion Exchange" : "N/A (TDS within 500 mg/l)";
        const qualityStatus = avgTDS > 1500 ? "Potential for induced salinity migration" : "No potential for salinity ingress";
        const salineReq = isSaline ? "Mandatory disposal through solar evaporation" : "Not Applicable";

        return {
            roi: `${Math.round(roiVal)}m`,
            headDrop: `${dropVal.toFixed(2)} m over 5 years`,
            threat: discharge > 100 ? "Localized drawdown near abstraction point" : "No significant drawdown near surface bodies",
            qualityStatus: qualityStatus,
            mitigation: `Water reuse (${isSaline ? '45%' : '38.5%'}) + Rainwater harvesting`,
            treatment: treatmentTech,
            recyclingRate: isSaline ? "45.0%" : "38.5%",
            salineRequirement: salineReq,
            monitoring: "Digital Meters + IoT Telemetry",
            sopStatus: "MODFLOW study included in Annexure II"
        };
    }, [summaryData, waterQualityData]);

    const impactAnalysis = manualAnalysis || computedAnalysis;

    const handleMetaDataChange = (field, value) => {
        setEditableMetaData(prev => ({ ...prev, [field]: value }));
    };

    const handleAnalysisChange = (field, value) => {
        if (!manualAnalysis) {
            setManualAnalysis({ ...computedAnalysis, [field]: value });
        } else {
            setManualAnalysis(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleTubewellChange = (id, field, value) => {
        setTubewellEntries(prev => prev.map(entry => entry.id === id ? { ...entry, [field]: value } : entry));
    };

    const handleMiningChange = (field, value, rowId, subField) => {
        setMiningData(prev => {
            if (rowId && subField) {
                // Handle table updates (walls, bottom, summary)
                return {
                    ...prev,
                    [field]: prev[field].map(row => row.id === rowId ? { ...row, [subField]: value } : row)
                };
            }
            // Handle simple field updates
            return { ...prev, [field]: value };
        });
    };

    const handleAddTubewellRow = () => {
        setTubewellEntries(prev => [
            ...prev,
            { id: Date.now(), detail: `BW - ${prev.length + 1} (Prop.)`, aquifer: '', depth: '', diameter: '', log: '', hp: '', discharge: '', usage: '' }
        ]);
    };

    const handleAddMiningRow = (type) => {
        setMiningData(prev => {
            const newList = [...prev[type]];
            const lastRow = newList[newList.length - 1];
            const yearNum = lastRow ? parseInt(lastRow.year.replace('Year ', '')) || 1 : 1;
            const nextYear = `Year ${yearNum + (newList.length % 2 === 0 ? 1 : 0)}`; // Increment year every 2 rows if they follow pre/post pattern

            let newRow = { id: Math.random().toString(36).substr(2, 9), year: nextYear };
            if (type === 'estimationWalls') {
                newRow = { ...newRow, period: newList.length % 2 === 0 ? 'Pre' : 'Post', benchRL: '', waterRL: '', faceLength: '', faceWidth: '', satThick: '', gradient: '', hydCond: '', seepageDay: '', annual: '' };
            } else if (type === 'estimationBottom') {
                newRow = { ...newRow, period: newList.length % 2 === 0 ? 'Pre-Monsoon' : 'Post-Monsoon', hydCond: '', seepageDay: '', annualSeepage: '' };
            } else if (type === 'seepageSummary') {
                newRow = { ...newRow, year: `Year ${newList.length + 1}`, period: 'Pre / Post', annualSeepage: '' };
            }
            return { ...prev, [type]: [...newList, newRow] };
        });
    };

    const handlePrint = () => {
        // 1. Validate Metadata
        const requiredMeta = [

            { key: 'projectName', label: 'Name of Project' },
            { key: 'accreditationNo', label: 'NOC Application Number' },
            { key: 'totalSiteArea', label: 'Total Site Area' },
            { key: 'topography', label: 'Topography (Terrain)' },
            { key: 'drainage', label: 'Drainage Pattern' },
            { key: 'aquiferSystem', label: 'Aquifer System' }
        ];

        const missingMeta = requiredMeta.filter(m => !editableMetaData[m.key] || editableMetaData[m.key].trim() === '');

        if (missingMeta.length > 0) {
            alert(`Please fill out the following mandatory fields:\n\n${missingMeta.map(m => `• ${m.label}`).join('\n')}`);
            return;
        }

        // 2. Validate Tubewells
        if (tubewellEntries.length === 0) {
            alert('Please add details for at least one proposed/existing tubewell.');
            return;
        }

        // Check for specific missing fields in entries that have *some* data
        const incompleteEntries = tubewellEntries.filter(w => w.detail && (!w.depth || !w.discharge || !w.usage));
        if (incompleteEntries.length > 0) {
            alert('Please complete the details (Depth, Discharge, Usage) for all listed tubewells.');
            return;
        }

        // 3. Validate Mining Data (if applicable)
        if (reportType === 'mining') {
            if (!miningData.minePlanDetails || miningData.minePlanDetails.trim() === '') {
                alert('Please provide details for the Approved Mine Plan.');
                return;
            }

            // Validate Estimation Tables
            const hasWallData = miningData.estimationWalls.some(row => row.annual && row.annual !== '');
            const hasBottomData = miningData.estimationBottom.some(row => row.annualSeepage && row.annualSeepage !== '');
            const hasSummaryData = miningData.seepageSummary.some(row => row.annualSeepage && row.annualSeepage !== '');

            if (!hasWallData || !hasBottomData || !hasSummaryData) {
                alert('Please ensure Mine Seepage Estimation tables (Walls, Bottom, Summary) have calculated annual values.');
                return;
            }
        }

        // 4. Validate Impact Assessment
        if (!impactAnalysis.roi || !impactAnalysis.headDrop) {
            alert('Please ensure Impact Assessment values (ROI, Head Drop) are calculated or entered.');
            return;
        }

        // If all validations pass
        window.print();
    };

    return (
        <div className="wa-report-paper-wrapper ia-report-wrapper">
            <SelectionNavbar />

            <div className="report-grey-section">
                <div className="wa-report-container printable-report">
                    <PrintHeaderFooter
                        title="IMPACT ASSESSMENT REPORT"
                        metaData={editableMetaData}
                    />

                    <table className="print-layout-table">
                        <thead>
                            <tr>
                                <td>
                                    <div className="print-layout-header-spacer">
                                        <RepeatingHeader title="IMPACT ASSESSMENT REPORT" t={t} />
                                    </div>
                                </td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className="screen-only">
                                        <ReportHeader
                                            title="IMPACT ASSESSMENT REPORT"
                                            metaData={editableMetaData}
                                            dateStr={dateStr}
                                            timeStr={timeStr}
                                            onPrint={handlePrint}
                                        />
                                    </div>

                                    <div className="screen-only">
                                        <ReportBreadcrumb
                                            state={editableMetaData.state}
                                            district={editableMetaData.district}
                                            block={editableMetaData.block}
                                            gp={editableMetaData.gpName}
                                            year={editableMetaData.year}
                                        />
                                    </div>



                                    <div className="wa-report-content">
                                        {/* Type Selector (Internal to UI, not in print) */}
                                        <div className="report-type-toggle no-print">
                                            <div className="report-toggle-buttons">
                                                <button className={reportType === 'industry' ? 'active' : ''} onClick={() => setReportType('industry')}>Industry</button>
                                                <button className={reportType === 'infrastructure' ? 'active' : ''} onClick={() => setReportType('infrastructure')}>Infrastructure</button>
                                                <button className={reportType === 'mining' ? 'active' : ''} onClick={() => setReportType('mining')}>Mining</button>
                                            </div>
                                            <button
                                                className={`btn-edit-report ${isEditing ? 'active' : ''}`}
                                                onClick={() => setIsEditing(!isEditing)}
                                            >
                                                {isEditing ? (
                                                    <>
                                                        <span style={{ fontSize: '1.2rem' }}>✓</span> Save Changes
                                                    </>
                                                ) : (
                                                    <>
                                                        <span style={{ fontSize: '1.2rem' }}>✎</span> Edit Report
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <main className="impact-full-report">
                                            <div className="impact-report-sections">
                                                <ChapterSalientFeatures
                                                    metaData={editableMetaData}
                                                    isEditing={isEditing}
                                                    onChange={handleMetaDataChange}
                                                />
                                                <ChapterAboutProject
                                                    metaData={editableMetaData}
                                                    gpId={gpId}
                                                    isPrint={isPrint}
                                                    projectCenter={projectCenter}
                                                    waterbodiesData={waterbodiesData}
                                                />
                                                <ChapterHydrogeology
                                                    gpId={gpId}
                                                    waterLevelData={waterLevelData}
                                                    waterQualityData={waterQualityData}
                                                    loading={loading}
                                                    isPrint={isPrint}
                                                    projectCenter={projectCenter}
                                                />
                                                <ChapterTubewells
                                                    entries={tubewellEntries}
                                                    isEditing={isEditing}
                                                    onChange={handleTubewellChange}
                                                    onAdd={handleAddTubewellRow}
                                                />

                                                {reportType === 'mining' && (
                                                    <>
                                                        <ChapterMiningPlan
                                                            data={miningData}
                                                            isEditing={isEditing}
                                                            onChange={handleMiningChange}
                                                            onAddRow={handleAddMiningRow}
                                                        />
                                                        <ChapterMiningManagement
                                                            data={miningData}
                                                            isEditing={isEditing}
                                                            onChange={handleMiningChange}
                                                        />
                                                    </>
                                                )}

                                                <ChapterImpactAssessment
                                                    reportType={reportType}
                                                    analysis={impactAnalysis}
                                                    isEditing={isEditing}
                                                    onAnalysisChange={handleAnalysisChange}
                                                />
                                                <AnalyticalCharts gpId={gpId} isPrint={isPrint} reportType={reportType} />
                                                <ChapterConclusion
                                                    analysis={impactAnalysis}
                                                    isEditing={isEditing}
                                                    onAnalysisChange={handleAnalysisChange}
                                                />
                                            </div>

                                            <div className="report-footer-note no-print">
                                                <p>This assessment is based on current GEC-2015 methodologies and proposed intervention efficiencies. Actual impacts may vary based on implementation precision and rainfall variability.</p>
                                            </div>
                                        </main>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td>
                                    <div className="print-layout-footer-spacer">
                                        <RepeatingFooter metaData={editableMetaData} />
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="wa-report-actions no-print">
                    <button className="btn-back" onClick={() => navigate('/supply-side-management', { state: persistedState })}>Back</button>
                    <button className="btn-next" onClick={() => navigate('/final-report', { state: persistedState })}>Go to Final Report</button>
                </div>
            </div>
        </div >
    );
};

export default ImpactAssessmentPage;
