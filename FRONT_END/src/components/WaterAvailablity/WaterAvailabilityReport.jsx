import React from 'react';
import './WaterAvailabilityReport.css';

// Reusable Shared Components
import ReportHeader from '../Shared/ReportHeader';
import ReportBreadcrumb from '../Shared/ReportBreadcrumb';

// Section Components
import WaterAvailabilityTable from './components/WaterAvailabilityTable';
import WaterAvailabilityChart from './components/WaterAvailabilityChart';

const WaterAvailabilityReport = ({ onBack, onNext, data, metadata }) => {
    // Current date and time
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB'); // dd/mm/yyyy
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const userMetadata = {
        state: metadata?.state || "Rajasthan_8",
        district: metadata?.district || "Ajmer_86",
        block: metadata?.block || "Ajmer Rural_7382",
        gp: metadata?.gpName || "Aradka_33827",
        year: "2023-24",
        userName: "SPMU_Rajasthan_8_nodal.atal@rajasthan.gov.in"
    };

    return (
        <div className="wa-report-paper-wrapper">
            <div className="wa-report-container printable-report">
                <ReportHeader
                    title="Water Availability Report"
                    metaData={userMetadata}
                    dateStr={dateStr}
                    timeStr={timeStr}
                />

                <ReportBreadcrumb
                    state={userMetadata.state}
                    district={userMetadata.district}
                    block={userMetadata.block}
                    gp={userMetadata.gp}
                    year={userMetadata.year}
                />

                <div className="wa-report-content">
                    {/* Chart Section (Top) */}
                    <WaterAvailabilityChart data={data} />

                    {/* Table Section (Bottom) */}
                    <WaterAvailabilityTable data={data} />
                </div>
            </div>

            <div className="wa-report-actions no-print">
                <button className="btn-back" onClick={onBack}>Back</button>
                <button className="btn-next" onClick={onNext}>Go to Water Utilization</button>
            </div>
        </div>
    );
};

export default WaterAvailabilityReport;
