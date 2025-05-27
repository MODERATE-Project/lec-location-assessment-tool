import React from 'react';
import './BuildingPopover.css';
import { FaBuilding, FaBolt, FaSolarPanel, FaClipboard, FaMapMarkerAlt, FaLink, FaIdCard } from 'react-icons/fa';
import { capitalizeCamel } from '../../../constants';
import { useTranslation } from 'react-i18next';

const BuildingPopover = ({ building, position, onClose, color }) => {
  const { t } = useTranslation();
  
  if (!building) return null;

  const colorUsable = color.luminance() < 0.8?color:color.darker()

  return (
    <div className="popover" style={position ? { left: position[0], top: position[1], zIndex: 999 } : { }}>
      {!position && <div className="popover-title" style={color?{background:color, color: color.luminance() > 0.5? '#000000' : '#ffffff' }:{}}>
        <h3><FaBuilding /> {t("Selected Building")}</h3>
        <button className="close-btn no-print" onClick={onClose}>&times;</button>
      </div>}
      <div className="popover-content">
        <div className="info-grid" style={color?{color:colorUsable}:{}}>
          <div className="info-item">
            <FaMapMarkerAlt />
            <span>{t("Area")}</span>
            <strong>{building.AREA.toFixed(2)}</strong> 
            <span>m²</span>
          </div>
          <div className="info-item">
            <FaBolt />
            <span>{t("Potential")}</span>
            <strong>{building.MEAN.toFixed(2)}</strong>
            <span>{t("kWh/m² per year")}</span>
          </div>
          <div className="info-item">
            <FaSolarPanel />
            <span>{t("Total Production")}</span>
            <strong>{building.production.toFixed(2)}</strong>
            <span>{t("MWh per year")}</span>
          </div>
          <div className="info-item">
            <FaSolarPanel />
            <span>{t("Number of Panels")}</span>
            <strong>{building.panels.toFixed(2)}</strong>
            <span>{t("units")}</span>
          </div>
          <div className="info-item">
            <FaClipboard />
            <span>{t("Current Use")}</span>
            <strong>{building.currentUse}</strong>
          </div>
          <div className="info-item">
            <FaIdCard />
            <span>{t("Cadastral Reference")}</span>
            <strong style={{wordBreak: 'break-all'}}>{building.reference}</strong>
          </div>
          {/* <div className="info-item">
            <FaIdCard />
            <span>ID</span>
            <strong>{building.id}</strong>
          </div> */}
        </div>
      </div>
      <div className="popover-footer no-print">
        <a href={building.informatio} target="_blank" rel="noopener noreferrer" className="cadastre-link" style={{color:colorUsable}}>
          <FaLink /> {t("View Cadastre")}
        </a>
      </div>
    </div>
  );
};

export default BuildingPopover;