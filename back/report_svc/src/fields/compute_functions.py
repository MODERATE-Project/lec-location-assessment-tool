# Ejemplo de funciones de cálculo personalizadas
# def compute_NOMBRE_PARAMETRO():
#     return VALUE

from time import sleep
import requests
from os import getenv, path
import pandas as pd
import logging
import matplotlib.pyplot as plt
from matplotlib.ticker import FuncFormatter
import seaborn as sns
import io
import numpy as np
import json


log = logging.getLogger(__name__)
data = None

BASE_DIR = '/report_svc/data'
BUILDINGS_API_URL = getenv(
    'BUILDINGS_API_URL', 'http://buildings_service:5000/buildings')

sns.set_theme(font_scale=1.2, context='talk', style='whitegrid')

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


def _from_data(municipality, fields_dict):
    global data

    if fields_dict['isAreaSelected']:
        return pd.json_normalize(fields_dict['selectedBuildings'])
    else:
        if data is None:
            data_df = _get_data(municipality)
            data = data_df
            return data_df
        else:
            return data

def compute_MUNICIPALITY(args):
    return args[0]

def compute_MUNICIPALITY_TITLE(args):
    return args[0].upper()


def compute_PCT_1(args):
    municipality = args[0]
    df = _from_data(municipality, args[2])
    df['currentUse_normalized'] = df['currentUse'].str.replace(r'\s+', '', regex=True).str.lower()

    total = len(df[df['currentUse_normalized'].isin(['residential', 'industrial', 'publicservices', 'retail', 'agriculture', 'office'])])
    log.info(f"total: {total}")
    percentage = len(df[df['currentUse_normalized'].str.strip().str.lower() == 'residential']) / total * 100
    return f"{percentage:.2f}"

def compute_PCT_2(args):
    municipality = args[0]
    df = _from_data(municipality, args[2])
    df['currentUse_normalized'] = df['currentUse'].str.replace(r'\s+', '', regex=True).str.lower()

    total = len(df[df['currentUse_normalized'].isin(['residential', 'industrial', 'publicservices', 'retail', 'agriculture', 'office'])])
    percentage = len(df[df['currentUse_normalized'] == 'industrial']) / total * 100
    return f"{percentage:.2f}"

def compute_PCT_3(args):
    municipality = args[0]
    df = _from_data(municipality, args[2])
    df['currentUse_normalized'] = df['currentUse'].str.replace(r'\s+', '', regex=True).str.lower()

    total = len(df[df['currentUse_normalized'].isin(['residential', 'industrial', 'publicservices', 'retail', 'agriculture', 'office'])])
    percentage = len(df[df['currentUse_normalized'] == 'agriculture']) / total * 100
    return f"{percentage:.2f}"

def compute_PCT_4(args):
    municipality = args[0]
    df = _from_data(municipality, args[2])
    df['currentUse_normalized'] = df['currentUse'].str.replace(r'\s+', '', regex=True).str.lower()

    total = len(df[df['currentUse_normalized'].isin(['residential', 'industrial', 'publicservices', 'retail', 'agriculture', 'office'])])
    pct_industrial = len(df[df['currentUse_normalized'].isin(['industrial', 'agriculture'])]) / total * 100
    
    return f"{pct_industrial:.2f}"


def compute_PCT_5(args):
    municipality = args[0]
    df = _from_data(municipality, args[2])
    df['currentUse_normalized'] = df['currentUse'].str.replace(r'\s+', '', regex=True).str.lower()

    total = len(df[df['currentUse_normalized'].isin(['residential', 'industrial', 'publicservices', 'retail', 'agriculture', 'office'])])
    percentage = len(df[df['currentUse_normalized'].isin(['retail', 'office'])]) / total * 100
    return f"{percentage:.2f}"



def compute_PCT_6(args):
    municipality = args[0]
    df = _from_data(municipality, args[2])
    df['currentUse_normalized'] = df['currentUse'].str.replace(r'\s+', '', regex=True).str.lower()

    total = len(df[df['currentUse_normalized'].isin(['residential', 'industrial', 'publicservices', 'retail', 'agriculture', 'office'])])
    percentage = len(df[df['currentUse_normalized'] == 'publicservices']) / total * 100
    return f"{percentage:.2f}"


def compute_PARAMETRO_3(_):
    sleep(3)
    return 3


def compute_NUM_BUILDINGS(args):
    # log.info(f'args: {args}')
    # municipality = args[0]
    # data = _from_data(municipality)
    # data = _get_data(f'{municipality}&filtered=false')
    # return len(data)
    # return args[2]['NUM_BUILDINGS']
    municipality = args[0]
    data = _get_data(f'{municipality}&filtered=false')

    value = len(data)
    log.info(f'value: {value}')
    return int(value)




def compute_SURFACE(args):
    municipality = args[0]
    data = _from_data(municipality, args[2])
    
    total = data['AREA'].sum() / 1_000_000

    if total == 0:
        return "0.00"
    max_decimales = 10
    for decimales in range(2, max_decimales + 1):
        formato = f".{decimales}f"
        valor = format(total, formato)
        partes = valor.split(".")
        if partes[1] != "0" * decimales:
            return valor
    return format(total, ".2f")


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
    labels = ['Residencial', 'Industrial', 'Comercial', 'Public services']
    colors = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000']

    # Configurar el estilo de seaborn
    # sns.set_style("whitegrid")
    
    # Crear la figura
    fig = plt.figure(figsize=(10, 8))

    # Create pie chart
    plt.pie(percentages,
            labels=labels,
            colors=colors,
            autopct='%1.0f%%',
            pctdistance=0.85,
            labeldistance=1.1,
            startangle=90,
            counterclock=False)

    # Add title
    plt.title('Área de tejado por uso')

    # Equal aspect ratio ensures that pie is drawn as a circle
    plt.axis('equal')

    # Add legend
    plt.legend(labels, loc='lower center', 
            ncol=len(labels), frameon=False)

    # Ajustar el layout
    plt.tight_layout()
    
    image_path = f"{municipality}_plot.png"
    plt.savefig(path.join(BASE_DIR, image_path),
                format='png',
                bbox_inches='tight',
                dpi=300)
    plt.close(fig)
    
    return image_path


def compute_NTOTAL_PARCELAS(args):
    # municipality = args[0]
    # data = _from_data(municipality)

    # value = len(data[data.MEAN > 0])
    # log.info(f'value: {value}')
    # return int(value)
    return compute_NUM_BUILDINGS(args)

def compute_N_PARCELAS_NO_ADECUADAS(args):
    municipality = args[0]
    data = _get_data(f'{municipality}&filtered=false')

    value = len(data[data['MEAN'] == 0])
    log.info(f'value: {value}')
    return int(value)


def compute_N_PARCELAS_ADECUADAS(args):
    municipality = args[0]
    data = _from_data(municipality, args[2])

    value = len(data[data.MEAN > 0])
    log.info(f'value: {value}')
    return int(value)


def compute_TOTAL_PANELES(args):
    municipality = args[0]
    data = _from_data(municipality, args[2])

    value = np.sum(data['panels'])
    log.info(f'value: {value}')
    return int(value)

def compute_PCT_7(args):

    # total = float(args[1]['NTOTAL_PARCELAS']) if 'NTOTAL_PARCELAS' in args[1] else compute_NTOTAL_PARCELAS(args)
    total = float(args[1]['NUM_BUILDINGS']) if 'NUM_BUILDINGS' in args[1] else compute_NUM_BUILDINGS(args)
    adecuadas = float(args[1]['N_PARCELAS_ADECUADAS']) if 'N_PARCELAS_ADECUADAS' in args[1] else compute_N_PARCELAS_ADECUADAS(args)
        
    return "{:.2f}".format(adecuadas/total * 100)


def compute_PLOT_APPROPIATE_ROOF_AREA(args):
    municipality = args[0]
    df = _from_data(municipality, args[2])

    df_grouped = df.groupby('currentUse').agg(
        area_total=('AREA', 'sum'),
    ).reset_index().sort_values(by='area_total', ascending=False)

    df_grouped['currentUse'] = df_grouped['currentUse'].replace('public Services', 'public services')

    plt.subplots(figsize=(10, 7))
    ax = sns.barplot(df_grouped, x='currentUse', y='area_total', hue='currentUse')

    ax.set_ylabel('Totala area (m²)')
    ax.set_title('Appropriate roof area')

    ax.ticklabel_format(axis='y', style='plain')
    # ax.tick_params(axis='x', rotation=45)
    plt.xticks(rotation=45, ha='right')
    
    plt.tight_layout()

    image_path = f"{municipality}_PLOT_APPROPIATE_ROOF_AREA.png"
    plt.savefig(path.join(BASE_DIR, image_path), format='png')

    plt.close()
    return image_path


def compute_PLOT_DISTRIB_AREAS_POR_USO(args):
    municipality = args[0]
    df = _from_data(municipality, args[2])
    
    data = []
    area_ranges = [(0, 100), (100, 300), (300, 800), (800, float('inf'))]
    for min_area, max_area in area_ranges:
        label = f'{min_area}-{max_area} m²' if max_area != float('inf') else f'>{min_area} m²'
        for use_type in df['currentUse'].unique():
            mask = (df['currentUse'] == use_type) & (df['AREA'] >= min_area) & (df['AREA'] < max_area)
            suitable_count = mask.sum()
            total_count = len(df[df['currentUse'] == use_type])
            percentage = suitable_count / total_count * 100 if total_count > 0 else 0
            data.append({'currentUse': use_type, 'Area Range': label, 'Percentage': percentage})
    df_plot = pd.DataFrame(data)

    fig, ax = plt.subplots(figsize=(15, 10)) 
    sns.barplot(data=df_plot, x='Area Range', y='Percentage', hue='currentUse', ax=ax)

    ax.set_xlabel(None)
    ax.set_ylabel(None)
    ax.set_title('Surface of suitable roofs')
    ax.set_ylabel(None)
    ax.set_xlabel(None)
    ax.set_title('Surface of suitable roofs')

    plt.tight_layout()
    formatter = FuncFormatter(lambda x, pos: f'{x:.0f}%') 
    ax.yaxis.set_major_formatter(formatter)
    
    sns.move_legend(
        ax, "lower center",
        bbox_to_anchor=(.5, -0.4), ncol=3, title=None, frameon=False,
    )

    fig.subplots_adjust(bottom=0.25) 

    image_path = f"{municipality}_PLOT_DISTRIB_AREAS_POR_USO.png"
    plt.savefig(path.join(BASE_DIR, image_path), format='png')

    plt.close()
    return image_path

def compute_RADIACION_SOLAR(args):
    municipality = args[0]
    data = _from_data(municipality, args[2])

    mean_value = data['MEAN'].mean()
    return f"{mean_value:.2f}"

def compute_MIN_MEDIA_RS(args):
    municipality = args[0]
    data = _from_data(municipality, args[2])

    mean_value = data['MEAN'].min()
    return f"{mean_value:.2f}"

def compute_MAX_MEDIA_RS(args):
    municipality = args[0]
    data = _from_data(municipality, args[2])

    mean_value = data['MEAN'].max()
    return f"{mean_value:.2f}"


def compute_SORTING_CRITERIA_LIST(args):
    front_args = args[2]
    criterios = front_args.get("SORTING_CRITERIA_LIST", {})
    # claves_ordenadas = sorted(criterios.keys(), key=lambda clave: criterios[clave])
    # Start Generation Here
    # log.debug(f"claves_ordenadas: {claves_ordenadas}")

    # lineas = [f"{idx}.\t{clave}" for idx, clave in enumerate(claves_ordenadas, start=1)]

    # return '\n'.join(lineas)
    return criterios

def compute_TOTAL_PANELES(args):
    municipality = args[0]
    front_args = args[2]
    data = _from_data(municipality, front_args)

    return str(data['panels'].sum())


def compute_BUILDINGS_TABLE(args):
    municipality = args[0]
    front_args = args[2]
    df = _from_data(municipality, front_args).head(n=10)

    # Seleccionar y renombrar las columnas que queremos mostrar
    df_display = df[["reference", "currentUse", "AREA", "MEAN", "production", "Porcentaje_poblacion", "Renta_media"]].copy()
    
    # Traducir los tipos de uso al español
    # uso_map = {
    #     'residential': 'Residential',
    #     'industrial': 'Industrial',
    #     'publicServices': 'Public services',
    #     'retail': 'Retail',
    #     'agriculture': 'Agriculture',
    #     'office': 'Office'
    # }
    # df_display['currentUse'] = df_display['currentUse'].str.lower().map(uso_map)

    # Formatear los números
    col_numeric = ['AREA', 'MEAN', 'production', 'Renta_media']
    df_display[col_numeric] = df_display[col_numeric].round(2)
    
    # Renombrar las columnas para mejor presentación
    df_display.columns = "CADASTRAL ID", "Current Use", "SUITABLE AREA (m2)", "Mean Solar Radiation (kWh/m²/year)", "Energy Production Potential (MWh/year)", "Population density percentage", "Average Income (€)"


    # Crear la estructura de la tabla
    table_data = {
        'table': {
            'headers': df_display.columns.tolist(),
            'rows': df_display.values.tolist()
        }
    }

    return table_data


def compute_PLOT_DISTRIB_MEAN_SOLAR(args):
    municipality = args[0]
    df = _from_data(municipality, args[2])

    mean_value = df['MEAN'].mean()

    # Crear figura
    fig, ax = plt.subplots(figsize=(12, 6))

    # Histograma
    sns.histplot(df['MEAN'], kde=False, bins=50, color='skyblue', ax=ax)

    # Línea vertical en la media
    ax.axvline(mean_value, color='blue', linewidth=2)

    # Etiquetas y título
    ax.set_title("Distribución de la radiación solar media", fontsize=14)
    ax.set_xlabel(None)
    ax.set_ylabel("Recuento")

    # Mejorar layout
    plt.tight_layout()

    # Guardar imagen
    image_path = f"{municipality}_PLOT_DISTRIB_MEAN_SOLAR.png"
    plt.savefig(path.join(BASE_DIR, image_path), format='png')
    plt.close()

    return image_path

def compute_POTENCIAL_PRODUCCION(args):
    municipality = args[0]
    df = _from_data(municipality, args[2])
    total = df['production'].sum()
    return f"{total:.2f}"
    

def compute_CAPACIDAD(args):
    municipality = args[0]
    df = _from_data(municipality, args[2])
    total = df['capacity_MWp'].sum()
    return f"{total:.2f}"


def compute_PLOT_RADIACION_POR_USO(args):
    municipality = args[0]
    df = _from_data(municipality, args[2])
    df['currentUse_normalized'] = df['currentUse'].str.replace(r'\s+', '', regex=True).str.lower()

    # df_grouped = df.groupby('currentUse_normalized').agg(
    #     mean_radiation=('MEAN', 'mean'),
    #     total_area=('AREA', 'sum')
    # ).reset_index()

    df['currentUse_normalized'] = df['currentUse_normalized'].replace('publicservices', 'public services')
    df_grouped = df.groupby('currentUse_normalized')['MEAN'].mean()

    plt.figure(figsize=(10, 7))
    df_grouped.plot(kind='bar', color='royalblue')

    # Añadir título y etiquetas
    plt.title('Radiación solar según uso de parcelas', fontsize=18)
    plt.ylabel('Radiación solar media', fontsize=18)
    plt.xlabel('')
    plt.xticks(rotation=45, ha='right', fontsize=18)


    plt.tight_layout()

    # Guardar imagen
    image_path = f"{municipality}_PLOT_RADIACION_POR_USO.png"
    plt.savefig(path.join(BASE_DIR, image_path), format='png')
    plt.close()

    return image_path



def compute_PLOT_POTENCIAL_POR_USO(args):
    pass