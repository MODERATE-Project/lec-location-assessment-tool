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
import { REACT_APP_GEOSERVER_API_URL } from "../constants.js"
// import './OlMapBasic.css'
import { addBoxInteraction, removeBoxInteraction } from "../services/mapDrawingModule.js";

export function useMap({
    location,
    onMunicipioSelected,
    availableMunicipiosRef,
    selectedBuilding,
    isDrawingEnabled,
    selectInteractionsRef,
}) {
    const mapRef = useRef(null);
    const simplifiedMunicipalityLayerRef = useRef(null);
    const detailedMunicipalityLayerRef = useRef(null);
    const isMapInitialized = useRef(false); // se añade al principio del componente
    const [activeLayer, setActiveLayerState] = useState(null);

    const panToLocation = useCallback(async (locName) => {
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

                mapRef.current.getView().animate({ center: coordinates, zoom: 11 });
            } else {
                alert("Ubicación no encontrada");
            }
        } catch (err) {
            alert("Error al encontrar la ubicación");
        }
    }, []);

    useEffect(() => {
        if (location && mapRef.current) {
            panToLocation(location);
        }
    }, [location, panToLocation]);


    const setActiveLayer = useCallback(
        (layerType) => {
            if (!mapRef.current) {
                return;
            }

            if (layerType === "detailed" && activeLayer !== "detailed") {
                if (
                    simplifiedMunicipalityLayerRef.current &&
                    layerIsOnMap(mapRef.current, simplifiedMunicipalityLayerRef.current)
                ) {
                    mapRef.current.removeLayer(simplifiedMunicipalityLayerRef.current);
                }
                if (
                    detailedMunicipalityLayerRef.current &&
                    !layerIsOnMap(mapRef.current, detailedMunicipalityLayerRef.current)
                ) {
                    mapRef.current.addLayer(detailedMunicipalityLayerRef.current);
                }
                setActiveLayerState("detailed");
            } else if (layerType === "simplified" && activeLayer !== "simplified") {
                if (
                    detailedMunicipalityLayerRef.current &&
                    layerIsOnMap(mapRef.current, detailedMunicipalityLayerRef.current)
                ) {
                    mapRef.current.removeLayer(detailedMunicipalityLayerRef.current);
                }
                if (
                    simplifiedMunicipalityLayerRef.current &&
                    !layerIsOnMap(mapRef.current, simplifiedMunicipalityLayerRef.current)
                ) {
                    mapRef.current.addLayer(simplifiedMunicipalityLayerRef.current);
                }
                setActiveLayerState("simplified");
            }
        },
        [activeLayer]
    );


    const getStyleFunction = useCallback(
        (feature, resolution, currentZoom) => {
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
                            ? "rgba(0, 59, 73, 0.8)"
                            : "rgba(255,255,255,0)",
                }),
            });

            if (currentZoom >= 10) {
                defaultStyle.getStroke().setWidth(1);
            }

            return defaultStyle;
        },
        [availableMunicipiosRef]
    );

    const createVectorLayer = useCallback(
        (typename, initialMap) => {
            return new VectorLayer({
                source: new VectorSource({
                    format: new GeoJSON(),
                    url: function (extent) {
                        return `${REACT_APP_GEOSERVER_API_URL}/ows?service=WFS&version=1.0.0&request=GetFeature&typename=${typename}&outputFormat=application/json&srsname=EPSG:4326`;
                    },
                    strategy: bbox,
                }),
                style: (feature, resolution) => {
                    const currentZoom = initialMap.getView().getZoom();
                    return getStyleFunction(feature, resolution, currentZoom);
                },
            });
        },
        [getStyleFunction]
    );

    const drawingVectorLayer = useRef(new VectorLayer({
        source: new VectorSource({ wrapX: false }),
    }));


    const initializeMap = useCallback(() => {
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

        const initialMap = new Map({
            target: mapRef.current,
            layers: [new TileLayer({ source: new OSM() }), drawingVectorLayer.current],
            view: new View({
                center: fromLonLat([-3.70379, 40.416775]),
                zoom: 7.7,
            }),
            controls: [],
        });

        mapRef.current = initialMap;

        const simplifiedMunicpalityLayer = createVectorLayer(
            "moderate_municipios:simplified",
            initialMap
        );
        const detailedMunicipalityLayer = createVectorLayer(
            "moderate_municipios:detailed",
            initialMap
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

    }, [createVectorLayer, setActiveLayer, onMunicipioSelected]);

    // FIXME [Lo comento porque] parece no hacer nada
    useEffect(() => {
        const currentHover = selectInteractionsRef.current.hover;
        const currentClick = selectInteractionsRef.current.click;

        return () => {
            if (mapRef.current) {
                // Usa las constantes locales en lugar de la ref directamente.
                if (currentHover) {
                    mapRef.current.removeInteraction(currentHover);
                }
                if (currentClick) {
                    mapRef.current.removeInteraction(currentClick);
                }

                mapRef.current.setTarget(null);
                //setMap(null);
            }
        };
    }, []);


    useEffect(() => {
        if (!isMapInitialized.current) {
            initializeMap();
            isMapInitialized.current = true;
        }
    }, [onMunicipioSelected, availableMunicipiosRef, activeLayer, initializeMap]);


    const layerIsOnMap = (map, layer) => {
        const layers = map.getLayers().getArray();
        return layers.includes(layer);
    };




    useEffect(() => {
        console.log('Map receive isDrawingEnabled event', isDrawingEnabled)
        if (mapRef.current) {

            if (isDrawingEnabled) {

                addBoxInteraction(mapRef.current, drawingVectorLayer.current);
                mapRef.current.removeInteraction(selectInteractionsRef.current.hover)
                mapRef.current.removeInteraction(selectInteractionsRef.current.click)

            } else {
                removeBoxInteraction(mapRef.current);
                mapRef.current.addInteraction(selectInteractionsRef.current.hover)
                mapRef.current.addInteraction(selectInteractionsRef.current.click)
            }

        }
    }, [isDrawingEnabled]);



    return { mapRef };
}

// export function useBuildingLayer() {
//     const buildingLayerRef = useRef(null);

//     const createOrUpdateBuildingLayer = (map, coordinates) => {
//         // Create or update building layer
//     };

//     const centerMapOnBuilding = (map, coordinates) => {
//         // Center map on building
//     };

//     return { buildingLayerRef, createOrUpdateBuildingLayer, centerMapOnBuilding };
// }
