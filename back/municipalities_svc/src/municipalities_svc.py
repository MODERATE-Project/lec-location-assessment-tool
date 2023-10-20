from flask import Flask, jsonify, request
from flask_cors import CORS
from municipalities_data_management import get_municipalities_data, get_municipalities_with_data

from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

municipalities = get_municipalities_data()


@app.route('/municipalities', methods=['GET'])
def get_municipalities():

    data_param = request.args.get('withData')

    if data_param == 'true':
        municipalities_with_data = get_municipalities_with_data()
        return jsonify({"municipalities": municipalities_with_data})

    return jsonify({"municipalities": municipalities})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)