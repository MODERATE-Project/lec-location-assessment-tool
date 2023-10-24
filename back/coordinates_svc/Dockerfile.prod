FROM python:3.9
WORKDIR /coordinates_svc
COPY requirements.prod.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY src /coordinates_svc/src
COPY data /coordinates_svc/data
RUN adduser --disabled-password --no-create-home appuser
USER appuser
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "src.coordinates_svc:app"]
