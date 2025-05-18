FROM python:3.10-slim

WORKDIR /app

COPY requirements_docker.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements_docker.txt

COPY . .

EXPOSE 8000

CMD ["python", "main.py"]