export const GEC_NORMS = {
    canal_seepage: [
        {
            type: "Unlined canals in normal soils with some clay content along with sand",
            recommended: 17.5,
            min: 15,
            max: 20
        },
        {
            type: "Unlined canals in sandy soil with some silt content",
            recommended: 27.5,
            min: 25,
            max: 30
        },
        {
            type: "Lined canals in normal soils with some clay content along with sand",
            recommended: 3.5,
            min: 3,
            max: 4
        },
        {
            type: "Lined canals in sandy soil with some silt content",
            recommended: 5.5,
            min: 5,
            max: 6
        },
        {
            type: "All canals in hard rock area",
            recommended: 3.5,
            min: 3,
            max: 4
        }
    ],
    irrigation_return_flow: {
        norms: [
            { depth: 10, gw_paddy: 45, gw_non_paddy: 25, sw_paddy: 50, sw_non_paddy: 30 },
            { depth: 11, gw_paddy: 43.3, gw_non_paddy: 23.7, sw_paddy: 48.3, sw_non_paddy: 28.7 },
            { depth: 12, gw_paddy: 41.7, gw_non_paddy: 22.3, sw_paddy: 46.7, sw_non_paddy: 27.3 },
            { depth: 13, gw_paddy: 40, gw_non_paddy: 21, sw_paddy: 45, sw_non_paddy: 26 },
            { depth: 14, gw_paddy: 38.3, gw_non_paddy: 19.7, sw_paddy: 43.3, sw_non_paddy: 24.7 },
            { depth: 15, gw_paddy: 36.7, gw_non_paddy: 18.3, sw_paddy: 41.7, sw_non_paddy: 23.3 },
            { depth: 16, gw_paddy: 35, gw_non_paddy: 17, sw_paddy: 40, sw_non_paddy: 22 },
            { depth: 17, gw_paddy: 33.3, gw_non_paddy: 15.7, sw_paddy: 38.3, sw_non_paddy: 20.7 },
            { depth: 18, gw_paddy: 31.7, gw_non_paddy: 14.3, sw_paddy: 36.7, sw_non_paddy: 19.3 },
            { depth: 19, gw_paddy: 30, gw_non_paddy: 13, sw_paddy: 35, sw_non_paddy: 18 },
            { depth: 20, gw_paddy: 28.3, gw_non_paddy: 11.7, sw_paddy: 33.3, sw_non_paddy: 16.7 },
            { depth: 21, gw_paddy: 26.7, gw_non_paddy: 10.3, sw_paddy: 31.7, sw_non_paddy: 15.3 },
            { depth: 22, gw_paddy: 25, gw_non_paddy: 9, sw_paddy: 30, sw_non_paddy: 14 },
            { depth: 23, gw_paddy: 23.3, gw_non_paddy: 7.7, sw_paddy: 28.3, sw_non_paddy: 12.7 },
            { depth: 24, gw_paddy: 21.7, gw_non_paddy: 6.3, sw_paddy: 26.7, sw_non_paddy: 11.3 },
            { depth: 25, gw_paddy: 20, gw_non_paddy: 5, sw_paddy: 25, sw_non_paddy: 10 }
        ],
        bonus_continuous: 5
    },
    tanks_and_ponds: {
        recommended: 0.0014,
        min: 0.0010,
        max: 0.0018
    },
    wcs: {
        total: 40,
        monsoon: 20,
        non_monsoon: 20
    }
};

export const LIVESTOCK_NORMS = [
    { type: 'Cattle', requirement: 85 },
    { type: 'Buffalo', requirement: 100 },
    { type: 'Sheep', requirement: 7 },
    { type: 'Goat', requirement: 7 },
    { type: 'Horse', requirement: 25 },
    { type: 'Mule', requirement: 22 },
    { type: 'Donkey', requirement: 10 },
    { type: 'Camel', requirement: 60 },
    { type: 'Pig', requirement: 15 },
    { type: 'Poultry', requirement: 0.3 }
];

/**
 * Calculates Irrigation Return Flow Factor (RFF) based on GEC 2015 norms
 * @param {number} depth - Depth to Water Table (m bgl)
 * @param {string} source - 'GW' or 'SW'
 * @param {string} cropType - 'PADDY' or 'NON_PADDY'
 * @param {boolean} isContinuous - Whether supply is continuous (+5% bonus)
 * @returns {number} RFF as a decimal (0.0 to 1.0)
 */
export const calculateRFF = (depth, source, cropType, isContinuous = false) => {
    const d = Math.min(25, Math.max(10, parseFloat(depth) || 10));
    const s = (source || 'GW').toUpperCase();
    const ct = (cropType || 'NON_PADDY').toUpperCase() === 'PADDY' ? 'paddy' : 'non_paddy';

    const norms = GEC_NORMS.irrigation_return_flow.norms;
    const key = `${s.toLowerCase()}_${ct}`;

    // Find the two points for interpolation
    let p1, p2;
    for (let i = 0; i < norms.length - 1; i++) {
        if (d >= norms[i].depth && d <= norms[i + 1].depth) {
            p1 = norms[i];
            p2 = norms[i + 1];
            break;
        }
    }

    if (!p1 || !p2) return 0.25; // Fallback

    // Linear interpolation: y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
    const val1 = p1[key];
    const val2 = p2[key];
    let resultPercent = val1 + (d - p1.depth) * (val2 - val1) / (p2.depth - p1.depth);

    if (isContinuous) {
        resultPercent += GEC_NORMS.irrigation_return_flow.bonus_continuous;
    }

    return Math.min(50, resultPercent) / 100.0;
};

