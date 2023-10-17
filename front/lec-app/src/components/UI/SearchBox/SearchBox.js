// SearchBox.js
import React, { useState, useEffect } from "react";
import Select, {createFilter} from "react-select";
import classes from "./SearchBox.module.css";
import CustomMenuList from "./CustomMenuList"


const SearchBox = ({ onLocationSelected }) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    
    fetch(process.env.REACT_APP_MUNICIPALITIES_API_URL)
      .then(response=>{
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
     
        const transformedData = data.municipalities.map((item) => {
          return {
            value: item.name,
            label: item.name,
          };
        });
       
        setOptions(transformedData);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error.message);
      });
      ;
  }, []); 

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
