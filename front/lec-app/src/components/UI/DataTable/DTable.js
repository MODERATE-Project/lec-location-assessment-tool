import DataTable from "react-data-table-component";

const customStyles = {
  headRow: {
    style: {
      backgroundColor: "#003b49",
    },
  },
  headCells: {
    style: {
      color: "#f2c75c", // Color de texto para un mejor contraste con el fondo oscuro
      fontFamily: "Roboto, sans-serif",
      fontSize: "16px",
      
    },
    
  },

  rows: {
    style: {
      fontFamily: "Roboto, sans-serif", // Usar la fuente Roboto
      fontSize: "16px",
    },
  },
};

const DTable = ({ data }) => {


  /*
    "AREA": 286.25,
            "MEAN": 1487.64656476,
            "MWh_aprove": 425.838829163,
            "MWh_prod_e": 76.6509892493,
            "Municipios": "Crevillent",
            "Porcentaje_Hogares_unipersonales": "25,9",
            "Porcentaje_mayor_65": "22,6",
            "Porcentaje_menor_18": "16",
            "Porcentaje_poblacion": "68,9",
            "Renta_media": 21.927,
            "Secciones": 305905002,
            "Tamaño_medio_hogar": "2,74",
            "Total_edad_media": "44,9",
            "Total_poblacion": 8700,
            "area_m2"
    */
  // Columnas para nuestra tabla
  const columns = [
    {
      name: "Potential",
      selector: (row) => row.MEAN,
      sortable: true,
      width: "auto"
    },
    {
      name: "Area",
      selector: (row) => row.AREA,
      sortable: true,
      width: "auto"
    },
    {
      name: "Average Income",
      selector: (row) => row.Renta_media,
      sortable: true,
      width: "auto"
    },
    {
      name: "Total Population",
      selector: (row) => row.Total_poblacion,
      sortable: true,
      width: "auto"
    },
    {
      name: "% Population",
      selector: (row) => row.Porcentaje_poblacion,
      sortable: true,
      width: "auto"
    },
    {
      name: "% Single-Person Households",
      selector: (row) => row.Porcentaje_Hogares_unipersonales,
      sortable: true,
      width: "auto"
    },
    {
      name: "% Greater than 65",
      selector: (row) => row.Porcentaje_mayor_65,
      sortable: true,
      width: "auto"
    },
    {
      name: "% Greater than 18",
      selector: (row) => row.Porcentaje_menor_18,
      sortable: true,
      width: "auto"
    },
    {
      name: "Average Household Size",
      selector: (row) => row.Tamaño_medio_hogar,
      sortable: true,
      width: "auto"
    },
    {
      name: "Average age",
      selector: (row) => row.Total_edad_media,
      sortable: true,
      width: "auto"
    },

    
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      pagination
      highlightOnHover
      customStyles={customStyles}
      resizableColumns 
      showGridlines
    />
  );
};

export default DTable;
