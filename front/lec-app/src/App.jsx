import React, { useState, useEffect, useCallback } from "react";
import DTable from "./components/UI/DataTable/DTable";
import SearchBox from "./components/UI/SearchBox/SearchBox";
import { REACT_APP_MUNICIPALITIES_API_URL, REACT_APP_BUILDINGS_API_URL, REACT_APP_GEOSERVER_API_URL } from "./constants"
import './App.css'
// import OlMapBasic from "./components/OlMap/OlMapBasic";
// import DeclarativeMapDef from "./components/OlMap/DelcarativeMapDef";
import OlMap from "./components/OlMap/OlMap";
import SortingCriteriaSelector from "./components/UI/SortingCriteriaSelector/SortingCriteriaSelector";
import DrawingToggleButton from "./components/UI/DrawingToggleButton/DrawingToggleButton";
import mapWeightsToApi from "./services/sortAdapter"
import toast, { Toaster } from "react-hot-toast";


function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [availables, setAvailables] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState();
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleRowClick = (building) => {
    setSelectedBuilding(building);
  };

  // const handleLocationSelected = (location) => {
  //   setSelectedLocation(location);
  //   console.log('new location', location)
  // };

  useEffect(() => {
    console.debug(
      "REACT_APP_MUNICIPALITIES_API_URL",
      REACT_APP_MUNICIPALITIES_API_URL
    );
    console.debug(
      "REACT_APP_BUILDINGS_API_URL",
      REACT_APP_BUILDINGS_API_URL
    );
    console.debug(
      "REACT_APP_GEOSERVER_API_URL",
      REACT_APP_GEOSERVER_API_URL
    );
  }, []);


  const handleSortingCriteria = (sortingCriteria) => {
    console.log('sortingCriteria', sortingCriteria)

    setIsLoading(true)
    const weights_mapped = mapWeightsToApi(sortingCriteria)

    // Realiza la llamada GET a la API del backend para obtener los datos
    const url = `${REACT_APP_BUILDINGS_API_URL
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

    const url = `${REACT_APP_BUILDINGS_API_URL
      }?municipio=${encodeURIComponent(municipio)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setTableData(data); // Guarda los datos en el estado local
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
    const url = `${REACT_APP_MUNICIPALITIES_API_URL}?withData=true`;
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
    console.log('isDrawingEnabled', isDrawingEnabled)
    setIsDrawingEnabled(prevState => !prevState);

  }
  return (
    <div className="App">
      <OlMap
        location={selectedLocation}
        onMunicipioSelected={handleMunicipioSelected}
        availableMunicipios={availables}
        availableBuildings={tableData.buildings}
        selectedBuilding={selectedBuilding}
        setSelectedBuilding={setSelectedBuilding}
        isDrawingEnabled={isDrawingEnabled}
      >
        <SearchBox onLocationSelected={handleMunicipioSelected} location={selectedLocation} />
        {tableData.buildings?.length > 0 && !selectedBuilding &&
          <div className="buildings-alert">
            <p>Click on table rows or zoom in to see and interact with the buildings</p>
          </div>}
        {tableData.buildings?.length > 0 && <SortingCriteriaSelector onSort={handleSortingCriteria} isLoading={isLoading} />}
        {tableData.buildings?.length > 0 && <DrawingToggleButton isDrawingEnabled={isDrawingEnabled} onChange={handleDrawingToggleButtonChange} />}
      </OlMap>
      <DTable data={tableData.buildings} onRowClicked={handleRowClick} />
      <Toaster
        toastOptions={{
          style: {
            margin:'30px',
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
