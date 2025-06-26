import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  return (
    <div className="language-selector">
      <button 
        className={`lang-btn ${i18n.language.startsWith('es') ? 'active' : ''}`}
        onClick={() => i18n.changeLanguage('es')}
      >
        ES
      </button>
      <button 
        className={`lang-btn ${i18n.language.startsWith('en') ? 'active' : ''}`}
        onClick={() => i18n.changeLanguage('en')}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSelector; 