from flask import Flask, jsonify, request
from flask_cors import CORS
from buildings_data_management import get_buildings_data

app = Flask(__name__)
CORS(app)

buildings = get_buildings_data()


@app.route('/buildings', methods=['GET'])
def get_buildings():
    municipio = request.args.get('municipio', None)  # Obtiene el parámetro municipio; si no está presente, retorna None
    # coords = request.json.get('coordinates', [])

    print(municipio)
    filtered_buildings = [building for building in buildings if building['Municipios'] == municipio]
    print(filtered_buildings)
    return jsonify({"buildings": filtered_buildings})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6000)
