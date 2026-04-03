export const safeParse = (val, defaultVal = 0) => {
    const parsed = parseFloat(val);
    if (isNaN(parsed)) {
        return defaultVal;
    }
    return parsed;
};

export const validateAssessmentUnit = (
    stage,
    hasSignificantDeclinePre,
    hasSignificantDeclinePost
) => {
    const parsedStage = safeParse(stage, null);

    if (parsedStage === null) {
        return {
            isValid: false,
            message: 'Stage of extraction not assessable. Check availability and draft data.'
        };
    }

    const bothDecline = !!hasSignificantDeclinePre && !!hasSignificantDeclinePost;

    // GEC-2015: Decline indicators do NOT invalidate stage
    if (parsedStage <= 70 && bothDecline) {
        return {
            isValid: true,
            message: 'SAFE unit with significant decline indicators. Recommend monitoring and local investigation.'
        };
    }

    if (parsedStage > 100 && !bothDecline) {
        return {
            isValid: true,
            message: 'OVER-EXPLOITED unit. Decline not evident but category remains valid.'
        };
    }

    return { isValid: true, message: 'Assessment consistent with GEC-2015 criteria.' };
};
