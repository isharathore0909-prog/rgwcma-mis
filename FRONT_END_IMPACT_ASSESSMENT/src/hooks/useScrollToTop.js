import { useEffect } from 'react';

/**
 * Custom hook to scroll to top when component mounts
 * @param {boolean} smooth - Whether to use smooth scrolling (default: true)
 */
export const useScrollToTop = (smooth = true) => {
    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }, [smooth]);
};
