
import React from 'react';
import ReportSection from '../ReportSection';

export const ChapterMiningManagement = ({ data, isEditing, onChange }) => (
    <>
        <ReportSection>
            <thead>
                <tr><th colSpan="2">6. MINE WATER MANAGEMENT</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td>drinking water (NBC Norms)</td>
                    <td className="val-text">
                        {isEditing ? (
                            <input
                                type="text"
                                className="edit-input"
                                value={data?.drinkingWater || ''}
                                onChange={(e) => onChange('drinkingWater', e.target.value)}
                            />
                        ) : (
                            data?.drinkingWater || ''
                        )}
                    </td>
                </tr>
                <tr>
                    <td>Irrigation / Green belt</td>
                    <td className="val-text">
                        {isEditing ? (
                            <input
                                type="text"
                                className="edit-input"
                                value={data?.irrigation || ''}
                                onChange={(e) => onChange('irrigation', e.target.value)}
                            />
                        ) : (
                            data?.irrigation || ''
                        )}
                    </td>
                </tr>
                <tr>
                    <td>Dust suppression / Recharge</td>
                    <td className="val-text">
                        {isEditing ? (
                            <input
                                type="text"
                                className="edit-input"
                                value={data?.dustSuppression || ''}
                                onChange={(e) => onChange('dustSuppression', e.target.value)}
                            />
                        ) : (
                            data?.dustSuppression || ''
                        )}
                    </td>
                </tr>
            </tbody>
        </ReportSection>
    </>
);
