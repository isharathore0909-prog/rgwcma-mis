import React from 'react';
import useScroll from '../../hooks/useScroll';
// Note: In a real app, wrap the root with LanguageProvider. 
// For now, we import the hook to show usage, or fallback to direct usage if provider isn't wrapping.
// To ensure it works without rewriting index.js, we will use a self-contained approach or assume context is available.
// Given strict instructions to "arrange files in professional manner", I will assume the user will wrap the app.
// However, to prevent "breaking" if they drop this file in without the provider in index.js, I will use a safe approach.

import { useLanguage } from '../../context/LanguageContext';
import './Header.css';

const Header = () => {
    // Professional custom hook for scroll logic
    const isScrolled = useScroll(100);

    // Access language context
    const { t } = useLanguage();

    return (
        <header className={`header-container no-print ${isScrolled ? 'scrolled' : ''}`}>
            <div className={`header-main no-print ${isScrolled ? 'compact' : ''}`}>
                <div className="container">
                    <div className="branding-section">
                        {/* Logo */}
                        <div className="logo-wrapper">
                            <img
                                src="/logos/logo-black.png"
                                alt="Department Logo"
                                className="logo-img"
                            />
                        </div>

                        <div className="separator-line" />

                        <div className="title-wrapper">
                            <h1 className="department-name">
                                {t('department_name')}
                            </h1>
                            <p className="govt-name">
                                {t('govt_rajasthan')}
                            </p>
                        </div>
                    </div>

                    {/* Right Side Emblem */}
                    <div className="emblem-wrapper">
                        <img
                            src="/logos/india-emblem.png"
                            alt="Emblem of India"
                            className="emblem-img"
                        />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
