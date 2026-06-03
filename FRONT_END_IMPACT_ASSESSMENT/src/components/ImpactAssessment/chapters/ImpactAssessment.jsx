
import React from 'react';
import ReportSection from '../ReportSection';

export const ChapterImpactAssessment = ({ reportType, analysis, isEditing, onAnalysisChange }) => (
    <ReportSection>
        <thead>
            <tr><th colSpan="2">{reportType === 'industry' ? '5.' : '6.'} IMPACT ASSESSMENT</th></tr>
        </thead>
        <tbody>
            <tr className="section-head"><td colSpan="2">{reportType === 'industry' ? '5.1' : '6.1'} Impact on the ground water regime</td></tr>
            <tr>
                <td>Affected Area (5yr Radius)</td>
                <td className="val-text">
                    {isEditing ? (
                        <input
                            type="text"
                            className="edit-input"
                            value={analysis?.roi || ''}
                            onChange={(e) => onAnalysisChange('roi', e.target.value)}
                        />
                    ) : (
                        analysis?.roi || ''
                    )}
                </td>
            </tr>
            <tr>
                <td>Expected Head Drop</td>
                <td className="val-text">
                    {isEditing ? (
                        <input
                            type="text"
                            className="edit-input"
                            value={analysis?.headDrop || ''}
                            onChange={(e) => onAnalysisChange('headDrop', e.target.value)}
                        />
                    ) : (
                        analysis?.headDrop || ''
                    )}
                </td>
            </tr>
            <tr className="section-head"><td colSpan="2">{reportType === 'industry' ? '5.2' : '6.2'} Impact on Surface water sources</td></tr>
            <tr>
                <td>Threat Assessment</td>
                <td className="val-text">
                    {isEditing ? (
                        <input
                            type="text"
                            className="edit-input"
                            value={analysis?.threat || ''}
                            onChange={(e) => onAnalysisChange('threat', e.target.value)}
                        />
                    ) : (
                        analysis?.threat || ''
                    )}
                </td>
            </tr>
            <tr className="section-head"><td colSpan="2">{reportType === 'industry' ? '5.3' : '6.3'} Impact on Water Quality</td></tr>
            <tr>
                <td>Regime Status</td>
                <td className="val-text">
                    {isEditing ? (
                        <input
                            type="text"
                            className="edit-input"
                            value={analysis?.qualityStatus || ''}
                            onChange={(e) => onAnalysisChange('qualityStatus', e.target.value)}
                        />
                    ) : (
                        analysis?.qualityStatus || ''
                    )}
                </td>
            </tr>
            <tr className="section-head"><td colSpan="2">{reportType === 'industry' ? '5.4' : '6.4'} Mitigation measures</td></tr>
            <tr>
                <td>Adopted Measures</td>
                <td className="val-text">
                    {isEditing ? (
                        <input
                            type="text"
                            className="edit-input"
                            value={analysis?.mitigation || ''}
                            onChange={(e) => onAnalysisChange('mitigation', e.target.value)}
                        />
                    ) : (
                        analysis?.mitigation || ''
                    )}
                </td>
            </tr>
            <tr className="section-head"><td colSpan="2">{reportType === 'industry' ? '5.5' : '6.5'} Saline water disposal Strategies</td></tr>
            <tr>
                <td>Treatment Technology</td>
                <td className="val-text">
                    {isEditing ? (
                        <input
                            type="text"
                            className="edit-input"
                            value={analysis?.treatment || ''}
                            onChange={(e) => onAnalysisChange('treatment', e.target.value)}
                        />
                    ) : (
                        analysis?.treatment || ''
                    )}
                </td>
            </tr>
            <tr className="section-head"><td colSpan="2">{reportType === 'industry' ? '5.6' : '6.6'} GW Modelling Chapter</td></tr>
            <tr>
                <td>SOP Status</td>
                <td className="val-text">
                    {isEditing ? (
                        <input
                            type="text"
                            className="edit-input"
                            value={analysis?.sopStatus || 'MODFLOW study included in Annexure II'}
                            onChange={(e) => onAnalysisChange('sopStatus', e.target.value)}
                        />
                    ) : (
                        analysis?.sopStatus || 'MODFLOW study included in Annexure II'
                    )}
                </td>
            </tr>
        </tbody>
    </ReportSection>
);
