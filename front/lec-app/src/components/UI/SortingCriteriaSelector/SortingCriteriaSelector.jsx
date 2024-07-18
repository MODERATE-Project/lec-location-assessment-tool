import React, { useState } from 'react';
import './SortingCriteriaSelector.css';
import Loader from '../Loader';
import { Collapse } from 'react-collapse';


const SortingCriteriaComponent = ({ onSort, isLoading }) => {

  const [isOpened, setIsOpened] = useState(false);
  const [variableImportance, setVariableImportance] = useState({
    Rent: 0,
    Age: 0,
    Population: 0,
    "Single-person households": 0,
    "Elderly Percentage": 0,
    "Youth Percentage": 0,
    "Average Persons Per Household": 0,
    "Potential Production": 0,
  });

  const upperLimit = 10;

  // Function to handle importance assignment
  const handleImportanceChange = (variable, importance) => {
    const importanceNumber = parseInt(importance);
    const importanceValue =
      isNaN(importanceNumber) || importanceNumber < 0 || importanceNumber > upperLimit ? 0 : importanceNumber;

    setVariableImportance({
      ...variableImportance,
      [variable]: importanceValue,
    });

  };
  const handleSort = () => {
    onSort(variableImportance);
  };

  const toggleAccordion = () => {
    setIsOpened(!isOpened);
  };


  return (
    <div className="sorting-criteria-container">
      <div className="sorting-criteria-header" onClick={toggleAccordion}>
        <h2>Sorting Criteria</h2>
        <p>Select the importance of each variable on a scale from 0 to {upperLimit}</p>

        <Collapse isOpened={isOpened}>
          <div className="sorting-criteria-content" onClick={(e) => e.stopPropagation()}>
            {Object.entries(variableImportance).map(([variable, value]) => (
              <div key={variable} className="variable-row">
                <label htmlFor={variable}>{variable}</label>
                <input
                  type="number"
                  id={variable}
                  min="0"
                  max="10"
                  value={value}
                  onChange={(e) => handleImportanceChange(variable, e.target.value)}
                />
              </div>
            ))}
            <button className="sort-button dark" onClick={handleSort}>
              {isLoading && <Loader />}
              Sort Table
            </button>
          </div>
        </Collapse>
      </div>
    </div>
  );
};

export default SortingCriteriaComponent;
