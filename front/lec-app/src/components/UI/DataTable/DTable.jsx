import DataTable from "react-data-table-component";
import { capitalizeCamel } from "../../../constants"
import { useTranslation } from 'react-i18next';

const customStyles = {

  table: {
    style: {
      zIndex: 1000
    }
  },

  headRow: {
    style: {
      backgroundColor: "#003b49",
      maxWidth: "100vmax",
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
      maxWidth: "100vmax"
    },
  },
};

const DTable = ({ data, onRowClicked }) => {
  const { t } = useTranslation();

  const columns = [
    {
      name: t("Current use"),
      selector: (row) => row.currentUse,
      sortable: true,

    },
    {
      name: t("Production [MWh per year]"),
      selector: (row) => parseFloat(row.production),
      cell: (row) => parseFloat(row.production).toFixed(5),
      sortable: true,
      
    },
    {
      name: t("Potential [kWh/m² per year]"),
      selector: (row) => parseFloat(row.MEAN),
      cell: (row) => parseFloat(row.MEAN).toFixed(5),
      sortable: true,
      
    },
    // {
    //   name: "Panels",
    //   selector: (row) => row.panels,
    //   sortable: true,

    // },
    {
      name: t("Panels"),
      selector: (row) => parseInt(row.panels),
      cell: (row) => row.panels,
      sortable: true,

    },
    {
      name: t("Area [m²]"),
      selector: (row) => row.AREA,
      sortable: true,

    },
    {
      name: t("Average Income"),
      selector: (row) => row.Renta_media,
      sortable: true,

    },
    {
      name: t("Total Population"),
      selector: (row) => row.Total_poblacion,
      sortable: true,

    },
    {
      name: t("% Population"),
      selector: (row) => row.Porcentaje_poblacion,
      sortable: true,

    },
    {
      name: t("% Single-Person Households"),
      selector: (row) => row.Porcentaje_Hogares_unipersonales,
      sortable: true,

    },
    {
      name: t("% Greater than 65"),
      selector: (row) => row.Porcentaje_mayor_65,
      sortable: true,

    },
    {
      name: t("% less than 18"),
      selector: (row) => row.Porcentaje_menor_18,
      sortable: true,

    },
    {
      name: t("Average Household Size"),
      selector: (row) => row.Tamaño_medio_hogar,
      sortable: true,

    },
    {
      name: t("Average age"),
      selector: (row) => row.Total_edad_media,
      sortable: true,

    },


  ];

  return (
    <DataTable
      className="datatable"
      columns={columns}
      data={data}
      pagination
      highlightOnHover
      customStyles={customStyles}
      resizableColumns
      showGridlines
      onRowClicked={onRowClicked}
      noDataComponent={t("There are no records to display")}
    />
  );
};

export default DTable;
