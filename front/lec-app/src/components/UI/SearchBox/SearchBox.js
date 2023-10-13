// SearchBox.js
import React from "react";
import Select from "react-select";
import classes from "./SearchBox.module.css"

const options = [
  
];

const SearchBox = ({ onLocationSelected }) => {
  return (
    <div className={classes.selectContainer}>
      <Select
        options={options}
        placeholder="Select a municipality"
        onChange={(selectedOption) => onLocationSelected(selectedOption.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.value !== '') {
            onLocationSelected(e.target.value);
          }
        }}
      />
    </div>
  );
};

export default SearchBox;
