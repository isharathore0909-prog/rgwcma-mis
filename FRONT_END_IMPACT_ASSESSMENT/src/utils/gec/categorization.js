/**
 * Calculates the Stage of Ground Water Extraction.
 * Formula: SOD = (Gross Extraction / Net Availability) * 100
 * @param {number} extraction - Total Annual Ground Water Extraction (ham)
 * @param {number} availability - Annual Extractable Ground Water Resource (ham)
 * @returns {number} Stage of Extraction (%)
 */
export const calculateStageOfExtraction = (extraction, availability) => {
    if (availability <= 0) return null; // Not assessable as per GEC-2015
    return (extraction / availability) * 100;
};

export const categorizeUnit = (stage, qualityHazards = {}) => {
    if (stage === null) return 'NOT ASSESSABLE';

    let category;
    if (stage <= 70) category = 'SAFE';
    else if (stage > 70 && stage <= 90) category = 'SEMI-CRITICAL';
    else if (stage > 90 && stage <= 100) category = 'CRITICAL';
    else category = 'OVER-EXPLOITED';

    const tags = [];
    if (qualityHazards.salinity) tags.push('Salinity');
    if (qualityHazards.fluoride) tags.push('Fluoride');
    if (qualityHazards.arsenic) tags.push('Arsenic');

    return tags.length ? `${category} (${tags.join(', ')})` : category;
};

