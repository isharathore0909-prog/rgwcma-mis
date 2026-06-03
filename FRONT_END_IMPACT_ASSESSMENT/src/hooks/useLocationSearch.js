import { useState, useEffect, useCallback } from 'react';
import { locationService } from '../services/locationService';

export const useLocationSearch = () => {
    const [districts, setDistricts] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [gps, setGps] = useState([]);

    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedBlock, setSelectedBlock] = useState('');
    const [selectedGp, setSelectedGp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        const fetchDistricts = async () => {
            setLoading(true);
            try {
                const districtList = await locationService.getDistricts(controller.signal);
                setDistricts(districtList);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError("Error fetching districts");
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDistricts();
        return () => controller.abort();
    }, []);

    const handleDistrictChange = useCallback(async (districtId) => {
        setSelectedDistrict(districtId);
        setSelectedBlock('');
        setSelectedGp('');
        setBlocks([]);
        setGps([]);

        if (districtId) {
            setLoading(true);
            try {
                const blockList = await locationService.getBlocks(districtId);
                setBlocks(blockList);
            } catch (err) {
                setError("Error fetching blocks");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    }, []);

    const handleBlockChange = useCallback(async (blockId) => {
        setSelectedBlock(blockId);
        setSelectedGp('');
        setGps([]);

        if (blockId) {
            setLoading(true);
            try {
                const gpList = await locationService.getGPs(blockId);
                setGps(gpList);
            } catch (err) {
                setError("Error fetching GPs");
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    }, []);

    const handleGpChange = useCallback((gpId) => {
        setSelectedGp(gpId);
    }, []);

    const getSelectedNames = () => {
        const districtObj = districts.find(d => d.id.toString() === selectedDistrict);
        const blockObj = blocks.find(b => b.id.toString() === selectedBlock);
        const gpObj = gps.find(g => g.id.toString() === selectedGp);

        return {
            districtName: districtObj?.name || '',
            blockName: blockObj?.name || '',
            gpName: gpObj?.name || ''
        };
    };

    return {
        districts,
        blocks,
        gps,
        selectedDistrict,
        selectedBlock,
        selectedGp,
        loading,
        error,
        handleDistrictChange,
        handleBlockChange,
        handleGpChange,
        getSelectedNames
    };
};
