import React, { Suspense, lazy, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components';
import { LanguageProvider } from './context/LanguageContext';
import { ASSET_URLS } from './api/config';
import ScrollToTop from './components/Shared/ScrollToTop';
import BackToTop from './components/Shared/BackToTop';
import './index.css';

// Lazy load components for performance optimization
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const GramPanchayat = lazy(() => import('./pages/GramPanchayat/GramPanchayat'));
const WaterAvailabilityPage = lazy(() => import('./pages/WaterAvailability/WaterAvailabilityPage'));
const WaterUtilizationPage = lazy(() => import('./pages/WaterUtilization/WaterUtilizationPage'));
const WaterBalancePage = lazy(() => import('./pages/WaterBalance/WaterBalancePage'));
const WaterBudgetPage = lazy(() => import('./pages/WaterBudget/WaterBudgetPage'));
const DemandSideManagementPage = lazy(() => import('./pages/Management/DemandSideManagementPage'));
const SupplySideManagementPage = lazy(() => import('./pages/Management/SupplySideManagementPage'));
const ImpactAssessmentPage = lazy(() => import('./pages/ImpactAssessment/ImpactAssessmentPage'));
const FinalReportPage = lazy(() => import('./pages/FinalReport/FinalReportPage'));

const PageLoader = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        fontSize: '1.2rem',
        color: 'var(--text-muted)',
        fontFamily: 'Outfit, sans-serif'
    }}>
        <div className="loader-orbit">
            <span>Loading...</span>
        </div>
    </div>
);

function App() {
    useLayoutEffect(() => {
        // Inject Google Fonts
        if (!document.getElementById('google-fonts')) {
            const link = document.createElement('link');
            link.id = 'google-fonts';
            link.rel = 'stylesheet';
            link.href = ASSET_URLS.fonts;
            document.head.appendChild(link);
        }

        // Inject Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
            const link = document.createElement('link');
            link.id = 'leaflet-css';
            link.rel = 'stylesheet';
            link.href = ASSET_URLS.leaflet_css;
            document.head.appendChild(link);
        }

        // Inject Leaflet JS
        if (!document.getElementById('leaflet-js')) {
            const script = document.createElement('script');
            script.id = 'leaflet-js';
            script.src = ASSET_URLS.leaflet_js;
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    return (
        <LanguageProvider>
            <Router>
                <ScrollToTop />
                <BackToTop />
                <div className="App">
                    <Header />
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/gram-panchayat" element={<GramPanchayat />} />
                            <Route path="/water-availability" element={<WaterAvailabilityPage />} />
                            <Route path="/water-utilization" element={<WaterUtilizationPage />} />
                            <Route path="/water-balance" element={<WaterBalancePage />} />
                            <Route path="/water-budget" element={<WaterBudgetPage />} />
                            <Route path="/demand-side-management" element={<DemandSideManagementPage />} />
                            <Route path="/supply-side-management" element={<SupplySideManagementPage />} />
                            <Route path="/impact-assessment" element={<ImpactAssessmentPage />} />
                            <Route path="/final-report" element={<FinalReportPage />} />
                        </Routes>
                    </Suspense>
                </div>
            </Router>
        </LanguageProvider>
    );
}

export default App;

