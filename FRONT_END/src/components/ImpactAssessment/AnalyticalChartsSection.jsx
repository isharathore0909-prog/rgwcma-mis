import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { locationService } from '../../services/locationService';
import ChartFigure from './ChartFigure';
import WaterBalanceCalculator from './WaterBalanceCalculator';
import './WaterBalanceCalculator.css';

const AnalyticalChartsSection = ({ gpId, isPrint, reportType }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (gpId) {
            setLoading(true);
            locationService.getGPExcelData(gpId)
                .then(res => {
                    if (res && Array.isArray(res) && res.length > 0) {
                        setData(res[0]); // Use the first record (main GP baseline)
                    } else if (res && !Array.isArray(res)) {
                        setData(res);
                    }
                })
                .catch(err => console.error("Error fetching chart data:", err))
                .finally(() => setLoading(false));
        }
    }, [gpId]);

    if (loading) return <div className="loading-charts">Loading Charts...</div>;
    if (!data) return (
        <div className="figure-grid">
            <ChartFigure title="WATER AVAILABILITY ANALYSIS (HAM)" />
            <ChartFigure title="SECTORAL WATER UTILIZATION (%)" />
            <ChartFigure title="WATER BALANCE COMPONENTS" />
            <ChartFigure title="ANNUAL WATER BUDGET PROFILE" />
            <ChartFigure title="PROJECTED WATER DEMAND (2025-2050)" />
            <ChartFigure title="WATER SUPPLY SOURCES DISTRIBUTION" />
        </div>
    );

    // Prepare Data for Charts

    // 1. Water Availability (HAM)
    const rechargeVal = data.recharge_ham || data.recharge_2024 || 0;
    const availabilityData = [
        { name: 'Monsoon Recharge', value: rechargeVal || 45.2 }, // Fallback to 45.2 if 0
        { name: 'Non-Monsoon', value: (data.recharge_2024 || 12.5) * 0.2 },
        { name: 'Total', value: (rechargeVal || 45.2) + ((data.recharge_2024 || 12.5) * 0.2) }
    ];

    // 2. Sectoral Utilization
    const utilizationData = [
        { name: 'Agriculture', value: (data.kharif_nir_mm || 0) + (data.rabi_nir_mm || 0) || 120 },
        { name: 'Domestic', value: ((data.total_human_population || 0) * 55 * 365 / 10000000) || 15 },
        { name: 'Industry', value: data.industry_daily_water_req_l_day ? (data.industry_daily_water_req_l_day * 365 / 10000000) : 5 }
    ];
    // Remove 0 values for Pie Chart to avoid ugly rendering
    const validUtilizationData = utilizationData.filter(d => d.value > 0);

    // 3. Water Balance
    const totalUtilization = utilizationData.reduce((a, b) => a + b.value, 0);
    const balanceData = [
        { name: 'Availability', value: availabilityData[2].value },
        { name: 'Utilization', value: totalUtilization },
    ];
    balanceData.push({ name: 'Balance', value: Math.max(0.1, balanceData[0].value - balanceData[1].value) });

    // 4. Annual Budget Profile
    const budgetData = [
        { name: 'Inflow', amount: balanceData[0].value },
        { name: 'Outflow', amount: balanceData[1].value },
        { name: 'Storage Change', amount: balanceData[2].value * 0.1 }
    ];

    // 5. Projected Demand (Line Chart 2025-2050)
    const projectedData = [];
    const baseDemand = totalUtilization;
    for (let year = 2025; year <= 2050; year += 5) {
        projectedData.push({ year, demand: baseDemand * (1 + (year - 2024) * 0.015) });
    }

    // 6. Supply Sources
    const supplyData = [
        { name: 'Groundwater', value: rechargeVal || 70 },
        { name: 'Surface Water', value: data.sw_irrigation_mcm || 30 },
    ];


    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const chartWidth = isPrint ? 500 : '100%';
    const chartHeight = isPrint ? 200 : 260;

    const renderChart = (chartContent) => {
        if (isPrint) {
            return (
                <div style={{ width: '580px', height: '320px', margin: '0 auto' }}>
                    {chartContent}
                </div>
            );
        }
        return (
            <ResponsiveContainer width="100%" height="100%">
                {chartContent}
            </ResponsiveContainer>
        );
    };

    return (
        <div className={isPrint ? "impact-report-sections" : "figure-grid"}>
            {/* 1. Availability */}
            <div className="chart-figure full-width-chart" style={{ pageBreakInside: 'avoid', marginBottom: isPrint ? '10px' : '30px' }}>
                <div className="chart-title">Figure 15: WATER AVAILABILITY ANALYSIS (HAM)</div>
                <div style={{ width: '100%' }}>
                    {/* Print Version */}
                    <div className="print-only" style={{ width: '500px', height: '200px', margin: '0 auto' }}>
                        <BarChart width={500} height={200} data={availabilityData} margin={{ bottom: 20, top: 5, left: 30, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#000', fontWeight: 700 }} />
                            <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#000' }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} />
                            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                            <Legend
                                verticalAlign="bottom"
                                formatter={(value, entry) => <span style={{ color: '#000', fontSize: '0.75rem', fontWeight: 700 }}>{value}: {(entry.payload?.value || 0).toFixed(2)} HAM</span>}
                                wrapperStyle={{ bottom: 0, paddingBottom: '10px' }}
                            />
                        </BarChart>
                    </div>
                    {/* Screen Version */}
                    <div className="screen-only" style={{ height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={availabilityData} margin={{ bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} isAnimationActive={true} />
                                <Legend
                                    verticalAlign="bottom"
                                    formatter={(value, entry) => <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>{value}: {(entry.payload?.value || 0).toFixed(2)} HAM</span>}
                                    wrapperStyle={{ paddingTop: '15px' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 2. Utilization */}
            <div className="chart-figure full-width-chart" style={{ pageBreakInside: 'avoid', marginBottom: isPrint ? '10px' : '30px' }}>
                <div className="chart-title">Figure 16: SECTORAL WATER UTILIZATION (HAM)</div>
                <div style={{ width: '100%' }}>
                    {/* Print Version */}
                    <div className="print-only" style={{ width: '500px', height: '200px', margin: '0 auto' }}>
                        <PieChart width={500} height={200}>
                            <Pie
                                data={validUtilizationData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={70}
                                label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                                isAnimationActive={false}
                            >
                                {validUtilizationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Legend
                                verticalAlign="bottom"
                                formatter={(value, entry) => <span style={{ color: '#000', fontSize: '0.75rem', fontWeight: 700 }}>{value}: {(entry.payload?.value || 0).toFixed(2)} HAM</span>}
                                iconType="circle"
                                wrapperStyle={{ bottom: 0, paddingBottom: '10px' }}
                            />
                        </PieChart>
                    </div>
                    {/* Screen Version */}
                    <div className="screen-only" style={{ height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={validUtilizationData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    isAnimationActive={true}
                                >
                                    {validUtilizationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    verticalAlign="bottom"
                                    formatter={(value, entry) => <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>{value}: {(entry.payload?.value || 0).toFixed(2)} HAM</span>}
                                    iconType="circle"
                                    wrapperStyle={{ paddingTop: '15px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. Balance */}
            <div className="chart-figure full-width-chart" style={{ pageBreakInside: 'avoid', marginBottom: isPrint ? '10px' : '30px' }}>
                <div className="chart-title">Figure 17: WATER BALANCE COMPONENTS</div>
                <div style={{ width: '100%' }}>
                    {/* Print Version */}
                    <div className="print-only" style={{ width: '500px', height: '200px', margin: '0 auto' }}>
                        <BarChart width={500} height={200} data={balanceData} margin={{ bottom: 20, top: 5, left: 30, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#000', fontWeight: 700 }} />
                            <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#000' }} />
                            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                            <Legend
                                verticalAlign="bottom"
                                formatter={(value, entry) => <span style={{ color: '#000', fontSize: '0.75rem', fontWeight: 700 }}>{value}: {(entry.payload?.value || 0).toFixed(2)} HAM</span>}
                                wrapperStyle={{ bottom: 0, paddingBottom: '10px' }}
                            />
                        </BarChart>
                    </div>
                    {/* Screen Version */}
                    <div className="screen-only" style={{ height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={balanceData} margin={{ bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} isAnimationActive={true} />
                                <Legend
                                    verticalAlign="bottom"
                                    formatter={(value, entry) => <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>{value}: {(entry.payload?.value || 0).toFixed(2)} HAM</span>}
                                    wrapperStyle={{ paddingTop: '15px' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 4. Budget */}
            <div className="chart-figure full-width-chart" style={{ pageBreakInside: 'avoid', marginBottom: isPrint ? '10px' : '30px' }}>
                <div className="chart-title">Figure 18: ANNUAL WATER BUDGET PROFILE</div>
                <div style={{ width: '100%' }}>
                    {/* Print Version */}
                    <div className="print-only" style={{ width: '500px', height: '200px', margin: '0 auto' }}>
                        <BarChart width={500} height={200} data={budgetData} layout="vertical" margin={{ left: 60, bottom: 20, top: 5, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                            <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: '#000' }} />
                            <YAxis dataKey="name" type="category" fontSize={10} width={100} axisLine={false} tickLine={false} tick={{ fill: '#000', fontWeight: 700 }} />
                            <Bar dataKey="amount" fill="#f59e0b" radius={[0, 4, 4, 0]} isAnimationActive={false} />
                            <Legend
                                verticalAlign="bottom"
                                formatter={(value, entry) => <span style={{ color: '#000', fontSize: '0.75rem', fontWeight: 700 }}>{value}: {(entry.payload?.amount || 0).toFixed(2)} HAM</span>}
                                wrapperStyle={{ bottom: 0, paddingBottom: '10px' }}
                            />
                        </BarChart>
                    </div>
                    {/* Screen Version */}
                    <div className="screen-only" style={{ height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetData} layout="vertical" margin={{ left: 10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" fontSize={10} width={100} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="amount" fill="#f59e0b" radius={[0, 4, 4, 0]} isAnimationActive={true} />
                                <Legend
                                    verticalAlign="bottom"
                                    formatter={(value, entry) => <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>{value}: {(entry.payload?.amount || 0).toFixed(2)} HAM</span>}
                                    wrapperStyle={{ paddingTop: '15px' }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 5 & 6. Combined Water Balance Calculator */}
            <div className="chart-figure full-width-chart" style={{ pageBreakInside: 'avoid', marginBottom: isPrint ? '5px' : '30px', gridColumn: 'span 2' }}>
                <div className="chart-title">Figure 19: GROUND WATER BALANCE & STP REUSE ANALYSIS</div>
                <div style={{ width: '100%' }}>
                    <WaterBalanceCalculator isPrint={isPrint} projectTypeProp={reportType} />
                </div>
            </div>
        </div>
    );

};

export default AnalyticalChartsSection;
