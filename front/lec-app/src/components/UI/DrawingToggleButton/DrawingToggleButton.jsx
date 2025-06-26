import React from 'react';
import './DrawingToggleButton.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPencilSquareO } from '@fortawesome/free-solid-svg-icons';
import { FaVectorSquare } from "react-icons/fa6";
import { useTranslation } from 'react-i18next';

function DrawingToggleButton({ isDrawingEnabled, onChange }) {
    const { t } = useTranslation();
    
    return (
        <button className={`left-button ${isDrawingEnabled ? 'left-button-enabled' : 'left-button-disabled'}`} onClick={onChange}>
            <FaVectorSquare size={isDrawingEnabled ? 24 : 23} title={isDrawingEnabled ? t("Draw area (enabled)") : t("Draw area")} />
        </button>
    );
}

export default DrawingToggleButton;
