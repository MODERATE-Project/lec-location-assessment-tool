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

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [availables, setAvailables] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState();
  const [isDrawingEnabled, setIsDrawingEnabled] = useState(false)

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
  }

  const handleMunicipioSelected = useCallback((municipio) => {
    const url = `${REACT_APP_BUILDINGS_API_URL
      }?municipio=${encodeURIComponent(municipio)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setTableData(data); // Guarda los datos en el estado local
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
        selectedBuilding={selectedBuilding}
        isDrawingEnabled={isDrawingEnabled} 
      >
        <SearchBox onLocationSelected={handleMunicipioSelected} />
        {tableData.buildings?.length > 0 && <SortingCriteriaSelector onSort={handleSortingCriteria} />}
        {tableData.buildings?.length > 0 && <DrawingToggleButton isDrawingEnabled={isDrawingEnabled} onChange={handleDrawingToggleButtonChange} />}
      </OlMap>
      <DTable data={tableData.buildings} onRowClicked={handleRowClick} />
    </div>
  );
}

export default App;
