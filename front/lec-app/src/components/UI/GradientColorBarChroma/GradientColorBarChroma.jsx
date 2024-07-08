import React from 'react';
import chroma from 'chroma-js';
import './GradientColorBar.css';

// Alternativa al GradientColorBar que usa chroma, que permite
// mayor presonalizacion en la creacion del gradiente
// por ej. discretización de colores en un rango de valores (valor de 'step')
const GradientColorBar = ({
  gradient = ['red', 'yellow', 'green'],
  width = 25,
  height = 200,
  steps = 50,
  minValue = 0,
  maxValue = 1
}) => {
  // Crear el gradiente usando chroma.js
  const colors = chroma.scale(gradient).colors(steps);
  const midValue = (minValue + maxValue) / 2;


  return (
    <div className="color-bar" style={{ width: `${width}px`, height: `${height}px` }}>
      {colors.map((color, i) => (
        <div
          key={i}
          className="color-segment"
          style={{
            backgroundColor: color,
            height: `${height / steps}px`,
          }}
        />
      ))}
      <div className="labels">
        <span>{minValue}</span>
        <span>{midValue}</span>
        <span>{maxValue}</span>
      </div>
    </div>

  );
};

export default GradientColorBar;
