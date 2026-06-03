/**
 * GEC 2015 Methodology Calculations
 * Fully corrected & audit-safe
 */

import { safeParse } from './gec/inputs.validator';
import { calculateIrrigationReturnRecharge, calculateSWIrrigationRecharge, calculateCanalSeepage, calculateTankRecharge, calculateConservationRecharge, calculateWTRainfallComponent, getReturnFlowFraction } from './gec/recharge.wt';
import { calculateRIFRecharge, calculateNonMonsoonRIF } from './gec/recharge.rif';
import { calculateNaturalDischarge } from './gec/availability';
import { calculatePercentDeviation, adoptRainfallRecharge } from './gec/adoption.logic';
import { calculateStageOfExtraction, categorizeUnit } from './gec/categorization';

export { calculateStageOfExtraction, categorizeUnit };

export const calculateWaterBalance = (data) => {
    const updated = { ...data };
    const auditTrail = [];

    /* ------------------ 1. Parsing ------------------ */
    const areaHa = safeParse(updated.areaHa);
    const syRaw = safeParse(updated.specificYield);
    const specificYield = syRaw > 1 ? syRaw / 100 : syRaw;

    const normalMonsoonRain = safeParse(updated.normalMonsoonRainfall);
    const normalNonMonsoonRain = safeParse(updated.nonMonsoonRainfall);
    const annualNormalRain = normalMonsoonRain + normalNonMonsoonRain;

    const isUrban = updated.unitType === 'URBAN';

    /* ------------------ 2. RIF factors ------------------ */
    let rifBase = safeParse(updated.rifValue, 0.10);
    let rifMonsoon = isUrban ? rifBase * 0.30 : rifBase;
    rifMonsoon = Math.min(Math.max(rifMonsoon, 0), 1);

    /* ------------------ 3. Other recharge ------------------ */

    /* SW irrigation */
    if (safeParse(updated.rswi_avgDischarge) > 0) {
        // Calculate Return Flow Fraction (RFF)
        const rff = getReturnFlowFraction(
            false, // isGroundwater = false
            updated.rswi_cropType,
            updated.preMonsoonDepth,
            updated.isContinuousSupply
        );
        updated.rswi_returnFlowFactor = rff;

        updated.gwRechargeFromIrrigationMonsoon = calculateSWIrrigationRecharge(
            safeParse(updated.rswi_avgDischarge),
            safeParse(updated.rswi_pumpingHours, 10), // Default to 10 hours if not provided
            safeParse(updated.rswi_days),
            rff
        );
    } else {
        updated.gwRechargeFromIrrigationMonsoon = 0;
    }

    /* GW irrigation */
    const gwIrrVol = safeParse(updated.gwExtractionMonsoon);
    updated.gwRechargeFromGWIirrigationMonsoon =
        calculateIrrigationReturnRecharge(
            gwIrrVol,
            true,
            updated.rgwi_cropType,
            updated.preMonsoonDepth,
            updated.isContinuousSupply
        );

    /* Canal seepage */
    updated.gwRechargeFromCanalsMonsoon = calculateCanalSeepage(
        safeParse(updated.rc_wettedArea),
        safeParse(updated.rc_days),
        safeParse(updated.rc_seepageFactor, 0.018)
    );

    /* Tanks */
    updated.gwRechargeFromTanksMonsoon = calculateTankRecharge(
        safeParse(updated.rtp_avgWaterSpreadArea),
        safeParse(updated.rtp_days),
        safeParse(updated.rtp_rechargeFactor, 0.0014)
    );

    /* WCS */
    updated.gwRechargeFromWCSMonsoon = calculateConservationRecharge(
        safeParse(updated.rwcs_grossStorage),
        safeParse(updated.rwcs_rechargeFactor, 0.2)
    );

    /* Urban pipelines */
    if (isUrban) {
        const loss = safeParse(updated.pipelineLosses);
        const factor = safeParse(updated.pipelineLossFactor, 0.5);
        updated.gwRechargeFromPipelines = loss * factor;
    } else {
        updated.gwRechargeFromPipelines = 0;
    }

    const totalOther =
        updated.gwRechargeFromIrrigationMonsoon +
        updated.gwRechargeFromGWIirrigationMonsoon +
        updated.gwRechargeFromCanalsMonsoon +
        updated.gwRechargeFromTanksMonsoon +
        updated.gwRechargeFromWCSMonsoon +
        updated.gwRechargeFromPipelines;

    updated.gwRechargeOtherMonsoon = totalOther;

    /* ------------------ 4. WT method ------------------ */

    const fluctuation =
        safeParse(updated.preMonsoonDepth) -
        safeParse(updated.postMonsoonDepth);

    const deltaS = areaHa * specificYield * fluctuation;

    const extraction =
        safeParse(updated.gwExtractionMonsoon) ||
        safeParse(updated.gwWithdrawal) * 0.7;

    let wtRain = calculateWTRainfallComponent(
        deltaS,
        extraction,
        totalOther
    );

    updated.gwRechargeWtMethod = wtRain;

    /* WT normalization */
    const actualRain = safeParse(updated.currentMonsoonRainfall);
    if (actualRain > normalMonsoonRain && wtRain > 0) {
        wtRain *= normalMonsoonRain / actualRain;
        auditTrail.push(`WT rainfall normalized`);
    }

    updated.gwRechargeWtRainfallNormalized = wtRain;


    /* ------------------ 5. RIF method ------------------ */
    const rifRain = calculateRIFRecharge(
        areaHa,
        normalMonsoonRain,
        rifMonsoon
    );

    updated.gwRechargeRifMethod = rifRain;

    /* ------------------ 6. Adoption ------------------ */
    let rejectionReason = null;
    if (fluctuation <= 0) rejectionReason = 'Negative Fluctuation';
    else if (wtRain <= 0) rejectionReason = 'Negative WLFM Recharge';

    const pd = calculatePercentDeviation(wtRain, rifRain);
    const adopted = adoptRainfallRecharge(wtRain, rifRain, pd, rejectionReason);

    updated.percentDeviation = pd;
    updated.finalRainfallRecharge = adopted.value;
    updated.adoptedRainfallMethod = adopted.method;
    updated.gwRechargeRainfallMonsoon = updated.finalRainfallRecharge;

    /* ------------------ 7. NON-MONSOON ------------------ */

    let nmRainRecharge = 0;

    if (annualNormalRain > 0) {

        const ratio =
            normalNonMonsoonRain /
            annualNormalRain;

        updated.isNonMonsoonRainfallBelowThreshold =
            ratio < 0.10;

        if (ratio >= 0.10) {

            nmRainRecharge =
                calculateNonMonsoonRIF(
                    areaHa,
                    normalNonMonsoonRain,
                    annualNormalRain,
                    rifBase
                );
        }
    }

    updated.gwRechargeRainfallNonMonsoon =
        Math.max(0, nmRainRecharge);


    /* Other sources */

    const nmIrrigation =
        safeParse(updated.gwRechargeOtherNonMonsoon);

    const nmCanalsTanks =
        safeParse(updated.gwRechargeFromCanalsNonMonsoon);

    const totalNonMonsoon = Math.max(
        0,
        nmRainRecharge +
        nmIrrigation +
        nmCanalsTanks
    );

    updated.totalNonMonsoonRecharge =
        totalNonMonsoon;


    /* ------------------ 8. TOTAL RECHARGE ------------------ */

    const totalRecharge = Math.max(
        0,
        updated.gwRechargeRainfallMonsoon +
        totalOther +
        totalNonMonsoon
    );


    /* ------------------ 9. NATURAL DISCHARGE ------------------ */

    const ndDefault =
        adopted.method === 'WT' ? 5 : 10;

    const ndFinal =
        calculateNaturalDischarge(
            totalRecharge,
            ndDefault,
            updated.userNaturalDischarge
        );


    /* Net Availability */

    updated.totalGwAvailable =
        Math.max(
            0,
            totalRecharge - ndFinal
        );


    /* ------------------ 10. STATIC RESOURCES ------------------ */
    // Formula: Area * (Bottom - PreMonsoonPiezometric) * Sy
    const bottomUnconfined = safeParse(updated.bottomOfUnconfinedAquifer);
    const preMonsoonDepth = safeParse(updated.preMonsoonDepth);

    // Assuming depths are mbgl, thickness = Bottom - PreMonsoon
    const staticThickness = Math.max(0, bottomUnconfined - preMonsoonDepth);
    updated.staticGroundWaterResource = areaHa * staticThickness * specificYield;


    /* ------------------ 11. CONFINED AQUIFER ------------------ */
    const confinedArea = safeParse(updated.confinedArea);
    const storativity = safeParse(updated.storativity);
    const piezoPre = safeParse(updated.piezometricHeadPre);
    const piezoPost = safeParse(updated.piezometricHeadPost);
    const bottomConfining = safeParse(updated.bottomOfTopConfiningLayer);

    // Dynamic: Change in storage (Pre - Post)
    // Note: If Pre > Post (Pre-Monsoon level is higher? No, usually Post is higher/shallower)
    // Fluctuation = Post(shallower AMSL) - Pre(deeper AMSL)
    // Absolute difference for magnitude
    updated.dynamicConfinedResource = confinedArea * storativity * Math.abs(piezoPost - piezoPre);

    // In-Storage: Head above bottom of confining layer (PreHead - BottomConfining)
    updated.instorageConfinedResource = confinedArea * storativity * Math.max(0, piezoPre - bottomConfining);

    // Total Confined
    updated.totalConfinedResource = updated.dynamicConfinedResource + updated.instorageConfinedResource;


    /* ------------------ 12. STAGE OF EXTRACTION ------------------ */
    const extMonsoon = safeParse(updated.gwExtractionMonsoon);
    // Try to find non-monsoon extraction, or default to 0 if not present
    const extNonMonsoon = safeParse(updated.gwExtractionNonMonsoon) || 0;

    updated.gwWithdrawal = extMonsoon + extNonMonsoon;

    if (updated.totalGwAvailable > 0) {
        updated.stageOfExtraction = (updated.gwWithdrawal / updated.totalGwAvailable) * 100;
    } else {
        updated.stageOfExtraction = 0;
    }


    /* ------------------ 13. SURFACE WATER AVAILABILITY ------------------ */

    let totalSw = 0;
    if (updated.surfaceWaterBodies && Array.isArray(updated.surfaceWaterBodies)) {
        totalSw = updated.surfaceWaterBodies.reduce((sum, body) => {
            return sum + (safeParse(body.capacity) || 0);
        }, 0);
    }

    // Also check if totalStorageCapacity was set directly (legacy support)
    if (totalSw === 0 && updated.totalStorageCapacity) {
        totalSw = safeParse(updated.totalStorageCapacity);
    }

    updated.totalSwAvailable = totalSw;


    /* ------------------ 14. SUMMARY AGGREGATIONS ------------------ */

    // 1. Total Rainfall Recharge
    updated.totalGwRechargeRainfall =
        (updated.gwRechargeRainfallMonsoon || 0) +
        (updated.gwRechargeRainfallNonMonsoon || 0);

    // 2. Total Other Source Recharge
    // Non-Monsoon Other Total components
    const ecNonMonsoonOtherRec = safeParse(updated.gwRechargeOtherNonMonsoon); // Return Flow
    const ecNonMonsoonCanalRec = safeParse(updated.gwRechargeFromCanalsNonMonsoon); // Canals/Tanks

    // Total Non-Monsoon Other
    updated.gwRechargeOtherNonMonsoonTotal = ecNonMonsoonOtherRec + ecNonMonsoonCanalRec;

    updated.totalGwRechargeOther =
        (updated.gwRechargeOtherMonsoon || 0) +
        updated.gwRechargeOtherNonMonsoonTotal;

    // 3. Final Total Water Available (GW + SW)
    // totalGwAvailable is Net Annual GW Availability
    updated.totalWaterAvailable =
        (updated.totalGwAvailable || 0) +
        (updated.totalSwAvailable || 0);


    /* ------------------ AUDIT ------------------ */

    updated.methodAuditTrail =
        auditTrail;

    return updated;

};