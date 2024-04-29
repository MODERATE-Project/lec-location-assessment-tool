import React from 'react';
import './DrawingToggleButton.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPencilSquareO } from '@fortawesome/free-solid-svg-icons';
import { FaVectorSquare } from "react-icons/fa6";

function DrawingToggleButton({ isDrawingEnabled, onChange }) {
    return (
        <button className={`left-button ${isDrawingEnabled ? 'left-button-enabled' : 'left-button-disabled'}`} onClick={onChange}>
            <FaVectorSquare size={isDrawingEnabled ? 24 : 23} title={isDrawingEnabled ? "Dibujar área (activado)" : "Dibujar área"} />

        </button>


    );
}

export default DrawingToggleButton;
