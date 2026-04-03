import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { locationService } from '../../services/locationService';
import PlaceholderImage from '../Shared/PlaceholderImage';

const AquiferTrendGraph = ({ gpId, title, isPrint, data: initialData }) => {
    const [data, setData] = useState(initialData || []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setData(initialData);
            return;
        }
        if (gpId) {
            const controller = new AbortController();
            setLoading(true);
            locationService.getAquiferTrend(gpId, controller.signal)
                .then(res => setData(res))
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error("Error fetching trend data:", err);
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) {
                        setLoading(false);
                    }
                });

            return () => controller.abort();
        }
    }, [gpId, initialData]);

    if (loading) {
        return (
            <PlaceholderImage
                title={title}
                height="300px"
                message="Analyzing Decadal Trends..."
            />
        );
    }

    if (!data || data.length === 0) {
        return (
            <PlaceholderImage
                title={title}
                height="300px"
                message="No historical trend data available."
            />
        );
    }

    const chartData = data.filter(d => d.pre !== null || d.post !== null);

    const renderChart = (fixed) => (
        <LineChart
            width={fixed ? 500 : undefined}
            height={fixed ? 200 : undefined}
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: fixed ? 60 : 40 }}
        >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={fixed ? "#eee" : "#f1f5f9"} />
            <XAxis
                dataKey="year"
                scale="point"
                padding={{ left: 15, right: 15 }}
                axisLine={{ stroke: '#ccc' }}
                tickLine={false}
                tick={{ fill: fixed ? '#000' : '#64748b', fontSize: 11, fontWeight: 700 }}
            />
            <YAxis
                reversed={true}
                axisLine={{ stroke: '#ccc' }}
                tickLine={false}
                tick={{ fill: fixed ? '#000' : '#64748b', fontSize: 10 }}
                label={{
                    value: 'Depth (mbgl)',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 15,
                    style: { textAnchor: 'middle', fill: fixed ? '#000' : '#94a3b8', fontSize: 10, fontWeight: 700 }
                }}
            />
            <Tooltip
                contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    padding: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
                labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
            />
            <Legend
                iconType="circle"
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconSize={10}
                wrapperStyle={fixed ? { bottom: 0, paddingBottom: '10px' } : { paddingTop: '25px', paddingBottom: '10px' }}
                formatter={(value) => <span style={{ color: '#000', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', paddingRight: '15px' }}>{value}</span>}
            />
            <Line
                name="Post-Monsoon"
                type="monotone"
                dataKey="post"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
                connectNulls
                isAnimationActive={false}
            />
            <Line
                name="Pre-Monsoon"
                type="monotone"
                dataKey="pre"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6 }}
                connectNulls
                isAnimationActive={false}
            />
        </LineChart>
    );

    return (
        <div className="chart-figure" style={{ width: '100%', margin: '0', pageBreakInside: 'avoid' }}>
            <div className="chart-title" style={{ padding: '5px 0' }}>{title}</div>

            {/* SCREEN VERSION */}
            <div className="screen-only" style={{
                background: '#ffffff',
                border: 'none',
                padding: '0',
                width: '100%',
                marginTop: '10px',
                borderRadius: '0',
                overflow: 'visible',
                position: 'relative',
                height: '400px'
            }}>
                <div style={{ height: '100%', width: '100%', margin: '0 auto' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart(false)}
                    </ResponsiveContainer>
                </div>
            </div>

            {/* PRINT VERSION */}
            <div className="print-only" style={{
                background: '#ffffff',
                border: 'none',
                padding: '0',
                width: '100%',
                marginTop: '5px',
                borderRadius: '0',
                overflow: 'visible',
                position: 'relative',
                height: '200px'
            }}>
                <div style={{ height: '100%', width: '500px', margin: '0 auto' }}>
                    {renderChart(true)}
                </div>
            </div>
        </div>
    );
};

export default AquiferTrendGraph;
