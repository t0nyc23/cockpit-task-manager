FROM python:3.9-slim

WORKDIR /cockpit-task-manager

COPY requirements.txt .
COPY api api

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

CMD ["flask", "--app", "api/", "run", "--host=0.0.0.0"]
