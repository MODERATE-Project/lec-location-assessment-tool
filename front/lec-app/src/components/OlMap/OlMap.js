import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

const OlMap = () => {
  const mapRef = useRef();

  useEffect(() => {
    // Inicializar mapa
    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()

        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2
      }),
      controls: []
    });
  }, []);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '600px' }}></div>
  );
}

export default OlMap;
