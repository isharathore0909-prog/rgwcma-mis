import React, { useState, useMemo, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { locationService } from '../../services/locationService';
import PlaceholderImage from '../Shared/PlaceholderImage';

const WaterQualityGraph = ({ data: initialData, gpId, title, showInsights = true, isPrint }) => {
    const [activeParam, setActiveParam] = useState('ec');
    const [data, setData] = useState(initialData || []);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setData(initialData);
            setLoading(false);
            return;
        }
        if (gpId) {
            const controller = new AbortController();
            setLoading(true);
            locationService.getWaterQualityData(gpId, controller.signal)
                .then(res => setData(res))
                .catch(err => {
                    if (err.name !== 'AbortError') {
                        console.error("Error fetching quality graph data:", err);
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) {
                        setLoading(false);
                    }
                });

            return () => controller.abort();
        }
    }, [initialData, gpId]);

    const parameters = {
        ec: { label: 'Salinity (EC)', unit: 'µS/cm', color: '#3b82f6', desc: 'Standard: < 2250 µS/cm', safe: 2250, critical: 4000 },
        tds: { label: 'TDS', unit: 'mg/L', color: '#0ea5e9', desc: 'Standard: < 500 mg/L', safe: 500, critical: 2000 },
        nitrate: { label: 'Nitrate', unit: 'mg/L', color: '#8b5cf6', desc: 'Limit: 45 mg/L', safe: 45, critical: 100 },
        fluoride: { label: 'Fluoride', unit: 'mg/L', color: '#ec4899', desc: 'Limit: 1.5 mg/L', safe: 1.5, critical: 3.0 },
        ph: { label: 'pH', unit: '', color: '#10b981', desc: 'Range: 6.5 - 8.5', safe: 8.5, critical: 9.0 },
        hardness: { label: 'Hardness', unit: 'mg/L', color: '#f59e0b', desc: 'Limit: 600 mg/L', safe: 600, critical: 1000 }
    };


    const dataToChartData = (rawData, param) => {
        if (!rawData || rawData.length === 0) return [];
        return [...rawData].sort((a, b) => (a.well_id || '').localeCompare(b.well_id || ''))
            .map(d => ({
                name: d.well_id || 'Well',
                val: parseFloat(d[param]) || 0,
            }));
    };

    const chartData = useMemo(() => dataToChartData(data, activeParam), [data, activeParam]);

    if (loading) {
        return (
            <PlaceholderImage
                title={title}
                height="300px"
                message="Analyzing Water Quality Samples..."
            />
        );
    }

    if (!data || data.length === 0) {
        return (
            <PlaceholderImage
                title={title}
                height="300px"
                message="Analysis waiting for well data..."
            />
        );
    }

    const current = parameters[activeParam];

    return (
        <div style={{ paddingBottom: isPrint ? '10px' : '30px', width: '100%', margin: '0' }}>
            <div className="chart-title" style={{ padding: '4px 0', margin: 0 }}>{title}</div>

            {/* A. SCREEN VIEW: Interactive Tabbed Dashboard */}
            <div className="quality-dashboard screen-only" style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '0',
                width: '100%',
                marginTop: '10px',
                borderRadius: '0'
            }}>
                <div className="no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '25px', padding: '15px' }}>
                    {Object.entries(parameters).map(([key, info]) => (
                        <button
                            key={key}
                            onClick={() => setActiveParam(key)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '12px',
                                border: activeParam === key ? `2px solid ${info.color}` : '1px solid #e2e8f0',
                                background: activeParam === key ? `${info.color}10` : '#f8fafc',
                                color: activeParam === key ? info.color : '#64748b',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: info.color }}></span>
                            {info.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: showInsights ? 'minmax(0, 1fr) 240px' : 'minmax(0, 1fr)', gap: '30px', padding: '0 15px 15px 15px' }}>
                    <div style={{ height: '400px', position: 'relative', minWidth: 0 }}>
                        <div style={{ position: 'absolute', top: -10, left: 10, fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', zIndex: 10 }}>
                            {current.label} ({current.unit})
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={current.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={current.color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} padding={{ left: 20, right: 20 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                <Tooltip content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const val = payload[0].value;
                                        const status = val <= current.safe ? 'SAFE' : val <= current.critical ? 'WARNING' : 'HAZARDOUS';
                                        const statusColor = status === 'SAFE' ? '#10b981' : status === 'WARNING' ? '#f59e0b' : '#ef4444';
                                        return (
                                            <div style={{ background: '#fff', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                                                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Well: {payload[0].payload.name}</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>{val} <small style={{ fontSize: '0.7rem' }}>{current.unit}</small></span>
                                                    <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: `${statusColor}20`, color: statusColor, fontWeight: 900 }}>{status}</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }} />
                                <ReferenceLine y={current.safe} stroke="#10b981" strokeDasharray="5 5" label={{ value: 'Safe Limit', position: 'right', fill: '#10b981', fontSize: 10, fontWeight: 800 }} />
                                <Area type="monotone" dataKey="val" stroke={current.color} strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {showInsights && (
                        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
                            <h5 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#1e293b', fontWeight: 800 }}>Expert Insights</h5>
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Recommendation</div>
                                <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.5', fontWeight: 600 }}>
                                    {current.desc}. Values shown reflect current groundwater health at specific sample points.
                                </div>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '8px', background: '#fff', border: '1px solid #e2e8f0' }}>
                                <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '8px' }}>Health Indicators</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span style={{ color: '#10b981', fontWeight: 700 }}>Excellent</span>
                                        <span style={{ color: '#64748b' }}>&lt; {current.safe}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span style={{ color: '#f59e0b', fontWeight: 700 }}>Permissible</span>
                                        <span style={{ color: '#64748b' }}>Up to {current.critical}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <span style={{ color: '#ef4444', fontWeight: 700 }}>Hazardous</span>
                                        <span style={{ color: '#64748b' }}>&gt; {current.critical}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* B. PRINT VIEW: All Graphs List */}
            <div className="print-only" style={{ width: '100%' }}>
                {Object.entries(parameters).map(([key, info]) => (
                    <div key={key} style={{ marginBottom: isPrint ? '5px' : '20px', pageBreakInside: 'avoid' }}>
                        <div style={{
                            fontSize: '1.2rem',
                            fontWeight: 800,
                            color: '#1e3a8a',
                            marginBottom: '5px',
                            paddingBottom: '8px',
                            borderBottom: '2px solid #f1f5f9',
                            textTransform: 'uppercase'
                        }}>
                            {info.label} ({info.unit})
                        </div>
                        <div className="full-width-chart" style={{ display: 'flex', justifyContent: 'center', height: '180px' }}>
                            <AreaChart
                                width={500}
                                height={180}
                                data={dataToChartData(data, key)}
                                margin={{ top: 10, right: 40, left: 40, bottom: 10 }}
                            >
                                <defs>
                                    <linearGradient id={`colorPrint-${key}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={info.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={info.color} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
                                <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: 12, fontWeight: 'bold' }} />
                                <ReferenceLine
                                    y={info.safe}
                                    stroke="#10b981"
                                    strokeDasharray="5 5"
                                    label={{ value: 'Safe Limit', position: 'right', fill: '#10b981', fontSize: 12, fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="val"
                                    stroke={info.color}
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill={`url(#colorPrint-${key})`}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </div>
                        <div style={{
                            marginTop: '8px',
                            padding: '12px 15px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8e0',
                            fontSize: '0.9rem',
                            color: '#334155'
                        }}>
                            <strong>Parameter Analysis:</strong> {info.desc}. Values are measured in {info.unit}.
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

};

export default WaterQualityGraph;
