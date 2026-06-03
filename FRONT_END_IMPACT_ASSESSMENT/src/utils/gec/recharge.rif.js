/**
 * GEC 2015 Rainfall Infiltration Factor (RIF) Method
 */

export const INFILTRATION_FACTORS = {
    ALLUVIAL: {
        INDO_GANGETIC: 0.22,
        OTHER: 0.20
    },
    HARD_ROCK: {
        GRANITE: 0.10,
        BASALT: 0.12,
        LATERITE: 0.08,
        PHYLLITE_SHALE: 0.04,
        LIMESTONE: 0.15,
        SANDSTONE: 0.10
    }
};

export const calculateRIFRecharge = (areaHa, rainfallMm, infiltrationFactor) => {
    if (areaHa <= 0 || rainfallMm <= 0 || infiltrationFactor <= 0) {
        return 0;
    }
    return (areaHa * rainfallMm / 1000) * infiltrationFactor;
};

export const calculateNonMonsoonRIF = (
    areaHa,
    normalNonMonsoonRain,
    annualNormalRain,
    rifFactor
) => {
    if (
        areaHa <= 0 ||
        normalNonMonsoonRain < 0 ||
        annualNormalRain <= 0 ||
        rifFactor <= 0
    ) {
        return 0;
    }

    const threshold = 0.10 * annualNormalRain;
    if (normalNonMonsoonRain <= threshold) {
        return 0;
    }

    return calculateRIFRecharge(areaHa, normalNonMonsoonRain, rifFactor);
};

