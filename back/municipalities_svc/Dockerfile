FROM python:3.9-bookworm
ENV LIBGDAL_VERSION=3.6.2+dfsg-1+b2
ENV PYTHONPATH=/municipalities_svc/src

RUN apt-get update -y && \
    apt-get install --no-install-recommends -y libgdal-dev=${LIBGDAL_VERSION} || \
    apt-get install -y --fix-missing

WORKDIR /municipalities_svc
COPY requirements.prod.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY src /municipalities_svc/src
COPY data /municipalities_svc/data
RUN adduser --disabled-password --no-create-home appuser
USER appuser
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "src.municipalities_svc:app"]
