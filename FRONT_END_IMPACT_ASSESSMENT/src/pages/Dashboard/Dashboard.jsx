import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocationSearch } from '../../hooks/useLocationSearch';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import './Dashboard.css';

const Dashboard = () => {
    useScrollToTop();
    const navigate = useNavigate();
    const {
        districts,
        blocks,
        gps,
        selectedDistrict,
        selectedBlock,
        selectedGp,
        loading,
        handleDistrictChange,
        handleBlockChange,
        handleGpChange,
        getSelectedNames
    } = useLocationSearch();

    const handleStartClick = () => {
        if (!selectedGp) return;

        const { districtName, blockName, gpName } = getSelectedNames();

        navigate('/impact-assessment', {
            state: {
                districtId: selectedDistrict,
                blockId: selectedBlock,
                gpId: selectedGp,
                districtName,
                blockName,
                gpName
            }
        });
    };

    const rajasthanBoundary = "M 152.80,9.11 L 146.35,13.52 L 138.78,15.68 L 133.07,20.04 L 130.74,27.57 L 127.18,34.54 L 123.15,41.30 L 118.87,47.82 L 111.54,50.72 L 104.64,54.53 L 98.36,58.98 L 95.53,66.30 L 90.98,72.46 L 85.47,77.95 L 82.06,84.07 L 74.53,86.09 L 66.68,86.46 L 59.10,88.56 L 51.84,91.62 L 45.22,88.83 L 41.62,82.21 L 34.32,81.38 L 28.13,86.11 L 23.96,92.69 L 19.34,98.73 L 13.79,104.26 L 7.85,109.39 L 5.38,116.81 L 6.61,123.84 L 13.71,127.18 L 21.20,128.37 L 27.68,130.98 L 27.25,138.78 L 24.45,145.83 L 27.14,152.97 L 32.43,158.33 L 40.14,158.44 L 44.14,161.89 L 45.04,169.07 L 50.01,174.99 L 52.66,182.17 L 56.49,188.98 L 62.53,193.30 L 68.96,192.87 L 76.10,192.56 L 81.96,193.73 L 86.34,193.15 L 91.26,192.90 L 98.07,193.88 L 97.47,195.81 L 102.40,198.28 L 105.71,197.46 L 111.18,201.16 L 118.10,203.16 L 121.11,198.34 L 124.10,201.34 L 127.04,203.53 L 124.25,208.64 L 128.33,213.14 L 133.12,210.28 L 134.36,216.87 L 134.95,221.74 L 138.60,226.81 L 141.91,229.39 L 144.94,233.40 L 150.23,235.29 L 155.09,236.89 L 158.25,241.35 L 163.28,243.59 L 169.03,244.34 L 175.51,241.25 L 177.31,238.71 L 171.49,236.57 L 175.29,231.89 L 181.39,229.03 L 184.40,223.87 L 184.19,216.98 L 185.63,210.57 L 182.77,204.93 L 180.05,201.72 L 179.65,198.10 L 180.02,193.88 L 180.39,188.55 L 183.84,192.32 L 187.40,187.95 L 182.27,186.97 L 182.93,182.82 L 188.46,185.64 L 191.86,181.46 L 197.16,179.54 L 197.17,183.59 L 196.87,185.36 L 198.39,186.53 L 194.21,184.32 L 193.22,188.99 L 199.96,190.82 L 207.17,191.29 L 214.04,189.54 L 215.82,194.10 L 216.84,199.09 L 211.78,199.95 L 213.89,204.52 L 212.40,209.54 L 212.37,213.71 L 207.36,214.23 L 202.22,216.54 L 206.23,220.67 L 210.62,219.43 L 213.82,218.31 L 219.22,214.78 L 224.09,211.06 L 225.10,204.46 L 228.51,206.74 L 234.66,206.85 L 239.39,206.81 L 242.49,206.91 L 247.90,209.68 L 249.22,205.56 L 247.89,199.12 L 250.30,196.37 L 254.82,196.77 L 253.21,190.36 L 247.58,188.22 L 250.90,184.98 L 249.21,179.95 L 256.39,178.75 L 262.77,178.07 L 266.61,174.23 L 264.73,169.08 L 260.31,168.96 L 255.17,170.24 L 249.10,170.35 L 242.29,169.49 L 237.80,164.15 L 235.70,157.64 L 239.68,152.06 L 245.39,149.98 L 250.27,144.72 L 256.85,141.28 L 263.35,137.99 L 268.35,134.54 L 275.20,131.57 L 280.60,128.35 L 286.50,124.98 L 289.86,121.70 L 292.48,118.66 L 290.71,116.33 L 286.77,119.45 L 282.57,118.50 L 276.80,118.58 L 270.18,120.73 L 267.51,122.30 L 270.33,117.61 L 277.16,115.23 L 274.50,114.06 L 269.79,111.72 L 275.18,108.50 L 272.71,103.68 L 266.81,100.30 L 264.36,95.06 L 263.01,89.73 L 258.43,88.74 L 253.96,88.15 L 252.43,91.15 L 250.10,91.43 L 250.85,85.19 L 251.51,78.16 L 247.18,74.61 L 242.11,78.51 L 237.70,82.66 L 235.85,79.10 L 233.26,76.86 L 231.29,77.31 L 229.86,80.91 L 226.42,81.02 L 226.63,86.42 L 222.18,86.51 L 217.60,83.72 L 219.66,80.44 L 217.97,78.72 L 222.91,76.43 L 219.08,71.20 L 213.36,68.11 L 208.92,64.24 L 204.71,59.16 L 203.05,52.05 L 201.29,47.78 L 199.87,42.96 L 197.67,39.80 L 192.15,40.31 L 185.97,39.34 L 180.91,35.41 L 174.81,37.74 L 172.57,33.32 L 173.17,27.34 L 170.45,24.11 L 171.49,18.82 L 165.34,17.17 L 157.48,16.69 L 150.08,15.87 L 152.80,9.11 Z";

    return (
        <div className="dashboard-container">
            <div className="filter-bar glass-effect">
                <div className="filter-group">
                    <span className="filter-label">State</span>
                    <div className="filter-value">RAJASTHAN</div>
                </div>

                <div className="filter-group">
                    <select
                        className="filter-select"
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        disabled={loading}
                    >
                        <option value="">Select District</option>
                        {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <select
                        className="filter-select"
                        value={selectedBlock}
                        onChange={(e) => handleBlockChange(e.target.value)}
                        disabled={loading || !selectedDistrict}
                    >
                        <option value="">Select Block</option>
                        {blocks.map(b => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
                    </select>
                </div>

                <div className="filter-group">
                    <select
                        className="filter-select"
                        value={selectedGp}
                        onChange={(e) => handleGpChange(e.target.value)}
                        disabled={loading || !selectedBlock}
                    >
                        <option value="">Select Gram Panchayat</option>
                        {gps.map(g => <option key={g.id} value={g.id}>{g.name.toUpperCase()}</option>)}
                    </select>
                </div>

                {loading && <div className="spinner-small"></div>}
            </div>

            <div className="timeline-container map-view">
                <div className="map-background">
                    <svg viewBox="-300 -350 950 950" className="rajasthan-svg" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <path id="circlePath" d="M 154, 549 a 420,420 0 1,1 0,-840 a 420,420 0 1,1 0,840" />
                            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.05" />
                                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.1" />
                            </linearGradient>
                        </defs>
                        <path d={rajasthanBoundary} className="map-path" transform="translate(154, 129) scale(2.5) translate(-154, -129)" fill="url(#mapGradient)" />
                        <text className="map-text-title" fontSize="42" fontWeight="800" letterSpacing="6">
                            <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                                GROUND WATER IMPACT ASSESSMENT MODULE
                            </textPath>
                        </text>
                    </svg>
                </div>

                <div className="timeline-items" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
                    <div className={`impact-start-card glass-effect ${selectedGp ? 'active' : ''}`} style={{
                        padding: '2.5rem',
                        borderRadius: '20px',
                        maxWidth: '480px',
                        textAlign: 'center',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: 'var(--shadow-lg)',
                        background: 'rgba(30, 41, 59, 0.7)',
                        backdropFilter: 'blur(20px)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: selectedGp ? 'scale(1)' : 'scale(0.95)',
                        opacity: selectedGp ? 1 : 0.8,
                        zIndex: 10
                    }}>
                        <div className="card-icon-glow" style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            color: 'var(--primary)',
                            fontSize: '2rem'
                        }}>
                            📊
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--text-main)' }}>Impact Assessment</h2>
                        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
                            {selectedGp 
                                ? 'Evaluate the hydrological outcomes, radius of influence, tubewells inventory, and mining seepage calculations for the selected Gram Panchayat.'
                                : 'Please select District, Block, and Gram Panchayat above to unlock the Impact Assessment calculations.'
                            }
                        </p>
                        <button
                            onClick={handleStartClick}
                            disabled={!selectedGp}
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '1rem 2rem',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                border: 'none',
                                background: selectedGp ? 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)' : 'rgba(255, 255, 255, 0.05)',
                                color: selectedGp ? '#ffffff' : 'rgba(255, 255, 255, 0.3)',
                                cursor: selectedGp ? 'pointer' : 'not-allowed',
                                boxShadow: selectedGp ? '0 4px 14px rgba(59, 130, 246, 0.4)' : 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {selectedGp ? 'Start Impact Assessment' : 'Location Not Selected'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
