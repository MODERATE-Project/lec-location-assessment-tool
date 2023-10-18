from flask import Flask, jsonify
from flask_cors import CORS

from buildings_data_management import get_buildings_data

app = Flask(__name__)
CORS(app)

buildings = get_buildings_data()


@app.route('/buildings', methods=['POST'])
def get_buildings():

    # coords = request.json.get('coordinates', [])
    return jsonify({"buildings": buildings})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=6000)
