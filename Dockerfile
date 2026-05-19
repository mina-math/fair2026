FROM python:3.12-slim
WORKDIR /app
COPY index.html .
COPY app.js .
COPY data.js .
COPY style.css .
COPY *.pdf .
EXPOSE 8080
CMD ["python", "-m", "http.server", "8080"]
