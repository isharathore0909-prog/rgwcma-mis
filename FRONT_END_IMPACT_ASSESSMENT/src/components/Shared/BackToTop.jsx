import React, { useState, useEffect } from 'react';
import './BackToTop.css';

const BackToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled down
    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Set the scroll event listener
    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className={`back-to-top ${isVisible ? 'visible' : ''}`} onClick={scrollToTop}>
            <div className="scroll-progress-ring">
                <svg width="50" height="50" viewBox="0 0 50 50">
                    <circle
                        className="bg"
                        cx="25" cy="25" r="22"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                    />
                    <path
                        d="M 25,12 L 15,25 L 21,25 L 21,38 L 29,38 L 29,25 L 35,25 Z"
                        fill="currentColor"
                    />
                </svg>
            </div>
            <span className="tooltip">Scroll to Top</span>
        </div>
    );
};

export default BackToTop;
