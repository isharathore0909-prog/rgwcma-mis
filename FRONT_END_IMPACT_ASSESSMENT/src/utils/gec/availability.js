/**
 * GEC 2015 Net Groundwater Availability & Extractions
 */

/**
 * Natural Discharge (GEC: 5-10%). 
 * User overrides must be validated within this range.
 */
export const calculateNaturalDischarge = (totalRecharge, percent = 5, userPercent = null) => {
    let p = userPercent !== null ? userPercent : percent;
    if (p < 5) {
        p = 5;
    }
    if (p > 10) {
        p = 10;
    }
    return totalRecharge * (p / 100);
};

/**
 * Projected Domestic Demand for 25 years
 * GEC-2015: Growth rate must be explicit, district/state-specific
 */
export const calculateDomesticAllocation = (population, lpcd, growthRate, isPopulationReliable = true, currentExtraction = 0) => {
    if (growthRate == null) {
        throw new Error("GEC-2015: Growth rate must be explicitly provided");
    }

    if (!isPopulationReliable) {
        // Fallback to measured extraction if population data unreliable
        return currentExtraction || (population * lpcd * 365 / 10000000);
    }

    const projectedPop = population * Math.pow(1 + growthRate, 25);
    const annualReqLiters = projectedPop * lpcd * 365;
    return annualReqLiters / 10000000; // Convert Liters to Ha-m
};

/**
 * Net Groundwater Availability for Future Use
 * Ensure inputs: netAvailability, existingDraft, domesticIndustrial
 */
export const calculateFutureAvailability = (netAvailability, existingDraft, domesticIndustrial) => {
    const net = netAvailability - existingDraft - domesticIndustrial;
    return Math.max(0, net);
};

/**
 * Potential Resource in Waterlogged/Shallow Water Table Areas
 * GEC-2015: Use post-monsoon depth, waterlogged area, threshold 3 m
 */
export const calculatePotentialResourceShallow = (postMonsoonDepth, waterloggedArea, specificYield) => {
    if (postMonsoonDepth < 3) {
        return (3 - postMonsoonDepth) * waterloggedArea * specificYield;
    }
    return 0;
};

/**
 * Potential Resource in Flood Prone Areas
 * ⚠️ Not GEC-2015; state-specific heuristic
 */
export const calculatePotentialResourceFlood = (retentionDays, floodProneArea) => {
    return (1.4 * retentionDays * floodProneArea) / 1000;
};

/**
 * In-Storage (Static) Ground Water Resources
 * ⚠️ Do NOT add to annual net availability
 */
export const calculateInStorageResources = (area, bottomDepth, preMonsoonDepth, specificYield) => {
    if (bottomDepth > preMonsoonDepth) {
        return area * (bottomDepth - preMonsoonDepth) * specificYield;
    }
    return 0;
};

/**
 * Confined Aquifer Resources (Static only)
 * ⚠️ Dynamic confined recharge not GEC-compliant
 */
export const calculateConfinedAquiferResources = (storativity, area, prePiezometricHead, bottomOfTopConfiningLayer) => {
    let inStorage = 0;
    if (prePiezometricHead > bottomOfTopConfiningLayer) {
        inStorage = storativity * area * (prePiezometricHead - bottomOfTopConfiningLayer);
    }
    return {
        inStorage,
        total: inStorage
    };
};

/**
 * Normalized Unit Draft
 * GEC-2015: Correct normalization = Actual Draft × Normal Rainfall / Current Rainfall
 */
export const calculateUnitDraftNormalization = (actualDraft, currentRainfall, normalRainfall) => {
    if (normalRainfall > 0 && currentRainfall > 0) {
        return (actualDraft * normalRainfall) / currentRainfall;
    }
    return actualDraft;
};

/**
 * Unit Draft Calculation (m³/hr to Ha-m)
 * ⚠️ Context: seasonal draft per structure
 */
export const calculateUnitDraft = (dischargeRate, pumpingHours, operationDays) => {
    const volumeM3 = dischargeRate * pumpingHours * operationDays;
    return volumeM3 / 10000; // Convert m³ to Ha-m
};
