import React from 'react';
import './ExportPanel.css';
import { FaFileExport, FaPrint } from "react-icons/fa6";


function ExportPanel({ exportFileProcedure }) {

    const onClick = () => {
        exportFileProcedure()
    }

    return (
        <div className='export-panel'>

            <button className='print-button' onClick={window.print}>
                <FaPrint className='export-icon' size={23} title={"Export to PDF or print the report with the currently displayed information"} />
                <span>Print</span>
            </button>

            <button className='export-button' onClick={onClick}>
                <FaFileExport className='export-icon' size={23} title={"Export to PDF or print the report with the currently displayed information"} />
                <span>Generate report</span>
            </button>

        </div>

    );
}

export default ExportPanel;
