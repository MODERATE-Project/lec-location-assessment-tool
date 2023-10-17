// SearchBox.js
import React, { useState, useEffect } from "react";
import Select, {createFilter} from "react-select";
import classes from "./SearchBox.module.css";
import CustomMenuList from "./CustomMenuList"


const SearchBox = ({ onLocationSelected }) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    // Reemplaza con tu llamada API
    fetch("http://127.0.0.1/municipalities")
      .then((response) => response.json())
      .then((data) => {
        // Asume que los datos son un array de objetos con forma { value: '...', label: '...' }
        // Si no es así, tendrás que transformarlos

        const transformedData = data.municipalities.map((item) => {
          return {
            value: item.name,
            label: item.name,
          };
        });
       
        setOptions(transformedData);
      });
  }, []); // El array vacío significa que este useEffect se ejecuta solo una vez, similar a componentDidMount

  return (
    <div className={classes.selectContainer}>
      <Select
     
     filterOption={createFilter({ ignoreAccents: false })}
        options={options}
        placeholder="Select a municipality"
        onChange={(selectedOption) => onLocationSelected(selectedOption.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target.value !== "") {
            onLocationSelected(e.target.value);
          }
        }}
        components={{
          MenuList: CustomMenuList
        }}
      />
    </div>
  );
};

export default SearchBox;
