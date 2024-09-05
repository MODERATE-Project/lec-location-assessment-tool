from flask import Flask, jsonify, request, make_response, send_file
from flask_cors import CORS
from spire.doc import *
from spire.doc.common import *
import docx
from docx.shared import Inches
import io
import matplotlib.pyplot as plt


app = Flask(__name__)
CORS(app)

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
            if key in paragraph.text:
                paragraph.text = paragraph.text.replace(key, value)
        
        if "{{plot}}" in paragraph.text:
            # Clear the placeholder text
            paragraph.text = ""
            # Add the plot image to this paragraph
            run = paragraph.add_run()

            fig, ax = plt.subplots()
            ax.plot([1, 2, 3, 4], [1, 4, 2, 3])
            ax.set_title('Sample Plot')

            # Save plot as image and insert into DOCX
            image_stream = io.BytesIO()
            plt.savefig(image_stream, format='png')
            image_stream.seek(0)


            run.add_picture(image_stream, width=Inches(4.0))


def replace_text_in_headers_footers(sections, data):
    """Helper function to replace placeholders in headers and footers"""
    for section in sections:
        header = section.header
        footer = section.footer

        replace_text_in_paragraphs(header.paragraphs, data)
        replace_text_in_paragraphs(footer.paragraphs, data)




@app.route('/report', methods=['GET'])
def get_report():

    data = { '${MUNICIPALITY_TITLE}':'CREVILLENT', 
            '${MUNICIPALITY}': 'Crevillent', 
            '${NUM_BUILDINGS}': '12',
            '${PCT_1} ': '69',
            '${PCT_4} ': '13',
            '${PCT_5} ': '10',
            '${PCT_6} ': '8' # NOTE: si pones el int en vez de string peta, para probar lo que pasa si el servicio de docx to pdf falla
            }



    doc_path = '../data/report_template.docx'
    report_filled_path = '../data/generated_report.docx'
    pdf_path = '../data/generated_report.pdf'
    # convert_file(doc_path, 'pdf', outputfile=pdf_path)

    # convert_odt_to_pdf(doc_path, pdf_path)

    # Load DOCX template
    doc = docx.Document(doc_path)

    replace_text_in_paragraphs(doc.paragraphs, data)

    # Replace placeholders in headers and footers
    replace_text_in_headers_footers(doc.sections, data)

   
    doc.save(report_filled_path)

    # document = Document()
# 
    # Load a doc or docx file
    # document.LoadFromFile(report_filled_path)

    #Save the document to PDF
    # document.SaveToFile(pdf_path, FileFormat.PDF)
    # document.Close()



    import requests

    # Abre el archivo en modo binario
    with open(report_filled_path, 'rb') as file:
        files = {'document': file}
    
        # Realiza la solicitud POST al contenedor 'docx-to-pdf'
        response = requests.post("http://docx-to-pdf:8080/pdf", files=files)

        if response.ok:

            with open(pdf_path, 'wb') as result_file:
                result_file.write(response.content)

            return send_file(pdf_path)

        # return f"Error in processing: {response.status_code}", 500

    # return send_file(report_filled_path, as_attachment=True)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=6000)
