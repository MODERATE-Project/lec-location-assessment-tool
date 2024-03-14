# lec-location-assessment-tool

## Requisites
Para desplegar la herramienta es necesario instalar Docker engine y Docker compose: https://docs.docker.com/engine/install/

## Desplegar la herramienta
1. Clonar este repositorio
```bash
git clone https://github.com/MODERATE-Project/lec-location-assessment-tool.git
```
2. Entrar al directorio clonado
```bash
cd .\lec-location-assessment-tool\
```
3. Construir la imagen de docker
```bash
docker compose -f docker-compose.prod.yaml build --no-cache
```
4. Instalar los contenedores para ejecutar la herramienta
```bash
docker compose -f docker-compose.prod.yaml up
```

## Ejecutar la herramienta
Abrir el navegador con el enlace siguiente: http://localhost

## Contenedores desplegados
En el sistema existirán cuatro contenedores desplegados, como se puede ver en el fichero docker compose de este repositorio. Éstos son:
- Microservicio para ofrecer datos de edificios mediante una API. Ejemplo: 
  - Para obtener los datos de todos los edificios del municipio de Crevillent se puede hacer una petición GET al endpoint http://127.0.0.1:5001/buildings?municipio=Crevillent
- Microservicio para obtener datos de municipios. Ejemplo:
  - Para obtener los nombres de los municipios de España se puede hacer una petición GET al endpoint http://localhost:5000/municipalities
- Geoserver para publicar datos geoespaciales en formatos vectoriales. Ubicado en http://localhost:8080/geoserver
- Aplicación React para acceder a información del catastro y socioestadística vinculada con los edificios de un municipio. Ubicada en http://localhost


## Screenshots
### Selección de un municipio
![Municipality selection](./images/lec_crevillent_search_box.jpg)

### Selección de un edificio
![Building selection](./images/lec_crevillent_selected_building.jpg)

### Datos catastrales del edificio
![Cadaster data for a building](./images/electronic_cadaster_info.jpg)


## Parar la herramienta
```bash
docker-compose -f docker-compose.prod.yaml down
```
