import React, { useState, useEffect, useCallback } from "react";
import OlMap from "./components/OlMap/OlMap";
import SearchBox from "./components/UI/SearchBox/SearchBox";
import DTable from "./components/UI/DataTable/DTable";

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [availables, setAvailables] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState();

  const handleRowClick = (building) => {
    setSelectedBuilding(building);
        
  };

  const handleLocationSelected = (location) => {
    setSelectedLocation(location);
  };

  const handleMunicipioSelected = useCallback((municipio) => {
    const url = `${
      process.env.REACT_APP_BUILDINGS_API_URL
    }?municipio=${encodeURIComponent(municipio)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log("DATA TO PASS TO DTable: ", data);
        setTableData(data); // Guarda los datos en el estado local
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los datos:", error);
      });
  }, []);

  useEffect(() => {
    // Realiza la llamada GET a la API del backend para obtener los datos municipios con datos
    const url = `${process.env.REACT_APP_MUNICIPALITIES_API_URL}?withData=true`;
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
  }, []); // El array vacío [] asegura que este efecto se ejecute solo una vez al montar el componente

  return (
    <div className="App">
      <OlMap
        location={selectedLocation}
        onMunicipioSelected={handleMunicipioSelected}
        availableMunicipios={availables} 
        selectedBuilding={selectedBuilding}
      >
        <SearchBox onLocationSelected={handleLocationSelected} />
      </OlMap>
      <DTable data={tableData.buildings} onRowClicked={handleRowClick} />
    </div>
  );
}

export default App;
