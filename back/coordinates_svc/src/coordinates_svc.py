from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/coordinates/<source_projection>/to/<target_projection>', methods=['POST'])
def convert_coordinates(source_projection, target_projection):
    # Obtener las coordenadas del cuerpo de la solicitud POST
    data = request.get_json()
    x = data.get('x')
    y = data.get('y')

    response_data = {
        'originalProjection': source_projection,
        'targetProjection': target_projection,
        'originalCoordinates': {'x': x, 'y': y},
        'convertedCoordinates': {'x': x, 'y': y}
    }

    return jsonify(response_data)


if __name__ == '__main__':
    app.run(debug=True)
