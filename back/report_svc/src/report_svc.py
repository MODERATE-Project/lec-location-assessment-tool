from flask import Flask, jsonify, request, make_response, send_file
from flask_cors import CORS
import docx
from docx.shared import Inches
import requests
import os

import fields.field_manager as field_manager
import logging

logging.basicConfig(
    level=logging.INFO,
    # Formato del mensaje
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',  # Formato de la fecha
    handlers=[
        logging.StreamHandler()  # Enviar los logs a la consola (stdout)
    ]
)

log = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

BASE_DIR = '/report_svc/data'
REPORT_FILE = os.getenv("REPORT_FILE", 'report_template.docx')


# buildings = get_buildings_data()

# @app.route('/buildings/old', methods=['GET'])
# def get_buildings():
#     municipio = request.args.get('municipio', None)  # Obtiene el parámetro municipio; si no está presente, retorna None
#     # coords = request.json.get('coordinates', [])

#     filtered_buildings = [building for building in buildings if building['Municipios'] == municipio]
#     return jsonify({"buildings": filtered_buildings})

def replace_text_in_paragraphs(paragraphs, data):
    """Helper function to replace placeholders in regular paragraphs"""

    for paragraph in paragraphs:
        for key, value in data.items():
            key_pattern = f"${{{key}}}"
            
            if key_pattern in paragraph.text:
                
                if "IMG" in key or "PLOT" in key:

                    # Clear the placeholder text
                    paragraph.text = ""

                    # Add the plot image to this paragraph
                    run = paragraph.add_run()

                    log.info(f"embbeding img_file: {value}")
                    try:
                        with open(os.path.join(BASE_DIR, value), 'rb') as image_stream:
                            run.add_picture(image_stream, width=Inches(5.0))
                    except FileNotFoundError:
                        print(f"Error: No se pudo encontrar el archivo de imagen {value}")

                else:
                    # paragraph.text = paragraph.text.replace(key_pattern, value) # FIXME: This is the correct final way
                    paragraph.text = paragraph.text.replace(key, str(value))  # FIXME: This is used for testing



def replace_text_in_headers_footers(sections, data):
    """Helper function to replace placeholders in headers and footers"""
    for section in sections:
        header = section.header
        footer = section.footer

        replace_text_in_paragraphs(header.paragraphs, data)
        replace_text_in_paragraphs(footer.paragraphs, data)


@app.route('/report', methods=['POST'])
def get_report():

    data = request.json

    # data = { '${MUNICIPALITY_TITLE}':'CREVILLENT',
    #         '${MUNICIPALITY}': 'Crevillent',
    #         '${NUM_BUILDINGS}': '12',
    #         '${PCT_1} ': '69',
    #         '${PCT_4} ': '13',
    #         '${PCT_5} ': '10',
    #         '${PCT_6} ': '8' # NOTE: si pones el int en vez de string peta, para probar lo que pasa si el servicio de docx to pdf falla
    #         }

    print('aqui van los datos', data)

    municipality = data.get("MUNICIPALITY").capitalize()

    municipality_parameters = field_manager.get_and_compute_as_needed(
        municipality=municipality, field_dict=data, base_dir=BASE_DIR)

    doc_path = os.path.join(BASE_DIR, REPORT_FILE)
    report_filled_path = os.path.join(BASE_DIR, 'generated_report.docx')
    pdf_path = os.path.join(BASE_DIR, 'generated_report.pdf')

    # convert_file(doc_path, 'pdf', outputfile=pdf_path)
    # convert_odt_to_pdf(doc_path, pdf_path)

    # Load DOCX template
    doc = docx.Document(doc_path)

    replace_text_in_paragraphs(doc.paragraphs, municipality_parameters)

    # Replace placeholders in headers and footers
    replace_text_in_headers_footers(doc.sections, municipality_parameters)

    doc.save(report_filled_path)

    # document = Document()
#
    # Load a doc or docx file
    # document.LoadFromFile(report_filled_path)

    # Save the document to PDF
    # document.SaveToFile(pdf_path, FileFormat.PDF)
    # document.Close()

    # Abre el archivo en modo binario
    with open(report_filled_path, 'rb') as file:
        files = {'document': file}

        # Realiza la solicitud POST al contenedor 'docx-to-pdf'
        response = requests.post("http://docx-to-pdf:8080/pdf", files=files)

        if response.ok:

            with open(pdf_path, 'wb') as result_file:
                result_file.write(response.content)

            return send_file(pdf_path, as_attachment=True, download_name=f"report_{data['MUNICIPALITY']}.pdf", mimetype='application/pdf')

        return f"Error in processing: {response.status_code}", 500

    # return send_file(report_filled_path, as_attachment=True)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=6000)
