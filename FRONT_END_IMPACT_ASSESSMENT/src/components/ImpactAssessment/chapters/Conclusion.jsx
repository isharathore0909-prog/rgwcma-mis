
import React from 'react';
import ReportSection from '../ReportSection';

export const ChapterConclusion = ({ analysis, isEditing, onAnalysisChange }) => (
    <ReportSection>
        <tbody>
            <tr className="section-head after-water-balance"><td colSpan="2">6. WATER BALANCE, RECYCLE AND REUSE</td></tr>
            <tr>
                <td>Recycling Percentage</td>
                <td className="val-text">
                    {isEditing ? (
                        <input
                            type="text"
                            className="edit-input"
                            value={analysis?.recyclingRate || ''}
                            onChange={(e) => onAnalysisChange('recyclingRate', e.target.value)}
                        />
                    ) : (
                        <span className="value-box">{analysis?.recyclingRate || ''}</span>
                    )}
                </td>
            </tr>

            <tr className="section-head"><td colSpan="2">7. SALINE WATER DISPOSAL STRATEGIES</td></tr>
            <tr>
                <td>Requirement</td>
                <td className="val-text">
                    {isEditing ? (
                        <input
                            type="text"
                            className="edit-input"
                            value={analysis?.salineRequirement || ''}
                            onChange={(e) => onAnalysisChange('salineRequirement', e.target.value)}
                        />
                    ) : (
                        analysis?.salineRequirement || ''
                    )}
                </td>
            </tr>

            <tr className="section-head"><td colSpan="2">8. ANY OTHER DETAILS</td></tr>
            <tr>
                <td>Monitoring Inf</td>
                <td className="val-text">
                    {isEditing ? (
                        <input
                            type="text"
                            className="edit-input"
                            value={analysis?.monitoring || ''}
                            onChange={(e) => onAnalysisChange('monitoring', e.target.value)}
                        />
                    ) : (
                        analysis?.monitoring || ''
                    )}
                </td>
            </tr>

            <tr className="section-head"><td colSpan="2">9. SUMMARY AND CONCLUSION</td></tr>
            <tr>
                <td colSpan="2" className="centered-cell">
                    {isEditing ? (
                        <textarea
                            className="edit-input"
                            style={{ textAlign: 'left', minHeight: '80px' }}
                            value={analysis?.conclusionText || (analysis?.recyclingRate === '45.0%'
                                ? "Sustainable impact confirmed with enhanced industrial recycling targets."
                                : "Sustainable impact confirmed with high recharge efficiency.")
                            }
                            onChange={(e) => onAnalysisChange('conclusionText', e.target.value)}
                        />
                    ) : (
                        <p className="summary-text">
                            {analysis?.conclusionText || (analysis?.recyclingRate === '45.0%'
                                ? "Sustainable impact confirmed with enhanced industrial recycling targets."
                                : "Sustainable impact confirmed with high recharge efficiency.")
                            }
                        </p>
                    )}
                </td>
            </tr>

            <tr className="section-head"><td colSpan="2">10. ACCREDITATION CERTIFICATE</td></tr>
            <tr>
                <td colSpan="2" className="centered-cell">
                    <p className="summary-text">Accredited by NABET / SPMU Certification</p>
                </td>
            </tr>
        </tbody>
    </ReportSection>
);
