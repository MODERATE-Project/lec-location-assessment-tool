import classes from "./SearchBox.module.css";
import Select from "react-select";
import { useState } from "react";


const options = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "vanilla", label: "Vanilla" },
];

const SearchBox = (props) => {
  const handleChange = (item) => {
    console.log("Selected item:", item);
    setSelectedOption(item);
  };

  const [selectedOption, setSelectedOption] = useState(null);

  return (

    <div className={classes.selectContainer}>
      <Select
        value={selectedOption}
        onChange={handleChange}
        options={options}
        placeholder="Select a municipality"
      />
    </div>
  );
};

export default SearchBox;
