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
import { bbox } from "ol/loadingstrategy";

import { pointerMove, click } from 'ol/events/condition';


const OlMap = (props) => {
  const mapRef = useRef();
  const [map, setMap] = React.useState(null);

  const [selectedMunicipality, setSelectedMunicipality] = React.useState(null);

  useEffect(() => {
    if (selectedMunicipality) {
      alert(`Has seleccionado el municipio: ${selectedMunicipality}`);
    }
  }, [selectedMunicipality]);

  const municipalityLayer = new VectorLayer({
    source: new VectorSource({
      format: new GeoJSON(),
      url: function (extent) {
        return "http://localhost:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typename=moderate_municipios:simplified&outputFormat=application/json&srsname=EPSG:4326";
        // return 'http://localhost:8080/geoserver/ows?service=WFS&' +
        //   'version=1.0.0&request=GetFeature&typename=moderate_municipios:Municipios_IGN&' +
        //   'outputFormat=application/json&srsname=EPSG:4326&' +
        //   'bbox=' + extent.join(',') + ',EPSG:3857';
      },
      strategy: bbox,
    }),
    style: new Style({
      stroke: new Stroke({
        color: "#F9C80E",
        width: 0.5,
      }),
      fill: new Fill({
        color: "rgba(255,255,255,0.5)", // Relleno transparente
      }),
    }),
  });

  const detailedMunicipalityLayer = new VectorLayer({
    source: new VectorSource({
      format: new GeoJSON(),
      url: function (extent) {
        return "http://localhost:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typename=moderate_municipios:detailed&outputFormat=application/json&srsname=EPSG:4326";
      },
      strategy: bbox,
    }),
    style: new Style({
      stroke: new Stroke({
        color: "#F9C80E",
        width: 1,
      }),
      fill: new Fill({
        color: "rgba(255,255,255,0.5)", // Relleno transparente
      }),
    }),
  });

  useEffect(() => {
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([-3.70379, 40.416775]),
        zoom: 7.7,
      }),
      controls: [],
    });

    // Creación de la capa de municipios

    initialMap.addLayer(municipalityLayer);

    initialMap.getView().on("change:resolution", () => {
      const currentZoom = initialMap.getView().getZoom();

      if (currentZoom >= 10) {
        if (
          !initialMap.getLayers().getArray().includes(detailedMunicipalityLayer)
        ) {
          initialMap.removeLayer(municipalityLayer);
          initialMap.addLayer(detailedMunicipalityLayer);
        }
      } else {
        if (currentZoom >= 7.6 && currentZoom < 10) {
          if (!initialMap.getLayers().getArray().includes(municipalityLayer)) {
            initialMap.removeLayer(detailedMunicipalityLayer);
            initialMap.addLayer(municipalityLayer);
          }
        } else {
          initialMap.removeLayer(municipalityLayer);
        }
      }
    });

    // Estilo de selección
    const selectStyle = new Style({
      fill: new Fill({
        color: "rgba(249, 200, 14, 0.8)",
      }),
    });

    const hoverInteraction = new Select({
      condition: pointerMove, // Se activará con el movimiento del puntero
      layers: [municipalityLayer, detailedMunicipalityLayer],
      style: selectStyle
    });
    
    initialMap.addInteraction(hoverInteraction);
    
    const selectInteraction = new Select({
      condition: click, // Se activará con el clic
      layers: [municipalityLayer, detailedMunicipalityLayer],
      style: selectStyle
    });
    
    selectInteraction.on('select', function(event) {
      if (event.selected.length > 0) {
        const feature = event.selected[0];
        console.log("feature", feature);
        const municipalityName = feature.get("nombre");
        console.log("Nombre del municipio seleccionado:", municipalityName);
      }
    });
    
    initialMap.addInteraction(selectInteraction);
    
    setMap(initialMap);

    // Limpieza: remueve la interacción y la capa al desmontar el componente
    return () => {
      initialMap.removeInteraction(selectInteraction);
      initialMap.removeInteraction(hoverInteraction);
      initialMap.removeLayer(municipalityLayer);
      initialMap.removeLayer(detailedMunicipalityLayer);
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
    <div style={{ position: "relative", width: "100%", height: "700px" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
      {props.children}
    </div>
  );
};

export default OlMap;
