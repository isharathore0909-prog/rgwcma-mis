import React, { useMemo } from 'react';
import Figure from './Figure';
import ChapterSection from './ChapterSection';
import ContourMap from '../ImpactAssessment/ContourMap';
import AquiferTrendGraph from '../ImpactAssessment/AquiferTrendGraph';
import WellLocationMap from '../ImpactAssessment/WellLocationMap';
import WaterQualityGraph from '../ImpactAssessment/WaterQualityGraph';
import LULCMap from '../ImpactAssessment/LULCMap';
import DEMMap from '../ImpactAssessment/DEMMap';
import GeomorphologyMap from '../ImpactAssessment/GeomorphologyMap';
import AquiferMap from '../ImpactAssessment/AquiferMap';
import Hydrograph from '../ImpactAssessment/Hydrograph';
import DrainageMap from '../ImpactAssessment/DrainageMap';
import DEMContourMap from '../ImpactAssessment/DEMContourMap';

export const ChapterGPInfo = ({ metaData, isPrint }) => (
    <ChapterSection title="Gram Panchayat Information" hasSpacer={false} colSpan={4}>
        <tbody className="gp-info-body">
            <tr>
                <td className="label-blue">State:</td><td className="val-text-left">{metaData.state}</td>
                <td className="label-blue">District:</td><td className="val-text-left">{metaData.district}</td>
            </tr>
            <tr>
                <td className="label-blue">Block / Taluk :</td><td className="val-text-left">{metaData.block}</td>
                <td className="label-blue">GP Name :</td><td className="val-text-left">{metaData.gpName}</td>
            </tr>
            <tr>
                <td className="label-blue">GP ID :</td><td className="val-text-left">{metaData.gpId || ''}</td>
                <td className="label-blue">Block Area (Ha) :</td><td className="val-text-left">{metaData.blockArea || ''}</td>
            </tr>
            <tr>
                <td className="label-blue">GP area (Ha) :</td><td className="val-text-left">{metaData.gpArea || ''}</td>
                <td className="label-blue">Watershed Code :</td><td className="val-text-left">{metaData.watershedCode || ''}</td>
            </tr>
            <tr>
                <td className="label-blue">Watershed name :</td><td className="val-text-left">{metaData.watershedName || ''}</td>
                <td className="label-blue">Watershed area in Block / Taluk (Ha) :</td><td className="val-text-left">{metaData.watershedBlockArea || ''}</td>
            </tr>
            <tr>
                <td className="label-blue">Sub-basin Code :</td><td className="val-text-left">{metaData.subBasinCode || ''}</td>
                <td className="label-blue">Sub basin name :</td><td className="val-text-left">{metaData.subBasinName || ''}</td>
            </tr>
            <tr>
                <td className="label-blue">Basin Code :</td><td className="val-text-left">{metaData.basinCode || ''}</td>
                <td className="label-blue">Basin Name :</td><td className="val-text-left">{metaData.basinName || ''}</td>
            </tr>
        </tbody>
    </ChapterSection>
);

export const ChapterSalientFeatures = ({ metaData, isPrint }) => (
    <ChapterSection title="1. SALIENT FEATURES OF THE PROPOSAL" hasSpacer={false} colSpan={3}>
        <tbody>
            <tr><td>1.1</td><td>Application No.</td><td className="val-text">{metaData.accreditationNo}</td></tr>
            <tr><td>1.2</td><td>Accredited by</td><td className="val-text"></td></tr>
            <tr><td>1.3</td><td>Date of Accreditation</td><td className="val-text">{metaData.accDate || '-'}</td></tr>
            <tr><td>1.4</td><td>Validity upto</td><td className="val-text">{metaData.accValidity || '-'}</td></tr>
            <tr><td>1.5</td><td>Work Order Date</td><td className="val-text">{metaData.workOrderDate || '-'}</td></tr>
            <tr><td>1.6</td><td>New/ Existing Project</td><td className="val-text">{metaData.projectType || '-'}</td></tr>
            <tr><td>1.7</td><td>CTE issued date</td><td className="val-text">{metaData.cteDate || '-'}</td></tr>
            <tr><td>1.8</td><td>Alluvium/ Non-alluvium</td><td className="val-text">{metaData.formationType || '-'}</td></tr>
            <tr><td>1.9</td><td>Block Name & Category (GWRA)</td><td className="val-text">{metaData.block || '-'}</td></tr>
            <tr><td>1.10</td><td>Ground water requirement</td><td className="val-text">{metaData.gwRequirement || '-'}</td></tr>
            <tr><td>1.11</td><td>Ground water Modelling Required (Yes/No)</td><td className="val-text">{metaData.modellingRequired || '-'}</td></tr>
            <tr><td>1.12</td><td>Jointly Prepared By</td><td className="val-text">{metaData.preparedBy || '-'}</td></tr>
            <tr><td>1.13</td><td>Prepared On</td><td className="val-text">{new Date().toLocaleDateString()}</td></tr>
        </tbody>
    </ChapterSection>
);

export const ChapterAboutProject = ({ gpId, metaData, isPrint }) => (
    <section className="report-data-section">
        <table className="report-data-table">
            <thead>
                <tr><th colSpan="2">2. ABOUT THE PROJECT</th></tr>
            </thead>
            <tbody>
                <tr><td>General Location</td><td className="val-text">Tehsil: {metaData.block}, District: {metaData.district}, State: Rajasthan</td></tr>
            </tbody>
        </table>
        <WellLocationMap gpId={gpId} title="Figure 1: Project Location & Observation Network" isPrint={isPrint} metaData={metaData} isFinalReport={true} />



        <table className="report-data-table">
            <tbody>
                <tr className="section-head"><td colSpan="2">2.1 LANDUSE / LAND COVER OF THE SURROUNDING AREA</td></tr>
            </tbody>
        </table>
        <LULCMap gpId={gpId} title="Figure 2: Land use / Land cover Map" isPrint={isPrint} />



        <table className="report-data-table">
            <tbody>
                <tr className="section-head"><td colSpan="2">2.2 DEM / TOPOGRAPHY</td></tr>
                <tr><td>Core & Buffer Analysis</td><td className="val-text">DEM and Contour maps within representative area.</td></tr>
            </tbody>
        </table>
        <DEMMap gpId={gpId} title="Figure 3: Digital Elevation Model (DEM) Map" isPrint={isPrint} />
        <div style={{ marginTop: '20px' }}>
            <DEMContourMap gpId={gpId} title="Figure 3A: Elevation Contour Map (10m Interval)" isPrint={isPrint} />
        </div>



        <table className="report-data-table">
            <tbody>
                <tr className="section-head"><td colSpan="2">2.3 GEOMORPHOLOGY AND DRAINAGE</td></tr>
                <tr><td>Regional Pattern</td><td className="val-text">Drainage patterns supported by Geomorphology maps.</td></tr>
            </tbody>
        </table>
        <GeomorphologyMap gpId={gpId} title="Figure 4: Geomorphological Map" isPrint={isPrint} />
        <DrainageMap gpId={gpId} title="Figure 5: Drainage Map" isPrint={isPrint} />

    </section>
);

export const ChapterHydrogeology = ({ gpId, waterLevelData, waterQualityData, aquiferTrendData, isPrint }) => {
    const avgPre = useMemo(() => {
        if (!waterLevelData || !waterLevelData.length) return "15.40";
        const vals = waterLevelData.map(d => parseFloat(d.pre_2024)).filter(v => !isNaN(v));
        return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : "15.40";
    }, [waterLevelData]);

    const avgPost = useMemo(() => {
        if (!waterLevelData || !waterLevelData.length) return "8.12";
        const vals = waterLevelData.map(d => parseFloat(d.pst_2024)).filter(v => !isNaN(v));
        return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : "8.12";
    }, [waterLevelData]);

    const inGPCount = useMemo(() => {
        if (!waterLevelData || !waterLevelData.length) return 0;
        return waterLevelData.filter(d => String(d.gp_id_val) === String(gpId)).length;
    }, [waterLevelData, gpId]);

    const totalCount = waterLevelData?.length || 0;
    const outGPCount = totalCount - inGPCount;

    const filteredWL = useMemo(() => {
        if (!waterLevelData || !waterLevelData.length) return [];
        return waterLevelData.filter(d => String(d.gp_id_val) === String(gpId));
    }, [waterLevelData, gpId]);

    const filteredWQ = useMemo(() => {
        if (!waterQualityData || !waterQualityData.length) return [];
        return waterQualityData.filter(d => String(d.gp_id_val) === String(gpId));
    }, [waterQualityData, gpId]);

    return (
        <section className="report-data-section">
            <table className="report-data-table">
                <thead>
                    <tr><th colSpan="2">3. HYDROGEOLOGY</th></tr>
                </thead>
                <tbody>
                    <tr className="sub-section-head"><td colSpan="2">3.1 GEOLOGICAL SETUP</td></tr>
                    <tr><td>Regional/Local Geology</td><td className="val-text">Based on GSI and Field Investigation within representative area.</td></tr>
                </tbody>
            </table>



            <table className="report-data-table">
                <tbody>
                    <tr className="sub-section-head"><td colSpan="2">3.2 GEOPHYSICAL STUDIES</td></tr>
                    <tr><td>Investigations</td><td className="val-text">Studies carried out at selected locations.</td></tr>
                </tbody>
            </table>



            <table className="report-data-table">
                <tbody>
                    <tr className="section-head"><td colSpan="2">3.3 HYDROGEOLOGICAL SETUP</td></tr>
                    <tr className="sub-section-head"><td colSpan="2">3.3.1. Aquifer characteristics</td></tr>
                    <tr><td>Parameters</td><td className="val-text">Depth, Thickness, Porosity, Permeability, Storativity details furnished.</td></tr>
                </tbody>
            </table>
            <AquiferMap gpId={gpId} title="Figure 6: Hydrogeological Map (Aquifer Units)" isPrint={isPrint} />



            <table className="report-data-table">
                <tbody>
                    <tr className="sub-section-head"><td colSpan="2">3.3.2 Depth to water level</td></tr>
                    <tr><td>Observation Plan</td><td className="val-text">{inGPCount} wells inside GP area, {outGPCount} in surrounding blocks.</td></tr>
                    <tr><td>Pre-Monsoon (mbgl)</td><td className="val-text">{avgPre} (May 2024)</td></tr>
                    <tr><td>Post-Monsoon (mbgl)</td><td className="val-text">{avgPost} (Oct 2024)</td></tr>
                </tbody>
            </table>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ContourMap gpId={gpId} title="Figure 7A: Decadal Pre Monsoon Water level (2015-24)" parameter="decadal_pre" isPrint={isPrint} />
                <ContourMap gpId={gpId} title="Figure 7B: Decadal Post Monsoon Water level (2015-24)" parameter="decadal_pst" isPrint={isPrint} />
                <ContourMap gpId={gpId} title="Figure 8A: Depth to Water Map (Pre-Monsoon 2024)" parameter="pre_2024" isPrint={isPrint} />
                <ContourMap gpId={gpId} title="Figure 8B: Depth to Water Map (Post-Monsoon 2024)" parameter="pst_2024" isPrint={isPrint} />
            </div>



            <table className="report-data-table">
                <tbody>
                    <tr className="sub-section-head"><td colSpan="2">3.3.3 Long term water level data analysis</td></tr>
                    <tr><td>Decadal Trend</td><td className="val-text">Decadal trend analysis based on State/CGWB data in the region.</td></tr>
                </tbody>
            </table>
            <div className="side-by-side-row">
                <div className="side-by-side-item">
                    <AquiferTrendGraph gpId={gpId} data={aquiferTrendData} title="Figure 9: Water Level Fluctuation (Decadal Trend)" isPrint={isPrint} />
                </div>
                <div className="side-by-side-item">
                    <Hydrograph gpId={gpId} data={aquiferTrendData} title="Figure 10: Hydrograph (WL vs Rainfall)" isPrint={isPrint} />
                </div>
            </div>



            <table className="report-data-table">
                <tbody>
                    <tr className="sub-section-head"><td colSpan="2">3.3.4 Ground water quality</td></tr>
                    <tr><td>Sampling Protocol</td><td className="val-text">Samples from representative locations, analyzed in NABL lab.</td></tr>
                </tbody>
            </table>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ContourMap gpId={gpId} title="Figure 11: Water Quality (EC Contour Map)" parameter="ec" isPrint={isPrint} />
                <ContourMap gpId={gpId} title="Figure 12: Water Quality (Nitrate Contour Map)" parameter="nitrate" isPrint={isPrint} />
                <ContourMap gpId={gpId} title="Figure 13: Water Quality (Fluoride Contour Map)" parameter="fluoride" isPrint={isPrint} />
                <div className="full-width-chart" style={{ width: '100%' }}>
                    <WaterQualityGraph gpId={gpId} data={waterQualityData} title="Figure 14: Graphical Water Quality Presentation" showInsights={false} isPrint={isPrint} />
                </div>



                {/* Water Level Table for Selected GP */}
                <div className="annex-container">
                    <div className="annex-title">ANNEXURE: GROUND WATER LEVEL DATA FOR SELECTED GP</div>
                    <table className="annex-table">
                        <thead>
                            <tr className="annex-header">
                                <th style={{ width: '40px' }}>#</th>
                                <th style={{ width: '180px' }}>Well ID / Tag</th>
                                <th>Village</th>
                                <th style={{ width: '100px' }}>Pre-Mon (mbgl)</th>
                                <th style={{ width: '100px' }}>Post-Mon (mbgl)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWL.map((d, i) => (
                                <tr key={i} className="annex-row">
                                    <td className="annex-center">{i + 1}</td>
                                    <td>{d.well_id}</td>
                                    <td>{d.village_name}</td>
                                    <td className="annex-val">{d.pre_2024 || '-'}</td>
                                    <td className="annex-val">{d.pst_2024 || '-'}</td>
                                </tr>
                            ))}
                            {filteredWL.length === 0 && <tr><td colSpan="5" className="annex-center">No Records Found for Selected GP</td></tr>}
                        </tbody>
                    </table>
                </div>



                {/* Water Quality Table for Selected GP */}
                <div className="annex-container">
                    <div className="annex-title">ANNEXURE: GROUND WATER QUALITY DATA FOR SELECTED GP</div>
                    <table className="annex-table">
                        <thead>
                            <tr className="annex-header">
                                <th style={{ width: '40px' }}>#</th>
                                <th style={{ width: '150px' }}>Village</th>
                                <th>pH</th>
                                <th>EC (µS/cm)</th>
                                <th>TDS (mg/l)</th>
                                <th>Nitrate (mg/l)</th>
                                <th>Fluoride (mg/l)</th>
                                <th>Hardness (mg/l)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWQ.map((d, i) => (
                                <tr key={i} className="annex-row">
                                    <td className="annex-center">{i + 1}</td>
                                    <td>{d.village_name}</td>
                                    <td className="annex-val">{d.ph || '-'}</td>
                                    <td className="annex-val">{d.ec || '-'}</td>
                                    <td className="annex-val">{d.tds || '-'}</td>
                                    <td className="annex-val">{d.nitrate || '-'}</td>
                                    <td className="annex-val">{d.fluoride || '-'}</td>
                                    <td className="annex-val">{d.hardness || '-'}</td>
                                </tr>
                            ))}
                            {filteredWQ.length === 0 && <tr><td colSpan="8" className="annex-center">No Records Found for Selected GP</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

        </section>
    );
};

import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

export const ChapterEstimation = ({ gpAquiferData, isPrint }) => {
    if (!gpAquiferData || !gpAquiferData.water_budget) return null;
    const { availability, utilization, balance, budget, demand_side, supply_side } = gpAquiferData.water_budget;

    // Chart Data Preparation
    const utilizationData = [
        { name: 'Agriculture', value: parseFloat(utilization?.agriculture || 0) },
        { name: 'Domestic', value: parseFloat(utilization?.domestic || 0) },
        { name: 'Industrial', value: parseFloat(utilization?.industrial || 0) },
    ].filter(d => d.value > 0);

    const balanceData = [
        { name: 'Net Availability', value: parseFloat(balance?.net_availability || 0) },
        { name: 'Gross Draft', value: parseFloat(balance?.gross_draft || 0) },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    return (
        <section className="report-data-section">


            {/* GRAPHS SECTION */}
            <div className="annex-container">
                <div className="annex-title">GRAPHICAL REPRESENTATION OF WATER BUDGET</div>
                <div className="water-budget-graphs" style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '0',
                    marginTop: '10px',
                    height: 'auto'
                }}>
                    {/* Graph 1: Utilization Pie */}
                    <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px', width: '100%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h4 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#1e3a8a', fontSize: '1rem', fontWeight: 'bold' }}>Figure 15: Sector-wise GW Utilization</h4>

                        {/* Screen Version */}
                        <div className="screen-only" style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={utilizationData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={50}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {utilizationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Print Version */}
                        <div className="print-only">
                            <PieChart width={650} height={350}>
                                <Pie
                                    data={utilizationData}
                                    cx={325}
                                    cy={150}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                                    isAnimationActive={false}
                                >
                                    {utilizationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </div>
                    </div>

                    {/* Graph 2: Balance Bar */}
                    <div style={{ flex: 1, border: '1px solid #ddd', padding: '15px', width: '100%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h4 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#1e3a8a', fontSize: '1rem', fontWeight: 'bold' }}>Figure 16: Availability vs Draft</h4>

                        {/* Screen Version */}
                        <div className="screen-only" style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={balanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <RechartsTooltip />
                                    <Bar dataKey="value" barSize={40}>
                                        {balanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#4caf50' : '#f44336'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Print Version */}
                        <div className="print-only">
                            <BarChart width={650} height={350} data={balanceData} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold', fill: '#000' }} />
                                <YAxis tick={{ fontSize: 12, fontWeight: 'bold', fill: '#000' }} />
                                <Bar dataKey="value" barSize={60} isAnimationActive={false}>
                                    {balanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#4caf50' : '#f44336'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </div>
                    </div>
                </div>
            </div>

            {/* 1. WATER AVAILABILITY */}
            <div className="annex-container">
                <div className="annex-title">TABLE 1: GROUND WATER AVAILABILITY (RESOURCES)</div>
                <table className="annex-table">
                    <thead>
                        <tr className="annex-header">
                            <th>Component</th>
                            <th style={{ width: '150px' }}>Value (Ha-m)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="annex-row">
                            <td>Rainfall Recharge (Monsoon)</td>
                            <td className="annex-val">{availability?.rainfall_recharge?.toFixed(2) || '-'}</td>
                        </tr>
                        <tr className="annex-row">
                            <td>Recharge from Other Sources</td>
                            <td className="annex-val">{availability?.other_recharge?.toFixed(2) || '-'}</td>
                        </tr>
                        <tr className="annex-row">
                            <td><strong>Total Annual Ground Water Availability</strong></td>
                            <td className="annex-val"><strong>{availability?.total_availability?.toFixed(2) || '-'}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 2. WATER UTILISATION */}
            <div className="annex-container">
                <div className="annex-title">TABLE 2: GROUND WATER UTILISATION (GROSS DRAFT)</div>
                <table className="annex-table">
                    <thead>
                        <tr className="annex-header">
                            <th>Sector</th>
                            <th style={{ width: '150px' }}>Value (Ha-m)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="annex-row">
                            <td>Agriculture (Irrigation)</td>
                            <td className="annex-val">{utilization?.agriculture?.toFixed(2) || '-'}</td>
                        </tr>
                        <tr className="annex-row">
                            <td>Domestic & Drinking</td>
                            <td className="annex-val">{utilization?.domestic?.toFixed(2) || '-'}</td>
                        </tr>
                        <tr className="annex-row">
                            <td>Industrial</td>
                            <td className="annex-val">{utilization?.industrial?.toFixed(2) || '-'}</td>
                        </tr>
                        <tr className="annex-row">
                            <td><strong>Total Gross Ground Water Draft</strong></td>
                            <td className="annex-val"><strong>{utilization?.total_draft?.toFixed(2) || '-'}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 3. WATER BALANCE */}
            <div className="annex-container">
                <div className="annex-title">TABLE 3: GROUND WATER BALANCE</div>
                <table className="annex-table">
                    <thead>
                        <tr className="annex-header">
                            <th>Description</th>
                            <th style={{ width: '150px' }}>Value (Ha-m)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="annex-row">
                            <td>Net Ground Water Availability</td>
                            <td className="annex-val">{balance?.net_availability?.toFixed(2) || '-'}</td>
                        </tr>
                        <tr className="annex-row">
                            <td>Gross Ground Water Draft</td>
                            <td className="annex-val">{balance?.gross_draft?.toFixed(2) || '-'}</td>
                        </tr>
                        <tr className="annex-row">
                            <td><strong>Ground Water Gap / Balance</strong></td>
                            <td className="annex-val" style={{ color: (balance?.gap_mcm < 0) ? 'red' : 'green' }}>
                                <strong>{balance?.gap_mcm?.toFixed(2) || '-'}</strong>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 4. WATER BUDGET */}
            <div className="annex-container">
                <div className="annex-title">TABLE 4: GROUND WATER BUDGET & CATEGORIZATION</div>
                <table className="annex-table">
                    <thead>
                        <tr className="annex-header">
                            <th>Parameter</th>
                            <th style={{ width: '200px' }}>Status / Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="annex-row">
                            <td>Stage of Ground Water Extraction</td>
                            <td className="annex-val">{budget?.stage_of_extraction?.toFixed(2)} %</td>
                        </tr>
                        <tr className="annex-row">
                            <td><strong>Categorization (GWRA 2020)</strong></td>
                            <td className="annex-val" style={{ fontWeight: '800' }}>{budget?.category || 'NA'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 5. DEMAND SIDE */}
            <div className="annex-container">
                <div className="annex-title">TABLE 5: DEMAND SIDE MANAGEMENT (EXISTING & PROJECTED)</div>
                <table className="annex-table">
                    <thead>
                        <tr className="annex-header">
                            <th>Period</th>
                            <th>Description</th>
                            <th style={{ width: '150px' }}>Demand (Ha-m)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="annex-row">
                            <td>Present</td>
                            <td>Existing Water Demand (All Sectors)</td>
                            <td className="annex-val">{demand_side?.current_demand?.toFixed(2) || '-'}</td>
                        </tr>
                        <tr className="annex-row">
                            <td>Projected (2025)</td>
                            <td>Estimated Future Demand</td>
                            <td className="annex-val">{demand_side?.projected_2025?.toFixed(2) || '-'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* 6. SUPPLY SIDE */}
            <div className="annex-container">
                <div className="annex-title">TABLE 6: SUPPLY SIDE INTERVENTIONS (PROPOSED)</div>
                <table className="annex-table">
                    <thead>
                        <tr className="annex-header">
                            <th>Intervention Measure</th>
                            <th style={{ width: '150px' }}>Quantity / Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="annex-row">
                            <td>Proposed Artificial Recharge Structures</td>
                            <td className="annex-val">{supply_side?.proposed_structures || 0} Nos.</td>
                        </tr>
                        <tr className="annex-row">
                            <td>Expected Additional Recharge</td>
                            <td className="annex-val">{supply_side?.expected_recharge?.toFixed(2) || 0} Ha-m</td>
                        </tr>
                    </tbody>
                </table>
            </div>


        </section>
    );
};

export const ChapterManagement = ({ isPrint }) => null;

export const ChapterConclusion = ({ isPrint }) => (
    <>
        <section className="report-data-section">
            <table className="report-data-table">
                <tbody>
                    <tr className="section-head"><td>8. ANY OTHER DETAILS PERTAINING TO THE PROJECT</td></tr>
                    <tr><td className="val-text">-</td></tr>
                    <tr className="section-head"><td>9. SUMMARY AND CONCLUSION</td></tr>
                    <tr><td className="val-text">Likely impact and mitigation measures discussed in relevant sections.</td></tr>
                    <tr className="section-head"><td>10. ACCREDITATION CERTIFICATE</td></tr>
                    <tr><td className="val-text">Copy of Accreditation Certificate attached in Annexure.</td></tr>
                </tbody>
            </table>
        </section>

    </>
);
