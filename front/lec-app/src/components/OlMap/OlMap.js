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
import { Circle as CircleStyle, Style, Stroke, Fill } from "ol/style";
import Select from "ol/interaction/Select";
import { bbox } from "ol/loadingstrategy";
import { pointerMove, click } from "ol/events/condition";
import { Point } from "ol/geom";
import { Feature } from "ol";

const OlMap = ({
  location,
  onMunicipioSelected,
  availableMunicipios,
  children,
  selectedBuilding,
}) => {
  const mapRef = useRef();
  const [map, setMap] = useState(null);
  const selectInteractionsRef = useRef({});
  const [activeLayer, setActiveLayerState] = useState("simplified");

  const municipalityLayerRef = useRef(null);
  const detailedMunicipalityLayerRef = useRef(null);
  const availableMunicipiosRef = useRef(availableMunicipios);

  // Creamos una nueva referencia para la capa del edificio seleccionado.
  const buildingLayerRef = useRef(null);

  // Este efecto se encargará de actualizar el mapa con la ubicación del edificio seleccionado.
  useEffect(() => {
    if (map && selectedBuilding) {
      try {
        // Extraemos las coordenadas del edificio seleccionado.
        const coordinates = fromLonLat([
          selectedBuilding.longitude,
          selectedBuilding.latitude,
        ]);

        // Creamos un nuevo feature para el edificio con las coordenadas.
        const buildingFeature = new Feature(new Point(coordinates));

        // Creamos y/o actualizamos la capa del edificio.
        if (!buildingLayerRef.current) {
          const vectorSource = new VectorSource({
            features: [buildingFeature],
          });

          const buildingLayer = new VectorLayer({
            source: vectorSource,
            style: new Style({
              image: new CircleStyle({
                radius: 7,
                fill: new Fill({ color: "#003b49" }),
                stroke: new Stroke({ color: "white", width: 2 }),
              }),
            }),
          });

          buildingLayerRef.current = buildingLayer;
          map.addLayer(buildingLayer);
        } else {
          buildingLayerRef.current.getSource().clear();
          buildingLayerRef.current.getSource().addFeature(buildingFeature);
        }

        // Centramos el mapa en la ubicación del edificio.
        map.getView().animate({ center: coordinates, zoom: 18 });

        // Deseleccionar todas las características de selectInteraction
        if (selectInteractionsRef.current && selectedBuilding) {
          selectInteractionsRef.current.click.getFeatures().clear();
          selectInteractionsRef.current.hover.getFeatures().clear();
        }
      } catch (error) {
        console.error("Error animating map:", error);
      }
    }
  }, [selectedBuilding]);

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
        if (currentZoom < 7 ) {
          return null;
        }

        const defaultStyle = new Style({
          stroke: new Stroke({
            color: "#003b49",
            width: 0.5,
          }),
          fill: new Fill({
            color: availables.includes(municipalityName) && currentZoom <= 12
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

      const currentZoom = initialMap.getView().getZoom();
      hoverInteraction.setActive(currentZoom <= 14); // Establece el estado inicial de la interacción según el nivel de zoom

      initialMap.addInteraction(hoverInteraction);
      selectInteractionsRef.current.hover = hoverInteraction;

      const selectInteraction = new Select({
        condition: click,
        layers: [municipalityLayer, detailedMunicipalityLayer],
        style: selectStyle,
      });

      selectInteraction.setActive(currentZoom <= 14); // Si deseas activarlo a partir del zoom 10, por ejemplo.

      selectInteraction.on("select", (event) => {
        if (event.selected.length > 0) {
          const municipalityName = event.selected[0].get("NAMEUNIT");
          onMunicipioSelected(municipalityName);
        }
      });

      initialMap.getView().on("change:resolution", function () {
        const currentZoom = initialMap.getView().getZoom();

        if (currentZoom <= 14) {
          selectInteraction.setActive(true);
          hoverInteraction.setActive(true);
        } else {
          selectInteraction.setActive(false);
          hoverInteraction.setActive(false);

          // Des-selecciona las features cuando el zoom no es el adecuado
          selectInteraction.getFeatures().clear();
          hoverInteraction.getFeatures().clear();
        }
        if (currentZoom >= 10) {
          setActiveLayer("detailed");
        } else {
          setActiveLayer("simplified");
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
    }
  }, [map, onMunicipioSelected, availableMunicipios, activeLayer]);

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
    const currentHover = selectInteractionsRef.current.hover;
    const currentClick = selectInteractionsRef.current.click;

    return () => {
      if (map) {
        // Usa las constantes locales en lugar de la ref directamente.
        if (currentHover) {
          map.removeInteraction(currentHover);
        }
        if (currentClick) {
          map.removeInteraction(currentClick);
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
