import React from 'react';

const ChapterSection = ({ title, children, hasSpacer = true, colSpan = 4 }) => (
    <>
        <section className="report-data-section">
            <table className="report-data-table">
                {title && (
                    <thead>
                        <tr><th colSpan={colSpan}>{title}</th></tr>
                    </thead>
                )}
                {children}
            </table>
        </section>
        {hasSpacer && <div className="report-spacer"></div>}
    </>
);

export default ChapterSection;
