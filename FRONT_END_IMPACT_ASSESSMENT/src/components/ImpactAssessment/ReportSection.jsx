import React from 'react';

const ReportSection = ({ children }) => (
    <section className="report-data-section">
        <table className="report-data-table">
            {children}
        </table>
    </section>
);

export default ReportSection;
