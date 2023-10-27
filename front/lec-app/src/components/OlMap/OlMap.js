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
  const [activeLayer, setActiveLayerState] = useState(null);

  const simplifiedMunicipalityLayerRef = useRef(null);
  const detailedMunicipalityLayerRef = useRef(null);
  const availableMunicipiosRef = useRef(availableMunicipios);

  // Creamos una nueva referencia para la capa del edificio seleccionado.
  const buildingLayerRef = useRef(null);

  // Este efecto se encargará de actualizar el mapa con la ubicación del edificio seleccionado.
  useEffect(() => {
    if (map && selectedBuilding) {
      try {
        const coordinates = getBuildingCoordinates(selectedBuilding);
        createOrUpdateBuildingLayer(coordinates);
        centerMapOnBuilding(coordinates);
        deselectAllFeatures();
      } catch (error) {
        console.error("Error animating map:", error);
      }
    }
  }, [selectedBuilding]);

  const getBuildingCoordinates = (building) => {
    return fromLonLat([building.longitude, building.latitude]);
  };

  const createOrUpdateBuildingLayer = (coordinates) => {
    const buildingFeature = new Feature(new Point(coordinates));

    if (!buildingLayerRef.current) {
      const vectorSource = new VectorSource({ features: [buildingFeature] });
      const buildingLayer = new VectorLayer({
        source: vectorSource,
        style: new Style({
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({ color: "red" }),
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
  };

  const centerMapOnBuilding = (coordinates) => {
    map.getView().animate({ center: coordinates, zoom: 18 });
  };

  const deselectAllFeatures = () => {
    if (selectInteractionsRef.current) {
      selectInteractionsRef.current.click.getFeatures().clear();
      selectInteractionsRef.current.hover.getFeatures().clear();
    }
  };

  useEffect(() => {
    availableMunicipiosRef.current = availableMunicipios;
  }, [availableMunicipios]);

  useEffect(() => {
    if (!map) {
      initializeMap();
    }
  }, [map, onMunicipioSelected, availableMunicipios, activeLayer]);

  const getStyleFunction = useCallback((feature, resolution, currentZoom) => {
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
        color:
          availables.includes(municipalityName) && currentZoom <= 12
            ? "rgba(0, 255, 0, 0.5)"
            : "rgba(255,255,255,0.5)",
      }),
    });

    if (currentZoom >= 10) {
      defaultStyle.getStroke().setWidth(1);
    }

    return defaultStyle;
  }, [availableMunicipiosRef]);

  const createVectorLayer = useCallback((typename, initialMap) => {    
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
        return getStyleFunction(feature, resolution, currentZoom);
      },
    });
  }, [getStyleFunction]);

  const initializeMap = useCallback(() => {
    const initialMap = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: fromLonLat([-3.70379, 40.416775]),
        zoom: 7.7,
      }),
      controls: [],
    });

    mapRef.current = initialMap;
   
    const simplifiedMunicpalityLayer = createVectorLayer(
      "moderate_municipios:simplified", initialMap
    );
    const detailedMunicipalityLayer = createVectorLayer(
      "moderate_municipios:detailed", initialMap
    );

    simplifiedMunicipalityLayerRef.current = simplifiedMunicpalityLayer;
    detailedMunicipalityLayerRef.current = detailedMunicipalityLayer;

    initialMap.addLayer(simplifiedMunicpalityLayer);

    initializeSelectInteractions(initialMap, [
      simplifiedMunicpalityLayer,
      detailedMunicipalityLayer,
    ]);
    initializeZoomHandler(initialMap);

    if (simplifiedMunicipalityLayerRef.current) {
      simplifiedMunicipalityLayerRef.current.getSource().refresh();
    }

    if (detailedMunicipalityLayerRef.current) {
      detailedMunicipalityLayerRef.current.getSource().refresh();
    }

    setMap(initialMap);
   
  },[createVectorLayer, onMunicipioSelected, availableMunicipios]);;


  const initializeSelectInteractions = (initialMap, layers) => {
    const selectStyle = new Style({
      fill: new Fill({
        color: "rgba(249, 200, 14, 0.8)",
      }),
    });

    const currentZoom = initialMap.getView().getZoom();

    const hoverInteraction = new Select({
      condition: pointerMove,
      layers: layers,
      style: selectStyle,
    });

    hoverInteraction.setActive(currentZoom <= 14);
    initialMap.addInteraction(hoverInteraction);
    selectInteractionsRef.current.hover = hoverInteraction;

    const selectInteraction = new Select({
      condition: click,
      layers: layers,
      style: selectStyle,
    });

    selectInteraction.setActive(currentZoom <= 14);

    selectInteraction.on("select", (event) => {
      if (event.selected.length > 0) {
        const municipalityName = event.selected[0].get("NAMEUNIT");
        onMunicipioSelected(municipalityName);
      }
    });

    initialMap.addInteraction(selectInteraction);
    selectInteractionsRef.current.click = selectInteraction;
  };

  const initializeZoomHandler = (initialMap) => {
    initialMap.getView().on("change:resolution", function () {
      const currentZoom = initialMap.getView().getZoom();

      const hoverInteraction = selectInteractionsRef.current.hover;
      const selectInteraction = selectInteractionsRef.current.click;

      if (currentZoom <= 14) {
        setActiveLayer("simplified");
        selectInteraction.setActive(true);
        hoverInteraction.setActive(true);
      } else {
        setActiveLayer("detailed");
        selectInteraction.setActive(false);
        hoverInteraction.setActive(false);
        // Des-selecciona las features cuando el zoom no es el adecuado
        selectInteraction.getFeatures().clear();
        hoverInteraction.getFeatures().clear();
      }
    });
  };


  const layerIsOnMap = (map, layer) => {
    const layers = map.getLayers().getArray();
    return layers.includes(layer);
  };

  const setActiveLayer = useCallback((layerType) => {
    if (!mapRef.current) {
      return;
    }

    if (layerType === "detailed" && activeLayer !== "detailed") {
      if (simplifiedMunicipalityLayerRef.current && layerIsOnMap(mapRef.current, simplifiedMunicipalityLayerRef.current)) {
        mapRef.current.removeLayer(simplifiedMunicipalityLayerRef.current);
      }
      if (detailedMunicipalityLayerRef.current && !layerIsOnMap(mapRef.current, detailedMunicipalityLayerRef.current)) {
        mapRef.current.addLayer(detailedMunicipalityLayerRef.current);
      }
      setActiveLayerState("detailed");
    } else if (layerType === "simplified" && activeLayer !== "simplified") {
      if (detailedMunicipalityLayerRef.current && layerIsOnMap(mapRef.current, detailedMunicipalityLayerRef.current)) {
        mapRef.current.removeLayer(detailedMunicipalityLayerRef.current);
      }
      if (simplifiedMunicipalityLayerRef.current && !layerIsOnMap(mapRef.current, simplifiedMunicipalityLayerRef.current)) {
        mapRef.current.addLayer(simplifiedMunicipalityLayerRef.current);
      }
      setActiveLayerState("simplified");
    }
  }, [activeLayer]);

 
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
