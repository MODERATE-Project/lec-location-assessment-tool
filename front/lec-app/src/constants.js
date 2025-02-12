// const REACT_APP_MUNICIPALITIES_API_URL = 'http://localhost:5000/municipalities'
// const REACT_APP_BUILDINGS_API_URL = 'http://localhost:5001/buildings'
// const REACT_APP_GEOSERVER_API_URL = 'http://localhost:8080/geoserver'

const VITE_MUNICIPALITIES_API_URL = import.meta.env.VITE_MUNICIPALITIES_API_URL || 'http://localhost:5000/municipalities';
const VITE_BUILDINGS_API_URL = import.meta.env.VITE_BUILDINGS_API_URL || 'http://localhost:5001/buildings';
const VITE_REPORT_API_URL = import.meta.env.VITE_REPORT_API_URL || 'http://localhost:5002/report';
const VITE_GEOSERVER_API_URL = import.meta.env.VITE_GEOSERVER_API_URL || 'http://localhost:8080/geoserver';

const camelRegex = /([A-Z])/g;
const firstCharRegex = /^./;
function capitalizeCamel(str) {
    console.log(`Capitalizando ${str}`);
    return str.replace(camelRegex, ' $1').replace(firstCharRegex, c => c.toUpperCase());
}


export { VITE_BUILDINGS_API_URL, VITE_MUNICIPALITIES_API_URL, VITE_REPORT_API_URL, VITE_GEOSERVER_API_URL, capitalizeCamel }

