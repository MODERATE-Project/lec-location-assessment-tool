from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from buildings_data_management import *
import json

app = Flask(__name__)
CORS(app)

buildings_df = get_buildings_dataframe()
# buildings = get_buildings_data()

# @app.route('/buildings/old', methods=['GET'])
# def get_buildings():
#     municipio = request.args.get('municipio', None)  # Obtiene el parámetro municipio; si no está presente, retorna None
#     # coords = request.json.get('coordinates', [])

#     filtered_buildings = [building for building in buildings if building['Municipios'] == municipio]
#     return jsonify({"buildings": filtered_buildings})

@app.route('/buildings', methods=['GET'])
def get_buildings():
    municipio = request.args.get('municipio', None)  # Obtiene el parámetro municipio; si no está presente, retorna None
    filtered = request.args.get('filtered', True)

    filtered_buildings = get_buildings_sorted_by_mean(buildings_df[ buildings_df['Municipios'] == municipio ])
    
    res = make_response(jsonify({"buildings": dataframe_to_json(filtered_buildings, filtered=filtered)}))
    res.headers['Content-Type'] = 'application/json; charset=utf-8'

    return res


@app.route('/buildings/weighted-sort', methods=['GET'])
def get_buildings_weighted_sort():
    municipio = request.args.get('municipio', None)
    weights_json = request.args.get('weights', None)

    if weights_json is not None:
        try:      

            weights = json.loads(weights_json)
            weights = {key: float(value) for key, value in weights.items()}
            sorted_buildings = get_buildings_sorted_by_weights(buildings_df[ buildings_df['Municipios'] == municipio ], weights)

            sorted_buildings = dataframe_to_json(sorted_buildings)

        except json.JSONDecodeError as e:
            print(e)
            return jsonify({"error": "Invalid JSON format for weights"}), 400
    else:
        sorted_buildings = None
    
    
    return jsonify({"buildings": sorted_buildings})



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=6000)
