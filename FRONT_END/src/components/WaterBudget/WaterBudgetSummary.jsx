import React from 'react';
import './WaterBudgetSummary.css';

const WaterBudgetSummary = ({ data, onBack, onNext }) => {
    // Current date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const metadata = {
        state: data.state || "Rajasthan_8",
        district: data.district || "Ajmer_88",
        block: data.block || "Ajmer Rural_7382",
        gpName: data.gpName || "Aradka_33827",
        year: "2023-24",
        userName: data.userName || "SPMU_Rajasthan_8_nodal.atal@rajasthan.gov.in"
    };

    // Calculate percentages for chart or indicators if needed
    const budgetStatus = data.netBudget >= 0 ? 'SURPLUS' : 'DEFICIT';

    return (
        <div className="wbg-report-paper-wrapper">
            <div className="wbg-printable-report">
                <header className="wbg-report-header">
                    <div className="report-branding-print">
                        <img src="/logos/logo-black.png" alt="Logo" className="print-logo" />
                        <div className="branding-text">
                            <span className="authority-name">Rajasthan Groundwater (Conservation & Management) Authority</span>
                            <span className="govt-label">GOVERNMENT OF RAJASTHAN</span>
                        </div>
                        <img src="/logos/india-emblem.png" alt="Emblem" className="print-emblem" />
                    </div>
                    <div className="title-area">
                        <h1>Water Budget Report</h1>
                        <button className="wbg-btn-download no-print" onClick={() => window.print()}>Print / Download PDF</button>
                    </div>
                    <div className="wbg-meta-info">
                        <span>Date : {dateStr}</span>
                        <span>Time : {timeStr}</span>
                        <span>User Name : {metadata.userName}</span>
                    </div>
                </header>

                <nav className="wbg-report-breadcrumb">
                    <span>State: {metadata.state} »</span>
                    <span>District: {metadata.district} »</span>
                    <span>Block: {metadata.block} »</span>
                    <span>Gram Panchayat: {metadata.gpName} »</span>
                    <span>Year: {metadata.year}</span>
                </nav>

                <div className="wbg-report-content">
                    {/* Left Table Section */}
                    <div className="wbg-report-table-section">
                        <table className="wbg-report-table">
                            <thead>
                                <tr>
                                    <th colSpan="3">Water Budget</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Section 1: Water Inflow */}
                                <tr className="wbg-section-head">
                                    <td style={{ width: '40px', textAlign: 'center' }}>1.</td>
                                    <td colSpan="2">Water Inflow (Annual) (ha m)</td>
                                </tr>
                                <tr>
                                    <td className="wbg-indent-1">a)</td>
                                    <td>Rainfall Inflow (Recharge)</td>
                                    <td className="wbg-val">{Number(data.rainfallInflow || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="wbg-indent-1">b)</td>
                                    <td>Ground Water Inflow (Other Recharge)</td>
                                    <td className="wbg-val">{Number(data.gwInflow || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="wbg-indent-1">c)</td>
                                    <td>Canal / Surface Inflow</td>
                                    <td className="wbg-val">{Number(data.canalInflow || 0).toFixed(2)}</td>
                                </tr>
                                <tr className="wbg-total-row">
                                    <td></td>
                                    <td className="font-bold">Total Annual Inflow</td>
                                    <td className="wbg-val font-bold">{Number(data.totalInflow || 0).toFixed(2)}</td>
                                </tr>

                                {/* Section 2: Water Outflow */}
                                <tr className="wbg-section-head">
                                    <td style={{ textAlign: 'center' }}>2.</td>
                                    <td colSpan="2">Water Outflow (Annual) (ha m)</td>
                                </tr>
                                <tr>
                                    <td className="wbg-indent-1">a)</td>
                                    <td>Irrigation Outflow</td>
                                    <td className="wbg-val">{Number(data.irrigationOutflow || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="wbg-indent-1">b)</td>
                                    <td>Domestic Outflow</td>
                                    <td className="wbg-val">{Number(data.domesticOutflow || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="wbg-indent-1">c)</td>
                                    <td>Industrial Outflow</td>
                                    <td className="wbg-val">{Number(data.industrialOutflow || 0).toFixed(2)}</td>
                                </tr>
                                <tr className="wbg-total-row">
                                    <td></td>
                                    <td className="font-bold">Total Annual Outflow</td>
                                    <td className="wbg-val font-bold">{Number(data.totalOutflow || 0).toFixed(2)}</td>
                                </tr>

                                {/* Section 3: Net Budget */}
                                <tr className="wbg-section-head" style={{ backgroundColor: data.netBudget >= 0 ? '#166534' : '#991b1b' }}>
                                    <td style={{ textAlign: 'center' }}>3.</td>
                                    <td colSpan="2">Annual Net Water Budget ({budgetStatus})</td>
                                </tr>
                                <tr style={{ backgroundColor: '#f0f9ff', fontWeight: '800' }}>
                                    <td></td>
                                    <td style={{ color: '#2563eb' }}>Net Surplus (+) / Deficit (-)</td>
                                    <td className="wbg-val" style={{ color: data.netBudget >= 0 ? '#166534' : '#dc2626', fontSize: '1.2rem' }}>
                                        {data.netBudget >= 0 ? '+' : ''}{Number(data.netBudget || 0).toFixed(2)}
                                    </td>
                                </tr>

                                {/* Section 4: GEC Assessment Summary */}
                                <tr className="wbg-section-head">
                                    <td style={{ textAlign: 'center' }}>4.</td>
                                    <td colSpan="2">GEC 2015 Dynamic Resource Summary</td>
                                </tr>
                                <tr>
                                    <td className="wbg-indent-1">i)</td>
                                    <td>Net Annual Ground Water Availability</td>
                                    <td className="wbg-val">{Number(data.netAnnualGwAvailability || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="wbg-indent-1">ii)</td>
                                    <td>Gross Ground Water Draft</td>
                                    <td className="wbg-val">{Number(data.grossGwDraft || 0).toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td className="wbg-indent-1">iii)</td>
                                    <td>Stage of Ground Water Extraction</td>
                                    <td className="wbg-val">{Number(data.stageOfExtraction || 0).toFixed(2)} %</td>
                                </tr>
                                <tr style={{ backgroundColor: '#f8fafc', borderTop: '2px solid #1e293b' }}>
                                    <td></td>
                                    <td style={{ fontWeight: '800' }}>Unit Categorization</td>
                                    <td className="wbg-val" style={{
                                        fontWeight: '800',
                                        color: data.category?.includes('SAFE') ? '#166534' :
                                            data.category?.includes('SEMI') ? '#92400e' : '#991b1b'
                                    }}>
                                        {data.category || 'N/A'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Right Chart Section */}
                    <div className="wbg-report-chart-section">
                        <h3 className="wbg-chart-title">Water Budget Component Analysis</h3>
                        <div className="wbg-chart-placeholder">
                            <div className="budget-summary-card">
                                <h4>Annual Inflow</h4>
                                <p className="text-xl font-bold">{Number(data.totalInflow || 0).toFixed(2)} ha m</p>
                            </div>
                            <div className="budget-summary-card">
                                <h4>Annual Outflow</h4>
                                <p className="text-xl font-bold">{Number(data.totalOutflow || 0).toFixed(2)} ha m</p>
                            </div>
                            <div className={`budget-summary-card ${data.netBudget >= 0 ? 'success' : 'danger'}`}>
                                <h4>Net Budget</h4>
                                <p className={`text-2xl font-black ${data.netBudget >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {data.netBudget >= 0 ? '+' : ''}{Number(data.netBudget || 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="wbg-report-actions no-print">
                <button className="btn-back" onClick={onBack}>Back</button>
                <button className="btn-next" onClick={onNext}>Go to Demand side</button>
            </div>
        </div >
    );
};

export default WaterBudgetSummary;
