import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { useState } from 'react';


const getCityCoordinates = async (cityName) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${cityName}`);
    const data = await response.json();

    console.log(data);

    if (data.results && data.results.length > 0) {
      return data.results[0].geometry;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching city coordinates: ", error);
    return null;
  }
};


const OlMap = (props) => {
  const mapRef = useRef();
  const [map, setMap] = useState();

  useEffect(() => {
    // Inicializar mapa
    const initialMap = new Map({
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
    setMap(initialMap);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
      {props.children}
    </div>
  );
}

export default OlMap;
