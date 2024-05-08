import { Map } from "ol";
import { fromLonLat } from 'ol/proj';
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { bbox } from "ol/loadingstrategy";
import { REACT_APP_GEOSERVER_API_URL } from "../constants";
import { Style, Stroke, Fill } from "ol/style";


const osmLayer = new TileLayer({
    preload: Infinity,
    source: new OSM(),
})

const municipalitySource = (type) => {
    return new VectorSource({
        format: new GeoJSON(),
        url: `${REACT_APP_GEOSERVER_API_URL}/ows?service=WFS&version=1.0.0&request=GetFeature&typename=moderate_municipios:${type}&outputFormat=application/json&srsname=EPSG:4326`,
        strategy: bbox
    })
}



const simplifiedMunicipalityLayer = (vectorZoomThreshold, availables) => {
    return new VectorLayer({
        name: 'simplified',
        source: municipalitySource('simplified'),
        maxZoom: vectorZoomThreshold,
        minZoom: 7,
    })
}

const detailedMunicipalityLayer = (vectorZoomThreshold, availables) => {
    return new VectorLayer({
        name: 'detailed',
        source: municipalitySource('detailed'),
        minZoom: vectorZoomThreshold,
    })
}


export const initializeOlMap = ({ targetElemet, vectorZoomThreshold, initialZoomLevel, availableMunicipios }) => {

    const simplifiedLayer = simplifiedMunicipalityLayer(vectorZoomThreshold, availableMunicipios);
    const detailedLayer = detailedMunicipalityLayer(vectorZoomThreshold, availableMunicipios);
    const drawingVectorLayer = new VectorLayer({
        name: "drawing",
        source: new VectorSource({ wrapX: false }),
    })

    const initialMap = new Map({
        target: targetElemet,
        layers: [
            osmLayer,
            simplifiedLayer,
            detailedLayer,
            drawingVectorLayer
        ],
        view: new View({
            center: fromLonLat([-3.70379, 40.416775]),
            zoom: initialZoomLevel
        }),
        controls: []
    });

    // EVENT change:resolution // XXX para Debug: para verificar valores de zoom y capas
    // initialMap.getView().on("change:resolution", function () {
    //     const currentZoom = initialMap.getView().getZoom();
    //     console.log("Cambio de zoom: ", currentZoom)

    //     const layers = initialMap.getLayers().getArray();
    //     console.log("Capas: ", layers.map(layer => ({ 'name': layer.constructor.name, 'visible': layer.isVisible() })))
    // });


    // EVENT click // TODO: implementar correctamente.
    // initialMap.on("click", (event) => {
    //     const feature = initialMap.forEachFeatureAtPixel(
    //         event.pixel,
    //         (feature) => feature,
    //         {
    //             layerFilter: (layer) => layer === buildingLayerRef.current,
    //         }
    //     );
    //     if (feature) {
    //         const building = feature.getProperties();
    //         onBuildingSelected(building);
    //     }
    // });

    return { initialMap, simplifiedLayer, detailedLayer, drawingVectorLayer };
}        
