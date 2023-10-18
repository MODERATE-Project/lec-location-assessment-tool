import pandas as pd
import os


def get_municipalities_data():

    current_directory = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_directory, '../data/municipalities.csv')
    municipalities_df = pd.read_csv(file_path, header=0)

    municipalities_df['id'] = municipalities_df.index
    municipalities_json = municipalities_df.to_dict(orient='records')
    return municipalities_json
