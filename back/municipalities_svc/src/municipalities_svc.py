from flask import Flask, jsonify
from flask_cors import CORS
from municipalities_data_management import get_municipalities_data

app = Flask(__name__)
CORS(app)

municipalities = get_municipalities_data()


@app.route('/municipalities', methods=['GET'])
def get_municipalities():
    return jsonify({"municipalities": municipalities})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
