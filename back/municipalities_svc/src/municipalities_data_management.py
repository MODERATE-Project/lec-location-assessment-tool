import pandas as pd


def get_municipalities_data():
    municipalities_df = pd.read_csv('/municipalities_svc/data/municipalities.csv', header=0)
    municipalities_df['id'] = municipalities_df.index
    municipalities_json = municipalities_df.to_dict(orient='records')
    return municipalities_json
