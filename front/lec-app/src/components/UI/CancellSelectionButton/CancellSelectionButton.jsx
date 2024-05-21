import React from 'react';
import './CancellSelectionButton.css';

function CancellSelectionButton({ onClick: restoreBuildingsAndRemovePolygon }) {

    const handleClick = () => {
        restoreBuildingsAndRemovePolygon();
    }

    return (
        <button className='cancelselection-button' onClick={handleClick}>
            ✖️ Remove polygon and reset buildings
        </button>

    );
}

export default CancellSelectionButton;
