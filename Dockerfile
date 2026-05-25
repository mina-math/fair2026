FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY index.html .
COPY app.js .
COPY data.js .
COPY style.css .
COPY server.py .
COPY *.pdf .
COPY *.png .
EXPOSE 8080
CMD ["python", "server.py"]
