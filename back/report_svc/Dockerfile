FROM python:3.9-bookworm
ENV LIBGDAL_VERSION=3.6.2+dfsg-1+b2
ENV PYTHONPATH=/report_svc/src
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=1

RUN apt-get update -y && \
    apt-get install --no-install-recommends -y libgdal-dev=${LIBGDAL_VERSION} fonts-liberation ttf-mscorefonts-installer || \
    apt-get install -y --fix-missing 

WORKDIR /report_svc
COPY requirements.prod.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY src /report_svc/src
COPY data /report_svc/data

RUN adduser --disabled-password --no-create-home appuser
RUN chown -R appuser:appuser /report_svc  
RUN chmod -R u+rwx /report_svc 
USER appuser

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "src.report_svc:app"]
