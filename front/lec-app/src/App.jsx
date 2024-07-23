import React, { useState, useEffect, useCallback } from "react";
import DTable from "./components/UI/DataTable/DTable";
import SearchBox from "./components/UI/SearchBox/SearchBox";
import GradientColorBar from './components/UI/GradientColorBar/GradientColorBar';
import { VITE_MUNICIPALITIES_API_URL, VITE_BUILDINGS_API_URL, VITE_GEOSERVER_API_URL } from "./constants"
import './App.css'
import OlMap from "./components/OlMap/OlMap";
import SortingCriteriaSelector from "./components/UI/SortingCriteriaSelector/SortingCriteriaSelector";
import DrawingToggleButton from "./components/UI/DrawingToggleButton/DrawingToggleButton";
import mapWeightsToApi from "./services/sortAdapter"
import toast, { Toaster } from "react-hot-toast";
import CancellSelectionButton from "./components/UI/CancellSelectionButton/CancellSelectionButton";
import { createGradientFunction } from "./services/gradient";
import ExportButton from './components/UI/ExportButton/ExportButton';

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [initialTableData, setInitialTableData] = useState([]);
  const [availables, setAvailables] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState();
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [onClearPolygon, setOnClearPolygon] = useState(false)
  const [isPolygonDrawn, setIsPolygonDrawn] = useState(false)
  const [colorData, setColorData] = useState({
    getColor: () => null,
    minValue: 0,
    maxValue: 1
  })
  const [areMapBuildingsVisible, setMapBuildingsVisible] = useState(false)


  const handleRowClick = (building) => {
    setSelectedBuilding(building);
  };

  // const handleLocationSelected = (location) => {
  //   setSelectedLocation(location);
  //   console.log('new location', location)
  // };

  useEffect(() => {
    console.debug(
      "VITE_MUNICIPALITIES_API_URL",
      VITE_MUNICIPALITIES_API_URL
    );
    console.debug(
      "VITE_BUILDINGS_API_URL",
      VITE_BUILDINGS_API_URL
    );
    console.debug(
      "VITE_GEOSERVER_API_URL",
      VITE_GEOSERVER_API_URL
    );
  }, []);


  const handleSortingCriteria = (sortingCriteria) => {
    console.log('sortingCriteria', sortingCriteria)
    if (isPolygonDrawn) {
      restoreBuildingsAndRemovePolygon()
      console.log("Buildings restored and polygon removed", sortingCriteria)
    }
    setIsLoading(true)
    const weights_mapped = mapWeightsToApi(sortingCriteria)

    // Realiza la llamada GET a la API del backend para obtener los datos
    const url = `${VITE_BUILDINGS_API_URL
      }/weighted-sort?municipio=${encodeURIComponent(selectedLocation)}&weights=${encodeURIComponent(JSON.stringify(weights_mapped))}`;

    toast.promise(
      fetch(url)
        .then((res) => (
          console.log('res', res),
          res.json())
        )
        .then((data) => {
          if (data.buildings) {
            console.log('Fetching sorted: data:', data)
            setTableData(data); // Guarda los datos en el estado local
            setInitialTableData(data)
          }
          else console.error("Fetching sorted data: No response from server: ", data);
        })
        .catch((error) => {
          console.error("Hubo un error al obtener los datos:", error);
        })
        .finally(() => {
          setIsLoading(false)
        })
      ,
      {
        loading: 'Processing...',
        success: <b>Table updated!</b>,
        error: <b>Could not sort table.</b>,
      })
      ;
  }

  const handleMunicipioSelected = useCallback((municipio) => {


    console.log('Buscando Datos del municipio', municipio)

    const url = `${VITE_BUILDINGS_API_URL
      }?municipio=${encodeURIComponent(municipio)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const values = data.buildings.map(building => building['MEAN'])
        const maxValue = Math.min(...values)
        const minValue = Math.max(...values)
        data.maxValue = maxValue
        data.minValue = minValue

        setColorData({
          getColor: createGradientFunction(values, minValue, maxValue),
          minValue: minValue,
          maxValue: maxValue,
        });

        setTableData(data); // Guarda los datos en el estado local
        setInitialTableData(data);
        setSelectedBuilding(null);
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los datos:", error);
      })
      .finally(() => {
        console.log("Se ha terminado de obtener los datos del municipio " + municipio);

        setSelectedLocation(municipio);
      });
  }, []);

  useEffect(() => {
    // Realiza la llamada GET a la API del backend para obtener los datos municipios con datos
    const url = `${VITE_MUNICIPALITIES_API_URL}?withData=true`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        // Extrae los datos necesarios de la respuesta
        const availaMuni = data.municipalities.map((item) => item.name);
        // Actualiza el estado de availables con los datos obtenidos
        setAvailables(availaMuni);
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los datos:", error);
      });
  }, []);

  const handleDrawingToggleButtonChange = () => {
    setIsDrawingEnabled(prevState => !prevState);
    console.log('isDrawingEnabled', isDrawingEnabled)
  }

  const setAvailableBuildings = (buildings) => {


    /*
    // NOTE: uncomment in case that gradient has to relative to selected buildings (drawing a polygon)
    const values = buildings.map(building => building['MEAN'])
    const maxValue = Math.min(...values)
    const minValue = Math.max(...values)

    setColorData({
      getColor: createGradientFunction(values, minValue, maxValue),
      minValue: minValue,
      maxValue: maxValue,
    });
    */

    setTableData({ buildings: buildings })
  }

  const restoreBuildingsAndRemovePolygon = () => {

    /*
    // NOTE: uncomment in case that gradient has to relative to selected buildings (drawing a polygon)
    const values = initialTableData.buildings.map(building => building['MEAN'])
    const maxValue = Math.min(...values)
    const minValue = Math.max(...values)

    setColorData({
      getColor: createGradientFunction(values, minValue, maxValue),
      minValue: minValue,
      maxValue: maxValue,
    });
    */
    setTableData({ buildings: initialTableData.buildings })
    setOnClearPolygon(true)
  }

  const exportFileProcedure = () => {
    
    window.print() // TODO
  }

  return (
    <div className="App">
      <OlMap
        location={selectedLocation}
        onMunicipioSelected={handleMunicipioSelected}
        availableMunicipios={availables}
        availableBuildings={tableData.buildings}
        setAvailableBuildings={setAvailableBuildings}
        selectedBuilding={selectedBuilding}
        setSelectedBuilding={setSelectedBuilding}
        isDrawingEnabled={isDrawingEnabled}
        onClearPolygon={onClearPolygon}
        setClearPolygon={setOnClearPolygon}
        isPolygonDrawn={isPolygonDrawn}
        setIsPolygonDrawn={setIsPolygonDrawn}
        getColor={colorData.getColor}
        setMapBuildingsVisible={setMapBuildingsVisible}
      >
        <SearchBox onLocationSelected={handleMunicipioSelected} location={selectedLocation} />
        {tableData.buildings?.length > 0 && !selectedBuilding &&
          <div className="buildings-alert">
            <p>Click on table rows or zoom in to see and interact with the buildings</p>
          </div>}
        {tableData.buildings?.length > 0 && <>
          <ExportButton exportFileProcedure={exportFileProcedure}/>
          <SortingCriteriaSelector onSort={handleSortingCriteria} isLoading={isLoading} />
          { areMapBuildingsVisible && <GradientColorBar minValue={colorData.minValue} maxValue={colorData.maxValue} />}
          <DrawingToggleButton isDrawingEnabled={isDrawingEnabled} onChange={handleDrawingToggleButtonChange} />
        </>}
        {isPolygonDrawn && <CancellSelectionButton onClick={restoreBuildingsAndRemovePolygon} />}
      </OlMap>
      <DTable data={tableData.buildings} onRowClicked={handleRowClick} />
      <Toaster
        toastOptions={{
          style: {
            margin: '30px',
            padding: '10px 50px',
          }
        }}
        position="bottom-right"
        reverseOrder={false}
      />
    </div>
  );
}

export default App;
