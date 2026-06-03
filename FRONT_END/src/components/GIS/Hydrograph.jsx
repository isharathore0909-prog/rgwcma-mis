import React, { useEffect, useState, useMemo } from 'react';
import {
    ComposedChart,
    Bar,
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

const Hydrograph = ({ gpId, title, isPrint, data: initialData }) => {
    const [data, setData] = useState(initialData || []);
    const [loading, setLoading] = useState(!initialData || initialData.length === 0);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialData && initialData.length > 0) {
            setData(initialData);
            setLoading(false);
            return;
        }

        if (!gpId) return;

        const controller = new AbortController();
        const fetchData = async () => {
            try {
                const result = await locationService.getAquiferTrend(gpId, controller.signal);
                setData(result);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error("Hydrograph fetch error:", err);
                    setError(err.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => controller.abort();
    }, [gpId, initialData]);

    const processedData = useMemo(() => {
        if (!data || data.length === 0) return [];

        const getTrendParams = (key) => {
            const validPoints = data.map((d, i) => {
                const val = parseFloat(d[key]);
                return !isNaN(val) ? { x: i, y: val } : null;
            }).filter(p => p !== null);

            const n = validPoints.length;
            if (n < 2) return null;

            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
            validPoints.forEach(p => {
                sumX += p.x;
                sumY += p.y;
                sumXY += p.x * p.y;
                sumXX += p.x * p.x;
            });

            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;
            return { slope, intercept };
        };

        const preParams = getTrendParams('pre');
        const postParams = getTrendParams('post');

        return data.map((d, i) => ({
            ...d,
            preTrend: preParams ? parseFloat((preParams.slope * i + preParams.intercept).toFixed(2)) : null,
            postTrend: postParams ? parseFloat((postParams.slope * i + postParams.intercept).toFixed(2)) : null
        }));
    }, [data]);

    if (loading) {
        return (
            <PlaceholderImage
                title={title}
                height="400px"
                message="Loading Hydrograph Data..."
            />
        );
    }

    if (error || !data || data.length === 0) {
        return (
            <PlaceholderImage
                title={title}
                height="400px"
                message={error || "No Data Available for Hydrograph"}
            />
        );
    }

    const renderChart = (fixed) => (
        <ComposedChart
            width={fixed ? 500 : undefined}
            height={fixed ? 200 : undefined}
            data={processedData}
            margin={{ top: 10, right: 10, bottom: fixed ? 60 : 40, left: 10 }}
        >
            <CartesianGrid stroke={fixed ? "#eee" : "#f1f5f9"} strokeDasharray="3 3" vertical={false} />
            <XAxis
                dataKey="year"
                scale="point"
                padding={{ left: 15, right: 15 }}
                axisLine={{ stroke: '#ccc' }}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 700, fill: fixed ? '#000' : '#475569' }}
            />
            <YAxis
                yAxisId="left"
                orientation="left"
                axisLine={{ stroke: '#ccc' }}
                tickLine={false}
                tick={{ fontSize: 9, fill: fixed ? '#000' : '#4299e1' }}
                label={{ value: 'Rain (mm)', angle: -90, position: 'insideLeft', fontSize: 10, fontWeight: 700, fill: fixed ? '#000' : '#4299e1', offset: 10 }}
            />
            <YAxis
                yAxisId="right"
                orientation="right"
                reversed={true}
                axisLine={{ stroke: '#ccc' }}
                tickLine={false}
                tick={{ fontSize: 9, fill: fixed ? '#000' : '#f59e0b' }}
                label={{ value: 'DTW (mbgl)', angle: 90, position: 'insideRight', fontSize: 10, fontWeight: 700, fill: fixed ? '#000' : '#f59e0b', offset: 15 }}
            />
            <Tooltip
                contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={(value, name) => [value ? `${value} ${name.includes('Rain') ? 'mm' : 'mbgl'}` : 'N/A', name]}
            />
            <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={fixed ? { bottom: 0, paddingBottom: '10px' } : { paddingTop: '25px', paddingBottom: '10px' }}
                formatter={(value) => <span style={{ color: '#000', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', paddingRight: '12px' }}>{value}</span>}
            />
            <Bar yAxisId="left" dataKey="rainfall" name="Rainfall" barSize={fixed ? 10 : 20} fill="#3b82f6" fillOpacity={0.6} radius={[2, 2, 0, 0]} isAnimationActive={false} />
            <Line type="monotone" yAxisId="right" dataKey="post" name="Post-Mon" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} isAnimationActive={false} />
            <Line type="monotone" yAxisId="right" dataKey="pre" name="Pre-Mon" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} isAnimationActive={false} />
            <Line type="linear" yAxisId="right" dataKey="postTrend" name="Post-Trend" stroke="#10b981" strokeWidth={1.5} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
            <Line type="linear" yAxisId="right" dataKey="preTrend" name="Pre-Trend" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 5" dot={false} isAnimationActive={false} />

        </ComposedChart >
    );

    return (
        <div className="chart-figure" style={{ width: '100%', margin: '0', pageBreakInside: 'avoid' }}>
            <div className="chart-title" style={{ marginBottom: '2px', padding: '5px 0' }}>{title}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', marginBottom: '10px', fontStyle: 'italic' }}>
                (Decadal Trend: 2015 - 2024)
            </div>

            {/* SCREEN VERSION */}
            <div className="screen-only" style={{ width: '100%', height: '400px', backgroundColor: '#fff', border: 'none', borderRadius: '0', overflow: 'visible', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart(false)}
                </ResponsiveContainer>
            </div>

            {/* PRINT VERSION */}
            <div className="print-only" style={{ width: '100%', height: '200px', backgroundColor: '#fff', border: 'none', borderRadius: '0', overflow: 'visible', position: 'relative' }}>
                <div style={{ height: '100%', width: '500px', margin: '0 auto' }}>
                    {renderChart(true)}
                </div>
            </div>
        </div>
    );
};

export default Hydrograph;
