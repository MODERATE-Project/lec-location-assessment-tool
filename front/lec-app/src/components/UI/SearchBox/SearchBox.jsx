import React, { useState, useEffect } from "react";
import Select, { createFilter } from "react-select";
import classes from "./SearchBox.module.css";
import CustomMenuList from "./CustomMenuList";
import { REACT_APP_MUNICIPALITIES_API_URL } from '../../../constants.js'

const SearchBox = ({ onLocationSelected, location }) => {
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState();

  useEffect(() => {
    fetch(REACT_APP_MUNICIPALITIES_API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
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
      .catch((error) => {
        console.error(
          "There was a problem with the fetch operation:",
          error.message
        );
      });
  }, []);


  useEffect(() => {
    if (location)
      setSelectedOption({ value: location, label: location });
  }, [location]);

  const handleLocationSelected = (selectedOption) => {
    onLocationSelected(selectedOption);
  };

  return (
    <div className={classes.selectContainer}>
      <Select
        value={selectedOption}
        filterOption={createFilter({ ignoreAccents: true })}
        options={options}
        placeholder="Select a municipality"
        onChange={(selectedOption) =>
          handleLocationSelected(selectedOption.value)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target.value !== "") {
            handleLocationSelected(e.target.value);
          }
        }}
        components={{
          MenuList: CustomMenuList,
        }}
      />
    </div>
  );
};

export default SearchBox;
