import logo from './logo.svg';
import './App.css';
import OlMap from './components/OlMap/OlMap';
import SearchBox from './components/UI/SearchBox/SearchBox';
import React, { useState } from 'react';


function App() {

  const [selectedLocation, setSelectedLocation] = useState(null);

  const handleLocationSelected = (location) => {
      setSelectedLocation(location);
  };

  return (
    <div className="App">
      <OlMap location={selectedLocation}>
        <SearchBox onLocationSelected={handleLocationSelected}/>

      </OlMap>
    </div>
  );
}

export default App;
