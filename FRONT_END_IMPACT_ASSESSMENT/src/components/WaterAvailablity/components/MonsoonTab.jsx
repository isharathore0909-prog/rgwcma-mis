import React from 'react';
import { InputRow, CalculatedRow, SectionHeader, MultiInputRow, SelectRow, CheckboxRow } from './FormHelpers';
import { GEC_NORMS } from '../../../utils/gecNorms';

const MonsoonTab = ({ formData = {}, handleChange }) => {
    // Helper to auto-fill factors
    const handleCanalTypeChange = (typeName) => {
        const selected = GEC_NORMS.canal_seepage.find(c => c.type === typeName);
        if (selected) {
            handleChange('rc_seepageFactor', selected.recommended);
        }
    };

    // Helper to format numbers safely with 2 decimals
    const formatNum = (num) => {
        const n = parseFloat(num);
        return isNaN(n) ? '0.00' : n.toFixed(2);
    };

    // Determine PD color class
    const pd = formData.percentDeviation ?? 0;
    const pdClass = Math.abs(pd) > 20 ? 'red-text' : 'green-text';

    // Adopted method label
    const adoptedMethod = formData.adoptedRainfallMethod || 'None';

    return (
        <section className="wa-section">
            <h3 className="wa-section-title">Monsoon Season Recharge (GEC 2015)</h3>
            <div className="wa-form-grid">
                <SelectRow
                    label="Assessment Unit Type:"
                    field="unitType"
                    value={formData.unitType || 'RURAL'}
                    options={[{ label: 'Rural', value: 'RURAL' }, { label: 'Urban', value: 'URBAN' }]}
                    onChange={handleChange}
                />
                <InputRow label="1. Current Monsoon Rainfall (mm):" field="currentMonsoonRainfall" value={formData.currentMonsoonRainfall} onChange={handleChange} />
                <InputRow label="2. Normal Monsoon Rainfall (mm):" field="normalMonsoonRainfall" value={formData.normalMonsoonRainfall} onChange={handleChange} />

                <SectionHeader title="Assessment Condition Indicators" />
                <div style={{ display: 'flex', gap: '20px', marginLeft: '25%' }}>
                    <CheckboxRow label="Pre-Monsoon Decline" field="hasSignificantDeclinePre" value={formData.hasSignificantDeclinePre} onChange={handleChange} />
                    <CheckboxRow label="Post-Monsoon Decline" field="hasSignificantDeclinePost" value={formData.hasSignificantDeclinePost} onChange={handleChange} />
                    <CheckboxRow label="Continuous Irrigation" field="isContinuousSupply" value={formData.isContinuousSupply} onChange={handleChange} />
                </div>

                <SectionHeader title="A. Recharge from Rainfall - Water Table Fluctuation Method" />
                <InputRow className="indented" label="Total Assessment Unit Area (ha):" field="areaHa" value={formData.areaHa} onChange={handleChange} />
                <InputRow className="indented" label=" &nbsp;&nbsp;• Saline Area (ha):" field="saline_area_ha" value={formData.saline_area_ha} onChange={handleChange} />
                <InputRow className="indented" label=" &nbsp;&nbsp;• Command Area (ha):" field="areaCommandHa" value={formData.areaCommandHa} onChange={handleChange} />
                <InputRow className="indented" label=" &nbsp;&nbsp;• Non-Command Area (ha):" field="areaNonCommandHa" value={formData.areaNonCommandHa} onChange={handleChange} />
                <InputRow className="indented" label="Average Pre-Monsoon Depth (mbgl):" field="preMonsoonDepth" step="0.01" value={formData.preMonsoonDepth} onChange={handleChange} />
                <InputRow className="indented" label="Average Post-Monsoon Depth (mbgl):" field="postMonsoonDepth" step="0.01" value={formData.postMonsoonDepth} onChange={handleChange} />
                <InputRow className="indented" label="Specific Yield (fraction, e.g. 0.02):" field="specificYield" step="0.001" value={formData.specificYield} onChange={handleChange} />
                <InputRow className="indented" label="Ground Water Extraction (Monsoon) (ha m):" field="gwExtractionMonsoon" step="0.01" value={formData.gwExtractionMonsoon} onChange={handleChange} />

                <SectionHeader title="B. Recharge from Other Sources (Monsoon)" />

                {parseFloat(formData.areaCommandHa) > 0 ? (
                    <>
                        {/* SW Irrigation */}
                        <MultiInputRow
                            label="1. SW Irrigation (Discharge * Hrs * Days * RFF):"
                            inputs={[
                                { placeholder: "m3/hr", value: formData.rswi_avgDischarge, onChange: v => handleChange('rswi_avgDischarge', v), title: "Avg Discharge (m3/hr)" },
                                { placeholder: "Hrs/Day", value: formData.rswi_pumpingHours, onChange: v => handleChange('rswi_pumpingHours', v), title: "Pumping Hours" },
                                { placeholder: "Days", value: formData.rswi_days ?? 120, onChange: v => handleChange('rswi_days', v), title: "Days" },
                                { placeholder: "RFF", value: formData.rswi_returnFlowFactor, onChange: v => handleChange('rswi_returnFlowFactor', v), title: "RFF" }
                            ]}
                        />
                        <CalculatedRow className="indented highlight-sub" label="Recharge from SW Irrigation (ha m):" value={formatNum(formData.gwRechargeFromIrrigationMonsoon)} />

                        {/* Canals */}
                        <SelectRow
                            className="indented"
                            label="Select Canal Formation:"
                            field="rc_canalType"
                            value={formData.rc_canalType}
                            options={[
                                { label: '-- Select Formation --', value: '' },
                                ...GEC_NORMS.canal_seepage.map(c => ({ label: c.type, value: c.type }))
                            ]}
                            onChange={(f, v) => {
                                handleChange(f, v);
                                handleCanalTypeChange(v);
                            }}
                        />
                        <MultiInputRow
                            label="2. Canals (Wetted Area * Days * Seepage Factor):"
                            inputs={[
                                { placeholder: "M sq.m", value: formData.rc_wettedArea, onChange: v => handleChange('rc_wettedArea', v), title: "Wetted Area (Million m2)" },
                                { placeholder: "Days", value: formData.rc_days ?? 120, onChange: v => handleChange('rc_days', v), title: "Days" },
                                { placeholder: "ham/day/Mm2", value: formData.rc_seepageFactor, onChange: v => handleChange('rc_seepageFactor', v), title: "Seepage Factor" }
                            ]}
                        />
                        <CalculatedRow className="indented highlight-sub" label="Recharge from Canals (ha m):" value={formatNum(formData.gwRechargeFromCanalsMonsoon)} />
                    </>
                ) : (
                    <div className="wa-hint-text" style={{ padding: '10px 25px', color: '#666' }}>
                        * SW Irrigation and Canal Seepage inputs are hidden because <strong>Command Area is 0</strong>.
                        Please define a Command Area above to enable these.
                    </div>
                )}

                {/* GW Irrigation */}
                <CalculatedRow className="indented highlight-sub" label="3. Recharge from GW Irrigation (RGWI) (ha m):" value={formatNum(formData.gwRechargeFromGWIirrigationMonsoon)} />


                {/* Tanks */}
                <MultiInputRow
                    label="4. Tanks & Ponds (Area * Days * RF):"
                    inputs={[
                        { placeholder: "Spread Area (ha)", value: formData.rtp_avgWaterSpreadArea, onChange: v => handleChange('rtp_avgWaterSpreadArea', v), title: "Spread Area (ha)" },
                        { placeholder: "Days", value: formData.rtp_days ?? 120, onChange: v => handleChange('rtp_days', v), title: "Days" },
                        { placeholder: "Recharge Factor", value: formData.rtp_rechargeFactor, onChange: v => handleChange('rtp_rechargeFactor', v), title: `Recharge Factor - GEC Rec: ${GEC_NORMS.tanks_and_ponds.recommended}` }
                    ]}
                />
                <CalculatedRow className="indented highlight-sub" label="Recharge from Tanks (ha m):" value={formatNum(formData.gwRechargeFromTanksMonsoon)} />

                {/* WCS */}
                <MultiInputRow
                    label="5. Water Cons. Structures (Storage * RF):"

                    inputs={[
                        { placeholder: "Gross Storage", value: formData.rwcs_grossStorage, onChange: v => handleChange('rwcs_grossStorage', v), title: "Gross Storage (ha m)" },
                        { placeholder: "RF (fraction)", value: formData.rwcs_rechargeFactor, onChange: v => handleChange('rwcs_rechargeFactor', v), title: `Recharge Factor - GEC Rec: ${GEC_NORMS.wcs.monsoon / 100.0}` }
                    ]}
                />
                <CalculatedRow className="indented highlight-sub" label="Recharge from WCS (ha m):" value={formatNum(formData.gwRechargeFromWCSMonsoon)} />

                {/* Urban Pipeline */}
                {formData.unitType === 'URBAN' && (
                    <>
                        <InputRow label="6. Pipeline Losses (leakage) (ha m):" field="pipelineLosses" value={formData.pipelineLosses} onChange={handleChange} />

                        <CalculatedRow className="indented highlight-sub" label="Recharge from Pipeline Leakage (50%) (ha m):" value={formatNum(formData.gwRechargeFromPipelines)} />
                    </>
                )}

                <CalculatedRow
                    className="label-only"
                    label="Total Recharge from Other Sources (ha m):"
                    value={formatNum(formData.gwRechargeOtherMonsoon)}
                    style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}
                />

                <CalculatedRow className="highlight" label="Calculated Recharge (Water Balance Equations) (ha m):" value={formatNum(formData.gwRechargeWtMethod)} />

                <div className="wa-section-divider"></div>
                <SectionHeader title="C. Verification & Validation (RIF Method Comparison)" />
                <InputRow className="indented" label="Rainfall Infiltration Factor (RIF):" field="rifValue" step="0.01" value={formData.rifValue || 0.10} onChange={handleChange} />
                <CalculatedRow className="indented" label="Estimated Recharge (RIF Method) (ha m):" value={formatNum(formData.gwRechargeRifMethod)} />
                <CalculatedRow className="indented" label="Rainfall Recharge (WT Method, Normalized) (ha m):" value={formatNum(formData.gwRechargeWtRainfallNormalized)} />

                <div className="wa-form-row indented">
                    <label>Percent Deviation (PD) (%):</label>
                    <span className={`wa-value ${pdClass}`}>
                        {formatNum(pd)}%
                    </span>
                    <span style={{ fontSize: '0.8rem', marginLeft: '10px', color: '#666' }}>
                        (Adopted: {adoptedMethod})
                    </span>
                </div>

                <div className="wa-form-row highlight blue">
                    <label>Final Adopted Monsoon Rainfall Recharge (ha m):</label>
                    <span className="wa-value font-large">{formatNum(formData.finalRainfallRecharge)}</span>
                </div>
                <div className="wa-hint-text">
                    (If -20% &le; PD &le; 20%, WT Method adopted. Else, RIF Method corrected by factor 0.8 or 1.2 is adopted)
                </div>
            </div>
        </section>
    );
};

export default MonsoonTab;
