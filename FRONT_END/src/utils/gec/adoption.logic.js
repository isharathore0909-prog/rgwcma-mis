/**
 * Calculates the Percent Deviation (PD) between RIF and WT method recharge.
 * Formula: PD = ((WT - RIF) / RIF) * 100
 * @param {number} wtRain - Recharge from WT method (Rainfall component)
 * @param {number} rifRain - Recharge from RIF method
 * @returns {number} Percent Deviation
 */
export const calculatePercentDeviation = (wtRain, rifRain) => {
    if (rifRain === 0) {
        return wtRain === 0 ? 0 : (wtRain > 0 ? Infinity : -Infinity);
    }
    return ((wtRain - rifRain) / rifRain) * 100;
};

export const adoptRainfallRecharge = (wtRain, rifRain, pd, rejectionReason = null) => {
    // Determine effective PD for rejection cases
    // If WT is negative/zero, PD is effectively <= -100%
    const effectivePD = rejectionReason ? (wtRain <= 0 ? -100 : pd) : pd;

    // Rule 1: Normal Range (-20% to +20%)
    if (!rejectionReason && effectivePD >= -20 && effectivePD <= 20) {
        return {
            value: Number(wtRain),
            method: 'WT',
            status: 'ACCEPTED',
            pd: effectivePD
        };
    }

    // Rule 2: PD > +20%
    if (effectivePD > 20) {
        return {
            value: Number(rifRain * 1.2),
            method: '1.2 * RIF',
            status: rejectionReason ? `REJECTED (${rejectionReason})` : 'ACCEPTED (PD > +20%)',
            pd: effectivePD
        };
    }

    // Rule 3: PD < -20% (including WT negative rejection)
    if (effectivePD < -20 || rejectionReason) {
        return {
            value: Number(rifRain * 0.8),
            method: '0.8 * RIF',
            status: rejectionReason ? `REJECTED (${rejectionReason})` : 'ACCEPTED (PD < -20%)',
            pd: effectivePD
        };
    }

    // Fallback (should not happen with RIF > 0)
    return {
        value: Number(rifRain),
        method: 'RIF',
        status: 'FALLBACK',
        pd: effectivePD
    };
};
