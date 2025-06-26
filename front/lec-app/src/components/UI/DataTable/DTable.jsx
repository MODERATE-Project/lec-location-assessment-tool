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
      selector: (row) => t(row.currentUse),
      sortable: true,

    },
    {
      name: t("Production [MWh per year]"),
      selector: (row) => parseFloat(row.production),
      cell: (row) => parseFloat(row.production).toLocaleString('en-US', {useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 3}).replace(/,/g, ' '),
      sortable: true,
      
    },
    {
      name: t("Potential [kWh/m² per year]"),
      selector: (row) => parseFloat(row.MEAN),
      cell: (row) => parseFloat(row.MEAN).toLocaleString('en-US', {useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 3}).replace(/,/g, ' '),
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
      cell: (row) => parseInt(row.panels).toLocaleString('en-US', {useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 0}).replace(/,/g, ' '),
      sortable: true,

    },
    {
      name: t("Area [m²]"),
      selector: (row) => parseFloat(row.AREA),
      cell: (row) => parseFloat(row.AREA).toLocaleString('en-US', {useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 3}).replace(/,/g, ' '),
      sortable: true,

    },
    {
      name: t("Average Income"),
      selector: (row) => parseFloat(row.Renta_media) * 1000,
      cell: (row) => (parseFloat(row.Renta_media) * 1000).toLocaleString('en-US', {useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 3}).replace(/,/g, ' '),
      sortable: true,
    },
    {
      name: t("Total Population"),
      selector: (row) => parseFloat(row.Total_poblacion),
      cell: (row) => parseFloat(row.Total_poblacion).toLocaleString('en-US', {useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 3}).replace(/,/g, ' '),
      sortable: true,

    },
    {
      name: t("% Population"),
      selector: (row) => parseFloat(row.Porcentaje_poblacion),
      cell: (row) => parseFloat(row.Porcentaje_poblacion).toLocaleString('en-US', {useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 3}).replace(/,/g, ' '),
      sortable: true,

    },
    {
      name: t("% Single-Person Households"),
      selector: (row) => parseFloat(row.Porcentaje_Hogares_unipersonales),
      cell: (row) => parseFloat(row.Porcentaje_Hogares_unipersonales).toLocaleString('en-US', {useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 3}).replace(/,/g, ' '),
      sortable: true,

    },
    {
      name: t("% Greater than 65"),
      selector: (row) => parseFloat(row.Porcentaje_mayor_65),
      cell: (row) => parseFloat(row.Porcentaje_mayor_65).toLocaleString('en-US', {useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 3}).replace(/,/g, ' '),
      sortable: true,

    },
    {
      name: t("% less than 18"),
      selector: (row) => parseFloat(row.Porcentaje_menor_18),
      cell: (row) => parseFloat(row.Porcentaje_menor_18).toLocaleString('en-US', {useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 3}).replace(/,/g, ' '),
      sortable: true,

    },
    {
      name: t("Average Household Size"),
      selector: (row) => parseFloat(row.Tamaño_medio_hogar),
      cell: (row) => parseFloat(row.Tamaño_medio_hogar).toLocaleString('en-US', {useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 3}).replace(/,/g, ' '),
      sortable: true,

    },
    {
      name: t("Average age"),
      selector: (row) => parseFloat(row.Total_edad_media),
      cell: (row) => parseFloat(row.Total_edad_media).toLocaleString('en-US', {useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 3}).replace(/,/g, ' '),
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
