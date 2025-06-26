import React from 'react';
import './ExportPanel.css';
import { FaFileExport, FaPrint } from "react-icons/fa6";
import { useTranslation } from 'react-i18next';

function ExportPanel({ exportFileProcedure }) {
    const { t } = useTranslation();

    const onClick = () => {
        exportFileProcedure()
    }

    return (
        <div className='export-panel'>
            <button className='print-button' onClick={window.print}>
                <FaPrint className='export-icon' size={23} title={t("Export to PDF or print the report with the currently displayed information")} />
                <span>{t("Print")}</span>
            </button>

            <button className='export-button' onClick={onClick}>
                <FaFileExport className='export-icon' size={23} title={t("Export to PDF or print the report with the currently displayed information")} />
                <span>{t("Generate report")}</span>
            </button>
        </div>
    );
}

export default ExportPanel;
