
import React from 'react';
import ReportSection from '../ReportSection';

export const ChapterMiningPlan = ({ data, isEditing, onChange, onAddRow }) => (
    <>
        <ReportSection>
            <thead>
                <tr><th colSpan="2">4. APPROVED MINE PLAN</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td>Details</td>
                    <td className="val-text">
                        {isEditing ? (
                            <input
                                type="text"
                                className="edit-input"
                                value={data?.minePlanDetails || ''}
                                onChange={(e) => onChange('minePlanDetails', e.target.value)}
                            />
                        ) : (
                            data?.minePlanDetails || 'Year wise plan including excavation depth and area. Seepage KLD/KLY included.'
                        )}
                    </td>
                </tr>
            </tbody>
        </ReportSection>


        <ReportSection>
            <thead>
                <tr><th colSpan="11">5.1 ESTIMATION OF MINE SEEPAGE (From Walls of Pit/Tunnel)</th></tr>
                <tr className="table-sub-header">
                    <td>Year</td><td>Period</td><td>Bench RL (m)</td><td>Water RL (m)</td><td>Face Length</td><td>Face Width</td><td>Sat. Thick</td><td>Gradient</td><td>Hyd. Cond.</td><td>Seepage/Day</td><td>Annual</td>
                </tr>
            </thead>
            <tbody>
                {(data?.estimationWalls || [
                    { id: 'w1', year: 'Year 1', period: 'Pre' },
                    { id: 'w2', year: 'Year 1', period: 'Post' }
                ]).map((row, idx) => (
                    <tr key={row.id || idx}>
                        <td>{row.year}</td>
                        <td>{row.period}</td>
                        {['benchRL', 'waterRL', 'faceLength', 'faceWidth', 'satThick', 'gradient', 'hydCond', 'seepageDay', 'annual'].map(field => (
                            <td key={field} className="annex-val">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="edit-input"
                                        value={row[field] || ''}
                                        onChange={(e) => onChange('estimationWalls', e.target.value, row.id, field)}
                                    />
                                ) : (
                                    row[field] || ''
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
            {isEditing && (
                <tfoot>
                    <tr>
                        <td colSpan="11" style={{ padding: '10px', borderTop: 'none' }}>
                            <button className="btn-add-row no-print" onClick={() => onAddRow('estimationWalls')}>
                                + Add Estimation Row (Walls)
                            </button>
                        </td>
                    </tr>
                </tfoot>
            )}
        </ReportSection>


        <ReportSection>
            <thead>
                <tr><th colSpan="5">5.2 SEEPAGE FROM BOTTOM OF THE PIT</th></tr>
                <tr className="table-sub-header">
                    <td>Year</td><td>Period</td><td>Hyd. Conductivity</td><td>Seepage / Day</td><td>Annual Mine Seepage</td>
                </tr>
            </thead>
            <tbody>
                {(data?.estimationBottom || [
                    { id: 'b1', year: 'Year 1', period: 'Pre-Monsoon' },
                    { id: 'b2', year: 'Year 1', period: 'Post-Monsoon' }
                ]).map((row, idx) => (
                    <tr key={row.id || idx}>
                        <td>{row.year}</td>
                        <td>{row.period}</td>
                        {['hydCond', 'seepageDay', 'annualSeepage'].map(field => (
                            <td key={field} className="annex-val">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="edit-input"
                                        value={row[field] || ''}
                                        onChange={(e) => onChange('estimationBottom', e.target.value, row.id, field)}
                                    />
                                ) : (
                                    row[field] || ''
                                )}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
            {isEditing && (
                <tfoot>
                    <tr>
                        <td colSpan="5" style={{ padding: '10px', borderTop: 'none' }}>
                            <button className="btn-add-row no-print" onClick={() => onAddRow('estimationBottom')}>
                                + Add Estimation Row (Bottom)
                            </button>
                        </td>
                    </tr>
                </tfoot>
            )}
        </ReportSection>


        <ReportSection>
            <thead>
                <tr><th colSpan="3">ANNUAL MINE SEEPAGE SUMMARY (Table 5.1 + 5.2)</th></tr>
                <tr className="table-sub-header">
                    <td>Year</td><td>Period</td><td>Annual Mine Seepage (m³/Year)</td>
                </tr>
            </thead>
            <tbody>
                {(data?.seepageSummary || [
                    { id: 's1', year: 'Year 1', period: 'Pre / Post' },
                    { id: 's2', year: 'Year 2', period: 'Pre / Post' },
                    { id: 's3', year: 'Year 3', period: 'Pre / Post' },
                    { id: 's4', year: 'Year 4', period: 'Pre / Post' },
                    { id: 's5', year: 'Year 5', period: 'Pre / Post' }
                ]).map((row, idx) => (
                    <tr key={row.id || idx}>
                        <td>{row.year}</td>
                        <td>{row.period}</td>
                        <td className="val">
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="edit-input"
                                    value={row.annualSeepage || ''}
                                    onChange={(e) => onChange('seepageSummary', e.target.value, row.id, 'annualSeepage')}
                                />
                            ) : (
                                row.annualSeepage || ''
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
            {isEditing && (
                <tfoot>
                    <tr>
                        <td colSpan="3" style={{ padding: '10px', borderTop: 'none' }}>
                            <button className="btn-add-row no-print" onClick={() => onAddRow('seepageSummary')}>
                                + Add Summary Year
                            </button>
                        </td>
                    </tr>
                </tfoot>
            )}
            <tfoot>
                <tr>
                    <td colSpan="3" className="technical-note">
                        <p>• Hydraulic Conductivity based on Pumping Test capturing hydrogeological boundaries.</p>
                        <p>• Hydraulic Gradient calculated based on the ground water slope at the Mining Pit Area.</p>
                    </td>
                </tr>
            </tfoot>
        </ReportSection>


        <ReportSection>
            <thead>
                <tr><th colSpan="2">5.3 ADVANCED DEWATERING PLAN (COAL/LIGNITE)</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td>Applicability</td>
                    <td className="val-text">
                        {isEditing ? (
                            <input
                                type="text"
                                className="edit-input"
                                value={data?.dewateringPlan || ''}
                                onChange={(e) => onChange('dewateringPlan', e.target.value)}
                            />
                        ) : (
                            data?.dewateringPlan || ''
                        )}
                    </td>
                </tr>
            </tbody>
            <thead>
                <tr><th colSpan="2">5.4 GW MODELLING CHAPTER</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td>Modelling Status</td>
                    <td className="val-text">
                        {isEditing ? (
                            <input
                                type="text"
                                className="edit-input"
                                value={data?.modellingStatus || ''}
                                onChange={(e) => onChange('modellingStatus', e.target.value)}
                            />
                        ) : (
                            data?.modellingStatus || ''
                        )}
                    </td>
                </tr>
            </tbody>
        </ReportSection>
    </>
);
