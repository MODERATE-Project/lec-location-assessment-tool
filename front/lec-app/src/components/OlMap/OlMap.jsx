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
  isPolygonDrawn,
  children
}) => {

  const selectInteractionsRef = useRef({});
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
    isPolygonDrawn,
    setIsPolygonDrawn,
  })

  const buildingCentroidRef = useRef(null);
  const [isBuildingLayerReady, setBuildingLayerReady] = useState(false);

  const createOrUpdateBuildingLayer = useCallback((buildings) => {
    const features = buildings.map(building => {
      const coordinates = fromLonLat([building.longitude, building.latitude]);
      return new Feature({
        geometry: new Point(coordinates),
        building: building
      });
    });

    if (!buildingCentroidRef.current) {
      const vectorSource = new VectorSource({ features });
      const buildingLayer = new VectorLayer({
        source: vectorSource,
        style: (feature) => {
          let fillColor = 'red'; // Por defecto, rojo
          if (isPolygonDrawn) {
            fillColor = 'green'; // Si se está filtrando mediante un polígono, verde
          } else if (selectedBuilding && feature.get('building').id === selectedBuilding.id) {
            fillColor = 'blue'; // Si se ha seleccionado el edificio, azul
          }
          return new Style({
            image: new CircleStyle({
              radius: 7,
              fill: new Fill({ color: fillColor }),
              stroke: new Stroke({ color: "white", width: 2 }),
            }),
          });
        }
      });

      buildingCentroidRef.current = buildingLayer;
      mapRef.current.addLayer(buildingLayer);
    } else {
      buildingCentroidRef.current.getSource().clear();
      buildingCentroidRef.current.getSource().addFeatures(features);
    }
    setBuildingLayerReady(true);
  }, [mapRef, isPolygonDrawn, selectedBuilding]);

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

  useEffect(() => {
    if (mapRef.current && availableBuildings) {
      createOrUpdateBuildingLayer(availableBuildings);
    }
  }, [availableBuildings, createOrUpdateBuildingLayer, mapRef]);

  useEffect(() => {
    if (!mapRef.current) return;

    const handleMapClick = (event) => {
      mapRef.current.forEachFeatureAtPixel(
        event.pixel,
        (feature, layer) => {
          if (layer === buildingLayerRef.current) {
            const building = feature.get("building");
            if (building && selectedBuilding && building.id === selectedBuilding.id) {
              window.open(building.informatio, "_blank");
            }
            return true;
          }
        },
        {
          layerFilter: (layerCandidate) =>
            layerCandidate === buildingLayerRef.current,
        }
      );
    };

    mapRef.current.on("singleclick", handleMapClick);

    return () => {
      if (mapRef.current) {
        mapRef.current.un("singleclick", handleMapClick);
      }
    };
  }, [selectedBuilding, mapRef, buildingLayerRef]);

  useEffect(() => {
    if (buildingLayerRef.current) {
      setBuildingLayerReady(true);
    }
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
  }, [isBuildingLayerReady]);

  useEffect(() => {
    if (onClearPolygon && isBuildingLayerReady) {
      buildingLayerRef.current.setStyle(null);
      removePolygonDrawn();
      setClearPolygon(false);
    }
  }, [onClearPolygon, isBuildingLayerReady]);

  return (
    <div className="map-wrapper">
      <div ref={mapElementRef} className="map"></div>
      {children}
    </div>
  );
};

export default OlMap;
