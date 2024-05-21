import React, { useEffect, useRef, useState, useCallback } from "react";
import "ol/ol.css";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Circle as CircleStyle, Style, Stroke, Fill } from "ol/style";
import { Point } from "ol/geom";
import { Feature } from "ol";
import './OlMap.css'
import { useMap } from "../../hooks/useMap";

const OlMap = ({
  location,
  onMunicipioSelected,
  availableMunicipios,
  availableBuildings,
  setAvailableBuildings,
  selectedBuilding,
  setSelectedBuilding,
  isDrawingEnabled,
  onClearPolygon,
  setClearPolygon,
  setIsPolygonDrawn,
  children
}) => {

  const selectInteractionsRef = useRef({});
  // const availableMunicipios = useState(availableMunicipios);

  const mapElementRef = useRef();

  const { mapRef, buildingsLayerRef: buildingLayerRef, removePolygonDrawn } = useMap({
    mapElementRef,
    location,
    onMunicipioSelected,
    availableMunicipios,
    availableBuildings,
    setAvailableBuildings,
    selectedBuilding,
    setSelectedBuilding,
    isDrawingEnabled,
    selectInteractionsRef,
    setIsPolygonDrawn
  })



  // Creamos una nueva referencia para la capa del edificio seleccionado.
  const buildingCentroidRef = useRef(null);
  const [isBuildingLayerReady, setBuildingLayerReady] = useState(false);

  const createOrUpdateBuildingLayer = useCallback((coordinates) => {
    const buildingFeature = new Feature(new Point(coordinates));

    if (!buildingCentroidRef.current) {
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

      buildingCentroidRef.current = buildingLayer;
      mapRef.current.addLayer(buildingLayer);
    } else {
      buildingCentroidRef.current.getSource().clear();
      buildingCentroidRef.current.getSource().addFeature(buildingFeature);
    }
    setBuildingLayerReady(true);
  }, [mapRef]);

  const centerMapOnBuilding = useCallback((coordinates) => {
    mapRef.current.getView().animate({ center: coordinates, zoom: 18 });
  }, [mapRef]);

  const getBuildingCoordinates = (building) => {
    return fromLonLat([building.longitude, building.latitude]);
  };

  const deselectAllFeatures = () => {
    if (selectInteractionsRef.current) {
      selectInteractionsRef.current.click.getFeatures().clear();
      selectInteractionsRef.current.hover.getFeatures().clear();
    }
  };

  // Este efecto se encarga de actualizar el mapa con la ubicación del edificio seleccionado.
  useEffect(() => {
    if (mapRef.current && selectedBuilding) {
      try {
        const coordinates = getBuildingCoordinates(selectedBuilding);
        createOrUpdateBuildingLayer(coordinates);
        centerMapOnBuilding(coordinates);
        deselectAllFeatures();
      } catch (error) {
        console.error("Error animating map:", error);
      }
    }
  }, [selectedBuilding, centerMapOnBuilding, mapRef]);

  // Efecto para gestionar la apertura de la URL al catastro cuando se clicka en un edificio (Punto)
  useEffect(() => {
    if (!mapRef.current) return;

    // Función para manejar el click sobre el mapa
    const handleMapClick = (event) => {
      mapRef.current.forEachFeatureAtPixel(
        event.pixel,
        (feature, layer) => {
          if (layer === buildingLayerRef.current) {
            // Aquí se asume que selectedBuilding es un objeto con la propiedad 'informatio'
            if(feature.get("building").informatio != selectedBuilding.informatio) return
            feature.set("url", selectedBuilding.informatio);
            const url = feature.get("url");
            if (url) {
              // Abrir URL en una nueva pestaña que apunta a info del catastro
              window.open(url, "_blank");
            }
            return true; // Detendrá la iteración a través de más features en el mismo pixel.
          }
        },
        {
          layerFilter: (layerCandidate) =>
            layerCandidate === buildingLayerRef.current,
        }
      );
    };

    // Registrar el controlador de eventos de click
    mapRef.current.on("singleclick", handleMapClick);

    // Limpiar el evento al desmontar el componente
    return () => {
      if (mapRef.current) {
        mapRef.current.un("singleclick", handleMapClick);
      }
    };
    // Agrega selectedBuilding aquí si su cambio debería reconfigurar el evento
  }, [selectedBuilding, mapRef]);

  useEffect(() => {
    if (buildingLayerRef.current) {
      setBuildingLayerReady(true);
    }
    // No hay necesidad de tener este useEffect si solo estableces el estado
  }, []);

  useEffect(() => {
    if (!mapRef.current || !buildingLayerRef.current) return;

    const handlePointerMove = (event) => {
      const pixel = mapRef.current.getEventPixel(event.originalEvent);
      const hit = mapRef.current.forEachFeatureAtPixel(
        pixel,
        (feature, layer) => layer === buildingLayerRef.current
      );

      mapRef.current.getTargetElement().style.cursor = hit ? "pointer" : "";
    };

    mapRef.current.on("pointermove", handlePointerMove);

    return () => {
      if (mapRef.current) {
        mapRef.current.un("pointermove", handlePointerMove);
      }
    };
    // isBuildingLayerReady debe estar en la lista de dependencias para reconfigurar el evento si cambia
  }, [isBuildingLayerReady]);


  useEffect(() => {
    if (onClearPolygon && isBuildingLayerReady) {
      // buildingLayerRef.current.getSource().clear();
      buildingLayerRef.current.setStyle(null);
      removePolygonDrawn()
      setClearPolygon(false)
    }

  }, [onClearPolygon, isBuildingLayerReady])

  return (
    <div className="map-wrapper">
      <div ref={mapElementRef} className="map"></div>
      {children}
    </div>
  );
};

export default OlMap;
