# lec-location-assessment-tool

## Requirements
To deploy the tool, it is necessary to install Docker engine and Docker compose: https://docs.docker.com/engine/install/

## Deploying the tool
1. Clone this repository
```bash
git clone https://github.com/MODERATE-Project/lec-location-assessment-tool.git
```
2. Enter the cloned directory
```bash
cd .\lec-location-assessment-tool\
```
3. Build the docker image
```bash
docker compose -f docker-compose.prod.yaml build --no-cache
```
4. Install containers to run the tool
```bash
docker compose -f docker-compose.prod.yaml up
```

## Running the tool
Open the browser with the following link: http://localhost

## Contenedores desplegados
There will be four containers deployed in the system, as can be seen in the docker compose file of this repository. These are:
- Microservice to offer building data through an API. Example: 
  - To get the data of all buildings in the municipality of Crevillent, you can make a GET request to the endpoint http://127.0.0.1:5001/buildings?municipio=Crevillent
- Microservice to obtain municipality data. Example:
  - To get the names of municipalities in Spain, you can make a GET request to the endpoint http://localhost:5000/municipalities
- Geoserver to publish geospatial data in vector formats. Located at http://localhost:8080/geoserver
- React application to access cadastral and socio-statistical information linked with the buildings of a municipality. Located at http://localhost


## Screenshots
### Selecting a municipality
![Municipality selection](./images/lec_crevillent_search_box.jpg)

### Selecting a building
![Building selection](./images/lec_crevillent_selected_building.jpg)

### Cadaster data for the building
![Cadaster data for a building](./images/electronic_cadaster_info.jpg)


## Stopping the tool
```bash
docker-compose -f docker-compose.prod.yaml down
```
