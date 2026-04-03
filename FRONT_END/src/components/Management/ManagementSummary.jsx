import React from 'react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell
} from 'recharts';
import './ManagementSummary.css';

const ManagementSummary = ({ demandData, supplyData, metadata, onBack, onDownload, onNext }) => {
    // Current date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB');
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Helper to clean names from any unwanted ID suffixes (e.g., "AJMER_88" -> "AJMER")
    const cleanName = (name) => {
        if (!name) return "";
        return name.toString().split('_')[0].trim().toUpperCase();
    };

    const userMetadata = {
        state: cleanName(metadata?.state || "RAJASTHAN"),
        district: cleanName(metadata?.district || "AJMER"),
        block: cleanName(metadata?.block || "AJMER RURAL"),
        gp: cleanName(metadata?.gp || "ARADKA"),
        year: metadata?.year || "2023-24",
        userName: metadata?.userName?.toUpperCase() || "SPMU_RAJASTHAN"
    };

    // --- CHART DATA PREPARATION ---

    // 1. Demand Side Aggregation (Proposed Area in HA)
    const demandChartData = (() => {
        const categories = [
            { id: 'sprinkler', label: 'Sprinkler' },
            { id: 'drip', label: 'Drip' },
            { id: 'pipelines', label: 'Pipelines' },
            { id: 'diversification', label: 'Diversification' },
            { id: 'innovative', label: 'Innovative' }
        ];

        return categories.map(cat => {
            let area = 0;
            const catData = demandData[cat.id];
            if (catData) {
                ['kharif', 'rabi', 'summer'].forEach(season => {
                    const seasonData = catData[season];
                    if (!seasonData) return;

                    if (cat.id === 'diversification') {
                        const items = seasonData.changed || [];
                        items.forEach(item => { area += parseFloat(item.area || 0); });
                    } else {
                        const items = Array.isArray(seasonData) ? seasonData : [];
                        items.forEach(item => { area += parseFloat(item.areaProposed || item.area || 0); });
                    }
                });
            }
            return { name: cat.label, area: parseFloat(area.toFixed(2)) };
        }).filter(d => d.area > 0);
    })();

    // 2. Supply Side Aggregation (Capacity in HA M)
    const supplyChartData = [
        {
            name: 'Recharge (ARS)',
            capacity: parseFloat((supplyData?.recharge || [])
                .reduce((sum, item) => sum + parseFloat(item.storageCapacity || 0), 0)
                .toFixed(2))
        },
        {
            name: 'Conservation (WCS)',
            capacity: parseFloat((supplyData?.conservation || [])
                .reduce((sum, item) => sum + parseFloat(item.storageCapacity || 0), 0)
                .toFixed(2))
        }
    ].filter(d => d.capacity > 0);

    const DEMAND_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const SUPPLY_COLORS = ['#0ea5e9', '#22c55e'];

    return (
        <div className="wa-report-paper-wrapper">
            {/* Standardized Top Navigation Bar */}
            <div className="gp-top-bar no-print">
                <div className="breadcrumbs">
                    <span className="crumb-item">STATE:</span> {userMetadata.state}
                    <span className="crumb-separator">|</span>
                    <span className="crumb-item">DISTRICT:</span> {userMetadata.district}
                    <span className="crumb-separator">|</span>
                    <span className="crumb-item">BLOCK:</span> {userMetadata.block}
                    <span className="crumb-separator">|</span>
                    <span className="crumb-item">GRAM PANCHAYAT:</span> {userMetadata.gp}
                    <span className="crumb-separator">|</span>
                    <span className="crumb-item">YEAR:</span> {userMetadata.year}
                </div>
                <button className="back-home-button" onClick={onBack}>
                    Back
                </button>
            </div>

            <div className="printable-report">
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
                        <h1>DEMAND SUPPLY SIDE SUMMARY</h1>
                        <button className="btn-download no-print" onClick={() => window.print()}>Print / Download PDF</button>
                    </div>
                    <div className="meta-info">
                        <span>Date : {dateStr}</span>
                        <span>Time : {timeStr}</span>
                        <span>User Name : {userMetadata.userName}</span>
                    </div>
                </header>

                {/* Dark Context Breadcrumb */}
                <nav className="wa-report-breadcrumb">
                    <span>STATE: {userMetadata.state}</span>
                    <span className="breadcrumb-arrow">»</span>
                    <span>DISTRICT: {userMetadata.district}</span>
                    <span className="breadcrumb-arrow">»</span>
                    <span>BLOCK: {userMetadata.block}</span>
                    <span className="breadcrumb-arrow">»</span>
                    <span>GP: {userMetadata.gp}</span>
                    <span className="breadcrumb-arrow">»</span>
                    <span>YEAR: {userMetadata.year}</span>
                </nav>

                <div className="wa-report-content">
                    {/* SECTION 1: DEMAND SIDE */}
                    <div className="wa-report-table-section">
                        <table className="report-data-table">
                            <thead>
                                <tr>
                                    <th colSpan="7">Demand Side Management</th>
                                </tr>
                                <tr className="section-head">
                                    <td className="section-label">A</td>
                                    <td colSpan="6" className="section-title-cell">Ground Water Intervention / Measures</td>
                                </tr>
                                <tr className="table-header-row">
                                    <th style={{ width: '60px' }}>Sr No</th>
                                    <th>Name of Intervention</th>
                                    <th style={{ width: '100px' }}>Area (ha)</th>
                                    <th style={{ width: '120px' }}>Total Demand (ha m)</th>
                                    <th style={{ width: '120px' }}>Net Demand (ha m)</th>
                                    <th style={{ width: '120px' }}>Reduction (ha m)</th>
                                    <th style={{ width: '100px' }}>Cost (Lakh)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    let srNo = 1;
                                    let totalArea = 0;
                                    let totalDemand = 0;
                                    let totalNetDemand = 0;
                                    let totalReduction = 0;
                                    let totalCost = 0;
                                    const rows = [];

                                    // Helper to process intervention categories
                                    const categories = ['sprinkler', 'drip', 'pipelines', 'diversification', 'innovative'];
                                    categories.forEach(cat => {
                                        const catData = demandData[cat];
                                        if (!catData) return;

                                        // Handle seasons
                                        ['kharif', 'rabi', 'summer'].forEach(season => {
                                            const seasonData = catData[season];
                                            if (!seasonData) return;

                                            // Diversification has original/changed
                                            if (cat === 'diversification') {
                                                const originals = seasonData.original || [];
                                                const items = seasonData.changed || [];
                                                items.forEach((item, idx) => {
                                                    const original = originals[idx] || {};
                                                    const baseD = (parseFloat(original.area || 0) * parseFloat(original.waterReq || 0)) / 1000;
                                                    const netD = (parseFloat(item.area || 0) * parseFloat(item.waterReq || 0)) / 1000;
                                                    const red = baseD - netD;
                                                    const cost = parseFloat(item.cost || 0);

                                                    rows.push(
                                                        <tr key={`demand-${cat}-${season}-${item.id}`}>
                                                            <td>{srNo++}</td>
                                                            <td>{`Crop Diversification (${season.toUpperCase()}) - ${item.name}`}</td>
                                                            <td>{parseFloat(item.area || 0).toFixed(2)}</td>
                                                            <td>{baseD.toFixed(3)}</td>
                                                            <td>{netD.toFixed(3)}</td>
                                                            <td>{red.toFixed(3)}</td>
                                                            <td>{cost.toFixed(2)}</td>
                                                        </tr>
                                                    );
                                                    totalArea += parseFloat(item.area || 0);
                                                    totalDemand += baseD;
                                                    totalNetDemand += netD;
                                                    totalReduction += red;
                                                    totalCost += cost;
                                                });
                                            } else {
                                                // Sprinkler, Drip, Pipeline, Innovative
                                                const items = Array.isArray(seasonData) ? seasonData : [];
                                                items.forEach(item => {
                                                    const area = parseFloat(item.areaProposed || item.area || 0);
                                                    const baseD = (parseFloat(item.areaConv || area) * (parseFloat(item.netReq || item.waterReq || 0))) / 1000;
                                                    const savingFactor = (100 - (parseFloat(item.savingPercent || 0))) / 100;
                                                    const netD = (area * (parseFloat(item.netReq || item.waterReq || 0) * savingFactor)) / 1000;
                                                    const red = baseD - netD;
                                                    const cost = parseFloat(item.cost || 0);

                                                    rows.push(
                                                        <tr key={`demand-${cat}-${season}-${item.id}`}>
                                                            <td>{srNo++}</td>
                                                            <td>{`${cat.charAt(0).toUpperCase() + cat.slice(1)} (${season.toUpperCase()}) - ${item.name || item.measure || ''}`}</td>
                                                            <td>{area.toFixed(2)}</td>
                                                            <td>{baseD.toFixed(3)}</td>
                                                            <td>{netD.toFixed(3)}</td>
                                                            <td>{red.toFixed(3)}</td>
                                                            <td>{cost.toFixed(2)}</td>
                                                        </tr>
                                                    );
                                                    totalArea += area;
                                                    totalDemand += baseD;
                                                    totalNetDemand += netD;
                                                    totalReduction += red;
                                                    totalCost += cost;
                                                });
                                            }
                                        });
                                    });

                                    if (rows.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan="7" className="no-data-msg">No demand side data available.</td>
                                            </tr>
                                        );
                                    }

                                    return (
                                        <>
                                            {rows}
                                            <tr className="total-highlight-row">
                                                <td colSpan="2" style={{ textAlign: 'right', paddingRight: '20px' }}>Total</td>
                                                <td>{totalArea.toFixed(2)}</td>
                                                <td>{totalDemand.toFixed(3)}</td>
                                                <td>{totalNetDemand.toFixed(3)}</td>
                                                <td>{totalReduction.toFixed(3)}</td>
                                                <td>{totalCost.toFixed(2)}</td>
                                            </tr>
                                        </>
                                    );
                                })()}
                            </tbody>
                        </table>
                    </div>

                    {/* SECTION 2: FUNDING */}
                    {/* ... Skipping complex funding for now as summary report is main goal ... */}

                    {/* SECTION 3: SUPPLY SIDE - AR */}
                    <div className="wa-report-table-section">
                        <table className="report-data-table">
                            <thead>
                                <tr>
                                    <th colSpan="10">Supply Side Management</th>
                                </tr>
                                <tr className="section-head">
                                    <td className="section-label">C</td>
                                    <td colSpan="9" className="section-title-cell">Artificial Recharge Structures</td>
                                </tr>
                                <tr className="table-header-row">
                                    <th style={{ width: '60px' }}>Sr No</th>
                                    <th>Name of Structure</th>
                                    <th style={{ width: '85px' }}>Capacity (ha m)</th>
                                    <th style={{ width: '85px' }}>Recharge (ha m)</th>
                                    <th>Village Name</th>
                                    <th style={{ width: '110px' }}>Lat/Long</th>
                                    <th style={{ width: '70px' }}>FY</th>
                                    <th style={{ width: '130px' }}>Department</th>
                                    <th style={{ width: '130px' }}>Scheme</th>
                                    <th style={{ width: '85px' }}>Cost (Lakh)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplyData?.recharge?.length > 0 ? (
                                    <>
                                        {supplyData.recharge.map((item, idx) => (
                                            <tr key={item.id || idx}>
                                                <td>{idx + 1}</td>
                                                <td>{item.structureType}</td>
                                                <td>{item.storageCapacity}</td>
                                                <td>{item.annualGWRecharge}</td>
                                                <td>{item.villageName}</td>
                                                <td>{`${item.latitude}/${item.longitude}`}</td>
                                                <td>{item.financialYear}</td>
                                                <td>{item.departmentName}</td>
                                                <td>{item.schemeName}</td>
                                                <td>{item.estimatedCost}</td>
                                            </tr>
                                        ))}
                                        <tr className="total-highlight-row">
                                            <td colSpan="2" style={{ textAlign: 'right', paddingRight: '20px' }}>Total</td>
                                            <td>{supplyData.recharge.reduce((sum, item) => sum + parseFloat(item.storageCapacity || 0), 0).toFixed(2)}</td>
                                            <td>{supplyData.recharge.reduce((sum, item) => sum + parseFloat(item.annualGWRecharge || 0), 0).toFixed(2)}</td>
                                            <td colSpan="5"></td>
                                            <td>{supplyData.recharge.reduce((sum, item) => sum + parseFloat(item.estimatedCost || 0), 0).toFixed(2)}</td>
                                        </tr>
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="no-data-msg">No ARS Data Entered</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* SECTION 4: SUPPLY SIDE - WC */}
                    <div className="wa-report-table-section">
                        <table className="report-data-table">
                            <thead>
                                <tr className="section-head">
                                    <td className="section-label">D</td>
                                    <td colSpan="9" className="section-title-cell">Water Conservation Structures</td>
                                </tr>
                                <tr className="table-header-row">
                                    <th style={{ width: '60px' }}>Sr No</th>
                                    <th>Name of Structure</th>
                                    <th style={{ width: '85px' }}>Storage (ha m)</th>
                                    <th style={{ width: '85px' }}>Effective (ha m)</th>
                                    <th>Village Name</th>
                                    <th style={{ width: '110px' }}>Lat/Long</th>
                                    <th style={{ width: '70px' }}>FY</th>
                                    <th style={{ width: '130px' }}>Department</th>
                                    <th style={{ width: '130px' }}>Scheme</th>
                                    <th style={{ width: '85px' }}>Cost (Lakh)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {supplyData?.conservation?.length > 0 ? (
                                    <>
                                        {supplyData.conservation.map((item, idx) => (
                                            <tr key={item.id || idx}>
                                                <td>{idx + 1}</td>
                                                <td>{item.structureType}</td>
                                                <td>{item.storageCapacity}</td>
                                                <td>{item.effectiveStorage}</td>
                                                <td>{item.villageName}</td>
                                                <td>{`${item.latitude}/${item.longitude}`}</td>
                                                <td>{item.financialYear}</td>
                                                <td>{item.departmentName}</td>
                                                <td>{item.schemeName}</td>
                                                <td>{item.estimatedCost}</td>
                                            </tr>
                                        ))}
                                        <tr className="total-highlight-row">
                                            <td colSpan="2" style={{ textAlign: 'right', paddingRight: '20px' }}>Total</td>
                                            <td>{supplyData.conservation.reduce((sum, item) => sum + parseFloat(item.storageCapacity || 0), 0).toFixed(2)}</td>
                                            <td>{supplyData.conservation.reduce((sum, item) => sum + parseFloat(item.effectiveStorage || 0), 0).toFixed(2)}</td>
                                            <td colSpan="5"></td>
                                            <td>{supplyData.conservation.reduce((sum, item) => sum + parseFloat(item.estimatedCost || 0), 0).toFixed(2)}</td>
                                        </tr>
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="no-data-msg">No WCS Data Entered</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ANALYSIS GRAPHS SECTION */}
                    <div className="wa-report-chart-grid">
                        <div className="chart-card">
                            <h3 className="chart-title">Demand Side Analysis</h3>
                            {demandChartData.length > 0 ? (
                                <div style={{ height: 350, width: '100%' }}>
                                    <ResponsiveContainer>
                                        <BarChart data={demandChartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} label={{ value: 'Area (ha)', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                            <Bar dataKey="area" radius={[4, 4, 0, 0]}>
                                                {demandChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={DEMAND_COLORS[index % DEMAND_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="chart-placeholder">
                                    <p>Please enter demand data to see results</p>
                                </div>
                            )}
                        </div>
                        <div className="chart-card">
                            <h3 className="chart-title">Supply Side Summary</h3>
                            {supplyChartData.length > 0 ? (
                                <div style={{ height: 350, width: '100%' }}>
                                    <ResponsiveContainer>
                                        <BarChart data={supplyChartData} layout="vertical" margin={{ left: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" axisLine={false} tickLine={false} />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} />
                                            <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                            <Bar dataKey="capacity" radius={[0, 4, 4, 0]} barSize={40}>
                                                {supplyChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={SUPPLY_COLORS[index % SUPPLY_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="chart-placeholder">
                                    <p>Please enter supply data to see results</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="report-footer-disclaimer">
                        <p>The results and analysis contained within the Demand Supply Side Summary are generated with the help of inputs given by the user as well as existing database. Each component of water budgeting is designed to make understand the users about the processes, parameters and equations involved in the system. The overall goal of water budgeting is therefore to improve the management of ground water resources in priority areas of the country.</p>
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="wa-report-actions no-print">
                    <button className="btn-back" onClick={onBack}>Back</button>
                    <button className="btn-next" onClick={onNext}>Go to Impact Assessment</button>
                </div>
            </div>
        </div>
    );
};

export default ManagementSummary;
