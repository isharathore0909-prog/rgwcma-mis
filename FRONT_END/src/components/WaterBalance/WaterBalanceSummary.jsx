import React from 'react';
import './WaterBalanceSummary.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const WaterBalanceSummary = ({ data, onBack, onNext }) => {
    // Current date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB'); // dd/mm/yyyy
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const metadata = {
        state: "Rajasthan_8",
        district: "Ajmer_88",
        block: "Ajmer Rural_7382",
        gpName: "Aradka_33827",
        year: "2023-24",
        userName: "SPMU_Rajasthan_8_nodal.atal@rajasthan.gov.in"
    };

    // Destructure data with defaults
    const availability = data?.availability || { gw: 0, sw: 0 };
    const utilization = data?.utilization || { gw: 0, sw: 0 };
    const balance = data?.balance || { gw: 0, sw: 0 };

    // Derived totals
    const availSw = parseFloat(availability.sw || 0);
    const availGw = parseFloat(availability.gw || 0);
    const availTotal = availSw + availGw;

    const utilSw = parseFloat(utilization.sw || 0);
    const utilGw = parseFloat(utilization.gw || 0);
    const utilTotal = utilSw + utilGw;

    const balSw = parseFloat(balance.swBalance || balance.sw || 0);
    const balGw = parseFloat(balance.gwBalance || balance.gw || 0);
    const balTotal = parseFloat(balance.totalBalance || (balSw + balGw));

    // Prepare chart data
    const chartData = [
        {
            name: 'Availability',
            value: availTotal,
            color: '#82ca9d' // Light green - or use gradient in CSS if custom bars
        },
        {
            name: 'Utilization',
            value: utilTotal,
            color: '#ef4444' // Redish
        },
        {
            name: 'Balance',
            value: balTotal,
            color: '#3b82f6' // Blue
        }
    ];

    return (
        <div className="wb-report-paper-wrapper">
            <div className="wb-printable-report">
                <header className="wb-report-header">
                    <div className="report-branding-print">
                        <img src="/logos/logo-black.png" alt="Logo" className="print-logo" />
                        <div className="branding-text">
                            <span className="authority-name">Rajasthan Groundwater (Conservation & Management) Authority</span>
                            <span className="govt-label">GOVERNMENT OF RAJASTHAN</span>
                        </div>
                        <img src="/logos/india-emblem.png" alt="Emblem" className="print-emblem" />
                    </div>
                    <div className="title-area">
                        <h1>Water Balance Report</h1>
                        <button className="wb-btn-download no-print" onClick={() => window.print()}>Print / Download PDF</button>
                    </div>
                    <div className="wb-meta-info">
                        <span>Date : {dateStr}</span>
                        <span>Time : {timeStr}</span>
                        <span>User Name : {metadata.userName}</span>
                    </div>
                </header>

                <nav className="wb-report-breadcrumb">
                    <span>State: {metadata.state} »</span>
                    <span>District: {metadata.district} »</span>
                    <span>Block: {metadata.block} »</span>
                    <span>Gram Panchayat: {metadata.gpName} »</span>
                    <span>Year: {metadata.year}</span>
                </nav>

                <div className="wb-report-content">
                    {/* Left Table Section */}
                    <div className="wb-report-table-section">
                        <table className="wb-report-table">
                            <thead>
                                <tr>
                                    <th colSpan="3">Water Balance Summary</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Section A: Water Availability */}
                                <tr className="wb-section-header">
                                    <td className="wb-section-label">A</td>
                                    <td colSpan="2">Water Availability (ha m)</td>
                                </tr>
                                <tr>
                                    <td rowSpan="3"></td>
                                    <td className="wb-row-label">i) Total Ground Water Available</td>
                                    <td><span className="wb-val">{availGw.toFixed(2)}</span></td>
                                </tr>
                                <tr>
                                    <td className="wb-row-label">ii) Total Surface Water Available</td>
                                    <td><span className="wb-val">{availSw.toFixed(2)}</span></td>
                                </tr>
                                <tr className="wb-total-row">
                                    <td className="wb-row-label">Total Water Availability (ha m)</td>
                                    <td><span className="wb-val">{availTotal.toFixed(2)}</span></td>
                                </tr>

                                {/* Section B: Water Utilization */}
                                <tr className="wb-section-header">
                                    <td className="wb-section-label">B</td>
                                    <td colSpan="2">Water Utilization (ha m)</td>
                                </tr>
                                <tr>
                                    <td rowSpan="3"></td>
                                    <td className="wb-row-label">i) Total Surface Water Utilization</td>
                                    <td><span className="wb-val">{utilSw.toFixed(2)}</span></td>
                                </tr>
                                <tr>
                                    <td className="wb-row-label">ii) Total Ground Water Utilization</td>
                                    <td><span className="wb-val">{utilGw.toFixed(2)}</span></td>
                                </tr>
                                <tr className="wb-total-row">
                                    <td className="wb-row-label">Total Water Utilization</td>
                                    <td><span className="wb-val">{utilTotal.toFixed(2)}</span></td>
                                </tr>

                                { /* Section C: Balance */}
                                <tr className="wb-section-header">
                                    <td className="wb-section-label">C</td>
                                    <td colSpan="2">Balance [Surplus (+) / Deficit (-)]</td>
                                </tr>
                                <tr>
                                    <td rowSpan="3"></td>
                                    <td className="wb-row-label">i) Total Ground Water Balance</td>
                                    <td>
                                        <span className={`status-tag ${balGw >= 0 ? 'surplus' : 'deficit'}`}>
                                            {balGw >= 0 ? 'Surplus' : 'Deficit'}
                                        </span>
                                        <span className="wb-val">{balGw.toFixed(2)}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="wb-row-label">ii) Total Surface Water Balance</td>
                                    <td>
                                        <span className={`status-tag ${balSw >= 0 ? 'surplus' : 'deficit'}`}>
                                            {balSw >= 0 ? 'Surplus' : 'Deficit'}
                                        </span>
                                        <span className="wb-val">{balSw.toFixed(2)}</span>
                                    </td>
                                </tr>
                                <tr className="wb-total-row">
                                    <td className="wb-row-label">Total Water Balance</td>
                                    <td>
                                        <span className={`status-tag ${balTotal >= 0 ? 'surplus' : 'deficit'}`} style={{ fontSize: '0.8rem' }}>
                                            {balTotal >= 0 ? 'Surplus' : 'Deficit'}
                                        </span>
                                        <span className="wb-val">{balTotal.toFixed(2)}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Right Chart Section */}
                    <div className="wb-report-chart-section">
                        <div className="wb-chart-container">
                            <h3 className="wb-chart-title">Water Balance (ha m)</h3>
                            <div style={{ width: '100%', height: 350 }}>
                                {availTotal === 0 && utilTotal === 0 ? (
                                    <div className="wb-chart-placeholder">
                                        Chart visualization will appear here
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={350} minWidth={0} minHeight={0}>
                                        <BarChart
                                            data={chartData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fontSize: 12 }}
                                                interval={0}
                                                tickMargin={10}
                                                // Split long labels (simple approach)
                                                tickFormatter={(val) => {
                                                    if (val.includes('Availability')) return 'Total Avail.';
                                                    if (val.includes('Utilization')) return 'Total Util.';
                                                    if (val.includes('Balance')) return 'Total Bal.';
                                                    return val;
                                                }}
                                            />
                                            <YAxis axisLine={false} tickLine={false} label={{ value: 'Volume (ha m)', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip cursor={{ fill: 'transparent' }} />
                                            <Bar dataKey="value" barSize={60} radius={[4, 4, 0, 0]}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="wb-actions-row no-print">
                <button className="wb-btn wb-btn-back" onClick={onBack}>Back</button>
                <button className="wb-btn wb-btn-next" onClick={onNext}>Go to Water Budget</button>
            </div>
        </div>
    );
};

export default WaterBalanceSummary;
