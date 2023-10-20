import logo from "./logo.svg";
import "./App.css";
import OlMap from "./components/OlMap/OlMap";
import SearchBox from "./components/UI/SearchBox/SearchBox";
import React, { useState,useCallback } from "react";
import DTable from "./components/UI/DataTable/DTable";




const availables = ['Siero','Crevillent'];

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tableData, setTableData] = useState([]); 

  const handleLocationSelected = (location) => {
    setSelectedLocation(location);
  };

  const handleMunicipioSelected = useCallback((municipio) => {
    
    const url = `${process.env.REACT_APP_BUILDINGS_API_URL}?municipio=${encodeURIComponent(municipio)}`;
    console.log(municipio)
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setTableData(data); // Guarda los datos en el estado local
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los datos:", error);
      });
  }, []);  


  return (
    <div className="App">
      <OlMap
        location={selectedLocation}
        onMunicipioSelected={handleMunicipioSelected}
        availableMunicipios={availables}
      >
        <SearchBox onLocationSelected={handleLocationSelected} />
      </OlMap>
      <DTable data={tableData.buildings} />
    </div>
  );
}

export default App;
