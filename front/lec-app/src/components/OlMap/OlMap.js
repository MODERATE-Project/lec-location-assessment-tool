import React, { useEffect, useRef, useState, useCallback } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Stroke, Fill } from "ol/style";
import Select from "ol/interaction/Select";
import { bbox } from "ol/loadingstrategy";
import { pointerMove, click } from "ol/events/condition";

const OlMap = ({
  location,
  onMunicipioSelected,
  availableMunicipios,
  children,
}) => {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const selectInteractionsRef = useRef({});
  const [activeLayer, setActiveLayerState] = useState("simplified");

  const municipalityLayerRef = useRef(null);
  const detailedMunicipalityLayerRef = useRef(null);
  const availableMunicipiosRef = useRef(availableMunicipios);

  const setActiveLayer = (layerType) => {
    if (!map) {
      return;
    }

    if (layerType === "detailed" && activeLayer !== "detailed") {
      if (municipalityLayerRef.current) {
        map.removeLayer(municipalityLayerRef.current);
      }
      if (detailedMunicipalityLayerRef.current) {
        map.addLayer(detailedMunicipalityLayerRef.current);
      }
      setActiveLayerState("detailed");
    } else if (layerType === "simplified" && activeLayer !== "simplified") {
      if (detailedMunicipalityLayerRef.current) {
        map.removeLayer(detailedMunicipalityLayerRef.current);
      }
      if (municipalityLayerRef.current) {
        map.addLayer(municipalityLayerRef.current);
      }
      setActiveLayerState("simplified");
    }
  };

  useEffect(() => {
    availableMunicipiosRef.current = availableMunicipios;
  }, [availableMunicipios]);

  useEffect(() => {
    if (!map) {
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

      const styleFunction = (feature, resolution, currentZoom) => {
        const municipalityName = feature.get("NAMEUNIT");

        // Usa el ref en lugar de la variable de estado
        const availables = availableMunicipiosRef.current || [];


        //Ocultar las features a partir de un nivel de zoom
        if (currentZoom < 7) {
          return null;
        }

        const defaultStyle = new Style({
          stroke: new Stroke({
            color: "#003b49",
            width: 0.5,
          }),
          fill: new Fill({
            color: availables.includes(municipalityName)
              ? "rgba(0, 255, 0, 0.5)"
              : "rgba(255,255,255,0.5)",
          }),
        });

        if (currentZoom >= 10) {
          defaultStyle.getStroke().setWidth(1);
        }

        return defaultStyle;
      };

      const createVectorLayer = (typename) => {
        return new VectorLayer({
          source: new VectorSource({
            format: new GeoJSON(),
            url: function (extent) {
              return `http://localhost:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typename=${typename}&outputFormat=application/json&srsname=EPSG:4326`;
            },
            strategy: bbox,
          }),
          style: (feature, resolution) => {
            const currentZoom = initialMap.getView().getZoom();
            return styleFunction(feature, resolution, currentZoom);
          },
        });
      };

      const municipalityLayer = createVectorLayer(
        "moderate_municipios:simplified"
      );
      const detailedMunicipalityLayer = createVectorLayer(
        "moderate_municipios:detailed"
      );

      municipalityLayerRef.current = municipalityLayer;
      detailedMunicipalityLayerRef.current = detailedMunicipalityLayer;

      initialMap.addLayer(municipalityLayer);

      initialMap.getView().on("change:resolution", () => {
        const currentZoom = initialMap.getView().getZoom();
        if (currentZoom >= 10) {
          setActiveLayer("detailed");
        } else {
          setActiveLayer("simplified");
        }
      });

      const selectStyle = new Style({
        fill: new Fill({
          color: "rgba(249, 200, 14, 0.8)",
        }),
      });

      const hoverInteraction = new Select({
        condition: pointerMove,
        layers: [municipalityLayer, detailedMunicipalityLayer],
        style: selectStyle,
      });

      initialMap.addInteraction(hoverInteraction);
      selectInteractionsRef.current.hover = hoverInteraction;

      const selectInteraction = new Select({
        condition: click,
        layers: [municipalityLayer, detailedMunicipalityLayer],
        style: selectStyle,
      });

      selectInteraction.on("select", (event) => {
        if (event.selected.length > 0) {
          const municipalityName = event.selected[0].get("NAMEUNIT");
          onMunicipioSelected(municipalityName);
        }
      });

      initialMap.addInteraction(selectInteraction);
      selectInteractionsRef.current.click = selectInteraction;

      if (municipalityLayerRef.current) {
        municipalityLayerRef.current.getSource().refresh();
      }

      if (detailedMunicipalityLayerRef.current) {
        detailedMunicipalityLayerRef.current.getSource().refresh();
      }

      setMap(initialMap);
    }
  }, [map, onMunicipioSelected, availableMunicipios]);

  const panToLocation = useCallback(
    async (locName) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${locName}`
        );
        const json = await response.json();
        if (json && json.length > 0) {
          const loc = json[0];
          const coordinates = fromLonLat([
            parseFloat(loc.lon),
            parseFloat(loc.lat),
          ]);
          map.getView().animate({ center: coordinates, zoom: 11 });
        } else {
          alert("Ubicación no encontrada");
        }
      } catch (err) {
        alert("Error al encontrar la ubicación");
      }
    },
    [map]
  );

  useEffect(() => {
    if (location && map) {
      panToLocation(location);
    }
  }, [location, map, panToLocation]);

  useEffect(() => {
    return () => {
      if (map) {
        map.getView().un("change:resolution");
        if (selectInteractionsRef.current.hover) {
          map.removeInteraction(selectInteractionsRef.current.hover);
        }
        if (selectInteractionsRef.current.click) {
          map.removeInteraction(selectInteractionsRef.current.click);
        }

        map.setTarget(null);
        setMap(null);
      }
    };
  }, [map]);

  return (
    <div style={{ position: "relative", width: "100%", height: "700px" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
      {children}
    </div>
  );
};

export default OlMap;
