import React from 'react';
import './ExportButton.css';
import { FaFileExport } from "react-icons/fa6";

function ExportButton({ exportFileProcedure }) {

    const onClick = () => {
        exportFileProcedure()
    }

    return (
        <button className='export-button'  onClick={onClick}>
            <FaFileExport size={23} title={"Export as PDF"} />
        </button>

    );
}

export default ExportButton;
