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

const DTable = ({ data, onRowClicked }) => {

  const columns = [
    {
      name: "Current use",
      selector: (row) => row.currentUse,
      sortable: true,
      
    },
    {
      name: "Potential",
      selector: (row) => row.MEAN,
      sortable: true,
      
    },
    {
      name: "Area",
      selector: (row) => row.AREA,
      sortable: true,
      
    },
    {
      name: "Average Income",
      selector: (row) => row.Renta_media,
      sortable: true,
      
    },
    {
      name: "Total Population",
      selector: (row) => row.Total_poblacion,
      sortable: true,
      
    },
    {
      name: "% Population",
      selector: (row) => row.Porcentaje_poblacion,
      sortable: true,
      
    },
    {
      name: "% Single-Person Households",
      selector: (row) => row.Porcentaje_Hogares_unipersonales,
      sortable: true,
      
    },
    {
      name: "% Greater than 65",
      selector: (row) => row.Porcentaje_mayor_65,
      sortable: true,
      
    },
    {
      name: "% Greater than 18",
      selector: (row) => row.Porcentaje_menor_18,
      sortable: true,
      
    },
    {
      name: "Average Household Size",
      selector: (row) => row.Tamaño_medio_hogar,
      sortable: true,
      
    },
    {
      name: "Average age",
      selector: (row) => row.Total_edad_media,
      sortable: true,
      
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
      onRowClicked={onRowClicked}
    />
  );
};

export default DTable;
