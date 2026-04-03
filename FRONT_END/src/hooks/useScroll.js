import { useState, useEffect } from 'react';

/**
 * Custom hook to track scroll position
 * @param {number} threshold - Pixel value to trigger scrolled state
 * @returns {boolean} isScrolled
 */
const useScroll = (threshold = 100) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            setIsScrolled(prev => {
                if (!prev && scrollY > threshold) return true;
                if (prev && scrollY < 15) return false;
                return prev;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [threshold]);

    return isScrolled;
};

export default useScroll;
