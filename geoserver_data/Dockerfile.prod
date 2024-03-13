# Usar una imagen oficial de GeoServer como base
FROM kartoza/geoserver:latest

# La estructura de directorios de interés es la siguiente
# geoserver_data/
# ├── Dockerfile (este archivo)
# ├── data/
# │   └── municipalities/
# └── workspaces/
#     └── moderate_municipios/

# Copiar el directorio moderate_municipios dentro de workspaces a la imagen
COPY ./workspaces/moderate_municipios /opt/geoserver/data_dir/workspaces/

# Copiar el subdirectorio municipalities dentro de data a la imagen
COPY ./data/municipalities /opt/geoserver/data_dir/data/
