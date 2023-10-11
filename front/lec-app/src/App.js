import logo from './logo.svg';
import './App.css';
import OlMap from './components/OlMap/OlMap';
import Button from './components/UI/Button/Button';
import SearchBox from './components/UI/SearchBox/SearchBox';


function App() {
  return (
    <div className="App">
      <OlMap>
        <Button label="Aceptar"/>
        <SearchBox/>

      </OlMap>
    </div>
  );
}

export default App;
