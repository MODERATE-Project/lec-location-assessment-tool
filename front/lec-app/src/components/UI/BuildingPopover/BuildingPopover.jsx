import React from 'react';
import './BuildingPopover.css';

const BuildingPopover = ({ building, position, onClose }) => {
  if (!building) return null;

  return (
    <div className="popover" style={position ? { left: position[0], top: position[1] } : {}}>
      {!position && <button className="close-btn" onClick={onClose}>&times;</button>}
      <p><b>AREA:</b> {building['AREA'].toFixed(2)}</p>
      <p><b>Potential:</b> {building['MEAN'].toFixed(2)}</p>
      <p><b>MWh_aprove:</b> {building['MWh_aprove'].toFixed(2)}</p>
      <p><b>MWh_prod_e:</b> {building['MWh_prod_e'].toFixed(2)}</p>
      <p><b>currentUse:</b> {building['currentUse']}</p>
      <p><b>reference:</b> {building['reference']}</p> 
      <p><b>area_m2:</b> {building['area_m2']}</p>
      <p><b>id:</b> {building['id']}</p>
      <p><b>Cadastre:</b> <a href={building['informatio']}>follow link</a></p>
      {/* 
      <p><b>Secciones:</b> {building['Secciones']}</p>
      <p><b>Municipios:</b> {building['Municipios']}</p>
      <p><b>Porcentaje_Hogares_unipersonales:</b> {building['Porcentaje_Hogares_unipersonales']}</p>
      <p><b>Porcentaje_mayor_65:</b> {building['Porcentaje_mayor_65']}</p>
      <p><b>Porcentaje_menor_18:</b> {building['Porcentaje_menor_18']}</p>
      <p><b>Porcentaje_poblacion:</b> {building['Porcentaje_poblacion']}</p>
      <p><b>Renta_media:</b> {building['Renta_media']}</p>
      <p><b>Tamaño_medio_hogar:</b> {building['Tamaño_medio_hogar']}</p>
      <p><b>Total_edad_media:</b> {building['Total_edad_media']}</p>
      <p><b>Total_poblacion:</b> {building['Total_poblacion']}</p>
      */}
    </div>
  );
};

export default BuildingPopover;