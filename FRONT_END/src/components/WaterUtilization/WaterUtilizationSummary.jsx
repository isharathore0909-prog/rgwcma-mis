import React from 'react';
import './WaterUtilizationSummary.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WaterUtilizationSummary = ({ data, onBack, onGoToBalance }) => {
    // Current date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB'); // dd/mm/yyyy
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Calculate totals from data
    const drinkingTotal = React.useMemo(() => {
        const humanGW = data?.demandMetData?.human?.gwVol || 0;
        const humanSW = data?.demandMetData?.human?.swVol || 0;
        const livestockGW = data?.demandMetData?.livestock?.gwVol || 0;
        const livestockSW = data?.demandMetData?.livestock?.swVol || 0;
        return {
            sw: humanSW + livestockSW,
            gw: humanGW + livestockGW,
            total: humanSW + livestockSW + humanGW + livestockGW
        };
    }, [data?.demandMetData]);

    const irrigationTotal = React.useMemo(() => {
        const gwVol = data?.irrigationData?.gwVol || 0;
        const swVol = data?.irrigationData?.swVol || 0;
        return {
            sw: swVol,
            gw: gwVol,
            total: swVol + gwVol
        };
    }, [data?.irrigationData]);

    const industrialTotal = React.useMemo(() => {
        const entries = data?.industrialData?.entries || [];
        return entries.reduce((acc, entry) => ({
            sw: acc.sw + (entry.swVol || 0),
            gw: acc.gw + (entry.gwVol || 0),
            total: acc.total + (entry.totalDemand || 0)
        }), { sw: 0, gw: 0, total: 0 });
    }, [data?.industrialData]);

    const otherUsesTotal = React.useMemo(() => {
        const entries = data?.otherUsesData?.entries || [];
        return entries.reduce((acc, entry) => ({
            sw: acc.sw + (entry.swVol || 0),
            gw: acc.gw + (entry.gwVol || 0),
            total: acc.total + (entry.totalDemand || 0)
        }), { sw: 0, gw: 0, total: 0 });
    }, [data?.otherUsesData]);

    const abstractionTotal = React.useMemo(() => {
        const entries = data?.abstractionData?.entries || [];
        const details = entries.map(e => ({
            type: e.type,
            count: e.count,
            draft: e.annualDraft || 0
        }));
        const total = entries.reduce((acc, e) => acc + (e.annualDraft || 0), 0);
        return { details, total };
    }, [data?.abstractionData]);

    // Prepare chart data - Use higher precision for chart to avoid zeroing out small values
    const chartData = [
        {
            name: 'Drinking',
            GW: Number(drinkingTotal.gw.toFixed(6)),
            SW: Number(drinkingTotal.sw.toFixed(6)),
        },
        {
            name: 'Irrigation',
            GW: Number(irrigationTotal.gw.toFixed(6)),
            SW: Number(irrigationTotal.sw.toFixed(6)),
        },
        {
            name: 'Industrial',
            GW: Number(industrialTotal.gw.toFixed(6)),
            SW: Number(industrialTotal.sw.toFixed(6)),
        },
        {
            name: 'Other',
            GW: Number(otherUsesTotal.gw.toFixed(6)),
            SW: Number(otherUsesTotal.sw.toFixed(6)),
        }
    ];

    const hasData = chartData.some(d => d.GW > 0 || d.SW > 0);

    return (
        <div className="wa-report-paper-wrapper">
            <div className="wa-report-container printable-report">
                {/* Header Section */}
                <header className="wa-report-header">
                    <div className="report-branding-print">
                        <img src="/logos/logo-black.png" alt="Logo" className="print-logo" />
                        <div className="branding-text">
                            <span className="authority-name">Rajasthan Groundwater (Conservation & Management) Authority</span>
                            <span className="govt-label">GOVERNMENT OF RAJASTHAN</span>
                        </div>
                        <img src="/logos/india-emblem.png" alt="Emblem" className="print-emblem" />
                    </div>
                    <div className="title-area">
                        <h1>Water Utilization Report</h1>
                        <button className="btn-download no-print" onClick={() => window.print()}>Print / Download PDF</button>
                    </div>
                    <div className="meta-info">
                        <span>Date : {dateStr}</span>
                        <span>Time : {timeStr}</span>
                        <span>User Name : {data?.userName || "SPMU_Rajasthan_8_nodal.atal@rajasthan.gov.in"}</span>
                    </div>
                </header>

                {/* Breadcrumb Bar */}
                <nav className="wa-report-breadcrumb">
                    <span>State: RAJASTHAN_8 »</span>
                    <span>District: AJMER_86 »</span>
                    <span>Block: AJMER RURAL_7382 »</span>
                    <span>Gram Panchayat: ARADKA_33827 »</span>
                    <span>Year: 2023-24</span>
                </nav>

                {/* Main Content Grid */}
                <div className="wa-report-content">
                    {/* Left Side - Data Table */}
                    <div className="wa-report-table-section">
                        <table className="report-data-table">
                            <thead>
                                <tr>
                                    <th colSpan="2">Water Utilization</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Drinking/Domestic Section */}
                                <tr className="section-head">
                                    <td>A.</td>
                                    <td>Drinking /Domestic (ha m)</td>
                                </tr>
                                <tr>
                                    <td>i)</td>
                                    <td>From Surface Water <span className="val">{drinkingTotal.sw.toFixed(4)}</span></td>
                                </tr>
                                <tr>
                                    <td>ii)</td>
                                    <td>From Ground Water <span className="val">{drinkingTotal.gw.toFixed(4)}</span></td>
                                </tr>
                                <tr className="blue-val bg-light-gray">
                                    <td></td>
                                    <td>Total Drinking /Domestic (ha m) <span className="val">{drinkingTotal.total.toFixed(4)}</span></td>
                                </tr>

                                {/* Irrigated Agriculture Section */}
                                <tr className="section-head">
                                    <td>B.</td>
                                    <td>Irrigated Agriculture (ha m)</td>
                                </tr>
                                <tr>
                                    <td>i)</td>
                                    <td>From Surface Water <span className="val">{irrigationTotal.sw.toFixed(4)}</span></td>
                                </tr>
                                <tr>
                                    <td>ii)</td>
                                    <td>From Ground Water <span className="val">{irrigationTotal.gw.toFixed(4)}</span></td>
                                </tr>
                                <tr className="blue-val bg-light-gray">
                                    <td></td>
                                    <td>Total Irrigated Agriculture (ha m) <span className="val">{irrigationTotal.total.toFixed(4)}</span></td>
                                </tr>

                                {/* Industrial Use Section */}
                                <tr className="section-head">
                                    <td>C.</td>
                                    <td>Industrial Use (ha m)</td>
                                </tr>
                                <tr>
                                    <td>i)</td>
                                    <td>From Surface Water <span className="val">{industrialTotal.sw.toFixed(4)}</span></td>
                                </tr>
                                <tr>
                                    <td>ii)</td>
                                    <td>From Ground Water <span className="val">{industrialTotal.gw.toFixed(4)}</span></td>
                                </tr>
                                {data?.industrialData?.entries?.some(e => e.name.toLowerCase().includes('mining')) && (
                                    <tr className="mining-summary-row">
                                        <td></td>
                                        <td style={{ fontSize: '0.85rem', color: '#666' }}>
                                            * Includes Mining Dewatering: {data.industrialData.entries
                                                .filter(e => e.name.toLowerCase().includes('mining'))
                                                .map(e => `${e.dewateringQuantity} ha m (${e.dewateringDepth}m depth)`)
                                                .join(', ')}
                                        </td>
                                    </tr>
                                )}
                                {data?.industrialData?.entries?.some(e => (Number(e.recycledReusedQuantity) || 0) > 0) && (
                                    <tr className="reuse-summary-row">
                                        <td></td>
                                        <td style={{ fontSize: '0.85rem', color: '#166534', paddingLeft: '20px' }}>
                                            * Total Water Recycled/Reused: {data.industrialData.entries
                                                .reduce((acc, e) => acc + (Number(e.recycledReusedQuantity) || 0), 0)} L/day
                                        </td>
                                    </tr>
                                )}
                                {data?.industrialData?.entries?.some(e => Number(e.salineQuantity) > 0) && (
                                    <tr className="saline-summary-row">
                                        <td></td>
                                        <td style={{ fontSize: '0.85rem', color: '#5b21b6', paddingLeft: '20px' }}>
                                            * Saline Water Disposal: {data.industrialData.entries
                                                .filter(e => Number(e.salineQuantity) > 0)
                                                .map(e => `${e.disposalStrategy} (${e.salineQuantity} L/day)`)
                                                .join(', ')}
                                        </td>
                                    </tr>
                                )}
                                <tr className="blue-val bg-light-gray">
                                    <td></td>
                                    <td>Total Industrial Use (ha m) <span className="val">{industrialTotal.total.toFixed(4)}</span></td>
                                </tr>

                                {/* Other Uses Section */}
                                <tr className="section-head">
                                    <td>D.</td>
                                    <td>Other Uses (if any) (ha m)</td>
                                </tr>
                                <tr>
                                    <td>i)</td>
                                    <td>From Surface Water <span className="val">{otherUsesTotal.sw.toFixed(4)}</span></td>
                                </tr>
                                <tr>
                                    <td>ii)</td>
                                    <td>From Ground Water <span className="val">{otherUsesTotal.gw.toFixed(4)}</span></td>
                                </tr>
                                <tr className="blue-val bg-light-gray">
                                    <td></td>
                                    <td>Total Other Uses (if any) (ha m) <span className="val">{otherUsesTotal.total.toFixed(4)}</span></td>
                                </tr>

                                {/* Abstraction Structures Section */}
                                <tr className="section-head">
                                    <td>E.</td>
                                    <td>Groundwater Abstraction Structures</td>
                                </tr>
                                {abstractionTotal.details.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.type}</td>
                                        <td>Count: {item.count} | Draft: <span className="val">{item.draft.toFixed(6)} ha m</span></td>
                                    </tr>
                                ))}
                                {abstractionTotal.details.length === 0 && (
                                    <tr>
                                        <td colSpan="2" style={{ fontStyle: 'italic', paddingLeft: '20px' }}>No structures recorded</td>
                                    </tr>
                                )}
                                <tr className="blue-val bg-light-gray">
                                    <td></td>
                                    <td>Total Estimated Draft (ha m) <span className="val">{abstractionTotal.total.toFixed(6)}</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Right Side - Chart Section */}
                    <div className="wa-report-chart-section">
                        <div className="chart-area">
                            <h3 className="chart-title">Sector-wise Water Utilization (ha m)</h3>
                            <div className="wa-chart-wrapper" style={{ width: '100%', height: '400px' }}>
                                {!hasData ? (
                                    <div className="chart-empty-area">
                                        <p>No utilization data to visualize</p>
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height={400} minWidth={0} minHeight={0}>
                                        <BarChart
                                            data={chartData}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 12 }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Legend
                                                verticalAlign="top"
                                                align="right"
                                                iconType="circle"
                                                wrapperStyle={{ paddingBottom: '20px' }}
                                            />
                                            <Bar dataKey="GW" name="Ground Water" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                            <Bar dataKey="SW" name="Surface Water" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="wa-report-actions no-print">
                <button className="btn-back" onClick={onBack}>Back</button>
                <button className="btn-next" onClick={onGoToBalance}>Go to Balance</button>
            </div>
        </div>
    );
};

export default WaterUtilizationSummary;
