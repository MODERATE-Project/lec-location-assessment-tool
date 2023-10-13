import React, { useEffect, useRef, useCallback } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";

const OlMap = (props) => {
  const mapRef = useRef();
  const [map, setMap] = React.useState(null);

  useEffect(() => {
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
      controls: []
    });

    setMap(initialMap);
  }, []);

  const panToLocation = useCallback(async (locName) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${locName}`);
      const json = await response.json();
      if (json && json.length > 0) {
        const location = json[0];
        const coordinates = fromLonLat([parseFloat(location.lon), parseFloat(location.lat)]);
        map.getView().animate({
          center: coordinates,
          zoom: 11
        });
      } else {
        alert('Ubicación no encontrada');
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    }
  }, [map]);

  useEffect(() => {
    if (props.location && map) {
      panToLocation(props.location);
    }
  }, [props.location, map, panToLocation]);

  return (
    <div style={{ position: "relative", width: "100%", height: "600px" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
      {props.children}
    </div>
  );
};

export default OlMap;
