/**
 * GEC 2015 – Water Table (WT) Method & Recharge Components
 */

/* -------------------------------------------------------
   Irrigation Return Flow Recharge (Table 10 – GEC 2015)
-------------------------------------------------------- */
/* -------------------------------------------------------
   Return Flow Fraction Lookup (Table 10 – GEC 2015)
-------------------------------------------------------- */
export const getReturnFlowFraction = (
    isGroundwater,
    cropType = 'NON-PADDY',
    depthMBGL = 10,
    isContinuous = false
) => {
    const depth = Math.round(
        Math.min(25, Math.max(10, Number(depthMBGL) || 10))
    );

    const isPaddy = cropType && cropType.toUpperCase() === 'PADDY';

    const TABLE_10 = {
        10: { gw_p: 45, gw_np: 25, sw_p: 50, sw_np: 30 },
        11: { gw_p: 43.3, gw_np: 23.7, sw_p: 48.3, sw_np: 28.7 },
        12: { gw_p: 41.7, gw_np: 22.3, sw_p: 46.7, sw_np: 27.3 },
        13: { gw_p: 40, gw_np: 21, sw_p: 45, sw_np: 26 },
        14: { gw_p: 38.3, gw_np: 19.7, sw_p: 43.3, sw_np: 24.7 },
        15: { gw_p: 36.7, gw_np: 18.3, sw_p: 41.7, sw_np: 23.3 },
        16: { gw_p: 35, gw_np: 17, sw_p: 40, sw_np: 22 },
        17: { gw_p: 33.3, gw_np: 15.7, sw_p: 38.3, sw_np: 20.7 },
        18: { gw_p: 31.7, gw_np: 14.3, sw_p: 36.7, sw_np: 19.3 },
        19: { gw_p: 30, gw_np: 13, sw_p: 35, sw_np: 18 },
        20: { gw_p: 28.3, gw_np: 11.7, sw_p: 33.3, sw_np: 16.7 },
        21: { gw_p: 26.7, gw_np: 10.3, sw_p: 31.7, sw_np: 15.3 },
        22: { gw_p: 25, gw_np: 9, sw_p: 30, sw_np: 14 },
        23: { gw_p: 23.3, gw_np: 7.7, sw_p: 28.3, sw_np: 12.7 },
        24: { gw_p: 21.7, gw_np: 6.3, sw_p: 26.7, sw_np: 11.3 },
        25: { gw_p: 20, gw_np: 5, sw_p: 25, sw_np: 10 }
    };

    const row = TABLE_10[depth];
    if (!row) return 0;

    let percent = isGroundwater
        ? (isPaddy ? row.gw_p : row.gw_np)
        : (isPaddy ? row.sw_p : row.sw_np);

    if (isContinuous) percent += 5;

    // GEC safety cap
    percent = Math.min(percent, 50);

    return percent / 100; // Return as fraction (e.g. 0.45)
};

/* -------------------------------------------------------
   Irrigation Return Flow Recharge (Generic Wrapper)
-------------------------------------------------------- */
export function calculateIrrigationReturnRecharge(
    appliedVolumeHam,
    isGroundwater,
    cropType = 'NON-PADDY',
    depthMBGL = 10,
    isContinuous = false
) {
    if (appliedVolumeHam <= 0) return 0;
    const fraction = getReturnFlowFraction(isGroundwater, cropType, depthMBGL, isContinuous);
    return appliedVolumeHam * fraction;
}

/* -------------------------------------------------------
   SW Irrigation Recharge (Monsoon)
-------------------------------------------------------- */
export const calculateSWIrrigationRecharge = (
    dischargeM3PerHr,
    pumpingHoursPerDay,
    days,
    returnFlowFraction
) => {
    if (
        dischargeM3PerHr <= 0 ||
        pumpingHoursPerDay <= 0 ||
        days <= 0 ||
        returnFlowFraction <= 0
    ) return 0;

    // m³ → ha-m (1 ha-m = 10,000 m³)
    const appliedVolumeHam =
        (dischargeM3PerHr * pumpingHoursPerDay * days) / 10000;

    return appliedVolumeHam * returnFlowFraction;
};

/* -------------------------------------------------------
   Canal Seepage Recharge (GEC-2015)
-------------------------------------------------------- */
export const calculateCanalSeepage = (
    wettedAreaMillionM2,
    days,
    seepageFactor = 0.018 // ha-m/day per million m²
) => {
    if (wettedAreaMillionM2 <= 0 || days <= 0 || seepageFactor <= 0) {
        return 0;
    }

    // Normalization: If factor is > 1 (e.g., 17.5 GEC value), convert to appropriate unit
    if (seepageFactor > 1) {
        seepageFactor /= 1000;
    }

    return wettedAreaMillionM2 * seepageFactor * days;
};

/* -------------------------------------------------------
   Tank & Pond Recharge (GEC-2015)
-------------------------------------------------------- */
export const calculateTankRecharge = (
    areaHa,
    days,
    seepageFactor = 0.0014 // m/day
) => {
    if (areaHa <= 0 || days <= 0 || seepageFactor <= 0) return 0;

    // Recharge (ha-m) = Area (ha) * Rate (m/day) * Days
    return areaHa * seepageFactor * days;
};

/* -------------------------------------------------------
   Conservation Structures Recharge
-------------------------------------------------------- */
export const calculateConservationRecharge = (
    storageHam,
    efficiencyFraction = 0.2,
    fillings = 1
) => {
    if (storageHam <= 0 || fillings < 1) return 0;

    const eff = Math.min(Math.max(efficiencyFraction, 0.2), 0.5);
    return storageHam * eff * Math.round(fillings);
};

/* -------------------------------------------------------
   WT Rainfall Recharge Component (Chapter 5)
   R_rain = ΔS + GE − R_other
-------------------------------------------------------- */
export const calculateWTRainfallComponent = (
    deltaS,
    grossExtraction,
    totalOtherRecharge
) => {
    return (
        (Number(deltaS) || 0) +
        (Number(grossExtraction) || 0) -
        (Number(totalOtherRecharge) || 0)
    );
};
