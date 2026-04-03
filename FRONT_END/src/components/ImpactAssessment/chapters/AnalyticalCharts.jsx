
import React from 'react';
import ReportSection from '../ReportSection';
import AnalyticalChartsSection from '../AnalyticalChartsSection';

export const AnalyticalCharts = ({ gpId, isPrint, reportType }) => (
    <>
        <ReportSection>
            <thead>
                <tr><th>ANALYTICAL DATA VISUALIZATION</th></tr>
            </thead>
        </ReportSection>
        <section className="report-data-section">
            <AnalyticalChartsSection gpId={gpId} isPrint={isPrint} reportType={reportType} />
        </section>
    </>
);
