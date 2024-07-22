import React, { useState } from 'react';
import './SortingCriteriaSelector.css';
import Loader from '../Loader';
import { Collapse } from 'react-collapse';
import { FaCaretLeft, FaCaretRight, FaGripLines, } from "react-icons/fa6";
import { MdDragIndicator } from "react-icons/md";
import { ReactSortable } from "react-sortablejs";


const SortingCriteriaComponent = ({ onSort, isLoading }) => {

  const [advanced, setAdvanced] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [sortableList, setSortableList] = useState([
    { id: 1, name: 'Rent', value: 1 },
    { id: 2, name: 'Age', value: 1 },
    { id: 3, name: 'Population', value: 1 },
    { id: 4, name: 'Single-person households', value: 1 },
    { id: 5, name: 'Elderly Percentage', value: 1 },
    { id: 6, name: 'Youth Percentage', value: 1 },
    { id: 7, name: 'Average Persons Per Household', value: 1 },
    { id: 8, name: 'Potential Production', value: 1 },
  ])
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
  const handleImportanceChange = (index, importance) => {
    const importanceNumber = parseInt(importance);
    const importanceValue =
      isNaN(importanceNumber) || importanceNumber < 0 || importanceNumber > upperLimit ? 0 : importanceNumber;

    setSortableList((prev) => prev.map((item, idx) => (idx === index ? { ...item, value: importanceValue } : item)));
  };

  const handleSort = () => {

    const sortValuesDict = sortableList.reduce((acc, item, idx) => {
      acc[item.name] = advanced ? item.value : sortableList.length - idx
      return acc
    }, {})

    onSort(sortValuesDict);
  };

  const toggleAccordion = () => {
    setIsOpened(!isOpened);
  };

  const calculateFontSize = (index, totalItems) => {
    const baseSize = .85; // Tamaño base en em
    const increment = 0.4; // Incremento por elemento
    const scale = (totalItems - index) / totalItems;
    return baseSize + increment * scale;
  };


  return (
    <div className="sorting-criteria-container">
      <div className="sorting-criteria-header" onClick={toggleAccordion}>
        <h2>Sorting Criteria</h2>
        <p>Select the importance of each variable on a scale from 0 to {upperLimit}</p>
      </div>

      <Collapse isOpened={isOpened}>
        <div className="sorting-criteria-content" onClick={(e) => e.stopPropagation()}>
          <ReactSortable className="sorting-criteria-content" disabled={advanced} list={sortableList} setList={setSortableList}>
            {sortableList.map((item, index) => (

              <div div key={item.id} className="variable-row" style={{ "paddingBottom": !advanced ? '2px' : '0' }} >
                {!advanced && <MdDragIndicator style={{ 'paddingRight': '10px', 'fontSize': '1.25em' }} />}
                {/* {!advanced && <FaGripLines style={{ 'paddingRight': '15px' }} />} */}
                <label htmlFor={item} style={{ 'fontSize': advanced ? '1em' : `${calculateFontSize(index, sortableList.length)}em` }} >{item.name}</label>
                {advanced && <input
                  type="number"
                  id={item}
                  min="0"
                  max="10"
                  value={item.value}
                  onChange={(e) => handleImportanceChange(index, e.target.value)}
                />}
              </div>

            ))}
          </ReactSortable>

          <div style={{ 'textAlign': "end" }}>
            <button className="advanced-button" onClick={() => setAdvanced(prev => !prev)}>
              {advanced ? 'drag' : 'numbers'}
              {/* {advanced ? <FaCaretRight /> : <FaCaretLeft />} */}
            </button>
          </div>

          <button className="sort-button dark" onClick={handleSort}>
            {isLoading && <Loader />}
            Sort Table
          </button>
        </div>
      </Collapse >
    </div >
  );
};

export default SortingCriteriaComponent;
