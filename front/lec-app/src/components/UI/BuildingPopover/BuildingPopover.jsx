import React from 'react';
import './BuildingPopover.css';
import { FaBuilding, FaBolt, FaSolarPanel, FaClipboard, FaMapMarkerAlt, FaLink, FaIdCard } from 'react-icons/fa';

const BuildingPopover = ({ building, position, onClose, color }) => {
  if (!building) return null;

  const colorUsable = color.luminance() < 0.8?color:color.darker()

  return (
    <div className="popover" style={position ? { left: position[0], top: position[1], zIndex: 999 } : { }}>
      {!position && <div className="popover-title" style={color?{background:color, color: color.luminance() > 0.5? '#000000' : '#ffffff' }:{}}>
        <h3><FaBuilding /> Selected Building</h3>
        <button className="close-btn no-print" onClick={onClose}>&times;</button>
      </div>}
      <div className="popover-content">
        <div className="info-grid" style={color?{color:colorUsable}:{}}>
          <div className="info-item">
            <FaMapMarkerAlt />
            <span>Area</span>
            <strong>{building.AREA.toFixed(2)}</strong> 
            <strong>m²</strong>
          </div>
          <div className="info-item">
            <FaBolt />
            <span>Potential</span>
            <strong>{building.MEAN.toFixed(2)}</strong>
            <strong>kWh/m²</strong>
          </div>
          <div className="info-item">
            <FaSolarPanel />
            <span>Total Production</span>
            <strong>{building.production.toFixed(2)}</strong>
            <strong>MW/h year</strong>
          </div>
          <div className="info-item">
            <FaSolarPanel />
            <span>Num. pannels</span>
            <strong>{building.pannels.toFixed(2)}</strong>
            <strong>units</strong>
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
          {/* <div className="info-item">
            <FaIdCard />
            <span>ID</span>
            <strong>{building.id}</strong>
          </div> */}
        </div>
      </div>
      <div className="popover-footer no-print">
        <a href={building.informatio} target="_blank" rel="noopener noreferrer" className="cadastre-link" style={{color:colorUsable}}>
          <FaLink /> View Cadastre
        </a>
      </div>
    </div>
  );
};

export default BuildingPopover;