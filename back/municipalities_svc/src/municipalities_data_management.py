from functools import lru_cache

import pandas as pd
import os


@lru_cache(maxsize=None)
def get_municipalities_df():
    current_directory = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_directory, '../data/municipalities.csv')
    municipalities_df = pd.read_csv(file_path, header=0)
    return municipalities_df


def get_municipalities_data():

    municipalities_df = get_municipalities_df()
    municipalities_df['id'] = municipalities_df.index
    municipalities_json = municipalities_df.to_dict(orient='records')
    return municipalities_json


def get_municipalities_with_data():
    current_directory = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_directory, '../data/municipalities_with_data.csv')
    municipalities_df = pd.read_csv(file_path, header=0)

    return municipalities_df.to_dict(orient='records')

