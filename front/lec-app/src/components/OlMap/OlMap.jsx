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
import BuildingPopover from '../UI/BuildingPopover/BuildingPopover'

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
  getColor,
  setMapBuildingsVisible,
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
    getColor,
    setMapBuildingsVisible
  })

  const CENTROID_THRESHOLD = 20;

  const buildingCentroidRef = useRef(null);
  const [isBuildingLayerReady, setBuildingLayerReady] = useState(false);

  const [showPopover, setShowPopover] = useState(false);
  const [popover, setPopover] = useState({ visible: false, building: null, position: [0, 0], color: null });
  
  const centroidStyle = (feature) => {
    // let fillColor = 'red'; // Por defecto, rojo
    // if (isPolygonDrawn) {
    // fillColor = 'green'; // Si se está filtrando mediante un polígono, verde
    // } 
    // if (selectedBuilding && feature.get('building').id === selectedBuilding.id) {
    // fillColor = 'DeepSkyBlue'; // Si se ha seleccionado el edificio, azul
    // fillColor = 'DeepSkyBlue'; // Si se ha seleccionado el edificio, azul
    // }
    return new Style({
      image: new CircleStyle({
        radius: 5,
        // fill: new Fill({ color: 'white' }),
        stroke: new Stroke({ color: "white", width: 2 }),
      }),
    });
  }

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
        minZoom: CENTROID_THRESHOLD,
        source: vectorSource,
        style: centroidStyle,
      });

      buildingCentroidRef.current = buildingLayer;
      mapRef.current.addLayer(buildingLayer);
    } else {
      buildingCentroidRef.current.getSource().clear();
      buildingCentroidRef.current.setStyle(centroidStyle)
      buildingCentroidRef.current.getSource().addFeatures(features);
    }
    setBuildingLayerReady(true);
  }, [mapRef, isPolygonDrawn, selectedBuilding]);

  const centerMapOnBuilding = useCallback((coordinates) => {
    mapRef.current.getView().animate({ center: coordinates, zoom: 19 });
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
        createOrUpdateBuildingLayer([selectedBuilding]);
        centerMapOnBuilding(coordinates);
        deselectAllFeatures();
        setShowPopover(true);
      } catch (error) {
        console.error("Error animating map:", error);
      }
    } else {
      setShowPopover(false);
    }
  }, [selectedBuilding, centerMapOnBuilding, mapRef, createOrUpdateBuildingLayer]);

  useEffect(() => {
    if (mapRef.current && availableBuildings) {
      createOrUpdateBuildingLayer(availableBuildings);
    }
  }, [availableBuildings, createOrUpdateBuildingLayer, mapRef]);

  /*
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
*/

  useEffect(() => {
    if (buildingLayerRef.current) {
      setBuildingLayerReady(true);
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || !buildingLayerRef.current || isDrawingEnabled) return;

    const handlePointerMove = (event) => {

      const view = mapRef.current.getView();
      const zoomLevel = view.getZoom();
  
      const pixel = mapRef.current.getEventPixel(event.originalEvent);
      const hit = mapRef.current.forEachFeatureAtPixel(
        pixel,
        (feature, layer) => {
          if (layer === buildingLayerRef.current && zoomLevel > CENTROID_THRESHOLD) {
            const building = feature.get('building');
            const coordinate = fromLonLat([building.longitude, building.latitude]);
            setPopover({
              visible: true,
              building: building,
              color: feature.get('color'),
              // position: pixel // NOTE: Sustituir para mostrar popover según cursor
              position: mapRef.current.getPixelFromCoordinate(coordinate) // NOTE: sustituir para mostrar popover según centroide
            });
            return true;
          }
          return false;
        },
        { layerFilter: (layer) => layer === buildingLayerRef.current }
      );

      if (!hit) {
        setPopover({ visible: false, building: null, position: [0, 0] });
      }

      mapRef.current.getTargetElement().style.cursor = hit ? "pointer" : "";
    };
    mapRef.current.on("pointermove", handlePointerMove);

    return () => {
      if (mapRef.current) {
        mapRef.current.un("pointermove", handlePointerMove);
      }
    };
  }, [isBuildingLayerReady, isDrawingEnabled]);

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
      {popover.visible && <BuildingPopover building={popover.building} position={popover.position} color={popover.color} />}
      {showPopover && selectedBuilding && (
        <BuildingPopover
          building={selectedBuilding}
          color={getColor(selectedBuilding.MEAN)}
          onClose={() => setShowPopover(false)}
        />
      )}
    </div>
  );
};

export default OlMap;
