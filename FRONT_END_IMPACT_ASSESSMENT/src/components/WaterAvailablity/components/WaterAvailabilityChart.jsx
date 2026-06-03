import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const WaterAvailabilityChart = ({ data }) => {
    // defined categories matching the user request
    const chartData = [
        {
            name: "GW Recharge Rainfall",
            value: Number((data.totalGwRechargeRainfall || 0).toFixed(2)),
            color: "#9CCC65" // Light Green
        },
        {
            name: "GW Recharge Other",
            value: Number((data.totalGwRechargeOther || 0).toFixed(2)),
            color: "#EF5350" // Red
        },
        {
            name: "Total GW Available",
            value: Number((data.totalGwAvailable || 0).toFixed(2)),
            color: "#42A5F5" // Blue
        },
        {
            name: "SW Storage Capacity",
            value: Number((data.totalStorageCapacity || 0).toFixed(2)),
            color: "#FFA726" // Orange
        },
        {
            name: "Total SW Available",
            value: Number((data.totalSwAvailable || 0).toFixed(2)),
            color: "#26C6DA" // Cyan
        },
        {
            name: "Total Water",
            value: Number((data.totalWaterAvailable || 0).toFixed(2)),
            color: "#E040FB" // Purple
        }
    ];

    const hasData = chartData.some(d => d.value > 0);

    return (
        <div className="wa-report-chart-section">
            <h3 className="chart-title">Water Availability (ha m)</h3>
            <div className="wa-chart-wrapper" style={{ width: '100%', height: '400px' }}>
                {!hasData ? (
                    <div className="chart-empty-area">
                        <p>No availability data to visualize</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={400} minWidth={0} minHeight={0}>
                        <BarChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11 }}
                                textAnchor="middle"
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
                                formatter={(value) => [value, 'ha m']}
                            />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default WaterAvailabilityChart;
