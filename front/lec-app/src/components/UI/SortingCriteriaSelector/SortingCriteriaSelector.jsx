import React, { useState } from 'react';
import './SortingCriteriaSelector.css';
import Loader from '../Loader';
import { Collapse } from 'react-collapse';
import { MdDragIndicator } from "react-icons/md";
import { LuTextCursorInput } from "react-icons/lu";
import { TbDragDrop } from "react-icons/tb";
import { ReactSortable } from "react-sortablejs";


const SortingCriteriaComponent = ({ onSort, isLoading }) => {

  const [advanced, setAdvanced] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [sortableList, setSortableList] = useState([
    { id: 1, value: 1, name: 'Rent' },
    { id: 2, value: 1, name: 'Age' },
    { id: 3, value: 1, name: 'Population' },
    { id: 4, value: 1, name: 'Single-person households' },
    { id: 5, value: 1, name: 'Elderly Percentage' },
    { id: 6, value: 1, name: 'Youth Percentage' },
    { id: 7, value: 1, name: 'Average Persons Per Household' },
    { id: 8, value: 1, name: 'Potential Production' },
  ])

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

        <div>
          <h2>Sorting Criteria</h2>
          <p>Select the importance of each variable on a scale from 0 to {upperLimit}</p>
        </div>

        <button className="advanced-button" style={{ 'opacity': isOpened ? "1" : "0" }} onClick={
          (e) => {
            e.stopPropagation();
            setAdvanced(prev => !prev)
          }}>
          {/* {advanced ? 'simple' : 'advanced'} */}
          {advanced ? <TbDragDrop /> : <LuTextCursorInput />}
        </button>

      </div>

      <Collapse isOpened={isOpened}>
        {isOpened && <div className="sorting-criteria-content" onClick={(e) => e.stopPropagation()}>
          {/*
          <div style={{ 'textAlign': "end" }}>
            <button className="advanced-button" onClick={() => setAdvanced(prev => !prev)}>
              {/* {advanced ? 'simple' : 'advanced'} */}{/*
              {advanced ? <TbDragDrop /> : <LuTextCursorInput />}
            </button>
          </div>
*/}
          <ReactSortable className="sorting-criteria-content" disabled={advanced} list={sortableList} setList={setSortableList}>
            {sortableList.map((item, index) => (

              <div key={item.id} className="variable-row" style={{ "paddingBottom": !advanced ? '2px' : '0' }} >
                {!advanced && <MdDragIndicator className='drag-icon' />}
                {/* {!advanced && <FaGripLines style={{ 'paddingRight': '15px' }} />} */}
                <label htmlFor={item.name} style={{ 'fontSize': advanced ? '1em' : `${calculateFontSize(index, sortableList.length)}em` }} >{item.name}</label>
                {advanced && <input
                  type="number"
                  id={item.name}
                  min="0"
                  max="10"
                  value={item.value}
                  onChange={(e) => handleImportanceChange(index, e.target.value)}
                />}
              </div>

            ))}
          </ReactSortable>


          <button className="sort-button dark" onClick={handleSort}>
            {isLoading && <Loader />}
            Sort Table
          </button>
        </div>}
      </Collapse >
    </div >
  );
};

export default SortingCriteriaComponent;
