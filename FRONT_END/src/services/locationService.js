import { BASE_URL } from '../api/config';

export const locationService = {
    async getDistricts(signal) {
        const response = await fetch(`${BASE_URL}/locations/districts/`, { signal });
        if (!response.ok) throw new Error('Failed to fetch districts');
        return response.json();
    },

    async getBlocks(districtId, signal) {
        const response = await fetch(`${BASE_URL}/locations/blocks/?district_id=${districtId}`, { signal });
        if (!response.ok) throw new Error('Failed to fetch blocks');
        return response.json();
    },

    async getGPs(blockId, signal) {
        const response = await fetch(`${BASE_URL}/locations/gps/?block_id=${blockId}`, { signal });
        if (!response.ok) throw new Error('Failed to fetch GPs');
        return response.json();
    },

    async getAverageRainfall(gpId, signal) {
        const response = await fetch(`${BASE_URL}/rainfall/average/?gp_id=${gpId}`, { signal });
        if (!response.ok) throw new Error('Failed to fetch rainfall data');
        return response.json();
    },

    async getNormalMonsoonRainfall(gpId, signal) {
        const response = await fetch(`${BASE_URL}/rainfall/normal-monsoon/?gp_id=${gpId}`, { signal });
        if (!response.ok) throw new Error('Failed to fetch normal monsoon rainfall');
        return response.json();
    },

    async getAquiferData(gpId, signal) {
        const response = await fetch(`${BASE_URL}/aquifer/gp-data/?gp_id=${gpId}`, { signal });
        if (!response.ok) throw new Error('Failed to fetch aquifer data');
        return response.json();
    },

    async getWaterQualityData(gpId, signal) {
        const response = await fetch(`${BASE_URL}/water-quality/?gp_id=${gpId}`, { signal });
        if (!response.ok) throw new Error('Failed to fetch water quality data');
        return response.json();
    },

    async getAquiferTrend(gpId, signal) {
        const response = await fetch(`${BASE_URL}/aquifer/trend/?gp_id=${gpId}`, { signal });
        if (!response.ok) throw new Error('Failed to fetch aquifer trend data');
        return response.json();
    },

    async getAquiferWaterLevelData(gpId, signal) {
        const response = await fetch(`${BASE_URL}/aquifer-water-level/?gp_id=${gpId}`, { signal });
        if (!response.ok) throw new Error('Failed to fetch aquifer water level data');
        return response.json();
    },

    async getGPExcelData(gpId, signal) {
        const response = await fetch(`${BASE_URL}/gp-excel-data/?gp_id=${gpId}`, { signal });
        if (!response.ok) throw new Error('Failed to fetch GP Excel data');
        return response.json();
    },

    async getGPBoundary(gpId, signal) {
        const response = await fetch(`${BASE_URL}/locations/gp-boundary/?gp_id=${gpId}`, { signal });
        // If 404, might return null or throw. 
        if (!response.ok) return null;
        return response.json();
    },

    async getContourMap(gpId, parameter, lat, lon, signal) {
        let url = `${BASE_URL}/contour-map/?gp_id=${gpId}&parameter=${parameter}`;
        if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error('Failed to fetch contour map');
        return response.json();
    },

    async getGeomorphologyMap(gpId, lat, lon, signal) {
        let url = `${BASE_URL}/geomorphology-map/?gp_id=${gpId}&info=true`;
        if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error('Failed to fetch geomorphology map metadata');
        return response.json();
    },

    async getAquiferMap(gpId, lat, lon, signal) {
        let url = `${BASE_URL}/aquifer-map/?gp_id=${gpId}`;
        if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error('Failed to fetch aquifer map');
        return response.json();
    },

    async getLULCMap(gpId, lat, lon, signal) {
        let url = `${BASE_URL}/lulc-map/?gp_id=${gpId}&info=true`;
        if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error('Failed to fetch lulc map metadata');
        return response.json();
    },

    async getDEMMap(gpId, lat, lon, signal) {
        let url = `${BASE_URL}/dem-map/?gp_id=${gpId}&info=true`;
        if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error('Failed to fetch dem map metadata');
        return response.json();
    },

    async getDrainageMap(gpId, lat, lon, signal) {
        let url = `${BASE_URL}/drainage-map/?gp_id=${gpId}`;
        if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error('Failed to fetch drainage map');
        return response.json();
    },

    async getDEMContourMap(gpId, lat, lon, signal) {
        let url = `${BASE_URL}/dem-contour-map/?gp_id=${gpId}`;
        if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error('Failed to fetch DEM contour map');
        return response.json();
    },


    async getLocationComposition(gpId, lat, lon, signal) {
        let url = `${BASE_URL}/location-composition/?gp_id=${gpId}`;
        if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error('Failed to fetch location composition');
        return response.json();
    },

    async getWaterbodiesInfo(gpId, lat, lon, signal) {
        let url = `${BASE_URL}/waterbodies-info/?gp_id=${gpId}`;
        if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error('Failed to fetch waterbodies info');
        return response.json();
    },

    async getInfrastructureInfo(gpId, lat, lon, signal) {
        let url = `${BASE_URL}/infrastructure-info/?gp_id=${gpId}`;
        if (lat && lon) url += `&lat=${lat}&lon=${lon}`;
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error('Failed to fetch infrastructure info');
        return response.json();
    },

};
