# Ejemplo de funciones de cálculo personalizadas
# def compute_NOMBRE_PARAMETRO():
#     return VALUE

from time import sleep
import requests
from os import getenv, path
import pandas as pd
import logging
import matplotlib.pyplot as plt
import io
import numpy as np


log = logging.getLogger(__name__)
data = None

BASE_DIR = '/report_svc/data'
BUILDINGS_API_URL = getenv(
    'BUILDINGS_API_URL', 'http://buildings_service:5000/buildings')


def _get_data(municipality):
    try:
        url = f'http://{BUILDINGS_API_URL}?municipio={municipality}'
        response = requests.get(url)
        # Lanza una excepción si la respuesta tiene un código de error HTTP
        response.raise_for_status()
        data_json = response.json()  # Asumimos que la respuesta es un JSON
        data_df = pd.json_normalize(data_json['buildings'])
        return data_df
    except requests.exceptions.RequestException as e:
        log.error(f"Error al hacer la petición GET: {e}")
        return None


def _from_data(municipality):
    global data

    if data is None:
        data_df = _get_data(municipality)
        data = data_df
        return data_df
    else:
        return data


def compute_PCT_1(_):
    return 69


def compute_PCT_4(_):
    return 13


def compute_PCT_5(_):
    return 10


def compute_PCT_6(_):
    return 8


def compute_PARAMETRO_3(_):
    sleep(3)
    return 3


def compute_NUM_BUILDINGS(args):
    log.info(f'args: {args}')
    municipality = args[0]
    data = _from_data(municipality)
    return str(len(data))


def compute_SURFACE(args):
    municipality = args[0]
    data = _from_data(municipality)
    return sum(data['AREA']) / 1_000_000  # pasar a km2


def compute_IMG_PARCELAS(args):
    municipality = args[0]
    return f'{municipality}_IMG1.png'


def compute_PLOT(args):
    municipality = args[0]
    yaml_data = args[1]

    percentages = [yaml_data['PCT_1'], yaml_data['PCT_4'],
                   yaml_data['PCT_5'], yaml_data['PCT_6']] \
        if all(key in yaml_data for key in ['PCT_1', 'PCT_4', 'PCT_5', 'PCT_6']) \
        else [compute_PCT_1(args), compute_PCT_4(args), compute_PCT_5(args), compute_PCT_6(args)]

    log.info(f'percentages: {percentages}')
    labels = ['Residencial', 'Industrial', 'Comercial', 'Servicios Públicos']
    colors = ['#4f81bd', '#c0504d', '#9e9e9e',
              '#f9d02e']  # Colores personalizados
    explode = (0, 0, 0, 0)  # No separar ninguna porción del pastel

    fig, ax = plt.subplots()
    ax.pie(percentages, labels=labels, autopct='%1.0f%%',
           colors=colors, explode=explode, startangle=90)

    ax.set_title('Área de tejado por uso')

    ax.legend(labels, loc='lower left')

    image_path = f"{municipality}_plot.png"

    # Guardar el gráfico como imagen
    plt.savefig(path.join(BASE_DIR, image_path), format='png')

    # Cerrar la figura para liberar memoria
    plt.close(fig)

    return image_path


def compute_NTOTAL_PARCELAS(args):
    municipality = args[0]
    data = _from_data(municipality)

    value = np.count_nonzero(data['pannels'])
    log.info(f'value: {value}')
    return int(value)


def compute_N_PARCELAS_NO_ADECUADAS(args):
    municipality = args[0]
    data = _get_data(f'{municipality}&filtered=False')

    value = len(data['MEAN'] == 0)
    log.info(f'value: {value}')
    return int(value)


def compute_N_PARCELAS_ADECUADAS(args):
    municipality = args[0]
    data = _from_data(municipality)

    value = len(data['MEAN'] > 0)
    log.info(f'value: {value}')
    return int(value)


def compute_TOTAL_PANELES(args):
    municipality = args[0]
    data = _from_data(municipality)

    value = np.sum(data['pannels'])
    log.info(f'value: {value}')
    return int(value)
