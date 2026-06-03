import React from 'react';
import {
  InputRow,
  CalculatedRow,
  SectionHeader,
  MultiInputRow,
  SelectRow
} from './FormHelpers';

import { GEC_NORMS } from '../../../utils/gecNorms';

const NonMonsoonTab = ({
  formData = {},
  handleChange
}) => {
  // Handler for canal type selection
  const handleCanalTypeChange = (fieldPrefix, typeName) => {
    const selected = GEC_NORMS.canal_seepage.find(c => c.type === typeName);
    if (selected) {
      handleChange(`${fieldPrefix}seepageFactor_nm`, selected.recommended);
    }
  };
  // Helper to format numbers safely with 2 decimals
  const formatNum = (num) => {
    if (num === undefined || num === null) return '0.00';
    const n = parseFloat(num);
    return isNaN(n) ? '0.00' : n.toFixed(2);
  };

  return (
    <section className="wa-section">

      <h3 className="wa-section-title">
        Non-Monsoon Season Recharge (GEC 2015)
      </h3>

      <div className="wa-form-grid">

        {/* Rainfall input */}
        <InputRow
          label="1. Normal Non-Monsoon Rainfall (mm):"
          field="nonMonsoonRainfall"
          type="number"
          value={formData.nonMonsoonRainfall}
          onChange={handleChange}
        />

        <SectionHeader title="A. Recharge from Rainfall (RIF Method)" />

        <CalculatedRow
          className="indented"
          label="Recharge (ha m):"
          value={formatNum(formData.gwRechargeRainfallNonMonsoon)}
        />
        {/* Auto computed rule */}
        <CalculatedRow
          className="indented"
          label="Is Rainfall < 10% of Annual? (GEC Rule)"
          value={
            formData.isNonMonsoonRainfallBelowThreshold
              ? 'Yes (Recharge = 0)'
              : 'No'
          }
          valueClass={formData.isNonMonsoonRainfallBelowThreshold ? 'red-text' : 'green-text'}
        />

        <SectionHeader title="B. Recharge from Other Sources (Non-Monsoon)" />

        {/* Return Flow from Irrigation */}
        {parseFloat(formData.areaCommandHa) > 0 ? (
          <>
            <MultiInputRow
              label="2. Return Flow from SW Irrigation (Non-Paddy) (Draft * RFF):"
              inputs={[
                { placeholder: "SW Draft (ha m)", value: formData.rgwi_sw_draft_nm, onChange: v => handleChange('rgwi_sw_draft_nm', v), title: "SW Irrigation Draft" },
                { placeholder: "SW RFF", value: formData.rgwi_sw_rff_nm, onChange: v => handleChange('rgwi_sw_rff_nm', v), title: "SW RFF" }
              ]}
            />
            {/* Canals Seepage */}
            <SelectRow
              className="indented"
              label="Select Canal Formation:"
              field="rc_canalType_nm"
              value={formData.rc_canalType_nm}
              options={[
                { label: '-- Select Formation --', value: '' },
                ...GEC_NORMS.canal_seepage.map(c => ({ label: c.type, value: c.type }))
              ]}
              onChange={(f, v) => {
                handleChange(f, v);
                handleCanalTypeChange('rc_', v);
              }}
            />
            <MultiInputRow
              label="3. Canals (Wetted Area * Days * Seepage Factor):"
              inputs={[
                { placeholder: "M sq.m", value: formData.rc_wettedArea_nm, onChange: v => handleChange('rc_wettedArea_nm', v), title: "Wetted Area (Million m2)" },
                { placeholder: "Days", value: formData.rc_days_nm ?? 245, onChange: v => handleChange('rc_days_nm', v), title: "Days" },
                { placeholder: "ham/day/Mm2", value: formData.rc_seepageFactor_nm, onChange: v => handleChange('rc_seepageFactor_nm', v), title: "Seepage Factor" }
              ]}
            />
            <CalculatedRow
              className="indented highlight-sub"
              label="Recharge from Canals (ha m):"
              value={formatNum(formData.gwRechargeFromCanalsNonMonsoon)}
            />
          </>
        ) : (
          <div className="wa-hint-text" style={{ padding: '10px 25px', color: '#666' }}>
            * SW Irrigation and Canal Seepage inputs are hidden because <strong>Command Area is 0</strong>.
            Define a Command Area in the Monsoon tab to enable these.
          </div>
        )}

        {/* GW Irrigation Return Flow - Always applicable */}
        <MultiInputRow
          label="4. Return Flow from GW Irrigation (Non-Paddy) (Draft * RFF):"
          inputs={[
            { placeholder: "GW Draft (ha m)", value: formData.rgwi_gw_draft_nm, onChange: v => handleChange('rgwi_gw_draft_nm', v), title: "GW Irrigation Draft" },
            { placeholder: "GW RFF", value: formData.rgwi_gw_rff_nm, onChange: v => handleChange('rgwi_gw_rff_nm', v), title: "GW RFF" }
          ]}
        />
        <CalculatedRow
          className="indented highlight-sub"
          label="Total Return Flow from Irrigation (ha m):"
          value={formatNum(formData.gwRechargeFromIrrigationNonMonsoon)}
        />

        {/* Tanks/Ponds Recharge */}
        <MultiInputRow
          label="5. Tanks & Ponds (Area * Days * RF):"
          inputs={[
            { placeholder: "Spread Area (ha)", value: formData.rtp_avgWaterSpreadArea_nm, onChange: v => handleChange('rtp_avgWaterSpreadArea_nm', v), title: "Spread Area (ha)" },
            { placeholder: "Days", value: formData.rtp_days_nm ?? 245, onChange: v => handleChange('rtp_days_nm', v), title: "Days" },
            { placeholder: "Recharge Factor", value: formData.rtp_rechargeFactor_nm, onChange: v => handleChange('rtp_rechargeFactor_nm', v), title: "Recharge Factor - GEC Rec: 0.0014" }
          ]}
        />
        <CalculatedRow
          className="indented highlight-sub"
          label="Recharge from Tanks & Ponds (ha m):"
          value={formatNum(formData.gwRechargeFromTanksNonMonsoon)}
        />

        {/* WCS Recharge */}
        <MultiInputRow
          label="6. Water Cons. Structures (Storage * RF):"
          inputs={[
            { placeholder: "Gross Storage", value: formData.rwcs_grossStorage_nm, onChange: v => handleChange('rwcs_grossStorage_nm', v), title: "Gross Storage (ha m)" },
            { placeholder: "RF (e.g. 0.2)", value: formData.rwcs_rechargeFactor_nm, onChange: v => handleChange('rwcs_rechargeFactor_nm', v), title: "Recharge Factor - GEC Rec: 0.2" }
          ]}
        />
        <CalculatedRow
          className="indented highlight-sub"
          label="Recharge from WCS (ha m):"
          value={formatNum(formData.gwRechargeFromWCSNonMonsoon)}
        />

        {/* Backend total */}
        <div className="wa-form-row highlight blue" style={{ marginTop: '20px' }}>
          <label>Total Non-Monsoon Recharge (ha m):</label>
          <span className="wa-value font-large">{formatNum(formData.totalNonMonsoonRecharge)}</span>
        </div>


      </div>
    </section>
  );
};

export default NonMonsoonTab;
