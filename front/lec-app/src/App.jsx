import React, { useState, useEffect, useCallback } from "react";
import DTable from "./components/UI/DataTable/DTable";
import SearchBox from "./components/UI/SearchBox/SearchBox";
import GradientColorBar from './components/UI/GradientColorBar/GradientColorBar';
import { VITE_MUNICIPALITIES_API_URL, VITE_BUILDINGS_API_URL, VITE_REPORT_API_URL, VITE_GEOSERVER_API_URL, capitalizeCamel } from "./constants"
import './App.css'
import OlMap from "./components/OlMap/OlMap";
import SortingCriteriaSelector from "./components/UI/SortingCriteriaSelector/SortingCriteriaSelector";
import DrawingToggleButton from "./components/UI/DrawingToggleButton/DrawingToggleButton";
import mapWeightsToApi from "./services/sortAdapter"
import toast, { Toaster } from "react-hot-toast";
import CancellSelectionButton from "./components/UI/CancellSelectionButton/CancellSelectionButton";
import { createGradientFunction } from "./services/gradient";
import ExportPanel from './components/UI/ExportPanel/ExportPanel';
import { MultiSelect } from 'primereact/multiselect';
import 'primereact/resources/themes/fluent-light/theme.css';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './components/UI/LanguageSelector/LanguageSelector';

function App() {
  const { t } = useTranslation();
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
  const [buildingTypes, setBuildingTypes] = useState([])
  const [selectedBuildingTypes, setSelectedBuildingTypes] = useState([])
  const [currentSortingWeights, setCurrentSortingWeights] = useState("1.\Total Production");


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
      "VITE_REPORT_API_URL",
      VITE_REPORT_API_URL
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
    setCurrentSortingWeights(
      Object.entries(sortingCriteria)
        .filter(([_, weight]) => weight > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([key, _], index) => `${index + 1}.\t${key}`).join("\n")
    );
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
            data.buildings.map(b => {
              b.currentUse = capitalizeCamel(b.currentUse);
            })
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

        data.buildings.map(b => {
          b.currentUse = capitalizeCamel(b.currentUse);
        })
        setTableData(data); // Guarda los datos en el estado local
        setInitialTableData(data);
        setSelectedBuilding(null);

        const uniqueTypes = Array.from(new Set(data.buildings.map(b => b.currentUse)));
        setBuildingTypes(uniqueTypes);

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

  useEffect(() => {
    if (selectedBuildingTypes.length > 0) {
      const filteredData = initialTableData.buildings.filter(b => selectedBuildingTypes.includes(b.currentUse));
      setTableData({ buildings: filteredData });
    } else {
      setTableData(initialTableData);
    }
  }, [selectedBuildingTypes, initialTableData]);


  const handleDrawingToggleButtonChange = () => {
    setIsDrawingEnabled(prevState => !prevState);
    console.log('isDrawingEnabled', isDrawingEnabled)
  }

  const setAvailableBuildings = (buildings) => {


    /*
    // NOTE: uncomment in case that gradient has to relative to selected buildings (drawing a polygon)
    const values = buildings.map(building => building['production'])
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
    const values = initialTableData.buildings.map(building => building['production'])
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

  const generateReportProcedure = () => {
    const url = `${VITE_REPORT_API_URL}`;

    const data = {
      'MUNICIPALITY_TITLE': selectedLocation.toUpperCase(),
      'MUNICIPALITY': selectedLocation,
      // 'NUM_BUILDINGS': tableData.buildings.length.toString(),
      'SORTING_CRITERIA_LIST': currentSortingWeights,
      'isAreaSelected': isPolygonDrawn || selectedBuildingTypes.length > 0,
    };

    if (isPolygonDrawn || selectedBuildingTypes.length > 0){
      data.selectedBuildings = tableData.buildings
    }

    toast.promise(
      fetch(url, {
        method: 'POST', // Usamos el método POST
        headers: {
          'Content-Type': 'application/json', // Indicamos que enviamos JSON
        },
        body: JSON.stringify(data) // Enviamos los datos en el cuerpo de la solicitud
      })
        .then((res) => {
          // Extraemos el nombre del archivo del header 'Content-Disposition'
          const disposition = res.headers.get('Content-Disposition');
          let filename = `report_${data['MUNICIPALITY']}.pdf`; // Nombre por defecto

          if (disposition && disposition.includes('filename')) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
              filename = matches[1].replace(/['"]/g, ''); // Limpiamos las comillas
            }
          }

          return res.blob().then(blob => {





            const url = window.URL.createObjectURL(blob); // Creamos el objeto URL temporal

            // const newTab = window.open(url, '_blank'); // si se quisiera mostrar el archivo en una nueva pestaña

            // Simulamos un clic para permitir la descarga con el nombre correcto
            const a = document.createElement('a');
            a.href = url;
            a.download = filename; // Asignamos el nombre correcto al archivo
            document.body.appendChild(a); // Añadimos el enlace al DOM
            a.click(); // Simulamos el clic para que se pueda descargar con el nombre correcto
            a.remove(); // Removemos el enlace después del clic

            // Liberamos el objeto URL después de un tiempo
            // newTab.onload = () => window.URL.revokeObjectURL(url);

          });
        })
        .catch(error => {
          console.error('Error:', error); // Manejamos errores
          throw error
        })
      ,
      {
        loading: 'Generating report, please wait...',
        success: <b>Report generated. Downloading...</b>,
        error: <b>Could not generate the report, please try again.</b>,
      })
  };



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
        <LanguageSelector />
        <SearchBox onLocationSelected={handleMunicipioSelected} location={selectedLocation} />
        {tableData.buildings?.length > 0 && !selectedBuilding &&
          <div className="buildings-alert">
            <p>{t("Click on table rows or zoom in to see and interact with the buildings")}</p>
          </div>}
        {tableData.buildings?.length > 0 && <>
          <ExportPanel exportFileProcedure={generateReportProcedure} />
          <SortingCriteriaSelector onSort={handleSortingCriteria} isLoading={isLoading} />
          {areMapBuildingsVisible && <GradientColorBar minValue={colorData.minValue} maxValue={colorData.maxValue} />}
          <DrawingToggleButton isDrawingEnabled={isDrawingEnabled} onChange={handleDrawingToggleButtonChange} />
          <MultiSelect
            id="buildingTypesSelector"
            value={selectedBuildingTypes}
            onChange={(e) => setSelectedBuildingTypes(e.value)}
            options={buildingTypes.map(type => ({
              label: t(type),
              value: type
            }))}
            optionLabel="label"
            placeholder={t("Filter by building type")}
            className="w-full md:w-20rem"
          />

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
