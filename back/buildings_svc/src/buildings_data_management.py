import pandas as pd
import os


def get_buildings_data():
    current_directory = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_directory, '../data/buildings_sections.csv')

    buildings_df = pd.read_csv(file_path, header=0)
    buildings_df['id'] = buildings_df.index
    sorted_by_mean_df = buildings_df.sort_values(by='MEAN', ascending=False)
    sorted_by_mean_df = sorted_by_mean_df.head(20)
    buildings_json = sorted_by_mean_df.to_dict(orient='records')
    return buildings_json
