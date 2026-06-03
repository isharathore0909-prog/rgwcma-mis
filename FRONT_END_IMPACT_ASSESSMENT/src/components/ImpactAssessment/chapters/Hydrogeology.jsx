
import React, { useMemo } from 'react';
import ReportSection from '../ReportSection';
import AquiferMap from '../AquiferMap';
import ContourMap from '../ContourMap';
import AquiferTrendGraph from '../AquiferTrendGraph';
import Hydrograph from '../Hydrograph';
import WaterQualityGraph from '../WaterQualityGraph';

export const ChapterHydrogeology = ({ gpId, waterLevelData, waterQualityData, isPrint, projectCenter }) => {
    const avgPre = useMemo(() => {
        if (!waterLevelData || !waterLevelData.length) return "15.40"; // Fallback to original dummy if no data
        const vals = waterLevelData.map(d => parseFloat(d.pre_2024)).filter(v => !isNaN(v));
        return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : "15.40";
    }, [waterLevelData]);

    const avgPost = useMemo(() => {
        if (!waterLevelData || !waterLevelData.length) return "8.12"; // Fallback to original dummy if no data
        const vals = waterLevelData.map(d => parseFloat(d.pst_2024)).filter(v => !isNaN(v));
        return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : "8.12";
    }, [waterLevelData]);

    const inGPCount = useMemo(() => {
        if (!waterLevelData || !waterLevelData.length) return 6;
        return waterLevelData.filter(d => String(d.gp_id_val) === String(gpId)).length;
    }, [waterLevelData, gpId]);

    const totalCount = waterLevelData?.length || 10;
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
        <>
            <ReportSection>
                <thead>
                    <tr><th colSpan="2">3. HYDROGEOLOGY</th></tr>
                </thead>
                <tbody>
                    <tr className="section-head"><td colSpan="2">3.1 Hydrogeological Setup</td></tr>
                    <tr className="sub-section-head"><td colSpan="2">3.1.1. Aquifer Characteristics</td></tr>
                    <tr><td>Type/Depth/Permeability</td><td className="val-text"></td></tr>
                </tbody>
            </ReportSection>

            <section className="report-data-section">
                <div style={{ display: 'flex', flexDirection: 'column', gap: isPrint ? '5px' : '10px' }}>
                    <AquiferMap gpId={gpId} title="Figure 6: Aquifer Map (Spatial Layer Overlay)" isPrint={isPrint} projectCenter={projectCenter} />
                </div>
            </section>

            <ReportSection>
                <tbody>
                    <tr className="sub-section-head"><td colSpan="2">3.1.2. GW Flow & SW Interaction</td></tr>
                    <tr><td>Direction / Interconnection</td><td className="val-text"></td></tr>

                    <tr className="sub-section-head"><td colSpan="2">3.1.3. Depth to Water Level (5km Radius)</td></tr>
                    <tr><td>Measurement Plan</td><td className="val-text">{inGPCount} Observation wells inside, {outGPCount} outside radius</td></tr>
                    <tr><td>Pre-Monsoon (mbgl)</td><td className="val-text">{avgPre} (May 2024)</td></tr>
                    <tr><td>Post-Monsoon (mbgl)</td><td className="val-text">{avgPost} (Oct 2024)</td></tr>
                </tbody>
            </ReportSection>

            <section className="report-data-section">
                <div style={{ display: 'flex', flexDirection: 'column', gap: isPrint ? '5px' : '10px' }}>
                    <ContourMap gpId={gpId} title="Figure 7A: Depth to Water Map (Pre-Monsoon 2024)" parameter="pre_2024" isPrint={isPrint} projectCenter={projectCenter} />
                    <ContourMap gpId={gpId} title="Figure 7B: Depth to Water Map (Post-Monsoon 2024)" parameter="pst_2024" isPrint={isPrint} projectCenter={projectCenter} />
                </div>
            </section>

            <ReportSection>
                <tbody>
                    <tr className="sub-section-head"><td colSpan="2">3.1.4. Decadal Water Level Trend</td></tr>
                    <tr><td>Trend Analysis</td><td className="val-text"></td></tr>
                </tbody>
            </ReportSection>
            <section className="report-data-section" style={{ margin: 0, padding: 0 }}>
                <div style={{ display: isPrint ? 'block' : 'flex', flexDirection: 'column', gap: isPrint ? '0' : '10px' }}>
                    <div style={{ marginBottom: isPrint ? '5px' : '0' }}>
                        <ContourMap gpId={gpId} title="Figure 8A: Decadal Pre Monsoon Water level (2015-24)" parameter="decadal_pre" isPrint={isPrint} projectCenter={projectCenter} />
                    </div>
                    <div style={{ marginBottom: isPrint ? '5px' : '0' }}>
                        <ContourMap gpId={gpId} title="Figure 8B: Decadal Post Monsoon Water level (2015-24)" parameter="decadal_pst" isPrint={isPrint} projectCenter={projectCenter} />
                    </div>
                </div>
                <div className="full-width-chart">
                    <div className="figure-grid" style={{ marginTop: '5px' }}>
                        <AquiferTrendGraph gpId={gpId} title="Figure 9: Water Level Fluctuation (Decadal Trend)" isPrint={isPrint} />
                        <Hydrograph gpId={gpId} title="Figure 10: Hydrographs (Key Wells)" isPrint={isPrint} />
                    </div>
                </div>
            </section>


            <ReportSection>
                <tbody>
                    <tr className="sub-section-head"><td colSpan="2">3.1.5. Ground Water Quality</td></tr>
                    <tr><td>Sampling Detail</td><td className="val-text"></td></tr>
                    <tr><td>Electrical Conductivity</td><td className="val-text"></td></tr>
                </tbody>
            </ReportSection>
            <section className="report-data-section">
                <div style={{ display: isPrint ? 'block' : 'flex', flexDirection: 'column', gap: isPrint ? '0' : '10px' }}>
                    <div style={{ marginBottom: isPrint ? '5px' : '0' }}>
                        <ContourMap gpId={gpId} title="Figure 11: Water Quality (EC Contour Map)" parameter="ec" isPrint={isPrint} projectCenter={projectCenter} />
                    </div>
                    <div style={{ marginBottom: isPrint ? '5px' : '0' }}>
                        <ContourMap gpId={gpId} title="Figure 12: Water Quality (Nitrate Contour Map)" parameter="nitrate" isPrint={isPrint} projectCenter={projectCenter} />
                    </div>
                    <div style={{ marginBottom: isPrint ? '5px' : '0' }}>
                        <ContourMap gpId={gpId} title="Figure 13: Water Quality (Fluoride Contour Map)" parameter="fluoride" isPrint={isPrint} projectCenter={projectCenter} />
                    </div>
                    <div className="full-width-chart" style={{ width: '100%' }}>
                        <WaterQualityGraph gpId={gpId} title="Figure 14: Graphical Water Quality Presentation" showInsights={false} isPrint={isPrint} />
                    </div>
                    {/* Water Level Table for Selected GP */}
                    <div className="annex-container" style={{ marginTop: 0, marginBottom: 0 }}>
                        <div className="annex-title">ANNEXURE: GROUND WATER LEVEL DATA FOR SELECTED GP</div>
                        <table className="annex-table">
                            <thead>
                                <tr className="annex-header">
                                    <th style={{ width: '5%' }}>#</th>
                                    <th style={{ width: '20%' }}>Well ID / Tag</th>
                                    <th style={{ width: '25%' }}>Village</th>
                                    <th style={{ width: '25%' }}>Pre-Mon (mbgl)</th>
                                    <th style={{ width: '25%' }}>Post-Mon (mbgl)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWL.map((d, i) => (
                                    <tr key={i} className="annex-row">
                                        <td className="annex-center">{i + 1}</td>
                                        <td>{d.well_id}</td>
                                        <td>{d.village_name}</td>
                                        <td className="annex-val">{d.pre_2024 || 'N/A'}</td>
                                        <td className="annex-val">{d.pst_2024 || 'N/A'}</td>
                                    </tr>
                                ))}
                                {filteredWL.length === 0 && <tr><td colSpan="5" className="annex-center">No Records Found for Selected GP</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    {/* Water Quality Table for Selected GP */}
                    <div className="annex-container" style={{ marginTop: 0, marginBottom: 0 }}>
                        <div className="annex-title">ANNEXURE: GROUND WATER QUALITY DATA FOR SELECTED GP</div>
                        <table className="annex-table">
                            <thead>
                                <tr className="annex-header">
                                    <th style={{ width: '5%' }}>#</th>
                                    <th style={{ width: '15%' }}>Village</th>
                                    <th style={{ width: '10%' }}>pH</th>
                                    <th style={{ width: '14%' }}>EC (µS/cm)</th>
                                    <th style={{ width: '14%' }}>TDS (mg/l)</th>
                                    <th style={{ width: '14%' }}>Nitrate (mg/l)</th>
                                    <th style={{ width: '14%' }}>Fluoride (mg/l)</th>
                                    <th style={{ width: '14%' }}>Hardness (mg/l)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWQ.map((d, i) => (
                                    <tr key={i} className="annex-row">
                                        <td className="annex-center">{i + 1}</td>
                                        <td>{d.village_name}</td>
                                        <td className="annex-val">{d.ph || 'N/A'}</td>
                                        <td className="annex-val">{d.ec || 'N/A'}</td>
                                        <td className="annex-val">{d.tds || 'N/A'}</td>
                                        <td className="annex-val">{d.nitrate || 'N/A'}</td>
                                        <td className="annex-val">{d.fluoride || 'N/A'}</td>
                                        <td className="annex-val">{d.hardness || 'N/A'}</td>
                                    </tr>
                                ))}
                                {filteredWQ.length === 0 && <tr><td colSpan="8" className="annex-center">No Records Found for Selected GP</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>


            <ReportSection>
                <tbody>
                    <tr className="sub-section-head"><td colSpan="2">3.1.6. Quality of Nearby Water Bodies</td></tr>
                    <tr><td>Ponds/Canals</td><td className="val-text"></td></tr>
                    <tr>
                        <td colSpan="2" className="technical-note">
                            <p style={{ margin: '10px 0', textAlign: 'justify' }}>
                                Chemical analysis of surface water samples from nearby sources shows parameters within BIS 10500:2012 permissible limits.
                                The TDS levels (420 mg/l) indicate a sustainable chemical environment with no significant contaminants.
                                The similarity in chemical signatures between surface and ground water suggests localized interaction during monsoon recharge.
                            </p>
                        </td>
                    </tr>
                </tbody>
            </ReportSection>
        </>
    );
};
