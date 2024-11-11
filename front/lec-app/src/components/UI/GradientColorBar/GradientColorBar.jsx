import React from 'react';
import chroma from 'chroma-js';
import './GradientColorBar.css';

const formatNumber = (num) => {
  return num.toFixed(1).replace(/\.0$/, '');
}

const GradientColorBar = ({
  gradient = ['red', 'yellow', 'green'],
  width = 25,
  height = 200,
  minValue = 0,
  maxValue = 1,
  variableName = 'Production'
}) => {
  // Crear el gradiente usando chroma.js
  const gradientString = `linear-gradient(to top, ${gradient.join(', ')})`;
  const midValue = (minValue + maxValue) / 2;


  return (
    <div className="color-bar">
      <div className='variable-name'><span>{variableName}</span></div>
      <div
        className="gradient"
        style={{
          width: `${width}px`, height: `${height}px`,
          background: gradientString,
        }}
      />
      <div className="labels">
        <span>{formatNumber(minValue)}</span>
        <span>{formatNumber(midValue)}</span>
        <span>{formatNumber(maxValue)}</span>
      </div>
    </div>
  );
};

export default GradientColorBar;
