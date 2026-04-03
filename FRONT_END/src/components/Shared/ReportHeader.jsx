import React from 'react';

const ReportHeader = ({ title, metaData, dateStr, timeStr, onPrint }) => (
    <header className="wa-report-header">
        <div className="report-branding-print">
            <img src="/logos/logo-black.png" alt="Logo" className="print-logo" />
            <div className="branding-text">
                <span className="authority-name">Rajasthan Ground Water (Conservation & Management) Authority</span>
                <span className="govt-label">GOVERNMENT OF RAJASTHAN</span>
            </div>
            <img src="/logos/india-emblem.png" alt="Emblem" className="print-emblem" />
        </div>
        <div className="title-area">
            <h1>{title}</h1>
            <button className="btn-download no-print" onClick={onPrint || (() => window.print())}>Print / Download PDF</button>
        </div>
        <div className="meta-info">
            <span>DATE : {dateStr}</span>
            <span>TIME : {timeStr}</span>
            <span>USER NAME : {metaData.userName ? metaData.userName.toUpperCase() : ''}</span>
        </div>
    </header>
);

export default ReportHeader;
