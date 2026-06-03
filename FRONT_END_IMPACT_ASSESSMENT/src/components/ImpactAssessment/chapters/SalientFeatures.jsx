
import React from 'react';
import ReportSection from '../ReportSection';

export const ChapterSalientFeatures = ({ metaData, isEditing, onChange }) => (
    <ReportSection>
        <thead>
            <tr><th colSpan="2">1. SALIENT FEATURES OF THE PROPOSAL</th></tr>
        </thead>
        <tbody>
            <tr>
                <td>Name of Project</td>
                <td className="val-text">
                    {isEditing ? (
                        <input
                            type="text"
                            className="edit-input"
                            value={metaData.projectName || ''}
                            onChange={(e) => onChange('projectName', e.target.value)}
                        />
                    ) : (
                        metaData.projectName || ''
                    )}
                </td>
            </tr>
            <tr>
                <td>NOC Application Number</td>
                <td className="val-text">
                    {isEditing ? (
                        <input
                            type="text"
                            className="edit-input"
                            value={metaData.accreditationNo || ''}
                            onChange={(e) => onChange('accreditationNo', e.target.value)}
                        />
                    ) : (
                        metaData.accreditationNo || ''
                    )}
                </td>
            </tr>
            <tr>
                <td>Geographical Coordinates</td>
                <td className="val-text">
                    {isEditing ? (
                        <input
                            type="text"
                            className="edit-input"
                            value={metaData.coordinates || ''}
                            onChange={(e) => onChange('coordinates', e.target.value)}
                        />
                    ) : (
                        metaData.coordinates || ''
                    )}
                </td>
            </tr>
            <tr>
                <td>Total Site Area</td>
                <td className="val-text">
                    {isEditing ? (
                        <input
                            type="text"
                            className="edit-input"
                            value={metaData.totalSiteArea || ''}
                            onChange={(e) => onChange('totalSiteArea', e.target.value)}
                        />
                    ) : (
                        metaData.totalSiteArea || ''
                    )}
                </td>
            </tr>
        </tbody>
    </ReportSection>
);
