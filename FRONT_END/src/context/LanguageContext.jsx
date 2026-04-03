import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext({
    language: 'en',
    setLanguage: () => { },
    toggleLanguage: () => { },
    t: (key) => key
});

const translations = {
    en: {
        department_name: 'Rajasthan Groundwater (Conservation & Management) Authority',
        govt_rajasthan: 'Government of Rajasthan'
    },
    hi: {
        department_name: 'राजस्थान भूजल (संरक्षण और प्रबंधन) प्राधिकरण',
        govt_rajasthan: 'राजस्थान सरकार'
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    const t = (key) => translations[language][key] || key;

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'hi' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    // Removed error throwing to be safer, defaulting to initial context if provider missing
    return context;
};
