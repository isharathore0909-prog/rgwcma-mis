
import React from 'react';
import ReportSection from '../ReportSection';

export const ChapterTubewells = ({ entries = [], isEditing, onChange, onAdd }) => (
    <ReportSection>
        <thead>
            <tr><th colSpan="8">4. DETAILS OF PROPOSED / EXISTING TUBEWELLS/ BOREWELLS</th></tr>
            <tr className="table-sub-header">
                <td>Structure Detail</td>
                <td>Aquifer wise Parameters</td>
                <td>Drilling Depth (m)</td>
                <td>Diameter (mm)</td>
                <td>Lithological Log</td>
                <td>Pump H.P.</td>
                <td>Discharge (lps/m³/day)</td>
                <td>Usage</td>
            </tr>
        </thead>
        <tbody>
            {entries.map((entry) => (
                <tr key={entry.id}>
                    <td>
                        {isEditing ? (
                            <input
                                type="text"
                                className="edit-input"
                                style={{ textAlign: 'left' }}
                                value={entry.detail || ''}
                                onChange={(e) => onChange(entry.id, 'detail', e.target.value)}
                            />
                        ) : (
                            entry.detail || ''
                        )}
                    </td>
                    <td className="annex-val">
                        {isEditing ? (
                            <input
                                type="text"
                                className="edit-input"
                                value={entry.aquifer || ''}
                                onChange={(e) => onChange(entry.id, 'aquifer', e.target.value)}
                            />
                        ) : (
                            entry.aquifer || ''
                        )}
                    </td>
                    <td className="annex-val">
                        {isEditing ? (
                            <input
                                type="text"
                                className="edit-input"
                                value={entry.depth || ''}
                                onChange={(e) => onChange(entry.id, 'depth', e.target.value)}
                            />
                        ) : (
                            entry.depth || ''
                        )}
                    </td>
                    <td className="annex-val">
                        {isEditing ? (
                            <input
                                type="text"
                                className="edit-input"
                                value={entry.diameter || ''}
                                onChange={(e) => onChange(entry.id, 'diameter', e.target.value)}
                            />
                        ) : (
                            entry.diameter || ''
                        )}
                    </td>
                    <td className="annex-val">
                        {isEditing ? (
                            <input
                                type="text"
                                className="edit-input"
                                value={entry.log || ''}
                                onChange={(e) => onChange(entry.id, 'log', e.target.value)}
                            />
                        ) : (
                            entry.log || ''
                        )}
                    </td>
                    <td className="annex-val">
                        {isEditing ? (
                            <input
                                type="text"
                                className="edit-input"
                                value={entry.hp || ''}
                                onChange={(e) => onChange(entry.id, 'hp', e.target.value)}
                            />
                        ) : (
                            entry.hp || ''
                        )}
                    </td>
                    <td className="annex-val">
                        {isEditing ? (
                            <input
                                type="text"
                                className="edit-input"
                                value={entry.discharge || ''}
                                onChange={(e) => onChange(entry.id, 'discharge', e.target.value)}
                            />
                        ) : (
                            entry.discharge || ''
                        )}
                    </td>
                    <td className="annex-val">
                        {isEditing ? (
                            <input
                                type="text"
                                className="edit-input"
                                value={entry.usage || ''}
                                onChange={(e) => onChange(entry.id, 'usage', e.target.value)}
                            />
                        ) : (
                            entry.usage || ''
                        )}
                    </td>
                </tr>
            ))}
            {entries.length === 0 && (
                <tr>
                    <td colSpan="8" className="annex-center">No Tubewell Data Available</td>
                </tr>
            )}
        </tbody>
        {isEditing && (
            <tfoot>
                <tr>
                    <td colSpan="8" style={{ padding: '10px', borderTop: 'none' }}>
                        <button className="btn-add-row no-print" onClick={onAdd}>
                            + Add New Tubewell
                        </button>
                    </td>
                </tr>
            </tfoot>
        )}
    </ReportSection>
);
