from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# buildings = get_buildings_data()

# @app.route('/buildings/old', methods=['GET'])
# def get_buildings():
#     municipio = request.args.get('municipio', None)  # Obtiene el parámetro municipio; si no está presente, retorna None
#     # coords = request.json.get('coordinates', [])

#     filtered_buildings = [building for building in buildings if building['Municipios'] == municipio]
#     return jsonify({"buildings": filtered_buildings})

@app.route('/report', methods=['GET'])
def get_buildings():
    # municipio = request.args.get('municipio', None)  # Obtiene el parámetro municipio; si no está presente, retorna None

    # filtered_buildings = get_buildings_sorted_by_mean(buildings_df[ buildings_df['Municipios'] == municipio ])
    
    # res = make_response(jsonify({"buildings": dataframe_to_json(filtered_buildings)}))
    # res.headers['Content-Type'] = 'application/json; charset=utf-8'

    return "Hola report"


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=6000)
