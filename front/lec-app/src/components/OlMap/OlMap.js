import React, { useEffect, useRef, useCallback } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";

import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Stroke } from "ol/style";

import Select from "ol/interaction/Select";

import { Fill } from "ol/style";

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
      controls: [],
    });

    // Creación de la capa de municipios
    const municipalityLayer = new VectorLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        url: "/Municipios_IGN.geojson",
      }),
      style: new Style({
        stroke: new Stroke({
          color: "red",
          width: 2,
        }),
        fill: new Fill({ 
          color: 'rgba(255,255,255,0.1)'  // Relleno transparente
        }),
      }),
    });

    initialMap.addLayer(municipalityLayer);

    // Estilo de selección
    const selectStyle = new Style({
      stroke: new Stroke({
        color: "red",
        width: 2,
      }),
      fill: new Fill({
        color: "rgba(255, 0, 0, 0.1)", 
      }),
    });

    const select = new Select({
      condition: (event) => {
        let selected = false;
        initialMap.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
          if (layer === municipalityLayer) {
            selected = true;
          }
        });
        return selected;
      },
      layers: [municipalityLayer],
      style: selectStyle,
    });
    

    initialMap.addInteraction(select);

    setMap(initialMap);

    // Limpieza: remueve la interacción y la capa al desmontar el componente
    return () => {
      initialMap.removeInteraction(select);
      initialMap.removeLayer(municipalityLayer);
    };
  }, []);

  const panToLocation = useCallback(
    async (locName) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${locName}`
        );
        const json = await response.json();
        if (json && json.length > 0) {
          const location = json[0];
          const coordinates = fromLonLat([
            parseFloat(location.lon),
            parseFloat(location.lat),
          ]);
          map.getView().animate({
            center: coordinates,
            zoom: 11,
          });
        } else {
          alert("Ubicación no encontrada");
        }
      } catch (error) {
        console.error("Error en la búsqueda:", error);
      }
    },
    [map]
  );

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
