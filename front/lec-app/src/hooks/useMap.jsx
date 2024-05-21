import React, { useEffect, useRef, useState, useCallback } from "react";
import "ol/ol.css";
import { fromLonLat } from "ol/proj";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Stroke, Fill } from "ol/style";
import Select from "ol/interaction/Select";
import { pointerMove, click } from "ol/events/condition";
import { getCenter } from 'ol/extent'
import { REACT_APP_GEOSERVER_API_URL } from "../constants.js"
// import './OlMapBasic.css'
import { addBoxInteraction, removeBoxInteraction } from "../services/mapDrawingModule.js";
import { initializeOlMap } from '../services/OlMap'
import Feature from 'ol/Feature';
import WKT from 'ol/format/WKT';

export function useMap({
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
}) {
    const mapRef = useRef(null);

    const simplifiedMunicipalityLayerRef = useRef();
    const detailedMunicipalityLayerRef = useRef();
    const drawingVectorLayerRef = useRef();
    const buildingsLayerRef = useRef(null);

    const isMapInitialized = useRef(false); // se añade al principio del componente
    // const [activeLayer, setActiveLayerState] = useState(null);

    const panToLocation = useCallback(async (locName) => {

        const features = simplifiedMunicipalityLayerRef.current.getSource().getFeatures().filter(feature => (
            feature.get("NAMEUNIT") === locName || feature.get("NAMEUNIT") === location
        ))

        const feature = features.length > 0 ? features[0] : null

        if (feature) { // si encuentra la feature, la usamos para centrar el mapa

            const geometry = feature.getGeometry()
            // const centerCoordinates = geometry.getExtent();
            // const center = getCenter(centerCoordinates);

            // mapRef.current.getView().animate({ center: center, zoom: 11 });
            mapRef.current.getView().fit(geometry, { duration: 2000, padding: [70, 70, 70, 70] });
        } else { // si no la encuentra se recurre a nominatim para sacar el centro (original)
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
        }
    }, []);

    useEffect(() => {
        if (location && mapRef.current) {
            panToLocation(location);
        }
    }, [location, panToLocation]);

    /*
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
    */

    /*
    useEffect(() => {
        if (!isMapInitialized.current) {

            console.log("recibido availableMunicipios", availableMunicipios);
            initializeMap(availableMunicipios);
            isMapInitialized.current = true;
        }, [availableMunicipios]);

    const getStyleFunction = useCallback( // XXX OLD
        (feature, resolution, currentZoom) => {
            const municipalityName = feature.get("NAMEUNIT");

            // Usa el ref en lugar de la variable de estado
            const availables = availableMunicipios || [];

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
        [availableMunicipios]
    );
    */

    const styleFunction = useCallback(
        (layer) => (feature) => {

            const availables = availableMunicipios || [];
            const municipalityName = feature.get("NAMEUNIT");

            const currentZoom = mapRef.current.getView().getZoom();
            // console.log("zoom:", currentZoom, 'location:', location, 'municipalityName:', municipalityName);

            const colors = {
                'available': 'rgba(0, 59, 73, 0.8)',
                'unavailable': 'rgba(255,255,255,0)',
                'selected': 'rgba(249, 200, 14, 0.8)',
                'inspectionOutbound': 'rgba(160,160,160, 0.8)',
            }

            let color;
            if (currentZoom > 14 && location) {

                if (location === municipalityName && availables?.includes(municipalityName))
                    color = colors['unavailable'];
                else color = colors['inspectionOutbound'];

            }
            else if (location === municipalityName) {
                color = colors['selected'];
            }
            else if (availables?.includes(municipalityName)) {
                color = colors['available'];
            }
            else {
                color = colors['unavailable'];
            }

            const defaultStyle = new Style({
                stroke: new Stroke({
                    color: "#003b49",
                    width: layer === 'detailed' ? 1 : 0.5,
                }),
                fill: new Fill({ color: color }),
            });
            if (layer === 'detailed') {
                defaultStyle.getStroke().setWidth(1)
            }
            return defaultStyle;
        }, [availableMunicipios, location])


    // const createVectorLayer = useCallback(
    //     (typename, initialMap) => {
    //         return new VectorLayer({
    //             name: typename,
    //             source: new VectorSource({
    //                 format: new GeoJSON(),
    //                 url: function (extent) {
    //                     return `${REACT_APP_GEOSERVER_API_URL}/ows?service=WFS&version=1.0.0&request=GetFeature&typename=${typename}&outputFormat=application/json&srsname=EPSG:4326`;
    //                 },
    //                 strategy: bbox,
    //             }),
    //             style: (feature, resolution) => {
    //                 const currentZoom = initialMap.getView().getZoom();
    //                 return getStyleFunction(feature, resolution, currentZoom);
    //             },
    //         });
    //     },
    //     [getStyleFunction]
    // );

    useEffect(() => {

        if (isMapInitialized.current) {
            simplifiedMunicipalityLayerRef.current.setStyle(styleFunction('simplified'));
            detailedMunicipalityLayerRef.current.setStyle(styleFunction('detailed'));
        }

    }, [styleFunction])


    const initializeMap = useCallback((availableMunicipios) => {
        console.log("inicializando mapa", availableMunicipios);
        const initializeSelectInteractions = (initialMap, layers, buildingsLayer) => {
            const selectStyle = new Style({
                fill: new Fill({
                    stroke: new Stroke({
                        color: "#003b49",
                    }),
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

                    const feature = event.selected[0]
                    // const layerName = selectInteraction.getLayer(feature).get('name');

                    // if (layerName === 'buildings') {

                    // const building = feature.get("building");
                    // setSelectedBuilding(building);
                    // }
                    // else {
                    const municipalityName = feature.get("NAMEUNIT");

                    // setCurrentLocationFeature({feature: municipalityFeature, locName: municipalityName});
                    onMunicipioSelected(municipalityName);
                    // }
                }
            });

            initialMap.addInteraction(selectInteraction);
            selectInteractionsRef.current.click = selectInteraction;


            // ----

            // const buildingHover = new Select({
            //     condition: pointerMove,
            //     layers: "buildings",
            //     // style: selectStyle,
            // });

            // initialMap.addInteraction(buildingHover);

            const buildingClickInteraction = new Select({
                condition: click,
                layers: [buildingsLayer],
                // style: selectStyle,
            });

            buildingClickInteraction.on("select", (event) => {
                if (event.selected.length > 0) {

                    const feature = event.selected[0]

                    const building = feature.get("building");
                    setSelectedBuilding(building);
                }
            });

            initialMap.addInteraction(buildingClickInteraction);
            selectInteractionsRef.current.buildingsClick = buildingClickInteraction;
        };

        const initializeZoomHandler = (initialMap) => {
            initialMap.getView().on("change:resolution", function () {
                const currentZoom = initialMap.getView().getZoom();

                const hoverInteraction = selectInteractionsRef.current.hover;
                const selectInteraction = selectInteractionsRef.current.click;

                if (currentZoom <= 14) {
                    // setActiveLayer("simplified");
                    selectInteraction.setActive(true);
                    hoverInteraction.setActive(true);
                } else {
                    // setActiveLayer("detailed");
                    selectInteraction.setActive(false);
                    hoverInteraction.setActive(false);
                    // Des-selecciona las features cuando el zoom no es el adecuado
                    selectInteraction.getFeatures().clear();
                    hoverInteraction.getFeatures().clear();
                }
            });
        };

        // console.log(availableMunicipios.current)

        const {
            initialMap,
            simplifiedLayer: simplifiedMunicipalityLayer,
            detailedLayer: detailedMunicipalityLayer,
            drawingVectorLayer, buildingsLayer
        } = initializeOlMap({
            targetElemet: mapElementRef.current,
            vectorZoomThreshold: 9,
            initialZoomLevel: 7.7,
        });
        /*new Map({
        target: mapRef.current,
        layers: [new TileLayer({ source: new OSM(), name: "osm" }), drawingVectorLayer.current],
        view: new View({
            center: fromLonLat([-3.70379, 40.416775]),
            zoom: 7.7,
        }),
        controls: [],
    });*/


        // const simplifiedMunicpalityLayer = createVectorLayer(
        //     "moderate_municipios:simplified",
        //     initialMap
        // );
        // const detailedMunicipalityLayer = createVectorLayer(
        //     "moderate_municipios:detailed",
        //     initialMap
        // );
        // const simplifiedMunicpalityLayer = simplifiededMunicipalityLayerConstructor(10);
        // const detailedMunicipalityLayer = detailedMunicipalityLayerConstructor(10);

        simplifiedMunicipalityLayerRef.current = simplifiedMunicipalityLayer;
        detailedMunicipalityLayerRef.current = detailedMunicipalityLayer;
        drawingVectorLayerRef.current = drawingVectorLayer;
        buildingsLayerRef.current = buildingsLayer;

        // initialMap.addLayer(simplifiedMunicpalityLayer);

        initializeSelectInteractions(initialMap, [
            simplifiedMunicipalityLayer,
            detailedMunicipalityLayer,
        ],
            buildingsLayer
        );
        initializeZoomHandler(initialMap);

        if (simplifiedMunicipalityLayerRef.current) {
            simplifiedMunicipalityLayerRef.current.getSource().refresh();
        }

        if (detailedMunicipalityLayerRef.current) {
            detailedMunicipalityLayerRef.current.getSource().refresh();
        }

        mapRef.current = initialMap;

    }, []);

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
    }, [])

    useEffect(() => {
        if (buildingsLayerRef.current && availableBuildings && availableBuildings.length > 0) {
            buildingsLayerRef.current.getSource().clear();

            availableBuildings.forEach(building => {
                const geometryString = building.geometry

                const format = new WKT();
                const geometry = format.readGeometry(geometryString, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:4326'
                });


                const feature = new Feature({
                    geometry: geometry,
                    building: building
                });

                if (drawingVectorLayerRef.current.getSource().getFeatures().length > 0) {
                    feature.setStyle(new Style({
                        stroke: new Stroke({
                            color: 'green',
                            width: 2,
                        }),
                        fill: new Fill({
                            color: 'rgba(0, 255, 0, 0.1)',
                        }),
                    }));
                } else {

                    feature.setStyle(new Style({
                        stroke: new Stroke({
                            color: 'red',
                            width: 2,
                        }),
                        fill: new Fill({
                            color: 'rgba(255, 0, 0, 0.1)',
                        })
                    }))
                }

                buildingsLayerRef.current.getSource().addFeature(feature);

            });
        }
    }, [availableBuildings])


    useEffect(() => {
        if (availableBuildings?.length <= 0) return

        buildingsLayerRef.current.getSource().forEachFeature(feature => {
            if (drawingVectorLayerRef.current.getSource().getFeatures().length > 0) {
                feature.setStyle(new Style({
                    stroke: new Stroke({
                        color: 'green',
                        width: 2,
                    }),
                    fill: new Fill({
                        color: 'rgba(0, 255, 0, 0.1)',
                    }),
                }));
            } else {

                feature.setStyle(new Style({
                    stroke: new Stroke({
                        color: 'red',
                        width: 2,
                    }),
                    fill: new Fill({
                        color: 'rgba(255, 0, 0, 0.1)',
                    })
                }))
            }
        })
    }, [drawingVectorLayerRef.current?.getSource().getFeatures().length]);


// const layerIsOnMap = (map, layer) => {
//     const layers = map.getLayers().getArray();
//     console.log(`checking layer ${layer.get('name')} in layers: \n${layers.map(layer => layer.get('name') + ' ' || 'unamed')}`);

//     return layers.includes(layer);
// };




useEffect(() => {
    console.log('Map receive isDrawingEnabled event', isDrawingEnabled)
    if (mapRef.current) {

        if (isDrawingEnabled) {

            addBoxInteraction(mapRef.current, drawingVectorLayerRef.current);
            mapRef.current.removeInteraction(selectInteractionsRef.current.hover)
            mapRef.current.removeInteraction(selectInteractionsRef.current.click)

        } else {
            removeBoxInteraction(mapRef.current);
            mapRef.current.addInteraction(selectInteractionsRef.current.hover)
            mapRef.current.addInteraction(selectInteractionsRef.current.click)
        }

    }
}, [isDrawingEnabled]);


useEffect(() => {
    if (isDrawingEnabled) {
        const drawEndListener = drawingVectorLayerRef.current.getSource().on('addfeature', async (event) => {
            const drawnFeature = event.feature;
            const drawnGeometry = drawnFeature.getGeometry();

            const newBuildingsList = [...availableBuildings];
            buildingsLayerRef.current.getSource().forEachFeature((buildingFeature) => {
                const buildingGeometry = buildingFeature.getGeometry();
                const isBuildingInside = drawnGeometry.intersectsExtent(buildingGeometry.getExtent());

                if (isBuildingInside) {
                    buildingFeature.setStyle(null); // Mostrar edificio
                } else {
                    let index = Object.values(newBuildingsList).findIndex(item =>
                        item.id === buildingFeature.get('building').id
                    );
                    if (index !== -1) {
                        newBuildingsList.splice(index, 1);
                    }

                    // buildingFeature.setStyle(new Style({ opacity: 0 })); // Ocultar edificio
                    buildingFeature.setStyle(new Style({
                        display: 'none',
                    }));
                }
                //   });
            });
            setAvailableBuildings(newBuildingsList);
            setIsPolygonDrawn(true);
        });

        return () => {
            drawingVectorLayerRef.current.getSource().un('addfeature', drawEndListener);
        };
    } else {
        // Si el dibujo está deshabilitado, mostrar todos los edificios nuevamente
        buildingsLayerRef.current.setStyle(null);
    }
}, [isDrawingEnabled]);


const removePolygonDrawn = useCallback(() => {
    if (mapRef.current) {
        drawingVectorLayerRef.current.getSource().clear();
        setIsPolygonDrawn(false);
    }
});


return { mapRef, buildingsLayerRef, removePolygonDrawn };
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
