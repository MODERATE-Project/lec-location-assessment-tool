import React, { useState, useEffect, useCallback } from "react";
import OlMap from "./components/OlMap/OlMap";
import SearchBox from "./components/UI/SearchBox/SearchBox";
import DTable from "./components/UI/DataTable/DTable";

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [availables, setAvailables] = useState([]);

  const handleRowClick = (row) => {
    console.log("Click en fila", row);
    
    // Asumamos que las coordenadas que deseas convertir están en las propiedades `row.lat` y `row.lng`
    const coordinatesToConvert = {
      lat: row.lat,
      lng: row.lng,
    };

    // URL de tu servicio del backend que convierte coordenadas
    const apiUrl = `${process.env.REACT_APP_COORDINATES_API_URL}/25830/to/4326`;

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(coordinatesToConvert), // Convertimos las coordenadas a un string JSON para enviarlas en el cuerpo de la solicitud
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json(); // Devuelve las nuevas coordenadas como JSON
      })
      .then((data) => {
        // Aquí puedes manejar las coordenadas convertidas. Por ejemplo:
        //const newLat = data.newLat;
        //const newLng = data.newLng;
        console.log(data);

        // Aquí puedes hacer lo que necesites con las coordenadas convertidas, por ejemplo:
        // setSelectedLocation({ lat: newLat, lng: newLng });
      })
      .catch((error) => {
        console.error("Hubo un error al convertir las coordenadas:", error);
      });
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
        setTableData(data); // Guarda los datos en el estado local
      })
      .catch((error) => {
        console.error("Hubo un error al obtener los datos:", error);
      });
  }, []);

  useEffect(() => {
    // Realiza la llamada GET a la API del backend para obtener los datos de availables
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
        availableMunicipios={availables} // Pasa availables como prop a OlMap
      >
        <SearchBox onLocationSelected={handleLocationSelected} />
      </OlMap>
      <DTable data={tableData.buildings} onRowClicked={handleRowClick} />
    </div>
  );
}

export default App;
