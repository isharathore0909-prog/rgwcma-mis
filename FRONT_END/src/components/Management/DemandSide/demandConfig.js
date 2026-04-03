export const INTERVENTION_TYPES = [
    { id: 'sprinkler', label: 'Micro-Irrigation through Sprinkler', shortLabel: 'Sprinkler', icon: '🚿', reduction: 0.3, type: 'standard' },
    { id: 'drip', label: 'Micro-Irrigation through Drip', shortLabel: 'Drip', icon: '💧', reduction: 0.4, type: 'standard' },
    { id: 'pipelines', label: 'Irrigation through underground pipelines', shortLabel: 'Pipelines', icon: '🚜', reduction: 0.2, type: 'standard' },
    { id: 'diversification', label: 'Crop diversification', shortLabel: 'Diversification', icon: '🌽', reduction: 0, type: 'special' },
    { id: 'innovative', label: 'Any other measure for saving of water in agriculture / Innovative measures (Pl. specify)', shortLabel: 'other measures', icon: '✨', reduction: 0, type: 'innovative' }
];

export const SEASONS = [
    { id: 'kharif', label: 'Kharif Crops', icon: '🌾' },
    { id: 'rabi', label: 'Rabi Crops', icon: '🌾' },
    { id: 'summer', label: 'Summer Crops', icon: '☀️' },
    { id: 'funding', label: 'Funding Source', icon: '💰' }
];

export const INITIAL_DATA = {
    sprinkler: { kharif: [], rabi: [], summer: [], funding: [] },
    drip: { kharif: [], rabi: [], summer: [], funding: [] },
    pipelines: { kharif: [], rabi: [], summer: [], funding: [] },
    diversification: {
        kharif: { original: [], changed: [] },
        rabi: { original: [], changed: [] },
        summer: { original: [], changed: [] },
        funding: []
    },
    innovative: { kharif: [], rabi: [], summer: [], funding: [] }
};
