/**
 * Calculations for Water Utilization Module
 * Conversion Factors:
 * 1 Ha-m = 10,000 m3
 * 1 Ha-m = 10,000,000 Liters (10^7 L)
 */

/**
 * Calculates human water demand in Ha-m/year
 */
export const calculateHumanDemand = (population, dailyReqLpcd) => {
    const pop = Number(population) || 0;
    const req = Number(dailyReqLpcd) || 0;
    const dailyL = pop * req;
    // Convert Liters/day to Ha-m/year: (L/day * 365) / 10^7
    const annualHaM = (dailyL * 365) / 10000000;
    return Number(annualHaM.toFixed(6));
};

/**
 * Calculates livestock water demand in Ha-m/year
 */
export const calculateLivestockDemand = (livestockData) => {
    if (!Array.isArray(livestockData)) return 0;

    const dailyL = livestockData.reduce((sum, item) =>
        sum + ((Number(item.count) || 0) * (Number(item.requirement) || 0)), 0);

    // Convert Liters/day to Ha-m/year: (L/day * 365) / 10^7
    const annualHaM = (dailyL * 365) / 10000000;
    return Number(annualHaM.toFixed(6));
};

/**
 * Calculates volumes from GW and SW based on percentages
 */
export const calculateDemandMet = (requirement, gwPct, swPct) => {
    const req = Number(requirement) || 0;
    const gPct = Number(gwPct) || 0;
    const sPct = Number(swPct) || 0;

    return {
        gwVol: Number(((req * gPct) / 100).toFixed(6)),
        swVol: Number(((req * sPct) / 100).toFixed(6))
    };
};

/**
 * Calculates the updated drinking/domestic demand met data
 */
export const calculateDrinkingDomesticDemand = (formData) => {
    const humanAnnualHaM = calculateHumanDemand(formData.humanPopulation, formData.humanDailyRequirement);
    const livestockAnnualHaM = calculateLivestockDemand(formData.livestockData);

    const prevHuman = formData.demandMetData.human;
    const prevLivestock = formData.demandMetData.livestock;

    const humanVolumes = calculateDemandMet(humanAnnualHaM, prevHuman.gwPct, prevHuman.swPct);
    const livestockVolumes = calculateDemandMet(livestockAnnualHaM, prevLivestock.gwPct, prevLivestock.swPct);

    return {
        human: {
            ...prevHuman,
            requirement: humanAnnualHaM,
            gwVol: humanVolumes.gwVol,
            swVol: humanVolumes.swVol
        },
        livestock: {
            ...prevLivestock,
            requirement: livestockAnnualHaM,
            gwVol: livestockVolumes.gwVol,
            swVol: livestockVolumes.swVol
        }
    };
};

/**
 * Calculates Irrigation Demand for a set of crops
 * Formula: Demand (ha m) = (Area (ha) * NIR (mm)) / 1000
 */
export const calculateIrrigationDemand = (crops) => {
    if (!Array.isArray(crops)) return 0;
    const demand = crops.reduce((acc, crop) => {
        const area = Number(crop.area) || 0;
        const requirement = Number(crop.requirement) || 0;
        return acc + (area * requirement / 1000);
    }, 0);
    return Number(demand.toFixed(6));
};

/**
 * Calculates volume (ha m) from daily requirement (L/day) and days
 * Formula: (L/day * days) / 10,000,000
 */
export const calculateDailyToAnnualHaM = (dailyReq, days) => {
    return (Number(dailyReq) * Number(days)) / 10000000;
};

/**
 * Calculates Industrial Demand entry
 */
export const calculateIndustrialEntry = (form) => {
    const consumptionHaM = calculateDailyToAnnualHaM(form.dailyReq, form.days);
    const dewateringHaM = Number(form.dewateringQuantity) || 0;
    const totalHaM = consumptionHaM + dewateringHaM;

    // Consumption might be split between GW and SW, but dewatering is always GW
    const consumptionVol = calculateDemandMet(consumptionHaM, form.gwPct, form.swPct);

    return {
        totalDemand: Number(totalHaM.toFixed(6)),
        gwVol: Number((consumptionVol.gwVol + dewateringHaM).toFixed(6)),
        swVol: consumptionVol.swVol
    };
};

/**
 * Calculates Abstraction Structure Draft
 * Formula: Draft = (Count * Discharge * Hours * Days) / 10000
 * Assuming Discharge in m3/hr, Output in Ha-m
 */
export const calculateAbstractionDraft = (count, discharge, hours, days) => {
    const totalM3 = (Number(count) * Number(discharge) * Number(hours) * Number(days));
    return Number((totalM3 / 10000).toFixed(6));
};

/**
 * Calculates Other Uses Demand entry
 */
export const calculateOtherUsesEntry = (form) => {
    const totalHaM = calculateDailyToAnnualHaM(form.dailyReq, form.days);
    const volumes = calculateDemandMet(totalHaM, form.gwPct, form.swPct);

    return {
        totalDemand: Number(totalHaM.toFixed(6)),
        gwVol: volumes.gwVol,
        swVol: volumes.swVol
    };
};

/**
 * Calculates the water balance by comparing availability and utilization
 */
export const calculateWaterBalance = (availableGW, availableSW, utilizedGW, utilizedSW) => {
    const gwBalance = Number(availableGW) - Number(utilizedGW);
    const swBalance = Number(availableSW) - Number(utilizedSW);

    return {
        gwBalance: Number(gwBalance.toFixed(2)),
        swBalance: Number(swBalance.toFixed(2)),
        totalBalance: Number((gwBalance + swBalance).toFixed(2))
    };
};

/**
 * Calculates total utilized water from all sectors
 */
export const calculateTotalUtilization = (formData) => {
    let totalGW = 0;
    let totalSW = 0;

    // 1. Drinking/Domestic
    totalGW += formData.demandMetData.human.gwVol || 0;
    totalGW += formData.demandMetData.livestock.gwVol || 0;
    totalSW += formData.demandMetData.human.swVol || 0;
    totalSW += formData.demandMetData.livestock.swVol || 0;

    // 2. Irrigation
    totalGW += formData.irrigationData.gwVol || 0;
    totalSW += formData.irrigationData.swVol || 0;

    // 3. Industrial
    formData.industrialData.entries.forEach(e => {
        totalGW += Number(e.gwVol) || 0;
        totalSW += Number(e.swVol) || 0;
    });

    // 4. Other Uses
    formData.otherUsesData.entries.forEach(e => {
        totalGW += Number(e.gwVol) || 0;
        totalSW += Number(e.swVol) || 0;
    });

    return {
        totalGW: Number(totalGW.toFixed(4)),
        totalSW: Number(totalSW.toFixed(4)),
        totalCombined: Number((totalGW + totalSW).toFixed(4))
    };
};
