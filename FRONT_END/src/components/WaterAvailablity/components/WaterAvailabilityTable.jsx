import React from 'react';

// Helper Components
const SectionHeader = ({ id, title }) => (
    <tr className="section-head">
        <td>{id}</td>
        <td>{title}</td>
    </tr>
);

const SubHeader = ({ id, title }) => (
    <tr className="sub-head">
        <td>{id}</td>
        <td>{title}</td>
    </tr>
);

const DataRow = ({ id, label, value, className = "", unit = "" }) => (
    <tr className={className}>
        <td>{id}</td>
        <td>
            {label} <span className="val">{value !== undefined && value !== null ? `${value}${unit}` : ''}</span>
        </td>
    </tr>
);

const WaterAvailabilityTable = ({ data }) => {
    return (
        <div className="wa-report-table-section">
            <table className="report-data-table">
                <thead>
                    <tr>
                        <th colSpan="2">Water Availability</th>
                    </tr>
                </thead>
                <tbody>
                    {/* 1. Rainfall Section */}
                    <SectionHeader id="1." title="Total Available Water From Rainfall" />
                    <DataRow id="a." label="Annual Rainfall (mm)" value={data.annualRainfall?.toFixed(2)} />

                    {/* 2. Ground Water Section */}
                    <SectionHeader id="2." title="Ground Water (Sub-Unit Wise Assessment)" />
                    <DataRow id="" label="Total Assessment Area (ha)" value={data.areaHa?.toFixed(2)} />
                    {data.areaCommandHa > 0 && <DataRow id="" label=" - Command Area (ha)" value={data.areaCommandHa?.toFixed(2)} className="indented" />}
                    {data.areaNonCommandHa > 0 && <DataRow id="" label=" - Non-Command Area (ha)" value={data.areaNonCommandHa?.toFixed(2)} className="indented" />}

                    <SubHeader id="a." title="Recharge From Rainfall (ha m)" />
                    <DataRow id="(i)" label="Monsoon" value={data.gwRechargeRainfallMonsoon?.toFixed(2)} className="indented" />
                    <DataRow id="(ii)" label="Non-Monsoon" value={data.gwRechargeRainfallNonMonsoon?.toFixed(2)} className="indented" />
                    <DataRow id="" label="Total Ground Water Recharge from rainfall (ha m)" value={data.totalGwRechargeRainfall?.toFixed(2)} className="blue-val bg-light-gray" />

                    <SubHeader id="b." title="Ground Water Recharge from other sources (ha m)" />
                    <DataRow id="(i)" label="Monsoon" value={data.gwRechargeOtherMonsoon?.toFixed(2)} className="indented" />
                    <DataRow id="(ii)" label="Non-Monsoon" value={data.gwRechargeOtherNonMonsoon?.toFixed(2)} className="indented" />
                    <DataRow id="" label="Total Ground Water Recharge from other sources (ha m)" value={data.totalGwRechargeOther?.toFixed(2)} className="blue-val bg-light-gray" />

                    <DataRow id="c." label="Losses Due to Natural Discharge (ha m)" value={data.naturalDischargeLosses?.toFixed(2)} />
                    <DataRow id="" label="Total Ground Water Available (ha m)" value={data.totalGwAvailable?.toFixed(2)} className="blue-val bg-light-gray" />

                    <SubHeader id="d." title="Salinity & Poor Quality (Section 5.0)" />
                    <DataRow id="(i)" label="Saline Area Proportion (%)" value={(data.saline_area_proportion || 0).toFixed(2)} unit="%" className="indented" />
                    <DataRow id="(ii)" label="Fresh Assessment Area (ha)" value={data.fresh_area_ha?.toFixed(2)} className="indented" />
                    <DataRow id="(iii)" label="Excluded Saline Area (ha)" value={data.saline_area_ha?.toFixed(2)} className="indented red-text" />

                    <SubHeader id="e." title="Categorization & Trend (Section 6.2)" />
                    <DataRow id="(i)" label="10-Year Pre-Monsoon Trend (Slope)" value={data.pre_slope} unit=" m/yr" className="indented" />
                    <DataRow id="(ii)" label="10-Year Post-Monsoon Trend (Slope)" value={data.pst_slope} unit=" m/yr" className="indented" />
                    <DataRow id="(iii)" label="Trend Status" value={data.trends_declining ? "Significantly Declining" : "Stable / Not Declining"} className={`indented ${data.trends_declining ? 'red-text' : 'green-text'}`} />

                    <DataRow id="f." label="Ground Water Withdrawal (ha m)" value={data.gwWithdrawal?.toFixed(2)} />
                    <DataRow
                        id="g."
                        label="Stage of Ground Water Extraction (%)"
                        value={data.stageOfExtraction?.toFixed(2)}
                        unit="%"
                        className={data.stageOfExtraction > 100 ? "red-text" : "green-text"}
                    />

                    <DataRow
                        id="h."
                        label="Final Category (Validated)"
                        value={data.final_category}
                        className={`highlight ${data.final_category === 'SAFE' ? 'green-text' : 'red-text'}`}
                    />

                    <SubHeader id="i." title="Future Allocation (Section 6.1)" />
                    <DataRow id="(i)" label="Projected 25-Year Domestic Demand (ha m)" value={data.projected_domestic_25yr?.toFixed(2)} className="indented" />
                    <DataRow id="(ii)" label="Net GW Availability for Future Use (ha m)" value={data.net_future_availability_future?.toFixed(2)} className="indented blue-val bg-light-gray" />

                    <SubHeader id="j." title="Additional Potential GW Resources (ha m)" />
                    <DataRow id="(i)" label="In Waterlogged/Shallow Zones" value={data.potentialResourceShallow?.toFixed(2)} className="indented" />
                    <DataRow id="(ii)" label="In Flood Prone Areas" value={data.potentialResourceFlood?.toFixed(2)} className="indented" />

                    {/* 3. Advanced Aquifer Assessment */}
                    <SectionHeader id="3." title="Advanced Aquifer Assessment (GEC 2015)" />
                    <DataRow id="a." label="In-Storage (Static) GW Resources (ha m)" value={data.staticGroundWaterResource?.toFixed(2)} />
                    <DataRow id="b." label="Confined Aquifer Resources (ha m)" />
                    <DataRow id="(i)" label="Dynamic Resource" value={data.dynamicConfinedResource?.toFixed(2)} className="indented" />
                    <DataRow id="(ii)" label="In-Storage Resource" value={data.instorageConfinedResource?.toFixed(2)} className="indented" />

                    <tr className="blue-val bg-light-gray">
                        <td style={{ paddingLeft: '30px' }}></td>
                        <td>Total Confined Resource <span className="val">{data.totalConfinedResource?.toFixed(2)}</span></td>
                    </tr>
                    <DataRow id="c." label="Normalized Unit Draft (m3)" value={data.unitDraft_normalized?.toFixed(2)} />

                    {/* 4. Surface Water Section */}
                    <SectionHeader id="4." title="Surface Water" />
                    <SubHeader id="a." title="Surface Water available in storages" />
                    <DataRow id="(i)" label="Number of Surface Water Bodies and Storage Capacity (ha m)" className="indented" />

                    {/* Nested Table for Bodies */}
                    <tr className="nested-table">
                        <td colSpan="2">
                            <table className="internal-table">
                                <thead>
                                    <tr><th>Type of Structure</th><th>No. of Structures</th><th>Storage Capacity (ha m)</th></tr>
                                </thead>
                                <tbody>
                                    {data.surfaceWaterBodies?.map((body, idx) => (
                                        <tr key={idx}>
                                            <td>{body.type}</td>
                                            <td>{body.count}</td>
                                            <td>{parseFloat(body.capacity || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-light-gray">
                                        <td>Total Storage Capacity</td>
                                        <td>-</td>
                                        <td>{data.totalStorageCapacity?.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    <DataRow id="" label="Total Surface Water Available (ha m)" value={data.totalSwAvailable?.toFixed(2)} className="blue-val bg-light-gray" />

                    {/* 5. Total Available Water */}
                    <SectionHeader id="5." title="Total Water Available" />
                    <DataRow id="" label="Total Water Available (ha m)" value={data.totalWaterAvailable?.toFixed(2)} className="blue-val bg-light-gray highlight-row" />
                </tbody>
            </table>
        </div>
    );
};

export default WaterAvailabilityTable;
