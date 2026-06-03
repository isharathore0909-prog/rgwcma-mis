import React, { memo } from 'react';
import './ProcessCard.css';

import gramPanchayat from '../../assets/flow_images/gram_panchayat.png';
import waterAvailability from '../../assets/flow_images/water_availability.png';
import waterUtilization from '../../assets/flow_images/water_utilization.png';
import balance from '../../assets/flow_images/balance.png';
import waterBudget from '../../assets/flow_images/water_budget.png';
import demandSide from '../../assets/flow_images/demand_side.png';
import supplySide from '../../assets/flow_images/supply_side.png';
import impactAssessment from '../../assets/flow_images/impact_assessment.png';
import finalReport from '../../assets/flow_images/final_report.png';

const ProcessCard = memo(({ title, subtitle, stepNumber, color, position, style, onClick }) => {

    const iconMap = [
        gramPanchayat,
        waterAvailability,
        waterUtilization,
        balance,
        waterBudget,
        demandSide,
        supplySide,
        impactAssessment,
        finalReport
    ];

    const getIcon = (num) => {
        return iconMap[(num - 1) % iconMap.length];
    };

    return (
        <div
            className={`process-node ${position}`}
            style={{ ...style, '--node-color': color, cursor: onClick ? 'pointer' : 'default' }}
            onClick={onClick}
        >
            <div className="timeline-circle"></div>

            <div className="node-content glass-effect">
                <div className="step-header">
                    <span className="step-number">{stepNumber}</span>
                    <h3 className="step-title">{title}</h3>
                </div>

                <p className="step-description">{subtitle}</p>

                <div className="step-icon-container">
                    <img src={getIcon(stepNumber)} alt={title} className="process-icon-img" />
                </div>
            </div>
        </div>
    );
});

export default ProcessCard;
