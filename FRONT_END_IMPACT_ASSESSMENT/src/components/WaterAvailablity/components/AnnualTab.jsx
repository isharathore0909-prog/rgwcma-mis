import React from 'react';
import { InputRow, CalculatedRow, SectionHeader, MultiInputRow, CheckboxRow } from './FormHelpers';

const AnnualTab = ({
    formData = {},
    handleChange,
    bodies = [],
    handleBodyFieldChange,
    addBody
}) => {

    /* ---------------- SAFE VALUES ---------------- */
    const totalRecharge =
        (Number(formData.gwRechargeRainfallMonsoon) || 0) +
        (Number(formData.gwRechargeOtherMonsoon) || 0) +
        (Number(formData.totalNonMonsoonRecharge) || 0);

    const netAvailability =
        Number(formData.totalGwAvailable) || 0;

    const naturalDischarge =
        Math.max(0, totalRecharge - netAvailability);

    const stage =
        Number(formData.stageOfExtraction) || 0;

    const totalWaterAvailable =
        (Number(formData.totalGwAvailable) || 0) +
        (Number(formData.totalSwAvailable) || 0);

    // Helper for Natural Discharge Label
    const isWt = (formData.adoptedRainfallMethod || '').includes('WT');
    const ndPercent = formData.custom_nd_percent || formData.naturalDischargePercentAdopted || (isWt ? 5 : 10);

    return (
        <>
            {/* ---------------- Annual Availability ---------------- */}
            <section className="wa-section">
                <h3 className="wa-section-title">
                    Annual Groundwater Availability
                </h3>

                <div className="wa-form-grid">

                    <CalculatedRow
                        label="Total Annual Ground Water Recharge (Monsoon + Non-Monsoon) (ha m):"
                        value={totalRecharge}
                    />

                    <CalculatedRow
                        label={`Natural Discharge (${ndPercent}% of Recharge) (ha m):`}
                        value={naturalDischarge}
                    />

                    <CalculatedRow
                        className="highlight blue"
                        label="Net Annual Ground Water Availability (ha m):"
                        value={netAvailability}
                    />

                </div>
            </section>


            {/* ---------------- Static Resource ---------------- */}
            <section className="wa-section">
                <h3 className="wa-section-title">
                    IV. In-Storage (Static) Ground Water Resources
                </h3>

                <div className="wa-form-grid">

                    <InputRow
                        className="indented"
                        label="Bottom of Unconfined Aquifer (mbgl):"
                        field="bottomOfUnconfinedAquifer"
                        value={formData.bottomOfUnconfinedAquifer}
                        onChange={handleChange}
                    />

                    <CalculatedRow
                        className="indented highlight-sub"
                        label="Static GW Resource (ha m):"
                        value={formData.staticGroundWaterResource || 0}
                    />

                    <div className="wa-hint-text">
                        Formula: Area × (Bottom − PreMonsoonPiezometric) × Sy
                    </div>

                </div>
            </section>


            {/* ---------------- Confined Aquifer ---------------- */}
            <section className="wa-section">
                <h3 className="wa-section-title">
                    V. Confined Aquifer Resources
                </h3>

                <div className="wa-form-grid">

                    <MultiInputRow
                        label="Confined Aquifer Parameters:"
                        inputs={[
                            {
                                placeholder: "Confined Area (ha)",
                                value: formData.confinedArea,
                                onChange: v => handleChange('confinedArea', v)
                            },
                            {
                                placeholder: "Storativity (S)",
                                value: formData.storativity,
                                step: "0.0001",
                                onChange: v => handleChange('storativity', v)
                            }
                        ]}
                    />

                    <MultiInputRow
                        label="Piezometric Heads & Confining Layer:"
                        inputs={[
                            {
                                placeholder: "Pre-Monsoon Head (AMSL)",
                                value: formData.piezometricHeadPre,
                                onChange: v => handleChange('piezometricHeadPre', v)
                            },
                            {
                                placeholder: "Post-Monsoon Head (AMSL)",
                                value: formData.piezometricHeadPost,
                                onChange: v => handleChange('piezometricHeadPost', v)
                            },
                            {
                                placeholder: "Bottom Confining Layer (AMSL)",
                                value: formData.bottomOfTopConfiningLayer,
                                onChange: v => handleChange('bottomOfTopConfiningLayer', v)
                            }
                        ]}
                    />

                    <CalculatedRow
                        className="indented highlight-sub"
                        label="Dynamic Confined Resource (ha m):"
                        value={formData.dynamicConfinedResource || 0}
                    />

                    <CalculatedRow
                        className="indented highlight-sub"
                        label="In-Storage Confined Resource (ha m):"
                        value={formData.instorageConfinedResource || 0}
                    />

                    <CalculatedRow
                        className="highlight"
                        label="Total Confined GW Resource (ha m):"
                        value={formData.totalConfinedResource || 0}
                    />

                </div>
            </section>


            {/* ---------------- Stage of Extraction ---------------- */}
            <section className="wa-section">
                <h3 className="wa-section-title">
                    VII. Stage of Groundwater Extraction & Allocation
                </h3>

                <div className="wa-form-grid">

                    <CalculatedRow
                        label="Total Annual Ground Water Extraction (ha m):"
                        value={formData.gwWithdrawal || 0}
                    />

                    <div
                        className="wa-form-row highlight"
                        style={{
                            color: stage > 100 ? 'red' : 'green'
                        }}
                    >
                        <label>
                            Stage of Ground Water Extraction (%):
                        </label>

                        <span className="wa-value">
                            {stage.toFixed(2)}%
                        </span>
                    </div>

                </div>
            </section>


            {/* ---------------- Surface Water ---------------- */}
            <section className="wa-section">
                <h3 className="wa-section-title">
                    IX. Surface Water Availability
                </h3>

                <div className="wa-form-grid">

                    <div className="wa-form-row indented full-width">

                        <button
                            className="wa-btn-add"
                            onClick={addBody}
                        >
                            Add Body
                        </button>

                        <div className="wa-bodies-list">

                            {bodies.map(body => (
                                <div
                                    key={body.id}
                                    className="wa-body-row"
                                >

                                    <select
                                        value={body.type}
                                        onChange={(e) =>
                                            handleBodyFieldChange(
                                                body.id,
                                                'type',
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option>Ponds</option>
                                        <option>Tanks</option>
                                        <option>Check Dams</option>
                                        <option>Rivers</option>
                                    </select>

                                    <input
                                        type="number"
                                        placeholder="Count"
                                        value={body.count || ''}
                                        onChange={(e) =>
                                            handleBodyFieldChange(
                                                body.id,
                                                'count',
                                                e.target.value
                                            )
                                        }
                                    />

                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Capacity (ha m)"
                                        value={body.capacity || ''}
                                        onChange={(e) =>
                                            handleBodyFieldChange(
                                                body.id,
                                                'capacity',
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>
                            ))}

                        </div>
                    </div>

                    <CalculatedRow
                        label="Total Surface Water Available (ha m):"
                        value={formData.totalSwAvailable || 0}
                    />

                </div>
            </section>


            {/* ---------------- Terrain & Natural Discharge (GEC Section 4.3.2) ---------------- */}
            <section className="wa-section">
                <h3 className="wa-section-title">
                    X. Terrain and Natural Discharge Adjustment
                </h3>

                <div className="wa-form-grid">
                    <div className="wa-form-row">
                        <label>Terrain Type:</label>
                        <select
                            value={formData.terrainType || 'Plain'}
                            onChange={(e) => handleChange('terrainType', e.target.value)}
                            className="wa-select"
                        >
                            <option value="Plain">Plains / Alluvial</option>
                            <option value="Hilly">Hilly Terrain (Springs)</option>
                            <option value="Shallow">Shallow Water Table (&lt; 1.2m)</option>
                        </select>
                    </div>

                    {formData.terrainType === 'Hilly' && (
                        <InputRow
                            className="indented"
                            label="Measured Spring Discharge (ha m):"
                            field="terrainFixedDischarge"
                            value={formData.terrainFixedDischarge}
                            onChange={handleChange}
                            placeholder="Enter explicit volume"
                        />
                    )}

                    <CalculatedRow
                        className="highlight-sub"
                        label={`Adopted Natural Discharge (${ndPercent}% or Fixed) (ha m):`}
                        value={naturalDischarge}
                    />
                </div>
            </section>


            {/* ---------------- Future Allocation (GEC Section 6.1) ---------------- */}
            <section className="wa-section">
                <h3 className="wa-section-title">
                    XI. Future Use Allocation Projection (25 Years)
                </h3>

                <div className="wa-form-grid">
                    <InputRow
                        label="Decadal Population Growth Rate (%):"
                        field="decadalGrowthRate"
                        value={formData.decadalGrowthRate || 1.2}
                        onChange={handleChange}
                        step="0.01"
                    />

                    <CalculatedRow
                        label="Projected 25-Year Domestic/Industrial Demand (ha m):"
                        value={formData.projected_domestic_25yr || 0}
                    />

                    <CalculatedRow
                        className="highlight blue"
                        label="Net GW Availability for Future Use (ha m):"
                        value={formData.net_future_availability_future || 0}
                    />

                    <div className="wa-hint-text">
                        Formula: Net Availability - Gross Extraction - Projected 25-Year Allocation
                    </div>
                </div>
            </section>


            {/* ---------------- Total Water ---------------- */}
            <section className="wa-section">
                <h3 className="wa-section-title">
                    XII. Total Water Availability (GW + SW)
                </h3>

                <div className="wa-form-grid">

                    <div className="wa-form-row highlight blue">

                        <label>
                            Total Available Water (ha m):
                        </label>

                        <span className="wa-value font-large">
                            {totalWaterAvailable.toFixed(2)}
                        </span>

                    </div>

                </div>
            </section>

        </>
    );

};

export default AnnualTab;
