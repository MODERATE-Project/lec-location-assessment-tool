import React from 'react';
import './BuildingPopover.css';
import { FaBuilding, FaBolt, FaSolarPanel, FaClipboard, FaMapMarkerAlt, FaLink, FaIdCard } from 'react-icons/fa';

const BuildingPopover = ({ building, position, onClose }) => {
  if (!building) return null;

  return (
    <div className="popover" style={position ? { left: position[0], top: position[1] } : {}}>
      {!position && <div className="popover-title">
        <h3><FaBuilding /> Selected Building</h3>
        <button className="close-btn no-print" onClick={onClose}>&times;</button>
      </div>}
      <div className="popover-content">
        <div className="info-grid">
          <div className="info-item">
            <FaMapMarkerAlt />
            <span>Area</span>
            <strong>{building.AREA.toFixed(2)} m²</strong>
          </div>
          <div className="info-item">
            <FaBolt />
            <span>Potential</span>
            <strong>{building.MEAN.toFixed(2)} MWh</strong>
          </div>
          <div className="info-item">
            <FaSolarPanel />
            <span>MWh Approved</span>
            <strong>{building.MWh_aprove.toFixed(2)}</strong>
          </div>
          <div className="info-item">
            <FaSolarPanel />
            <span>MWh Produced</span>
            <strong>{building.MWh_prod_e.toFixed(2)}</strong>
          </div>
          <div className="info-item">
            <FaClipboard />
            <span>Current Use</span>
            <strong>{building.currentUse}</strong>
          </div>
          {/* <div className="info-item">
            <FaIdCard />
            <span>Reference</span>
            <strong>{building.reference}</strong>
          </div> */}
          <div className="info-item">
            <FaIdCard />
            <span>ID</span>
            <strong>{building.id}</strong>
          </div>
        </div>
      </div>
      <div className="popover-footer no-print">
        <a href={building.informatio} target="_blank" rel="noopener noreferrer" className="cadastre-link">
          <FaLink /> View Cadastre
        </a>
      </div>
    </div>
  );
};

export default BuildingPopover;