import React from 'react';

const ReportBreadcrumb = ({ state, district, block, gp, year }) => (
    <nav className="wa-report-breadcrumb">
        <span>State: {state} »</span>
        <span>District: {district} »</span>
        <span>Block: {block} »</span>
        <span>Gram Panchayat: {gp} »</span>
        <span>Year: {year}</span>
    </nav>
);

export default ReportBreadcrumb;
