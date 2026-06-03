import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const PrintHeaderFooter = ({ title, metaData }) => {
    const { t } = useLanguage();

    return null; // The logic is now handled by sub-components
};

// Sub-component for table header
export const RepeatingHeader = ({ title, t }) => (
    <div className="header-group-content">
        <div className="mini-branding-section">
            <img src="/logos/logo-black.png" alt="Logo" className="mini-print-logo" />
            <div className="mini-separator" />
            <div className="mini-title-wrapper">
                <span className="mini-authority">{t('department_name')}</span>
                <span className="mini-report-title">{title}</span>
            </div>
        </div>
        <img src="/logos/india-emblem.png" alt="Emblem" className="mini-print-emblem" />
    </div>
);

// Sub-component for table footer
export const RepeatingFooter = ({ metaData }) => (
    <div className="footer-group-content">
        <span className="footer-left">MIS - RSGWA | {metaData?.gpName || ''} {metaData?.block || ''}</span>
        <span className="footer-center">Generated on {new Date().toLocaleDateString('en-GB')}</span>
        <span className="footer-right"></span>
    </div>
);

export default PrintHeaderFooter;
