import pandas as pd
import os


def get_buildings_data():
    current_directory = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(
        current_directory, '../data/buildings_sections.csv')

    buildings_df = pd.read_csv(file_path, header=0)
    buildings_df['id'] = buildings_df.index
    sorted_by_mean_df = buildings_df.sort_values(by='MEAN', ascending=False)
    sorted_by_mean_df = sorted_by_mean_df.head(20)
    buildings_json = sorted_by_mean_df.to_dict(orient='records')
    return buildings_json


def get_buildings_dataframe():
    current_directory = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(
        current_directory, '../data/buildings_epsg4326_with_pannels.csv')

    buildings_df = pd.read_csv(file_path, header=0)
    buildings_df['id'] = buildings_df.index

    return buildings_df


def get_buildings_sorted_by_weights(buildings_df, weights: dict):
    if not weights:
        raise RuntimeError('No weights provided')

    weighted_score = sum(
        buildings_df[col] * weights[col]/10 for col in weights.keys())  # /10 --> pesos ∈ [0,1]
    buildings_df['Weighted_Score'] = weighted_score

    # Sort DataFrame by weighted score in descending order
    return buildings_df.sort_values(by='Weighted_Score', ascending=False)


def get_buildings_sorted_by_mean(buildings_df: pd.DataFrame):
    sorted_by_mean_df = buildings_df.sort_values(by='MEAN', ascending=False)
    return sorted_by_mean_df


def dataframe_to_json(buildings_df: pd.DataFrame, max=20, filtered=True):

    # filtered_df = buildings_df.head(max) # removing filtering
    if filtered: filtered_df = buildings_df[buildings_df['MEAN'] > 0]
    else: filtered_df = buildings_df
    filtered_df = filtered_df.applymap(lambda x: "undefined" if pd.isna(x) else x)
    return filtered_df.to_dict(orient='records')
